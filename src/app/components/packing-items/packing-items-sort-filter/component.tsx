import React from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";

import { ArrowDownWideNarrow, Filter } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { usePackingItemsSortFilterStore } from "./store";
import { FilterOptions, SortOptions } from "./types";

const PackingItemsSortFilter: React.FC = () => {
  const { searchQuery, sortOption, filterOptions, actions } =
    usePackingItemsSortFilterStore();

  return (
    <div className="flex gap-1">
      <Input
        type="search"
        placeholder="Search..."
        className="bg-card"
        value={searchQuery}
        onChange={(e) => actions.setSearchQuery(e.target.value)}
      />
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowDownWideNarrow size="1rem" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Sort</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent>
          <DropdownMenuLabel>Sort Gear</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={sortOption}
            onValueChange={(value) => {
              actions.setSortOption(value as SortOptions);
            }}
          >
            {Object.values(SortOptions).map((option) => (
              <DropdownMenuRadioItem key={option} value={option}>
                {option}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Filter size="1rem" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Filter</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent>
          <DropdownMenuLabel>Filter Gear</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={filterOptions[FilterOptions.NotInList]}
            onCheckedChange={() =>
              actions.toggleFilterOption(FilterOptions.NotInList)
            }
          >
            Hide items in current list
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default PackingItemsSortFilter;