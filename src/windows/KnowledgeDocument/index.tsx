import { getAllDocs } from "../../lib/knowledgeBase";
import { renderBlock } from "../../lib/markdown";
import "./KnowledgeDocument.css";

interface KnowledgeDocumentPayload {
  path?: string;
}

export function KnowledgeDocumentWindow({ payload }: { payload?: unknown }) {
  const { path } = (payload ?? {}) as KnowledgeDocumentPayload;
  const doc = path ? getAllDocs().find((d) => d.path === path) : undefined;

  if (!doc) {
    return (
      <div className="kb-doc-window">
        <p className="kb-doc-window__missing">Documento non trovato.</p>
      </div>
    );
  }

  const title = typeof doc.frontmatter.title === "string" ? doc.frontmatter.title : doc.slug;

  return (
    <div className="kb-doc-window">
      <h1 className="kb-doc-window__title">{title}</h1>
      <div
        className="kb-doc-window__body"
        dangerouslySetInnerHTML={{ __html: renderBlock(doc.body) }}
      />
      <footer className="kb-doc-window__source">📄 {doc.path}</footer>
    </div>
  );
}
