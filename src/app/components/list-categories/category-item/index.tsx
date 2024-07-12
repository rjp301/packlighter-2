import React from "react";
import type { CategoryItemProps } from "./types";
import { useMediaQuery } from "usehooks-ts";
import { MOBILE_MEDIA_QUERY } from "@/app/lib/constants";

import ListCategoryItemMobile from "./list-category-item-mobile";
import ListCategoryItem from "./list-category-item";
import { useDraggingStore } from "../dragging-store";

const CategoryItem: React.FC<CategoryItemProps> = (props) => {
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);
  const isDragging = useDraggingStore(
    (state) => state.draggingCategoryItemId === props.categoryItem.id,
  );

  if (isMobile) {
    return <ListCategoryItemMobile {...props} isDragging={isDragging} />;
  }

  return <ListCategoryItem {...props} isDragging={isDragging} />;
};

export default CategoryItem;
