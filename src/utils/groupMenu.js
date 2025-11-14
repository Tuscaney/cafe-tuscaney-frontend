export function formatMenu(raw) {
  // If the backend returned nothing or an empty value, just stop.
  if (!raw) return null;

  // This will hold all items grouped by type (sandwich, soup, salad, etc.)
  const byItem = {};

  // Loop through every record that came back from DynamoDB.
  for (const row of raw) {
    // Safety check: if a row is missing PK or SK, skip it.
    if (!row.PK || !row.SK) continue;

    // Example PK: "ITEM#sandwich" → split on "#" and take "sandwich"
    const [_, itemType] = String(row.PK).split("#");

    // Make sure to have a bucket for this itemType.
    if (!byItem[itemType]) {
      byItem[itemType] = {
        meta: null, // holds basePrice + category
        groups: {}  // holds option groups (Bread, Meat, Veggies, etc.)
      };
    }

    // -----------------------
    // 1) META row (base info)
    // -----------------------
    //
    // Example: PK="ITEM#sandwich", SK="META#"
    // Store the base price and category here.
    if (row.SK === "META#") {
      byItem[itemType].meta = {
        category: row.category || itemType,
        basePrice: row.basePrice || 0
      };
      continue; // move to the next row
    }

    const sk = String(row.SK);

    // -----------------------
    // 2) GROUP row
    // -----------------------
    //
    // Example: SK="GROUP#Bread" or SK="GROUP#Veggies"
    // This defines a group and how it behaves (single vs multi select, etc.)
    if (sk.startsWith("GROUP#")) {
      // e.g. "GROUP#Bread" → ["GROUP", "Bread"]
      const [, groupKey] = sk.split("#");
      // Prefer the "group" attribute if it exists, fallback to the key.
      const groupName = row.group || groupKey;

      byItem[itemType].groups[groupName] = {
        key: groupKey,     // short key like "Bread" used by options
        definition: row,   // original Dynamo row (has type, priceDelta, etc.)
        options: []        // options for this group will be pushed in later
      };

      continue; // move to the next row
    }

    // -----------------------
    // 3) OPTION row
    // -----------------------
    //
    // Example SK: "OPTION#Bread#wheat"
    //   parts[1] = "Bread" (group key)
    //   parts[2] = "wheat" (option id)
    if (sk.startsWith("OPTION#")) {
      const parts = sk.split("#"); // ["OPTION", "<GroupKey>", "<id>"]
      const groupKey = parts[1];

      // Find the group that matches this groupKey.
      // Stored the key on each group earlier.
      const groups = byItem[itemType].groups;
      const groupEntry = Object.values(groups).find(
        (g) => g.key === groupKey
      );

      // If for some reason we don't find a matching group, skip this option.
      if (!groupEntry) continue;

      // Push a simplified option object that the UI can easily render.
      groupEntry.options.push({
        id: row.id,
        label: row.label,
        // priceDelta can come from either priceDelta or price (for sweets).
        priceDelta: row.priceDelta ?? row.price ?? 0
      });
    }
  }

  // Final structured menu object used by the frontend.
  return byItem;
}
