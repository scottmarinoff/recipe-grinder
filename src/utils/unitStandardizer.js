export const standardizeUnit = (unit) => {
  const unitMap = {
    T: "Tbsp",
    t: "tsp",
    C: "cup",
    g: "gram",
    ml: "mL",
    // Add more unit mappings as needed
  };
  return unitMap[unit] || unit;
};