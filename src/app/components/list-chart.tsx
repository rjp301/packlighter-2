import type { ExpandedList } from "@/lib/types";
import React from "react";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/app/components/ui/chart";
import { Label, Pie, PieChart } from "recharts";
import { getItemWeightInUnit, type WeightUnit } from "@/lib/weight-units";

type Props = {
  list: ExpandedList;
};

const ListChart: React.FC<Props> = (props) => {
  const { list } = props;

  const chartData = React.useMemo(
    () =>
      list.categories.map((category) => ({
        name: category.name,
        weight: category.items.reduce(
          (acc, item) =>
            acc +
            getItemWeightInUnit(item.itemData, list.weightUnit as WeightUnit),
          0,
        ),
      })),
    [list],
  );

  const totalWeight = React.useMemo(
    () => chartData.reduce((acc, d) => acc + d.weight, 0),
    [chartData],
  );

  const chartConfig = {} satisfies ChartConfig;

  return (
    <div>
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[250px]"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartData}
            dataKey="weight"
            nameKey="name"
            innerRadius={60}
            strokeWidth={5}
          >
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-3xl font-bold"
                      >
                        {totalWeight.toLocaleString()}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 24}
                        className="fill-muted-foreground"
                      >
                        Visitors
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
    </div>
  );
};

export default ListChart;
