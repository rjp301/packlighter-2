import { cn } from "@/app/lib/utils";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";

import { MoreHorizontal, Delete, Copy } from "lucide-react";
import { Button } from "@/app/components/ui/button";

import Gripper from "@/app/components/base/gripper";
import { useSidebarStore } from "@/app/components/sidebar/sidebar-store";
import { Link } from "@tanstack/react-router";
import useMutations from "@/app/hooks/use-mutations";
import type { DraggableProvided } from "@hello-pangea/dnd";
import type { ListSelect } from "db/types";
import useListId from "@/app/hooks/use-list-id";

interface Props {
  list: ListSelect;
  provided: DraggableProvided;
  isDragging?: boolean;
}

const PackingList: React.FC<Props> = (props) => {
  const { list, isDragging, provided } = props;
  const listId = useListId();

  const isActive = listId === list.id;

  const { deleteList } = useMutations();
  const { toggleMobileSidebar } = useSidebarStore();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  return (
    <>
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              packing list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteList.mutate({ listId: list.id })}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div
        key={list.id}
        {...provided.draggableProps}
        ref={provided.innerRef}
        className={cn(
          "flex items-center gap-2 border-l-4 border-transparent py-0.5 pl-2 pr-2 hover:border-muted",
          isDragging && "rounded border border-l-4 border-border bg-card/70",
          isActive &&
            "border-primary bg-secondary text-secondary-foreground hover:border-primary",
        )}
      >
        <Gripper {...provided.dragHandleProps} isGrabbing={isDragging} />
        <Link
          to={`/list/$listId`}
          params={{ listId: list.id }}
          onClick={() => toggleMobileSidebar(false)}
          className={cn(
            "flex-1 truncate text-sm",
            !list.name && "italic text-muted-foreground",
          )}
        >
          {list.name || "Unnamed List"}
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className={cn("h-8 w-8 p-0")}>
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
              <Delete size="1rem" className="mr-2" />
              Delete List
            </DropdownMenuItem>

            <DropdownMenuItem
              disabled
              onClick={() => deleteList.mutate({ listId: list.id })}
            >
              <Copy size="1rem" className="mr-2" />
              Duplicate List
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};

export default PackingList;
