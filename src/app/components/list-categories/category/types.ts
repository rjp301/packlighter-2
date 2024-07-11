import type { ExpandedCategory } from "db/types";
import type { DraggableProvided } from "@hello-pangea/dnd";

export interface CategoryProps {
  category: ExpandedCategory;
  provided: DraggableProvided;
  isDragging?: boolean;
}
