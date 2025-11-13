import { useMenu } from "./hooks/useMenu";
import { formatMenu } from "./utils/groupMenu";
import MenuSection from "./components/MenuSection";
import { useCart } from "./context/CartContext";

export default function App() {
  const raw = useMenu();
  const menu = raw ? formatMenu(raw) : null;
  const { items, clearCart } = useCart();

  async function placeOrder() {
    const url = `${import.meta.env.VITE_API_BASE_URL}/orders`;

    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify({ items })
    });

    const data = await res.json();
    alert("Order placed! ID: " + data.orderId);
    clearCart();
  }

  if (!menu) return <p>Loading menu…</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Café Tuscaney</h1>
      <p>Config-driven builders (menu from DynamoDB)</p>
      <hr />

      <MenuSection title="Sandwich" item={menu.sandwich} />
      <MenuSection title="Soup" item={menu.soup} />
      <MenuSection title="Salad" item={menu.salad} />
      <MenuSection title="Drink" item={menu.drink} />
      <MenuSection title="Sweet" item={menu.sweet} />

      <hr />
      <h3>Cart: {items.length} items</h3>
      {items.length > 0 && (
        <button onClick={placeOrder}>Place Order</button>
      )}
    </div>
  );
}


