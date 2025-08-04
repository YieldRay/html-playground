import { formatTS } from "./formatTS";

export function formatHTML(html: string): string {
  const domParser = new DOMParser();
  const doc = domParser.parseFromString(html, "text/html");

  for (const script of doc.querySelectorAll("script")) {
    if (script.innerHTML) {
      script.innerHTML = formatTS(script.innerHTML);
    }
  }
  return getFullHTMLFromDoc(doc);
}

export function getFullHTMLFromDoc(document: Document): string {
  const doctype = document.doctype
    ? `<!DOCTYPE ${document.doctype.name}${
        document.doctype.publicId ? ' PUBLIC "' + document.doctype.publicId + '"' : ""
      }${document.doctype.systemId ? ' "' + document.doctype.systemId + '"' : ""}>\n`
    : "";
  const html = doctype + document.documentElement.outerHTML;
  return html;
}
