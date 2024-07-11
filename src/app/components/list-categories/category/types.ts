import type { DraggableProvided } from "@hello-pangea/dnd";
import type { Category } from "db/schema";

export interface CategoryProps {
  category: Category;
  provided: DraggableProvided;
  isDragging?: boolean;
}
