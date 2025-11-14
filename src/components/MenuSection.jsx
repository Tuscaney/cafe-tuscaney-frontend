import { useState } from "react";
import { useCart } from "../context/CartContext";

// Preferred group order for each item type
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

// For drink flavors, group by type to reflect menu
const DRINK_FRUIT_FLAVORS = new Set([
  "strawberry",
  "raspberry",
  "blueberry",
  "blackberry",
  "peach",
  "cherry",
  "apricot",
  "mango",
  "pineapple",
  "coconut",
  "passionfruit",
  "watermelon",
  "grape",
  "kiwi",
  "rhubarb",
]);

const DRINK_HERB_FLAVORS = new Set([
  "mint",
  "lavender",
  "basil",
  "rosemary",
  "hibiscus",
  "rose",
  "chamomile",
]);

const DRINK_OTHER_FLAVORS = new Set([
  "ginger",
  "vanilla",
  "cinnamon",
  "cardamom",
  "sichuan",
]);

// For salad cheeses, split into crumbled/soft vs shredded/hard
const SOFT_CHEESE_IDS = new Set(["feta", "goat", "bleu", "burrata"]);
const HARD_CHEESE_IDS = new Set(["parmesan", "cheddar", "mozzarella"]);

// Helper: sort groups into a consistent order
function getOrderedGroups(itemType, groups) {
  const entries = Object.entries(groups);
  const order = GROUP_ORDER[itemType] || [];

  return entries.sort(([nameA], [nameB]) => {
    const indexA = order.indexOf(nameA);
    const indexB = order.indexOf(nameB);

    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return nameA.localeCompare(nameB);
  });
}

// Helper: render a single checkbox option
function OptionCheckbox({ itemType, groupName, option, checked, onChange }) {
  return (
    <label key={option.id} className="menu-option">
      <input
        type="checkbox" // always checkbox (square look)
        name={`${itemType}-${groupName}-${option.id}`}
        value={option.id}
        checked={checked}
        onChange={onChange}
        className="menu-option-input"
      />
      <span className="menu-option-label">{option.label}</span>
      {option.priceDelta > 0 && (
        <span className="menu-option-price">
          (+${option.priceDelta.toFixed(2)})
        </span>
      )}
      {option.price && option.price > 0 && (
        <span className="menu-option-price">
          (${option.price.toFixed(2)})
        </span>
      )}
    </label>
  );
}

// This component renders one builder section (Sandwich, Soup, Salad, Drink, Sweet).
// It reads the grouped menu from DynamoDB and lets the user pick options
// into local state, then adds that configuration to the cart.
export default function MenuSection({ title, itemType, item }) {
  const { addItem } = useCart();

  // Example shape:
  // { Bread: "wheat", Veggies: ["tomato", "onion"] }
  const [selections, setSelections] = useState({});

  if (!item || !item.meta) return null;

  const { meta, groups } = item;

  // Single-choice groups: store a single id (but still show checkbox).
  function handleSingleChange(groupName, optionId) {
    setSelections((prev) => {
      const current = prev[groupName];
      if (current === optionId) {
        // Click again to uncheck
        return { ...prev, [groupName]: undefined };
      }
      return {
        ...prev,
        [groupName]: optionId,
      };
    });
  }

  // Multi-choice groups: store an array of ids.
  function handleMultiChange(groupName, optionId) {
    setSelections((prev) => {
      const current = Array.isArray(prev[groupName]) ? prev[groupName] : [];
      const exists = current.includes(optionId);

      return {
        ...prev,
        [groupName]: exists
          ? current.filter((id) => id !== optionId)
          : [...current, optionId],
      };
    });
  }

  // Add the configured item to the cart.
  // No longer use alert() here; App.jsx detects the cart size change
  // and shows a small inline toast message instead.
  function handleAddToCart() {
    const cartItem = {
      type: meta.category || itemType,
      basePrice: meta.basePrice ?? 0,
      selections,
    };

    addItem(cartItem);
  }

  const orderedGroups = getOrderedGroups(itemType, groups);

  return (
    <section className="menu-section">
      <h2 className="menu-section-title">{title}</h2>
      <p className="menu-base-price">
        <span>Base price:</span> ${meta.basePrice.toFixed(2)}
      </p>

      <div className="menu-groups">
        {orderedGroups.map(([groupName, group]) => {
          const type = group.definition?.type || "single";
          const isSingle = type === "single";

          const selectedValue = selections[groupName];
          const selectedArray = Array.isArray(selectedValue)
            ? selectedValue
            : [];

          const options = group.options;

          // --- SPECIAL ORGANIZATION CASES ---

          // 1) SWEET TREATS: split by kind (cookies, cakes, etc.)
          if (itemType === "sweet" && groupName === "Treats") {
            const buckets = {
              Cookies: options.filter((o) => o.id.startsWith("cookie-")),
              Cakes: options.filter((o) => o.id.startsWith("cake-")),
              "Cinnamon Rolls": options.filter((o) =>
                o.id.startsWith("cinnamonroll")
              ),
              Cheesecake: options.filter((o) =>
                o.id.startsWith("cheesecake")
              ),
              Tarts: options.filter((o) => o.id.startsWith("tart-")),
              Muffins: options.filter((o) => o.id.startsWith("muffin-")),
            };

            return (
              <div key={groupName} className="menu-group">
                <div className="menu-group-title">Sweet Treats</div>
                <div className="menu-buckets">
                  {Object.entries(buckets).map(
                    ([bucketName, bucketOptions]) => {
                      if (!bucketOptions.length) return null;

                      return (
                        <div key={bucketName} className="menu-bucket">
                          <div className="menu-bucket-title">
                            {bucketName}
                          </div>
                          <div className="menu-bucket-options">
                            {bucketOptions.map((option) => {
                              const checked = selectedArray.includes(
                                option.id
                              );
                              return (
                                <OptionCheckbox
                                  key={option.id}
                                  itemType={itemType}
                                  groupName={groupName}
                                  option={option}
                                  checked={checked}
                                  onChange={() =>
                                    handleMultiChange(groupName, option.id)
                                  }
                                />
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            );
          }

          // 2) DRINK FLAVORS: Fruit / Herbs & Flowers / Other
          if (itemType === "drink" && groupName === "Flavors") {
            const fruit = options.filter((o) => DRINK_FRUIT_FLAVORS.has(o.id));
            const herbs = options.filter((o) => DRINK_HERB_FLAVORS.has(o.id));
            const other = options.filter((o) => DRINK_OTHER_FLAVORS.has(o.id));

            const buckets = {
              "Fruit Flavors": fruit,
              "Herb & Flower Flavors": herbs,
              "Other Flavors": other,
            };

            return (
              <div key={groupName} className="menu-group">
                <div className="menu-group-title">
                  Flavors (+$0.50 each)
                </div>
                <div className="menu-buckets">
                  {Object.entries(buckets).map(
                    ([bucketName, bucketOptions]) => {
                      if (!bucketOptions.length) return null;

                      return (
                        <div key={bucketName} className="menu-bucket">
                          <div className="menu-bucket-title">
                            {bucketName}
                          </div>
                          <div className="menu-bucket-options">
                            {bucketOptions.map((option) => {
                              const checked = selectedArray.includes(
                                option.id
                              );
                              return (
                                <OptionCheckbox
                                  key={option.id}
                                  itemType={itemType}
                                  groupName={groupName}
                                  option={option}
                                  checked={checked}
                                  onChange={() =>
                                    handleMultiChange(groupName, option.id)
                                  }
                                />
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            );
          }

          // 3) SALAD CHEESES: Crumbled/Soft vs Shredded/Hard
          if (itemType === "salad" && groupName === "Cheeses") {
            const soft = options.filter((o) => SOFT_CHEESE_IDS.has(o.id));
            const hard = options.filter((o) => HARD_CHEESE_IDS.has(o.id));

            const buckets = {
              "Crumbled / Soft": soft,
              "Shredded / Hard": hard,
            };

            return (
              <div key={groupName} className="menu-group">
                <div className="menu-group-title">Cheeses</div>
                <div className="menu-group-note">
                  First cheese included, extras +$1
                </div>
                <div className="menu-buckets">
                  {Object.entries(buckets).map(
                    ([bucketName, bucketOptions]) => {
                      if (!bucketOptions.length) return null;

                      return (
                        <div key={bucketName} className="menu-bucket">
                          <div className="menu-bucket-title">
                            {bucketName}
                          </div>
                          <div className="menu-bucket-options">
                            {bucketOptions.map((option) => {
                              const checked = selectedArray.includes(
                                option.id
                              );
                              return (
                                <OptionCheckbox
                                  key={option.id}
                                  itemType={itemType}
                                  groupName={groupName}
                                  option={option}
                                  checked={checked}
                                  onChange={() =>
                                    handleMultiChange(groupName, option.id)
                                  }
                                />
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            );
          }

          // Default: normal group rendering (Sandwich, Soup, most Salad groups, etc.)
          return (
            <div key={groupName} className="menu-group">
              <div className="menu-group-title">{groupName}</div>

              <div className="menu-options">
                {options.map((option) => {
                  const checked = isSingle
                    ? selectedValue === option.id
                    : selectedArray.includes(option.id);

                  const onChange = () =>
                    isSingle
                      ? handleSingleChange(groupName, option.id)
                      : handleMultiChange(groupName, option.id);

                  return (
                    <OptionCheckbox
                      key={option.id}
                      itemType={itemType}
                      groupName={groupName}
                      option={option}
                      checked={checked}
                      onChange={onChange}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        className="btn-primary"
      >
        Add {title} to Cart
      </button>
    </section>
  );
}



