import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "Link Highlighter",
    description: "Highlights every external link on example.com.",
    permissions: ["storage"],
  },
});
