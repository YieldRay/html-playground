/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider"
import { App } from "./App";
import { rewriteHTML } from "./utils/rewriteHTML";
import { atou } from "./utils/utils";

let initialHTML = /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
  <button onclick="showConfetti()">Click me!</button>
</body>
<script type="module">
  import confetti from "canvas-confetti";
  globalThis.showConfetti = () => { confetti(); console.log("Confetti!"); }
</script>
</html>`;

try {
  const hash = window.location.hash.slice(1);
  if (hash.startsWith("~")) {
    const html = atou(hash.slice(1));
    document.open();
    document.write(rewriteHTML(html));
    document.close();
    // DO NOT render()
  } else if (hash) {
    initialHTML = atou(hash);
    render();
  } else {
    render();
  }
} catch {
  render();
}

function render() {
  const elem = document.getElementById("root")!;
  const app = (
    <StrictMode>
      <ThemeProvider storageKey="ui-theme">
        <App initialHTML={initialHTML} />
        <Toaster position="top-center" />
      </ThemeProvider>
    </StrictMode>
  );

  if (import.meta.hot) {
    // With hot module reloading, `import.meta.hot.data` is persisted.
    const root = (import.meta.hot.data.root ??= createRoot(elem));
    root.render(app);
  } else {
    // The hot module reloading API is not available in production.
    createRoot(elem).render(app);
  }
}
