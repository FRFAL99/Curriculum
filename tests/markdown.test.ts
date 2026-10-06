import { describe, expect, it } from "vitest";
import { getOverviewExcerpt, getReadingTime, renderBlock, renderInline } from "../src/lib/markdown";

/** Gli helper che trasformano i body della knowledge base (piano v2, Fase 26). */

describe("renderInline", () => {
  it("rende il grassetto senza avvolgere in un paragrafo", () => {
    expect(renderInline("Testo **forte**")).toBe("Testo <strong>forte</strong>");
  });
});

describe("renderBlock", () => {
  it("rende paragrafi e liste", () => {
    const html = renderBlock("# Titolo\n\n- uno\n- due");
    expect(html).toContain("<h1>Titolo</h1>");
    expect(html).toContain("<li>uno</li>");
  });
});

describe("getOverviewExcerpt", () => {
  it("prende solo la sezione Overview", () => {
    const body = "## Overview\n\nIl riassunto.\n\n## Problem\n\nAltro.";
    expect(getOverviewExcerpt(body)).toBe("Il riassunto.");
  });

  it("restituisce tutto il corpo se non ci sono sezioni", () => {
    expect(getOverviewExcerpt("Un solo paragrafo.")).toBe("Un solo paragrafo.");
  });
});

describe("getReadingTime", () => {
  it("stima circa 200 parole al minuto", () => {
    expect(getReadingTime("parola ".repeat(400))).toBe(2);
  });

  it("non scende sotto il minuto", () => {
    expect(getReadingTime("due parole")).toBe(1);
  });
});
