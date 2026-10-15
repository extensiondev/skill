import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

function Popup() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    storage.getItem<number>("local:lastCount").then(setCount);
  }, []);

  return (
    <main>
      <h1>Link Highlighter</h1>
      <p>{count === null ? "No page read yet" : `${count} external links on the last page`}</p>
      <small>{import.meta.env.WXT_API_URL}</small>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<Popup />);
