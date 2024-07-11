const weightUnitOptions = ["g", "kg", "oz", "lb"] as const;
export type WeightUnit = (typeof weightUnitOptions)[number];

export const weightUnitsFull: Record<WeightUnit, string> = {
  g: "grams",
  kg: "kilograms",
  oz: "ounces",
  lb: "pounds",
};

export const weightUnits: Record<WeightUnit, string> = {
  g: "g",
  kg: "kg",
  oz: "oz",
  lb: "lb",
};

const gramsConversions: Record<WeightUnit, number> = {
  oz: 28.3495,
  lb: 453.592,
  kg: 1000,
  g: 1,
};

export const getItemWeightInUnit = (
  item: { weight: number; weightUnit: string },
  unit: WeightUnit,
) => {
  const weightUnit = item.weightUnit as WeightUnit;
  if (weightUnit in gramsConversions) {
    const weight_g = item.weight * gramsConversions[weightUnit];
    return weight_g / gramsConversions[unit];
  }
  return NaN;
};
