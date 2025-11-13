import { useCart } from "../context/CartContext";

export default function MenuSection({ title, item }) {
  const { addItem } = useCart();

  if (!item) return null;

  const { meta, groups } = item;

  function handleAdd() {
    addItem({
      type: meta.category,
      basePrice: meta.basePrice,
      selections: {} // will fill later when selecting options
    });
  }

  return (
    <section style={{ marginBottom: "40px" }}>
      <h2>{title}</h2>
      <p><strong>Base price:</strong> ${meta.basePrice.toFixed(2)}</p>

      <ul>
        {Object.entries(groups).map(([groupName, group]) => (
          <li key={groupName}>
            {groupName} ({group.options.length} options)
          </li>
        ))}
      </ul>

      <button onClick={handleAdd}>Add to Cart</button>
    </section>
  );
}
