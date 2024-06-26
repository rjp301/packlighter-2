import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Loader from "@/components/base/loader";
import { Button } from "@/components/ui/button";
import { ArrowDownWideNarrow, Table } from "lucide-react";
import PackingItem from "./packing-item";
import { useStore } from "@/app/lib/store";
import Error from "@/components/base/error";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Placeholder from "@/components/base/placeholder";
import { useLocation, useNavigate } from "@tanstack/react-router";
import type { Item } from "@/api/db/schema";
import { itemsQueryOptions } from "@/app/lib/queries";

enum SortOptions {
  Name = "Name",
  Description = "Description",
  Weight = "Weight",
}

const sortingFunction = (option: SortOptions) => {
  switch (option) {
    case SortOptions.Name:
      return (a: Item, b: Item) => a.name.localeCompare(b.name);
    case SortOptions.Description:
      return (a: Item, b: Item) => a.description.localeCompare(b.description);
    case SortOptions.Weight:
      return (a: Item, b: Item) => a.weight - b.weight;
  }
};

const filterItems = (item: Item, query: string) => {
  const lowerCaseQuery = query.toLowerCase();
  return (
    item.name.toLowerCase().includes(lowerCaseQuery) ||
    item.description.toLowerCase().includes(lowerCaseQuery)
  );
};

const PackingItems: React.FC = () => {
  const { toggleSidebar } = useStore();

  const itemsQuery = useQuery(itemsQueryOptions);

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [sortOption, setSortOption] = React.useState<SortOptions>(
    SortOptions.Name,
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
              toggleSidebar(false);
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
