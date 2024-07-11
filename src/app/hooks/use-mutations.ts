import { api } from "@/app/lib/client";
import useListId from "./use-list-id";
import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import {
  itemsQueryOptions,
  listQueryOptions,
  listsQueryOptions,
} from "../lib/queries";
import { toast } from "sonner";
import type { Item, List } from "astro:db";
import React from "react";
import { useNavigate } from "@tanstack/react-router";
import type { ListSelect } from "db/types";

export default function useMutations() {
  const listId = useListId();
  const queryClient = useQueryClient();
  const toastId = React.useRef<string | number | undefined>();
  const navigate = useNavigate();

  const invalidateQueries = (queryKeys: QueryKey[]) => {
    queryKeys.forEach((queryKey) =>
      queryClient.invalidateQueries({ queryKey }),
    );
  };

  const onError = (error: Error) => {
    console.error(error);
    toast.error(error.message, { id: toastId.current });
  };

  const onMutateMessage = (message: string) => () => {
    toastId.current = toast.loading(message);
  };

  const toastSuccess = (message: string) => {
    toast.success(message, { id: toastId.current });
  };

  const deleteList = useMutation({
    mutationFn: async (props: { listId: string }) => {
      const { listId } = props;
      const res = await api.lists[":listId"].$delete({
        param: { listId },
      });
      if (!res.ok) throw new Error(res.statusText);
    },
    onSuccess: (_, props) => {
      queryClient.invalidateQueries({ queryKey: listsQueryOptions.queryKey });
      toastSuccess("List deleted successfully");
      if (props.listId === listId) {
        navigate({ to: "/" });
      }
    },
    onMutate: onMutateMessage("Deleting list..."),
    onError,
  });

  const updateItem = useMutation({
    mutationFn: async (props: {
      itemId: string;
      data: Partial<typeof Item.$inferInsert>;
    }) => {
      const { itemId, data } = props;
      const res = await api.items[":itemId"].$patch({
        json: data,
        param: { itemId },
      });
      if (!res.ok) throw new Error(res.statusText);
    },
    onSuccess: () => {
      invalidateQueries([
        listQueryOptions(listId).queryKey,
        itemsQueryOptions.queryKey,
      ]);
    },
    onError,
  });

  const deleteItem = useMutation({
    mutationFn: async (props: { itemId: string; itemName: string }) => {
      const res = await api.items[":itemId"].$delete({
        param: { itemId: props.itemId },
      });
      if (!res.ok) throw new Error(res.statusText);
    },
    onSuccess: (_, props) => {
      invalidateQueries([
        itemsQueryOptions.queryKey,
        listQueryOptions(listId).queryKey,
      ]);
      toastSuccess(`${props.itemName || "Unnamed gear"} deleted`);
    },
    onMutate: onMutateMessage("Deleting item..."),
    onError,
  });

  const updateList = useMutation({
    mutationFn: async (props: { data: Partial<typeof List.$inferInsert> }) => {
      const res = await api.lists[":listId"].$patch({
        json: props.data,
        param: { listId },
      });
      if (!res.ok) throw new Error(res.statusText);
    },
    onSuccess: () => {
      invalidateQueries([
        listQueryOptions(listId).queryKey,
        listsQueryOptions.queryKey,
      ]);
    },
    onError,
  });

  const addList = useMutation({
    mutationFn: async () => {
      const res = await api.lists.$post();
      if (!res.ok) throw new Error(res.statusText);
      return await res.json();
    },
    onSuccess: (data) => {
      const { queryKey } = listsQueryOptions;
      queryClient.invalidateQueries({ queryKey });
      navigate({ to: "/list/$listId", params: { listId: data.id } });
    },
    onError,
  });

  const reorderLists = useMutation({
    mutationFn: (lists: ListSelect[]) =>
      api.lists.reorder.$put({ json: lists.map((i) => i.id) }),
    onMutate: async (newLists) => {
      const { queryKey } = listsQueryOptions;
      await queryClient.cancelQueries({ queryKey });
      const previousLists = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, newLists);
      return { previousLists };
    },
    onError: (error, __, context) => {
      const { queryKey } = listsQueryOptions;
      if (context?.previousLists)
        queryClient.setQueryData(queryKey, context.previousLists);
      onError(error);
    },
    onSuccess: () => {
      const { queryKey } = listsQueryOptions;
      invalidateQueries([queryKey]);
    },
  });

  return {
    deleteItem,
    deleteList,
    updateItem,
    updateList,
    addList,
    reorderLists,
  };
}
