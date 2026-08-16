import { createColumnHelper } from "@tanstack/react-table";
import useMutations from "@/app/hooks/use-mutations";
import React from "react";
import {
  cn,
  formatWeight,
  getCheckboxState,
  toTitleCase,
} from "@/lib/client/utils";
import AddItemPopover from "./add-popovers/add-item-popover";
import useCurrentList from "@/app/hooks/use-current-list";
import { WeightConvertible } from "@/lib/convertible";
import {
  TextField,
  Select,
  Checkbox,
  Heading,
  Text,
  Button,
  IconButton,
  Tooltip,
} from "@radix-ui/themes";
import { z } from "astro/zod";
import useItemsMutations from "@/app/modules/items/items.mutations";
import {
  type ExpandedCategory,
  type ExpandedCategoryItem,
  type WeightType,
  type WeightUnit,
} from "@/lib/types";
import { ACCENT_COLOR, weightUnitsInfo } from "@/lib/client/constants";
import ItemImageDialog from "@/app/modules/items/components/item-image-dialog";
import CellWrapper from "@/app/components/ui/cell-wrapper";
import ConditionalForm from "@/app/components/input/conditional-form";
import DeleteButton from "@/app/components/ui/delete-button";
import ServerInput from "@/app/components/input/server-input";
import { weightTypes } from "@/db/schema";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ForkKnifeIcon,
  ShirtIcon,
} from "lucide-react";

const columnHelper = createColumnHelper<ExpandedCategoryItem>();

type UseColumnsProps = {
  category: ExpandedCategory;
  addItemRef: React.RefObject<HTMLButtonElement>;
};

const QTY_WIDTH = "3.5rem";
const WEIGHT_WIDTH = "5rem";

const WeightTypeIcon: React.FC<{ weightType: WeightType }> = ({
  weightType,
}) => {
  switch (weightType) {
    case "worn":
      return <ShirtIcon className="size-3" />;
    case "consumable":
      return <ForkKnifeIcon className="size-3" />;
    default:
      return null;
  }
};

export default function useEditorColumns({
  category,
  addItemRef,
}: UseColumnsProps) {
  const {
    updateCategory,
    deleteCategory,
    deleteCategoryItem,
    toggleCategoryPacked,
    updateCategoryItem,
  } = useMutations();
  const { updateItem } = useItemsMutations();

  const { list } = useCurrentList();

  if (!list) return [];

  return React.useMemo(
    () => [
      columnHelper.accessor("packed", {
        id: "packed",
        header: () => (
          <CellWrapper>
            <Checkbox
              size="3"
              checked={getCheckboxState(category.items.map((i) => i.packed))}
              onCheckedChange={() =>
                toggleCategoryPacked.mutate({ categoryId: category.id })
              }
            />
          </CellWrapper>
        ),
        cell: (props) => (
          <CellWrapper>
            <Checkbox
              size="3"
              checked={props.getValue()}
              onCheckedChange={(packed) =>
                updateCategoryItem.mutate({
                  categoryItemId: props.row.original.id,
                  data: { packed: Boolean(packed) },
                })
              }
            />
          </CellWrapper>
        ),
      }),

      columnHelper.accessor("itemData.image", {
        id: "image",
        header: () => null,
        cell: (props) => <ItemImageDialog item={props.row.original.itemData} />,
      }),

      columnHelper.accessor(
        (row) => ({
          name: row.itemData.name,
          description: row.itemData.description,
          isPacked: row.packed,
        }),
        {
          id: "nameDescription",
          header: () => (
            <ConditionalForm
              value={category.name}
              handleSubmit={(name) =>
                updateCategory.mutate({
                  categoryId: category.id,
                  data: { name },
                })
              }
              formProps={{ className: "flex-1" }}
            >
              {({ startEditing, displayValue }) => (
                <Heading
                  as="h3"
                  size="4"
                  weight="bold"
                  className="flex-1"
                  onClick={startEditing}
                >
                  {displayValue ?? "Unnamed Category"}
                </Heading>
              )}
            </ConditionalForm>
          ),
          cell: (props) => (
            <div
              className={cn(
                "flex-1 @container",
                list.showPacked &&
                  props.getValue().isPacked &&
                  "line-through opacity-50",
              )}
            >
              <div className="grid items-center @lg:grid-cols-[1fr_2fr] @lg:gap-2">
                <ConditionalForm
                  value={props.getValue().name}
                  handleSubmit={(name) =>
                    updateItem.mutate({
                      id: props.row.original.itemData.id,
                      name,
                    })
                  }
                  textFieldProps={{ placeholder: "Name" }}
                  compactButtons
                >
                  {({ startEditing, displayValue }) => (
                    <Text onClick={startEditing} size="2">
                      {displayValue || "Name"}
                    </Text>
                  )}
                </ConditionalForm>

                <ConditionalForm
                  value={props.getValue().description}
                  handleSubmit={(description) =>
                    updateItem.mutate({
                      id: props.row.original.itemData.id,
                      description,
                    })
                  }
                  textFieldProps={{ placeholder: "Description" }}
                  customSchema={z.string()}
                  compactButtons
                >
                  {({ startEditing, displayValue }) => (
                    <Text
                      onClick={startEditing}
                      size="2"
                      color="gray"
                      className={cn(!displayValue && "italic text-gray-10")}
                    >
                      {displayValue || "Description"}
                    </Text>
                  )}
                </ConditionalForm>
              </div>
            </div>
          ),
          footer: () => (
            <CellWrapper className="flex-1">
              <AddItemPopover ref={addItemRef} category={category} />
            </CellWrapper>
          ),
        },
      ),

      columnHelper.accessor("weightType", {
        id: "weightType",
        header: () => null,
        cell: (props) => {
          return (
            <CellWrapper>
              <div className="flex items-center gap-2">
                {weightTypes
                  .filter((i) => i !== "base")
                  .map((unit) => {
                    const isActive = props.getValue() === unit;
                    return (
                      <Tooltip
                        content={toTitleCase(unit)}
                        key={unit}
                        delayDuration={500}
                      >
                        <IconButton
                          size="1"
                          aria-checked={isActive}
                          variant="ghost"
                          className={cn(
                            "size-4 opacity-0 transition-opacity group-hover:opacity-100",
                            isActive && "opacity-100",
                          )}
                          color={isActive ? ACCENT_COLOR : "gray"}
                          onClick={() => {
                            updateCategoryItem.mutate({
                              categoryItemId: props.row.original.id,
                              data: { weightType: isActive ? "base" : unit },
                            });
                          }}
                        >
                          <WeightTypeIcon weightType={unit} />
                        </IconButton>
                      </Tooltip>
                    );
                  })}
              </div>
            </CellWrapper>
          );
        },
      }),

      columnHelper.accessor(
        (row) => ({
          weight: row.itemData.weight,
          weightUnit: row.itemData.weightUnit,
        }),
        {
          id: "weight",
          header: () => (
            <CellWrapper width={WEIGHT_WIDTH}>
              <Heading as="h3" size="2" color="gray">
                Weight
              </Heading>
            </CellWrapper>
          ),
          cell: (props) => (
            <CellWrapper width={WEIGHT_WIDTH}>
              <ServerInput
                type="number"
                currentValue={String(props.getValue().weight)}
                min={0}
                selectOnFocus
                onUpdate={(weight) =>
                  updateItem.mutate({
                    id: props.row.original.itemId,
                    weight: Number(weight),
                  })
                }
              >
                <TextField.Slot side="right">
                  <Select.Root
                    size="1"
                    value={props.getValue().weightUnit}
                    onValueChange={(weightUnit: WeightUnit) =>
                      updateItem.mutate({
                        id: props.row.original.itemId,
                        weightUnit,
                      })
                    }
                  >
                    <Select.Trigger variant="ghost" />
                    <Select.Content>
                      {Object.values(weightUnitsInfo).map(({ symbol }) => (
                        <Select.Item value={symbol}>{symbol}</Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </TextField.Slot>
              </ServerInput>
            </CellWrapper>
          ),
          footer: () => {
            const totalWeight = category.items.reduce(
              (acc, val) =>
                acc +
                WeightConvertible.convert(
                  val.itemData.weight,
                  val.itemData.weightUnit,
                  list.weightUnit,
                ) *
                  val.quantity,
              0,
            );
            return (
              <CellWrapper width={WEIGHT_WIDTH}>
                <Text size="2" weight="medium">
                  {formatWeight(totalWeight)}
                  <span>{list.weightUnit}</span>
                </Text>
              </CellWrapper>
            );
          },
        },
      ),
      columnHelper.accessor("quantity", {
        id: "qty",
        header: () => (
          <CellWrapper width={QTY_WIDTH}>
            <Heading as="h3" size="2" color="gray">
              Qty
            </Heading>
          </CellWrapper>
        ),
        cell: (props) => (
          <CellWrapper width={QTY_WIDTH}>
            <ServerInput
              type="number"
              placeholder="Qty"
              selectOnFocus
              currentValue={String(props.getValue())}
              onUpdate={(quantity) =>
                updateCategoryItem.mutate({
                  categoryItemId: props.row.original.id,
                  data: { quantity: Number(quantity) },
                })
              }
            >
              <TextField.Slot side="right">
                <div className="grid gap-0.5">
                  <Button
                    size="1"
                    variant="ghost"
                    onClick={() =>
                      updateCategoryItem.mutate({
                        categoryItemId: props.row.original.id,
                        data: { quantity: props.getValue() + 1 },
                      })
                    }
                  >
                    <ChevronUpIcon className="size-2.5" />
                  </Button>
                  <Button
                    size="1"
                    variant="ghost"
                    onClick={() => {
                      const quantity = props.getValue() - 1;
                      if (quantity < 1) return;
                      updateCategoryItem.mutate({
                        categoryItemId: props.row.original.id,
                        data: { quantity },
                      });
                    }}
                  >
                    <ChevronDownIcon className="size-2.5" />
                  </Button>
                </div>
              </TextField.Slot>
            </ServerInput>
          </CellWrapper>
        ),
        footer: () => (
          <CellWrapper width={QTY_WIDTH}>
            <Text size="2" weight="medium">
              {category.items.reduce((acc, val) => acc + val.quantity, 0)}
            </Text>
          </CellWrapper>
        ),
      }),
      columnHelper.display({
        id: "delete",
        header: () => (
          <DeleteButton
            handleDelete={() =>
              deleteCategory.mutate({
                categoryId: category.id,
              })
            }
          />
        ),
        cell: (props) => (
          <DeleteButton
            noConfirm
            handleDelete={() =>
              deleteCategoryItem.mutate({
                categoryItemId: props.row.original.id,
              })
            }
          />
        ),
        footer: () => <CellWrapper width="1.5rem" />,
      }),
    ],
    [category, list],
  );
}
