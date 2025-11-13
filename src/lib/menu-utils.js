// Turns the flat Dynamo list into { [category]: { basePrice, groups: { [groupName]: options[] } } }
export function groupMenu(items) {
  const byCat = {};
  for (const it of items) {
    const [_, cat] = String(it.PK || "").split("#"); // e.g., ITEM#sandwich
    if (!byCat[cat]) byCat[cat] = { basePrice: 0, groups: {} };

    // META
    if (it.SK === "META#") {
      if (typeof it.basePrice === "number") byCat[cat].basePrice = it.basePrice;
      continue;
    }

    const sk = String(it.SK || "");
    if (sk.startsWith("GROUP#")) {
      const groupName = it.group || sk.split("#")[1];
      byCat[cat].groups[groupName] = byCat[cat].groups[groupName] || [];
    } else if (sk.startsWith("OPTION#")) {
      const parts = sk.split("#"); // ["OPTION", "<GroupName>", "<id>"]
      const groupName = parts[1];
      byCat[cat].groups[groupName] = byCat[cat].groups[groupName] || [];
      byCat[cat].groups[groupName].push({
        id: it.id,
        label: it.label,
        priceDelta: it.priceDelta ?? it.price ?? 0,
      });
    }
  }
  return byCat;
}
