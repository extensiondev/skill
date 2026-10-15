export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(async () => {
    await storage.setItem("local:highlightColor", "#ffe066");
  });

  browser.runtime.onMessage.addListener((message) => {
    if (message?.type === "count") {
      return storage.setItem("local:lastCount", message.value);
    }
  });
});
