import React from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type OnDragEndResponder,
  type OnDragStartResponder,
} from "@hello-pangea/dnd";
import { useDraggingStore } from "./dragging-store";
import Category from "./category";
import { useListStore } from "@/app/lib/list-store";
import type { Category as CategoryType } from "db/schema";

type Props = {
  categories: CategoryType[];
};

const ListCategories: React.FC<Props> = (props) => {
  const { categories } = props;

  const { reorderCategoryItem, reorderCategory } = useListStore();

  const { resetDragging, setDraggingCategory, setDraggingCategoryItem } =
    useDraggingStore();

  const handleDragStart: OnDragStartResponder = (result) => {
    const { draggableId, type } = result;

    if (type === "category") {
      resetDragging();
      setDraggingCategory(draggableId);
    }

    if (type === "category-item") {
      resetDragging();
      setDraggingCategoryItem(draggableId);
    }
  };

  const handleDragEnd: OnDragEndResponder = (result) => {
    const { destination, source, draggableId, type } = result;
    resetDragging();

    if (!destination) return;

    if (type === "category-item") {
      console.log("category-item");
      console.log(draggableId);

      // if (source.droppableId !== destination.droppableId) {
      //   updateCategoryItem(
      //     source.droppableId,
      //     draggableId,
      //     data: {
      //       categoryId: destination.droppableId,
      //     },
      //   );
      //   return;
      // }

      reorderCategoryItem(source.droppableId, source.index, destination.index);
      return;
    }

    if (type === "category") {
      reorderCategory(source.index, destination.index);
      return;
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
      <Droppable droppableId="list-categories" type="category">
        {(provided) => (
          <div
            ref={provided.innerRef}
            className="flex flex-col gap-4"
            {...provided.droppableProps}
          >
            {categories.map((category, index) => (
              <Draggable
                key={category.id}
                draggableId={category.id}
                index={index}
              >
                {(provided) => (
                  <Category category={category} provided={provided} />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default ListCategories;
