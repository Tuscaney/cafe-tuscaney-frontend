import { useState } from "react";
import { useCart } from "../context/CartContext";

// This controls the order instead of relying on DynamoDB.
const GROUP_ORDER = {
  sandwich: ["Bread", "Meat", "Extra Meat", "Cheese", "Lettuce", "Veggies", "Condiments"],
  soup: ["Broth", "Proteins", "Vegetables"],
  salad: [
    "Lettuce Base",
    "Veggies",
    "Fruits",
    "Proteins",
    "Nuts",
    "Seeds",
    "Cheeses",
    "Grains",
    "Fresh Herbs",
  ],
  drink: ["Base", "Flavors", "Modifier"],
  sweet: ["Treats"],
};

// Helper to sort groups into a human-friendly order.
function getOrderedGroups(itemType, groups) {
  const entries = Object.entries(groups);
  const order = GROUP_ORDER[itemType] || [];

  return entries.sort(([nameA], [nameB]) => {
    const indexA = order.indexOf(nameA);
    const indexB = order.indexOf(nameB);

    // If both are in the order list, sort by that index.
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    // If only one is in the list, that one goes first.
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    // Otherwise, fall back to alphabetical.
    return nameA.localeCompare(nameB);
  });
}

// This component renders one builder section (Sandwich, Soup, Salad, etc.).
// It shows each group and each option inside that group.
// All inputs are checkboxes (square), even for single-choice groups.
export default function MenuSection({ title, itemType, item }) {
  const { addItem } = useCart();

  // Example shape:
  // { Bread: "wheat", Veggies: ["tomato", "onion"] }
  const [selections, setSelections] = useState({});

  if (!item || !item.meta) return null;

  const { meta, groups } = item;

  // Single-choice groups (type = "single") still only store one value,
  // but shows it with a checkbox for a consistent "square" look.
  function handleSingleChange(groupName, optionId) {
    setSelections((prev) => {
      // If the same option is clicked again, allow unchecking it.
      const current = prev[groupName];
      if (current === optionId) {
        return { ...prev, [groupName]: undefined };
      }
      return {
        ...prev,
        [groupName]: optionId,
      };
    });
  }

  // Multi-choice groups (type = "multi") store an array of ids.
  function handleMultiChange(groupName, optionId) {
    setSelections((prev) => {
      const current = Array.isArray(prev[groupName]) ? prev[groupName] : [];
      const exists = current.includes(optionId);

      return {
        ...prev,
        [groupName]: exists
          ? current.filter((id) => id !== optionId) // uncheck
          : [...current, optionId], // check
      };
    });
  }

  // When "Add to Cart" is clicked, the type, base price,
  // and all selections from this section are stored.
  function handleAddToCart() {
    const cartItem = {
      type: meta.category || itemType,
      basePrice: meta.basePrice,
      selections,
    };

    addItem(cartItem);
    alert(`Added ${title} to cart!`);
  }

  const orderedGroups = getOrderedGroups(itemType, groups);

  return (
    <section style={{ marginBottom: "40px" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>{title}</h2>
      <p>
        <strong>Base price:</strong> ${meta.basePrice.toFixed(2)}
      </p>

      {orderedGroups.map(([groupName, group]) => {
        const type = group.definition?.type || "single";
        const isSingle = type === "single";

        const selectedValue = selections[groupName];
        const selectedArray = Array.isArray(selectedValue) ? selectedValue : [];

        return (
          <div key={groupName} style={{ marginTop: "16px" }}>
            <div style={{ fontWeight: "600" }}>{groupName}</div>

            <div style={{ marginTop: "8px" }}>
              {group.options.map((option) => {
                const checked = isSingle
                  ? selectedValue === option.id
                  : selectedArray.includes(option.id);

                return (
                  <label
                    key={option.id}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      marginRight: "12px",
                      marginBottom: "8px",
                      fontSize: "0.9rem",
                    }}
                  >
                    <input
                      type="checkbox" // always checkbox for square bullets
                      name={`${itemType}-${groupName}-${option.id}`}
                      value={option.id}
                      checked={checked}
                      onChange={() =>
                        isSingle
                          ? handleSingleChange(groupName, option.id)
                          : handleMultiChange(groupName, option.id)
                      }
                      style={{ marginRight: "4px" }}
                    />
                    {option.label}
                    {option.priceDelta > 0 && (
                      <span
                        style={{ marginLeft: "4px", fontSize: "0.8rem" }}
                      >
                        (+${option.priceDelta.toFixed(2)})
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={handleAddToCart}
        style={{
          marginTop: "16px",
          padding: "8px 16px",
          borderRadius: "999px",
          border: "none",
          backgroundColor: "#16a34a",
          color: "white",
          cursor: "pointer",
        }}
      >
        Add {title} to Cart
      </button>
    </section>
  );
}

