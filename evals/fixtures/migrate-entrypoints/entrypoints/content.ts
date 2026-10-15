export default defineContentScript({
  matches: ["*://*.example.com/*"],
  async main(ctx) {
    const color = (await storage.getItem<string>("local:highlightColor")) ?? "#ffe066";
    const paint = () => {
      const links = document.querySelectorAll<HTMLAnchorElement>("a[href^='http']");
      let count = 0;
      for (const link of links) {
        if (link.host !== location.host) {
          link.style.backgroundColor = color;
          count += 1;
        }
      }
      browser.runtime.sendMessage({ type: "count", value: count });
    };
    paint();
    ctx.addEventListener(window, "wxt:locationchange", paint);
  },
});
