import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/app/components/ui/input";
import { Card } from "@/app/components/ui/card";
import Loader from "@/app/components/base/loader";
import { Button } from "@/app/components/ui/button";
import { ArrowDownWideNarrow, Table } from "lucide-react";
import PackingItem from "./packing-item";
import { useSidebarStore } from "@/app/components/sidebar/sidebar-store";
import Error from "@/app/components/base/error";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import Placeholder from "@/app/components/base/placeholder";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { itemsQueryOptions } from "@/app/lib/queries";
import type { ItemSelect } from "db/types";

enum SortOptions {
  CreatedAt = "Created At",
  Name = "Name",
  Description = "Description",
  Weight = "Weight",
}

const sortingFunction = (option: SortOptions) => {
  switch (option) {
    case SortOptions.CreatedAt:
      return (a: ItemSelect, b: ItemSelect) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    case SortOptions.Name:
      return (a: ItemSelect, b: ItemSelect) => a.name.localeCompare(b.name);
    case SortOptions.Description:
      return (a: ItemSelect, b: ItemSelect) =>
        a.description.localeCompare(b.description);
    case SortOptions.Weight:
      return (a: ItemSelect, b: ItemSelect) => a.weight - b.weight;
  }
};

const filterItems = (item: ItemSelect, query: string) => {
  const lowerCaseQuery = query.toLowerCase();
  return (
    item.name.toLowerCase().includes(lowerCaseQuery) ||
    item.description.toLowerCase().includes(lowerCaseQuery)
  );
};

const PackingItems: React.FC = () => {
  const { toggleDesktopSidebar, toggleMobileSidebar } = useSidebarStore();

  const itemsQuery = useQuery(itemsQueryOptions);

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [sortOption, setSortOption] = React.useState<SortOptions>(
    SortOptions.CreatedAt,
  );
  const [filterQuery, setFilterQuery] = React.useState("");

  return (
    <div className="flex h-full flex-1 flex-col gap-2 overflow-hidden p-4">
      <header className="flex flex-col gap-2">
        <div className="flex w-full items-center justify-between">
          <span className="text-sm font-semibold">Gear</span>
          <Button
            size="sm"
            variant={pathname === "/gear" ? "secondary" : "linkMuted"}
            onClick={() => {
              navigate({ to: "/gear" });
              toggleDesktopSidebar(false);
              toggleMobileSidebar(false);
            }}
          >
            <Table size="1rem" className="mr-2" />
            All Gear
          </Button>
        </div>
        <div className="flex gap-1">
          <Input
            placeholder="Filter..."
            className="bg-card"
            value={filterQuery}
            onChange={(ev) => setFilterQuery(ev.target.value)}
          />
          <DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <ArrowDownWideNarrow size="1rem" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Sort Gear</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenuContent>
              <DropdownMenuLabel>Sort Gear</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={sortOption}
                onValueChange={(v) => setSortOption(v as SortOptions)}
              >
                {Object.values(SortOptions).map((option) => (
                  <DropdownMenuRadioItem key={option} value={option}>
                    {option}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <Card className="h-full flex-1 overflow-y-auto overflow-x-hidden">
        {itemsQuery.isLoading && <Loader />}
        {itemsQuery.isError && <Error error={itemsQuery.error} />}
        {itemsQuery.isSuccess &&
          itemsQuery.data
            .filter((item) => filterItems(item, filterQuery))
            .sort(sortingFunction(sortOption))
            .map((item) => <PackingItem key={item.id} item={item} />)}
        {itemsQuery.isSuccess && itemsQuery.data.length === 0 && (
          <Placeholder message="No gear yet" />
        )}
      </Card>
    </div>
  );
};

export default PackingItems;
