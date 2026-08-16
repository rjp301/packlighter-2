import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  itemsQueryOptions,
  listQueryOptions,
  listsQueryOptions,
  otherListCategoriesQueryOptions,
} from "@/lib/client/queries";
import { produce } from "immer";
import { initCategory, initCategoryItem, initItem } from "@/lib/init";
import { actions } from "astro:actions";
import useCurrentList from "./use-current-list";
import useMutationHelpers from "./use-mutation-helpers";
import { useNavigate } from "@tanstack/react-router";
import { listLinkOptions } from "@/lib/client/links";
import type {
  CategorySelect,
  ExpandedList,
  ItemSelect,
  ListSelect,
} from "@/lib/types";

export default function useMutations() {
  const { listId } = useCurrentList();
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const {
    onError,
    onMutateMessage,
    toastSuccess,
    optimisticUpdate,
    onErrorOptimistic,
    invalidateQueries,
  } = useMutationHelpers();

  const deleteCategoryItem = useMutation({
    mutationFn: actions.categoryItems.remove.orThrow,
    onMutate: ({ categoryItemId }) => {
      const { queryKey } = listQueryOptions(listId);
      return optimisticUpdate<ExpandedList>(queryKey, (prev) =>
        produce(prev, (draft) => {
          draft.categories.forEach((category) => {
            category.items = category.items.filter(
              (i) => i.id !== categoryItemId,
            );
          });
        }),
      );
    },
    onError: (error, __, context) => {
      const { queryKey } = listQueryOptions(listId);
      onErrorOptimistic(queryKey, context);
      onError(error);
    },
  });

  const deleteCategory = useMutation({
    mutationFn: actions.categories.remove.orThrow,
    onMutate: ({ categoryId }) => {
      onMutateMessage("Deleting category...");
      const { queryKey } = listQueryOptions(listId);
      return optimisticUpdate<ExpandedList>(queryKey, (prev) => ({
        ...prev,
        categories: prev.categories.filter((i) => i.id !== categoryId),
      }));
    },
    onSuccess: () => {
      invalidateQueries([
        listQueryOptions(listId).queryKey,
        otherListCategoriesQueryOptions(listId).queryKey,
      ]);
      toastSuccess(`Category deleted`);
    },
    onError: (error, __, context) => {
      const { queryKey } = listQueryOptions(listId);
      onErrorOptimistic(queryKey, context);
      onError(error);
    },
  });

  const deleteList = useMutation({
    mutationFn: actions.lists.remove.orThrow,
    onSuccess: (_, props) => {
      invalidateQueries([
        listsQueryOptions.queryKey,
        otherListCategoriesQueryOptions(listId).queryKey,
      ]);
      toastSuccess("List deleted successfully");
      if (props.listId === listId) {
        navigate({ to: "/" });
      }
    },
    onMutate: () => onMutateMessage("Deleting list..."),
  });

  const updateCategoryItem = useMutation({
    mutationFn: actions.categoryItems.update.orThrow,
    onSuccess: () => {
      invalidateQueries([listQueryOptions(listId).queryKey]);
    },
    onMutate: ({ categoryItemId, data }) => {
      const { queryKey } = listQueryOptions(listId);
      return optimisticUpdate<ExpandedList>(queryKey, (prev) => ({
        ...prev,
        categories: prev.categories.map((category) => ({
          ...category,
          items: category.items.map((item) =>
            item.id === categoryItemId ? { ...item, ...data } : item,
          ),
        })),
      }));
    },
    onError: (error, __, context) => {
      const { queryKey } = listQueryOptions(listId);
      onErrorOptimistic(queryKey, context);
      onError(error);
    },
  });

  const updateCategoryCache = (data: CategorySelect) => {
    const { queryKey } = listQueryOptions(data.listId);
    queryClient.setQueryData(queryKey, (prev) =>
      produce(prev, (draft) => {
        if (!draft) return draft;
        const categoryIdx = draft.categories.findIndex((i) => i.id === data.id);
        if (categoryIdx === -1) return draft;
        draft.categories[categoryIdx] = {
          ...draft.categories[categoryIdx],
          ...data,
        };
      }),
    );
  };

  const updateCategory = useMutation({
    mutationFn: actions.categories.update.orThrow,
    onSuccess: (data) => updateCategoryCache(data),
  });

  const addCategoryItem = useMutation({
    mutationFn: actions.categoryItems.createAndAddToCategory.orThrow,
    onMutate: async ({ categoryId, itemData, categoryItemData }) => {
      const { queryKey } = listQueryOptions(listId);
      return optimisticUpdate<ExpandedList>(queryKey, (prev) =>
        produce(prev, (draft) => {
          const categoryIdx = draft.categories.findIndex(
            (i) => i.id === categoryId,
          );
          if (categoryIdx === -1) return draft;
          // TODO - fix issue with mismatched Ids
          const item = initItem(itemData as ItemSelect);
          const categoryItem = initCategoryItem({
            itemData: item,
            categoryId,
            ...categoryItemData,
          });
          draft.categories[categoryIdx].items.push(categoryItem);
        }),
      );
    },
    onError: (error, __, context) => {
      const { queryKey } = listQueryOptions(listId);
      onErrorOptimistic(queryKey, context);
      onError(error);
    },
    onSuccess: () => {
      invalidateQueries([
        listQueryOptions(listId).queryKey,
        itemsQueryOptions.queryKey,
      ]);
    },
  });

  const addItemToCategory = useMutation({
    mutationFn: actions.categoryItems.create.orThrow,
    onSuccess: () => {
      invalidateQueries([listQueryOptions(listId).queryKey]);
    },
  });

  const addCategory = useMutation({
    mutationFn: actions.categories.create.orThrow,
    onMutate: ({ data }) => {
      const { queryKey } = listQueryOptions(listId);
      return optimisticUpdate<ExpandedList>(queryKey, (prev) =>
        produce(prev, (draft) => {
          const newCategory = initCategory(data);
          draft.categories.push(newCategory);
        }),
      );
    },
    onSuccess: () => {
      invalidateQueries([
        listQueryOptions(listId).queryKey,
        otherListCategoriesQueryOptions(listId).queryKey,
      ]);
    },
    onError: (error, __, context) => {
      const { queryKey } = listQueryOptions(listId);
      onErrorOptimistic(queryKey, context);
      onError(error);
    },
  });

  const toggleCategoryPacked = useMutation({
    mutationFn: actions.categories.togglePacked.orThrow,
    onSuccess: () => {
      invalidateQueries([listQueryOptions(listId).queryKey]);
    },
  });

  const copyCategoryToList = useMutation({
    mutationFn: actions.categories.copyToList.orThrow,
    onSuccess: () => {
      invalidateQueries([
        listQueryOptions(listId).queryKey,
        otherListCategoriesQueryOptions(listId).queryKey,
      ]);
    },
  });

  const updateListCache = (data: Partial<ListSelect>, listId: string) => {
    const { queryKey: listQK } = listQueryOptions(listId);
    const { queryKey: listsQK } = listsQueryOptions;

    queryClient.setQueryData(listQK, (prev) => {
      if (!prev) return prev;
      return { ...prev, ...data };
    });

    queryClient.setQueryData(listsQK, (prev) => {
      if (!prev) return prev;
      return prev.map((list) =>
        list.id === listId ? { ...list, ...data } : list,
      );
    });
  };

  const updateList = useMutation({
    mutationFn: actions.lists.update.orThrow,
    onMutate: async ({ data, listId }) => {
      await Promise.all([
        queryClient.cancelQueries(listQueryOptions(listId)),
        queryClient.cancelQueries(listsQueryOptions),
      ]);
      const previousData = {
        previousLists: queryClient.getQueryData(listsQueryOptions.queryKey),
        previousList: queryClient.getQueryData(
          listQueryOptions(listId).queryKey,
        ),
      };
      updateListCache(data, listId);
      return previousData;
    },
    onSuccess: (data) => updateListCache(data, data.id),
    onError: (error, { listId }, context) => {
      queryClient.setQueryData(
        listsQueryOptions.queryKey,
        context?.previousLists,
      );
      queryClient.setQueryData(
        listQueryOptions(listId).queryKey,
        context?.previousList,
      );
      onError(error);
    },
  });

  const addList = useMutation({
    mutationFn: actions.lists.create.orThrow,
    onSuccess: (data) => {
      invalidateQueries([
        listsQueryOptions.queryKey,
        otherListCategoriesQueryOptions(listId).queryKey,
      ]);
      navigate(listLinkOptions(data.id));
    },
  });

  const duplicateList = useMutation({
    mutationFn: actions.lists.duplicate.orThrow,
    onSuccess: (data) => {
      invalidateQueries([
        listsQueryOptions.queryKey,
        otherListCategoriesQueryOptions(listId).queryKey,
      ]);
      navigate(listLinkOptions(data.id));
    },
  });

  const unpackList = useMutation({
    mutationFn: actions.lists.unpack.orThrow,
    onSuccess: (data) => {
      const { queryKey } = listQueryOptions(data.id);
      queryClient.setQueryData(queryKey, data);
    },
  });

  return {
    deleteCategoryItem,
    deleteCategory,
    deleteList,
    updateCategoryItem,
    updateList,
    updateCategory,
    addCategoryItem,
    addItemToCategory,
    addList,
    duplicateList,
    addCategory,
    toggleCategoryPacked,
    copyCategoryToList,
    unpackList,
  };
}
