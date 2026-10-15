import { useStorage } from "@plasmohq/storage/hook";

import "~style.css";

function IndexPopup() {
  const [enabled, setEnabled] = useStorage("enabled", true);

  return (
    <main className="popup">
      <h1>Price Banner</h1>
      <label>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(event) => setEnabled(event.target.checked)}
        />
        Show the banner
      </label>
    </main>
  );
}

export default IndexPopup;
