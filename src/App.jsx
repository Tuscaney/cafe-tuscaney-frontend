import { useEffect, useRef, useState } from "react";
import { useMenu } from "./hooks/useMenu";
import { formatMenu } from "./utils/groupMenu";
import MenuSection from "./components/MenuSection";
import { useCart } from "./context/CartContext";

// Main app shell:
// - loads the menu from the API
// - reshapes it with formatMenu()
// - renders builder sections in a fixed order
// - sends the cart to /orders when "Place Order" is clicked
// - shows a small inline "toast" message instead of alert()
export default function App() {
  // raw = flat array of DynamoDB records from the backend
  const raw = useMenu();

  // formatMenu turns the flat list into a nested structure
  const menu = raw ? formatMenu(raw) : null;

  // CartContext gives us the current cart items and a way to clear them
  const { items, clearCart } = useCart();

  // Customer info for the order
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Small "toast" banner at the top of the page
  const [flash, setFlash] = useState(null); // { message, type }
  const flashTimeoutRef = useRef(null);

  // Remember last cart size so we can detect when an item is added
  const lastCountRef = useRef(items.length);

  // Track the last order result ("Last order ID: …")
  const [orderMessage, setOrderMessage] = useState(null);

  // Show a tiny inline banner for a few seconds
  function showFlash(message, type = "info") {
    if (flashTimeoutRef.current) {
      clearTimeout(flashTimeoutRef.current);
    }
    setFlash({ message, type });
    flashTimeoutRef.current = setTimeout(() => {
      setFlash(null);
    }, 3000);
  }

  // Whenever the number of items goes up, assume something was added
  useEffect(() => {
    if (items.length > lastCountRef.current) {
      showFlash("Item added to cart.", "success");
    }
    lastCountRef.current = items.length;
  }, [items.length]);

  // Send the current cart to the backend /orders endpoint.
  async function placeOrder() {
    if (!items.length) return;

    // simple guard so you don't get empty customer info
    if (!customerName.trim() || !customerPhone.trim()) {
      showFlash(
        "Please enter your name and phone before placing an order.",
        "error"
      );
      return;
    }

    try {
      const url = `${import.meta.env.VITE_API_BASE_URL}/orders`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: customerName.trim(),
            phone: customerPhone.trim(),
          },
          items,
          // These will later be calculated on the backend pricing engine.
          subtotal: 0,
          tax: 0,
          total: 0,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();
      const id = data.id || data.orderId || "unknown";

      setOrderMessage(`Last order ID: ${id}`);
      showFlash("Order placed successfully!", "success");
      clearCart();
      setCustomerName("");
      setCustomerPhone("");
    } catch (err) {
      console.error(err);
      setOrderMessage("There was a problem placing your order.");
      showFlash("Order failed. Please try again.", "error");
    }
  }

  // While the menu is still loading, show a simple message.
  if (!menu) return <p className="app-loading">Loading menu…</p>;

  // Tiny, human-readable summary under the cart header
  function renderCartSummary() {
    if (!items.length) return null;

    return (
      <ul className="cart-summary">
        {items.map((item, index) => {
          const label =
            item.type && item.type.length
              ? item.type.charAt(0).toUpperCase() + item.type.slice(1)
              : "Item";

          const parts = item.selections
            ? Object.entries(item.selections).map(([groupLabel, values]) => {
                const readable = Array.isArray(values)
                  ? values.join(", ")
                  : values;
                return `${groupLabel}: ${readable}`;
              })
            : [];

          return (
            <li key={index}>
              <strong>{label}</strong>
              {parts.length > 0 && " — " + parts.join("; ")}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="app-root">
      <main className="app-main">
        <header className="app-header">
          <h1 className="app-title">Café Tuscaney</h1>
          <p className="app-subtitle">
            Always Made With Love. Always Made Your Way
          </p>

          {/* Small inline "toast" banner (no popup) */}
          {flash && (
            <div
              className={
                "toast " +
                (flash.type === "error" ? "toast-error" : "toast-success")
              }
            >
              {flash.message}
            </div>
          )}
        </header>

        {/* Order of sections: Sandwich, Soup, Salad, Drink, Sweet */}
        <section>
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
        </section>

        {/* Cart card */}
        <section className="cart-card">
          {/* Simple customer info form */}
          <div className="cart-customer">
            <div className="cart-field">
              <label htmlFor="customer-name">Name</label>
              <input
                id="customer-name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer name"
              />
            </div>
            <div className="cart-field">
              <label htmlFor="customer-phone">Phone</label>
              <input
                id="customer-phone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="555-555-5555"
              />
            </div>
          </div>

          <h3 className="cart-title">Cart: {items.length} item(s)</h3>

          {renderCartSummary()}

          {orderMessage && (
            <p className="cart-order-message">{orderMessage}</p>
          )}

          {items.length > 0 && (
            <button
              type="button"
              onClick={placeOrder}
              className="btn-primary"
            >
              Place Order
            </button>
          )}
        </section>
      </main>
    </div>
  );
}







