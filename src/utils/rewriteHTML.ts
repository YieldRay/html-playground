import { rewriteBareImport } from "./rewriteTS";

export function rewriteHTML(html: string) {
  const domParser = new DOMParser();
  const doc = domParser.parseFromString(html, "text/html");
  const scripts = doc.querySelectorAll("script");
  for (const script of scripts) {
    if (script.innerHTML) {
      const jsCode = script.innerHTML;
      const rewrittenCode = rewriteBareImport(jsCode);
      script.innerHTML = rewrittenCode;
    }
  }
  const script = doc.createElement("script");
  script.type = "module";
  script.innerHTML = `import { Hook } from 'https://esm.sh/console-feed';\nHook(window.console, log => window.parent.postMessage(log));`;
  doc.head.prepend(script);
  return doc.documentElement.outerHTML;
}

export function rewriteScript(script: string) {
  let js = rewriteBareImport(script);
  js = JSON.stringify(js);
  js = `console.log(eval(${js}))`;
  return /*js*/ `import('data:text/javascript,${encodeURIComponent(js)}').catch(console.error)`;
}
