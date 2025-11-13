import { useEffect, useState } from "react";
import { getMenu } from "./lib/api";
import { groupMenu } from "./lib/menu-utils";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const raw = await getMenu();
        const grouped = groupMenu(raw);
        setMenu(grouped);
      } catch (e) {
        setError(e.message || "Failed to load menu");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6 text-gray-700">Loading menu…</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!menu) return <div className="p-6">No menu found.</div>;

  const categories = Object.keys(menu);

  return (
    <div className="min-h-screen bg-neutral-50 text-gray-900">
      <header className="p-6 border-b bg-white">
        <h1 className="text-2xl font-bold">Café Tuscaney</h1>
        <p className="text-sm text-gray-600">Config-driven builders (menu from DynamoDB)</p>
      </header>

      <main className="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const data = menu[cat];
          const groups = Object.entries(data.groups);
          return (
            <section key={cat} className="bg-white rounded-2xl shadow p-5">
              <h2 className="text-xl font-semibold capitalize">{cat}</h2>
              {typeof data.basePrice === "number" && (
                <div className="mt-1 text-sm text-gray-600">Base price: ${data.basePrice.toFixed(2)}</div>
              )}
              <ul className="mt-4 space-y-2">
                {groups.map(([groupName, options]) => (
                  <li key={groupName} className="text-sm">
                    <span className="font-medium">{groupName}</span>{" "}
                    <span className="text-gray-500">({options.length} options)</span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </main>
    </div>
  );
}

