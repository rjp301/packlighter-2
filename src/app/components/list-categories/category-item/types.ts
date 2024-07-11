import type { ExpandedCategoryItem } from "db/types";
import type { DraggableProvided } from "@hello-pangea/dnd";

export interface CategoryItemProps {
  item: ExpandedCategoryItem;
  provided: DraggableProvided;
  isDragging?: boolean;
}
