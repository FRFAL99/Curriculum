import { describe, expect, it } from "vitest";
import { describe as summarize, renderHead, renderStatic, type Profile } from "../vite/kb-head";

/**
 * Prova il plugin che genera l'`<head>` e il profilo statico (piano v2,
 * Fase 26). Quel codice gira solo in build: un errore qui non rompe niente
 * in sviluppo e si scopre guardando l'anteprima di un link già condiviso.
 */

const PROFILE: Profile = {
  name: "Nome Cognome",
  role: "Software Engineer",
  location: "Città, Italia",
  body: "Prima frase di presentazione. Seconda frase, molto più lunga della prima, scritta apposta perché insieme alle altre superi il limite dei centosessanta caratteri della description.\n\nSecondo paragrafo.",
  email: "nome@example.com",
  github: "https://github.com/esempio",
  linkedin: "https://www.linkedin.com/in/esempio",
};

const SITE = "https://esempio.netlify.app";

describe("descrizione", () => {
  it("si ferma prima di superare i 160 caratteri", () => {
    const out = summarize(PROFILE.body);
    expect(out).toBe("Prima frase di presentazione.");
    expect(out.length).toBeLessThanOrEqual(160);
  });

  it("unisce più frasi finché ci stanno", () => {
    expect(summarize("Una. Due. Tre.")).toBe("Una. Due. Tre.");
  });

  it("tiene una frase sola anche se è più lunga del limite", () => {
    const lunga = `${"parola ".repeat(40)}.`;
    expect(summarize(lunga).length).toBeGreaterThan(160);
  });

  it("toglie la sintassi Markdown", () => {
    expect(summarize("Testo con **grassetto** e `codice`.")).toBe("Testo con grassetto e codice.");
  });
});

describe("head", () => {
  const head = renderHead(PROFILE, SITE);

  it("intitola la pagina «nome — ruolo»", () => {
    expect(head).toContain("<title>Nome Cognome — Software Engineer</title>");
  });

  it("dichiara l'anteprima in inglese con l'italiano come alternativa", () => {
    expect(head).toContain('property="og:locale" content="en_US"');
    expect(head).toContain('property="og:locale:alternate" content="it_IT"');
  });

  it("punta l'immagine e il canonical al sito", () => {
    expect(head).toContain(`content="${SITE}/og.png"`);
    expect(head).toContain(`href="${SITE}/"`);
    expect(head).toContain('name="twitter:card" content="summary_large_image"');
  });

  it("usa l'URL degli asset quando è diverso dal sito (anteprime Netlify)", () => {
    const anteprima = "https://deploy-preview-1--esempio.netlify.app";
    const out = renderHead(PROFILE, SITE, anteprima);
    expect(out).toContain(`content="${anteprima}/og.png"`);
    expect(out).toContain(`content="${SITE}/"`);
  });

  it("omette URL assoluti quando il sito non è noto (build locale)", () => {
    const out = renderHead(PROFILE);
    expect(out).not.toContain("og:image");
    expect(out).not.toContain("canonical");
  });

  it("descrive la persona in JSON-LD, senza il telefono", () => {
    const match = head.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
    const person = JSON.parse(match![1]) as Record<string, unknown>;
    expect(person["@type"]).toBe("Person");
    expect(person.jobTitle).toBe("Software Engineer");
    expect(person.email).toBe("mailto:nome@example.com");
    expect(person.sameAs).toEqual([PROFILE.github, PROFILE.linkedin]);
    expect(JSON.stringify(person)).not.toContain("phone");
  });

  it("non lascia che il JSON-LD chiuda il proprio <script>", () => {
    const out = renderHead({ ...PROFILE, role: "</script><script>alert(1)</script>" }, SITE);
    const jsonLd = out.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)![1];
    expect(jsonLd).not.toContain("</script>");
    expect(JSON.parse(jsonLd).jobTitle).toBe("</script><script>alert(1)</script>");
  });

  it("neutralizza le virgolette nei meta", () => {
    const out = renderHead({ ...PROFILE, role: 'Dev " onload=alert(1)' }, SITE);
    expect(out).toContain("&quot;");
    expect(out).not.toMatch(/content="Dev " /);
  });
});

describe("profilo statico", () => {
  const html = renderStatic(PROFILE);

  it("mette nome, ruolo e luogo", () => {
    expect(html).toContain("<h1>Nome Cognome</h1>");
    expect(html).toContain("Software Engineer");
    expect(html).toContain("Città, Italia");
  });

  it("rende ogni paragrafo del corpo", () => {
    expect(html).toContain("<p>Prima frase di presentazione.");
    expect(html).toContain("<p>Secondo paragrafo.</p>");
  });

  it("elenca i contatti come link", () => {
    expect(html).toContain('href="mailto:nome@example.com"');
    expect(html).toContain(PROFILE.linkedin!);
    expect(html).toContain(PROFILE.github!);
  });

  it("neutralizza l'HTML che arrivasse dalla knowledge base", () => {
    const out = renderStatic({ ...PROFILE, name: "<img src=x onerror=alert(1)>" });
    expect(out).not.toContain("<img");
    expect(out).toContain("&lt;img");
  });

  it("omette le righe dei campi assenti", () => {
    const out = renderStatic({ name: "Nome", role: "Ruolo", body: "Testo." });
    expect(out).not.toContain("class=\"where\"");
    expect(out).not.toContain("<ul>");
  });
});
