import { useState } from "react";
import { useCart } from "../context/CartContext";

// This component renders one menu section (e.g. Sandwich, Soup).
// It shows each option group with radio/checkbox inputs
// and saves the user's selections into the cart.
export default function MenuSection({ title, itemType, item }) {
  const { addItem } = useCart();

  // Local state to track what the user picked in this section.
  // Example shape: { Bread: "wheat", Veggies: ["tomato", "onion"] }
  const [selections, setSelections] = useState({});

  // If this item type has no meta info yet, don't render anything.
  if (!item || !item.meta) return null;

  const { meta, groups } = item;

  // For groups that should only allow one choice (type = "single").
  function handleSingleChange(groupName, optionId) {
    setSelections((prev) => ({
      ...prev,
      [groupName]: optionId
    }));
  }

  // For groups that allow multiple choices (type = "multi").
  function handleMultiChange(groupName, optionId) {
    setSelections((prev) => {
      const current = Array.isArray(prev[groupName]) ? prev[groupName] : [];
      const exists = current.includes(optionId);

      return {
        ...prev,
        [groupName]: exists
          ? current.filter((id) => id !== optionId) // uncheck
          : [...current, optionId] // check
      };
    });
  }

  // When the user clicks "Add to Cart", stores:
  // - the type (sandwich, soup, etc.)
  // - the base price from meta
  // - all of their selections from this section
  function handleAddToCart() {
    const cartItem = {
      type: meta.category || itemType,
      basePrice: meta.basePrice,
      selections
    };

    addItem(cartItem);
    alert(`Added ${title} to cart!`);
  }

  return (
    <section style={{ marginBottom: "40px" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>{title}</h2>
      <p>
        <strong>Base price:</strong> ${meta.basePrice.toFixed(2)}
      </p>

      {Object.entries(groups).map(([groupName, group]) => {
        // group.definition.type comes from DynamoDB (single | multi)
        const type = group.definition?.type || "single";
        const isSingle = type === "single";

        const selectedValue = selections[groupName];
        const selectedArray = Array.isArray(selectedValue)
          ? selectedValue
          : [];

        return (
          <div key={groupName} style={{ marginTop: "16px" }}>
            <div style={{ fontWeight: "600" }}>{groupName}</div>

            <div style={{ marginTop: "8px" }}>
              {group.options.map((option) => {
                // input "name" keeps radios grouped by item+group
                const inputName = `${itemType}-${groupName}`;
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
                      fontSize: "0.9rem"
                    }}
                  >
                    <input
                      type={isSingle ? "radio" : "checkbox"}
                      name={inputName}
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
          cursor: "pointer"
        }}
      >
        Add {title} to Cart
      </button>
    </section>
  );
}
