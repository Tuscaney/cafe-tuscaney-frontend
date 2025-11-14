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

  // Small "toast" banner at the top of the page
  const [flash, setFlash] = useState(null); // { message, type }
  const flashTimeoutRef = useRef(null);

  // Remember last cart size so we can detect when an item is added
  const lastCountRef = useRef(items.length);

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

  // Track the last order result ("Last order ID: …")
  const [orderMessage, setOrderMessage] = useState(null);

  // Whenever the number of items goes up, assume something was added
  useEffect(() => {
    if (items.length > lastCountRef.current) {
      showFlash("Item added to cart.", "success");
    }
    lastCountRef.current = items.length;
  }, [items.length]);

  // Send the current cart to the backend /orders endpoint.
  // For now, the customer info and totals are still simple placeholders.
  async function placeOrder() {
    if (!items.length) return;

    try {
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

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();
      const id = data.id || data.orderId || "unknown";

      setOrderMessage(`Last order ID: ${id}`);
      showFlash("Order placed successfully!", "success");
      clearCart();
    } catch (err) {
      console.error(err);
      setOrderMessage("There was a problem placing your order.");
      showFlash("Order failed. Please try again.", "error");
    }
  }

  // While the menu is still loading, show a simple message.
  if (!menu) return <p className="p-4 text-slate-800">Loading menu…</p>;

  // Tiny, human-readable summary under the cart header
  function renderCartSummary() {
    if (!items.length) return null;

    return (
      <ul className="mt-2 list-disc pl-5 text-sm text-slate-800">
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
    <div className="min-h-screen bg-amber-50 text-slate-900">
      <main className="mx-auto max-w-5xl px-4 py-8">
        <header className="mb-6 border-b border-amber-200 pb-4">
          <h1 className="text-3xl font-bold text-amber-900">Café Tuscaney</h1>
          <p className="mt-1 text-sm text-slate-700">
            Build-your-own items from a config-driven menu.
          </p>

          {/* Small inline "toast" banner (no popup) */}
          {flash && (
            <div
              className={`mt-3 rounded-md px-3 py-2 text-sm ${
                flash.type === "error"
                  ? "border border-red-200 bg-red-50 text-red-800"
                  : "border border-emerald-200 bg-emerald-50 text-emerald-900"
              }`}
            >
              {flash.message}
            </div>
          )}
        </header>

        {/* Menu sections in cards (MenuSection already has card styling) */}
        <section className="space-y-6">
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
        </section>

        {/* Cart summary in its own card */}
        <section className="mt-8 rounded-lg bg-white p-4 shadow-md">
          <h3 className="text-lg font-semibold text-amber-900">
            Cart: {items.length} item(s)
          </h3>

          {renderCartSummary()}

          {orderMessage && (
            <p className="mt-2 text-xs text-slate-600">{orderMessage}</p>
          )}

          {items.length > 0 && (
            <button
              type="button"
              onClick={placeOrder}
              className="mt-4 inline-flex items-center rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            >
              Place Order
            </button>
          )}
        </section>
      </main>
    </div>
  );
}





