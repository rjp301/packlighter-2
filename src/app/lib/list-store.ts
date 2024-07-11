import { initCategory } from "db/init";
import { zCategory } from "db/schema";
import type { ExpandedCategory } from "db/types";
import { createStore } from "zustand";

type Updater<T> = (id: string, value: Partial<T>) => void;
type Remover = (id: string) => void;
type Creator<T> = (value: Partial<T>) => void;

interface State {
  categories: ExpandedCategory[];
}

const initialState: State = {
  categories: [],
};

interface Actions {
  setCategories: (categories: ExpandedCategory[]) => void;
  addCategory: Creator<ExpandedCategory>;
  updateCategory: Updater<ExpandedCategory>;
  deleteCategory: Remover;

  reset: () => void;
}

export const listStore = createStore<State & Actions>()((set) => ({
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
