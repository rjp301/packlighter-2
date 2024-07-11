import { initCategory } from "db/init";
import type { Category } from "db/schema";
import { create } from "zustand";

type Updater<T> = (id: string, value: Partial<T>) => void;
type Remover = (id: string) => void;
type Creator<T> = (value?: Partial<T>) => void;

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

  reset: () => void;
}

export const useListStore = create<State & Actions>()((set) => ({
  ...initialState,
  setCategories: (categories) => set({ categories }),
  addCategory: (category) =>
    set((state) => ({
      categories: [...state.categories, initCategory(category)],
    })),
  updateCategory: (id, value) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, ...value } : c,
      ),
    })),
  deleteCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    })),
  reset: () => set(initialState),
}));
