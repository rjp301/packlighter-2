import type { DraggableProvided } from "@hello-pangea/dnd";
import type { CategoryItem } from "db/schema";

export interface CategoryItemProps {
  categoryItem: CategoryItem;
  provided: DraggableProvided;
  isDragging?: boolean;
  update: (data: Partial<CategoryItem>) => void;
  remove: () => void;
}
