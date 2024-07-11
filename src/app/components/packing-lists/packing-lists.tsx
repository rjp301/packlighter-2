import { Plus } from "lucide-react";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import PackingList from "./packing-list";
import Loader from "@/app/components/base/loader";
import ErrorPage from "@/app/components/base/error-page";

import { cn } from "@/app/lib/utils";
import Placeholder from "@/app/components/base/placeholder";
import { listsQueryOptions } from "@/app/lib/queries.ts";
import useMutations from "@/app/hooks/use-mutations";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type OnDragEndResponder,
  type OnDragStartResponder,
} from "@hello-pangea/dnd";
import { moveInArray } from "@/app/lib/helpers/move-in-array";

export default function PackingLists(): ReturnType<React.FC> {
  const listsQuery = useQuery(listsQueryOptions);
  const { addList, reorderLists } = useMutations();

  const [draggingId, setDraggingId] = React.useState<string | null>(null);

  const handleDragStart: OnDragStartResponder = (result) => {
    const { draggableId } = result;
    setDraggingId(draggableId);
  };

  const handleDragEnd: OnDragEndResponder = (result) => {
    const { destination, source, draggableId } = result;
    const items = listsQuery.data ?? [];
    const currentItem = items.find((item) => item.id === draggableId);

    setDraggingId(null);
    if (!destination || !currentItem) return;

    const newItems = moveInArray(items, source.index, destination.index);
    reorderLists.mutate(newItems);
  };

  return (
    <div className="flex h-full flex-col gap-2 p-4">
      <header className="flex items-center justify-between">
        <span className="text-sm font-semibold">Lists</span>
        <Button size="sm" variant="linkMuted" onClick={() => addList.mutate()}>
          <Plus size="1rem" className="mr-2" />
          Add List
        </Button>
      </header>
      <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
        <Droppable droppableId="packing-lists">
          {(provided) => (
            <Card
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={cn(
                "h-full overflow-y-auto overflow-x-hidden py-2 transition-colors",
                draggingId && "border-primary",
              )}
            >
              {listsQuery.isLoading && <Loader />}
              {listsQuery.isError && <ErrorPage error={listsQuery.error} />}
              {listsQuery.isSuccess &&
                listsQuery.data?.map((list, index) => (
                  <Draggable key={list.id} draggableId={list.id} index={index}>
                    {(provided) => (
                      <PackingList
                        list={list}
                        provided={provided}
                        isDragging={draggingId === list.id}
                      />
                    )}
                  </Draggable>
                ))}
              {provided.placeholder}
              {listsQuery.isSuccess && listsQuery.data.length === 0 && (
                <Placeholder message="No lists yet" />
              )}
            </Card>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
