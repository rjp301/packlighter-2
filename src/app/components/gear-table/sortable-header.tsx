import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp } from "lucide-react";
import { type Column } from "@tanstack/react-table";
import type { Item } from "@/api/db/schema";

type Props = React.PropsWithChildren<{
  column: Column<Item, unknown>;
}>;

const SortableHeader: React.FC<Props> = (props) => {
  const { column, children } = props;

  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {children}
      {column.getIsSorted() &&
        (column.getIsSorted() === "asc" ? (
          <ArrowUp size="1rem" className="ml-2" />
        ) : (
          <ArrowDown size="1rem" className="ml-2" />
        ))}
    </Button>
  );
};

export default SortableHeader;
