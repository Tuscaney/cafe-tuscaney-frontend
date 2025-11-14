import { useMenu } from "./hooks/useMenu";
import { formatMenu } from "./utils/groupMenu";
import MenuSection from "./components/MenuSection";
import { useCart } from "./context/CartContext";

// This is the main app shell. It:
// 1) Loads the raw menu from the API with useMenu()
// 2) Reshapes it with formatMenu() for easier rendering
// 3) Shows builder sections in a fixed order
// 4) Sends the cart to the backend when "Place Order" is clicked
export default function App() {
  // raw = flat array of DynamoDB records from the backend
  const raw = useMenu();

  // formatMenu turns the flat list into a nested structure
  const menu = raw ? formatMenu(raw) : null;

  // CartContext gives us the current cart items and a way to clear them
  const { items, clearCart } = useCart();

  // This function sends the current cart to the backend /orders endpoint.
  // For now, the customer info and totals are simple placeholders.
  async function placeOrder() {
    const url = `${import.meta.env.VITE_API_BASE_URL}/orders`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: {
          name: "Demo Customer",
          phone: "555-555-5555",
        },
        items,
        // These will later be calculated on the backend pricing engine.
        subtotal: 0,
        tax: 0,
        total: 0,
      }),
    });

    const data = await res.json();
    alert("Order placed! ID: " + (data.id || data.orderId || "unknown"));
    clearCart();
  }

  // While the menu is still loading, show a simple message.
  if (!menu) return <p>Loading menu…</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Café Tuscaney</h1>
      <p>Build-your-own items from a config-driven menu.</p>
      <hr />

      {/* Order of sections: Sandwich, Soup, Salad, Drink, Sweet */}
      <MenuSection
        title="Sandwich"
        itemType="sandwich"
        item={menu.sandwich}
      />
      <MenuSection title="Soup" itemType="soup" item={menu.soup} />
      <MenuSection title="Salad" itemType="salad" item={menu.salad} />
      <MenuSection title="Drink" itemType="drink" item={menu.drink} />
      <MenuSection
        title="Sweet Treat"
        itemType="sweet"
        item={menu.sweet}
      />

      <hr />
      <h3>Cart: {items.length} item(s)</h3>
      {items.length > 0 && (
        <button
          type="button"
          onClick={placeOrder}
          style={{
            marginTop: "8px",
            padding: "8px 16px",
            borderRadius: "999px",
            border: "none",
            backgroundColor: "#2563eb",
            color: "white",
            cursor: "pointer",
          }}
        >
          Place Order
        </button>
      )}
    </div>
  );
}



