import sanitizeHtml from "sanitize-html";

const DAYLIGHT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "b",
    "strong",
    "i",
    "em",
    "u",
    "s",
    "a",
    "ul",
    "ol",
    "li",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "blockquote",
    "code",
    "pre",
    "img",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "hr",
    "span",
    "div",
    "video",
    "source",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height"],
    video: ["src", "controls", "width", "height", "poster"],
    source: ["src", "type"],
    th: ["colspan", "rowspan"],
    td: ["colspan", "rowspan"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: {
    img: ["http", "https"],
  },
  allowedSchemesAppliedToAttributes: ["href", "src", "cite"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
  },
  disallowedTagsMode: "discard",
};

export const sanitizeHtmlContent = (html: string | undefined | null): string =>
  html ? sanitizeHtml(html, DAYLIGHT_OPTIONS) : "";