import { describe, expect, it } from "vitest";
import { sanitizeHtmlContent } from "./html";

describe("sanitizeHtmlContent", () => {
  it("strips script tags", () => {
    expect(sanitizeHtmlContent("<p>hello</p><script>alert(1)</script>")).toBe(
      "<p>hello</p>",
    );
  });

  it("strips inline event handlers", () => {
    expect(
      sanitizeHtmlContent('<img src="x" onerror="alert(1)">'),
    ).toBe('<img src="x" />');
  });

  it("strips javascript: URLs", () => {
    expect(sanitizeHtmlContent('<a href="javascript:alert(1)">x</a>')).toBe(
      '<a rel="noopener noreferrer">x</a>',
    );
  });

  it("adds rel=noopener to links", () => {
    expect(
      sanitizeHtmlContent('<a href="https://example.com">link</a>'),
    ).toBe(
      '<a href="https://example.com" rel="noopener noreferrer">link</a>',
    );
  });

  it("keeps safe formatting tags", () => {
    expect(
      sanitizeHtmlContent("<h2>Title</h2><ul><li>item</li></ul>"),
    ).toBe("<h2>Title</h2><ul><li>item</li></ul>");
  });

  it("returns empty string for null/undefined", () => {
    expect(sanitizeHtmlContent(null)).toBe("");
    expect(sanitizeHtmlContent(undefined)).toBe("");
  });
});