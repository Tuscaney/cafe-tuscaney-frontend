export function formatMenu(raw) {
  if (!raw) return null;

  const byItem = {};

  for (const row of raw) {
    const [_, itemType] = row.PK.split("#");

    if (!byItem[itemType]) {
      byItem[itemType] = {
        meta: null,
        groups: {}
      };
    }

    // META
    if (row.SK === "META#") {
      byItem[itemType].meta = row;
      continue;
    }

    // GROUP
    if (row.SK.startsWith("GROUP#")) {
      const [, groupName] = row.SK.split("#");
      byItem[itemType].groups[groupName] = {
        definition: row,
        options: []
      };
      continue;
    }

    // OPTION
    if (row.SK.startsWith("OPTION#")) {
      const [, groupName] = row.SK.split("#");
      byItem[itemType].groups[groupName].options.push(row);
    }
  }

  return byItem;
}
