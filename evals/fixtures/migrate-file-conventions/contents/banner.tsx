import cssText from "data-text:~contents/banner.css";
import type { PlasmoCSConfig } from "plasmo";
import { useEffect, useState } from "react";

import { sendToBackground } from "@plasmohq/messaging";
import { useStorage } from "@plasmohq/storage/hook";

export const config: PlasmoCSConfig = {
  matches: ["https://*.example.com/product/*"],
};

export const getStyle = () => {
  const style = document.createElement("style");
  style.textContent = cssText;
  return style;
};

const Banner = () => {
  const [enabled] = useStorage("enabled", true);
  const [lowest, setLowest] = useState<string | null>(null);

  useEffect(() => {
    sendToBackground({ name: "price", body: { url: location.href } }).then(
      (response) => setLowest(response.lowest),
    );
  }, []);

  if (!enabled || !lowest) return null;
  return <div className="banner">Lowest price seen: {lowest}</div>;
};

export default Banner;
