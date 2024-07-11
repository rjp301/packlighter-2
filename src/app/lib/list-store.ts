import { initCategory, initCategoryItem } from "db/init";
import type { Category, CategoryItem } from "db/schema";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { moveInArray } from "./helpers/move-in-array";

type Updater<T> = (id: string, value: Partial<T>) => void;
type Remover = (id: string) => void;
type Creator<T> = (value?: Partial<T>) => void;
type Reorder = (from: number, to: number) => void;

type UpdaterWithParent<T> = (
  parentId: string,
  id: string,
  value: Partial<T>,
) => void;
type RemoverWithParent = (parentId: string, id: string) => void;
type CreatorWithParent<T> = (parentId: string, value?: Partial<T>) => void;
type ReorderWithParent = (parentId: string, from: number, to: number) => void;

interface State {
  categories: Category[];
}

const initialState: State = {
  categories: [],
};

interface Actions {
  setCategories: (categories: Category[]) => void;

  addCategory: Creator<Category>;
  updateCategory: Updater<Category>;
  deleteCategory: Remover;
  reorderCategory: Reorder;
  toggleCategoryPacked: (categoryId: string) => void;

  addCategoryItem: CreatorWithParent<CategoryItem>;
  updateCategoryItem: UpdaterWithParent<CategoryItem>;
  deleteCategoryItem: RemoverWithParent;
  reorderCategoryItem: ReorderWithParent;

  reset: () => void;
}

export const useListStore = create<State & Actions>()(
  immer((set) => ({
    ...initialState,
    setCategories: (categories) => set({ categories }),

    addCategory: (category) =>
      set((state) => {
        state.categories.push(initCategory(category));
      }),
    updateCategory: (id, values) =>
      set((state) => {
        const category = state.categories.find((c) => c.id === id);
        if (!category) return;
        state.categories = state.categories.map((c) =>
          c.id === id ? Object.assign(category, values) : c,
        );
      }),
    deleteCategory: (id) =>
      set((state) => {
        state.categories = state.categories.filter((c) => c.id !== id);
      }),
    reorderCategory: (from, to) =>
      set((state) => {
        state.categories = moveInArray(state.categories, from, to);
      }),
    toggleCategoryPacked: (categoryId) =>
      set((state) => {
        const category = state.categories.find((c) => c.id === categoryId);
        if (!category) return;
        const isPacked = category.items.every((i) => i.packed);
        category.items = category.items.map((i) => ({
          ...i,
          packed: !isPacked,
        }));
      }),

    addCategoryItem: (categoryId, values) =>
      set((state) => {
        const categoryIndex = state.categories.findIndex(
          (c) => c.id === categoryId,
        );
        if (categoryIndex === -1) return;
        const categoryItem = initCategoryItem(values);
        state.categories[categoryIndex].items.push(categoryItem);
      }),
    updateCategoryItem: (categoryId, categoryItemId, values) =>
      set((state) => {
        const categoryIndex = state.categories.findIndex(
          (c) => c.id === categoryId,
        );
        if (categoryIndex === -1) return;
        const categoryItemIndex = state.categories[
          categoryIndex
        ].items.findIndex((i) => i.id === categoryItemId);
        if (categoryItemIndex === -1) return;
        state.categories[categoryIndex].items[categoryItemIndex] = {
          ...state.categories[categoryIndex].items[categoryItemIndex],
          ...values,
        };
      }),
    deleteCategoryItem: (categoryId, categoryItemId) =>
      set((state) => {
        const categoryIndex = state.categories.findIndex(
          (c) => c.id === categoryId,
        );
        if (categoryIndex === -1) return;
        state.categories[categoryIndex].items = state.categories[
          categoryIndex
        ].items.filter((i) => i.id !== categoryItemId);
      }),
    reorderCategoryItem: (categoryId, from, to) =>
      set((state) => {
        const categoryIndex = state.categories.findIndex(
          (c) => c.id === categoryId,
        );
        if (categoryIndex === -1) return;
        state.categories[categoryIndex].items = moveInArray(
          state.categories[categoryIndex].items,
          from,
          to,
        );
      }),

    reset: () => set(initialState),
  })),
);
