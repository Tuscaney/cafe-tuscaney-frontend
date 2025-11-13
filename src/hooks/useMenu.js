import { useEffect, useState } from "react";

export function useMenu() {
  const [menu, setMenu] = useState(null);

  useEffect(() => {
    async function load() {
      const url = `${import.meta.env.VITE_API_BASE_URL}/menu`;
      const res = await fetch(url);
      const data = await res.json();
      setMenu(data);
    }
    load();
  }, []);

  return menu;
}
