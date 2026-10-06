import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Bot, User, Send, RotateCcw, Cpu, Hash, Clock, Gauge, Mail, Download, X } from "lucide-react";
import { useLanguage } from "../../context/useLanguage";
import { LinkedinIcon } from "../../components/SocialIcons";
import { conversationStarters } from "../../context/translations";
import { readJSON, writeJSON } from "../../utils/storage";
import { renderBlock } from "../../lib/markdown";
import { getAllDocs, getContacts, getDocTitle, getProjects, getSocials } from "../../lib/knowledgeBase";
import type { Language, TranslationKey } from "../../context/translations";
import DOMPurify from "dompurify";
import "./Assistant.css";

interface ChatStats {
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  elapsedMs: number;
  tokensPerSecond: number;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  followups?: string[];
  stats?: ChatStats;
}

/** Una riga NDJSON dello stream della function (vedi netlify/functions/assistant.ts). */
interface StreamLine {
  delta?: string;
  done?: boolean;
  answer?: string;
  sources?: string[];
  followups?: string[];
  stats?: ChatStats;
  error?: string;
}

const STORAGE_KEY = "assistantConversation";
const MAX_HISTORY = 10;
const MAX_STARTERS = 5;
// Dopo quante risposte compare l'invito a contattare Francesco.
const CONTACT_AFTER_ANSWERS = 2;

// Fonti senza un titolo nel frontmatter (documenti lang-neutral).
const SOURCE_LABEL_KEY: Record<string, TranslationKey> = {
  skills: "skillsTitle",
  contact: "contactTitle",
  social: "contactTitle",
};

/**
 * Le domande di avvio: quelle generiche di `translations.ts` più una sul primo
 * progetto della knowledge base (il più basso `order`), dopo «Progetti».
 */
function starters(language: Language, t: (key: TranslationKey) => string): { label: string; prompt: string }[] {
  const list = [...conversationStarters[language]];
  const project = getProjects(language)[0];
  if (project) {
    const title = project.frontmatter.title;
    list.splice(2, 0, { label: title, prompt: t("assistantProjectStarter").replace("{title}", title) });
  }
  return list.slice(0, MAX_STARTERS);
}

function sourceLabel(path: string, t: (key: TranslationKey) => string): string {
  const doc = getAllDocs().find((d) => d.path === path);
  if (!doc) return path.split("/").pop() ?? path;
  const key = SOURCE_LABEL_KEY[doc.type];
  return key ? t(key) : getDocTitle(doc);
}

// Il testo arriva da un modello: lo si ripulisce prima di inserirlo come HTML.
function renderAnswer(markdown: string): string {
  return DOMPurify.sanitize(renderBlock(markdown));
}

/** Errore già pronto da mostrare al visitatore, nella lingua del sito. */
class AssistantError extends Error {}

export function AssistantWindow({ onOpenDoc }: { onOpenDoc?: (path: string) => void }) {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>(() => readJSON(STORAGE_KEY, []));
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Indice del messaggio che sta arrivando in streaming, se ce n'è uno.
  const [streamingIndex, setStreamingIndex] = useState<number | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [contactDismissed, setContactDismissed] = useState(false);
  const busy = loading || streamingIndex !== null;
  const lastMessage = messages.at(-1);
  const answerCount = messages.filter((m) => m.role === "assistant").length;
  const contacts = getContacts();
  const socials = getSocials();

  useEffect(() => {
    writeJSON(STORAGE_KEY, messages);
  }, [messages]);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight });
  }, [messages, loading]);

  async function callAssistant(currentMessages: ChatMessage[]) {
    const lastUserMessage = currentMessages[currentMessages.length - 1];
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError(null);
    setLoading(true);
    try {
      const history = currentMessages
        .slice(0, -1)
        .slice(-MAX_HISTORY)
        .map(({ role, content }) => ({ role, content }));

      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: lastUserMessage.content, language, history }),
        signal: controller.signal,
      });

      // 429 arriva sia dal rate limit Netlify (corpo non JSON) sia dalla
      // quota OpenRouter: in entrambi i casi basta riprovare più tardi.
      if (res.status === 429) throw new AssistantError(t("assistantRateLimited"));

      if (!res.ok || !res.body || !res.headers.get("Content-Type")?.includes("ndjson")) {
        // Parsing difensivo: la function può mancare (es. `npm run dev` senza
        // Netlify) o rispondere con corpo vuoto/non JSON.
        const raw = await res.text();
        let error: string | undefined;
        try {
          error = (JSON.parse(raw) as { error?: string }).error;
        } catch {
          // corpo non JSON: basta il codice HTTP
        }
        console.error(`Assistant error ${res.status}:`, error ?? raw.slice(0, 200));
        if (import.meta.env.DEV) {
          throw new AssistantError(
            `${t("assistantUnavailable")} (HTTP ${res.status}${error ? `, ${error}` : ""}; in locale serve \`npm run dev:full\`)`,
          );
        }
        throw new AssistantError(t("assistantUnavailable"));
      }

      // La risposta arriva a righe NDJSON: `delta` mentre il testo cresce,
      // `done` con la risposta pulita, fonti, domande e statistiche.
      const index = currentMessages.length;
      const update = (patch: Partial<ChatMessage>) =>
        setMessages((prev) => {
          const next = [...prev];
          next[index] = { ...(next[index] ?? { role: "assistant", content: "" }), ...patch };
          return next;
        });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let text = "";
      let finished = false;
      setLoading(false);
      setStreamingIndex(index);
      for (;;) {
        const { value, done } = await reader.read();
        buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
        const rows = buffer.split("\n");
        buffer = done ? "" : (rows.pop() ?? "");
        for (const row of rows) {
          if (!row.trim()) continue;
          const line = JSON.parse(row) as StreamLine;
          if (line.error) throw new AssistantError(t("assistantUnavailable"));
          if (typeof line.delta === "string") {
            text += line.delta;
            update({ role: "assistant", content: text });
          }
          if (line.done && typeof line.answer === "string") {
            finished = true;
            update({
              role: "assistant",
              content: line.answer,
              sources: line.sources,
              followups: line.followups,
              stats: line.stats,
            });
          }
        }
        if (done) break;
      }
      if (!finished) throw new AssistantError(t("assistantUnavailable"));
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      // Una risposta interrotta a metà non resta in chat: si può riprovare.
      setMessages((prev) => (prev.length > currentMessages.length ? prev.slice(0, currentMessages.length) : prev));
      if (!(err instanceof AssistantError)) console.error("Assistant request failed:", err);
      setError(err instanceof AssistantError ? err.message : t("assistantUnavailable"));
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
        setStreamingIndex(null);
        abortRef.current = null;
      }
    }
  }

  function handleSend(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setInput("");
    const next: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    callAssistant(next);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    handleSend(input);
  }

  function handleRetry() {
    callAssistant(messages);
  }

  function handleReset() {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreamingIndex(null);
    setLoading(false);
    setMessages([]);
    setError(null);
  }

  function renderInputRow() {
    return (
      <form className="assistant-window__input-row" onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("assistantPlaceholder")}
          maxLength={2000}
          disabled={busy}
        />
        <button type="submit" disabled={busy || !input.trim()} aria-label={t("send")}>
          <Send size={16} />
        </button>
      </form>
    );
  }

  const header = (
    <div className="assistant-window__header">
      <div className="assistant-window__header-title">
        <Bot size={16} strokeWidth={1.8} />
        <span>{t("assistantTitle")}</span>
      </div>
      {messages.length > 0 && (
        <button
          type="button"
          className="assistant-window__reset"
          onClick={handleReset}
          aria-label={t("resetConversation")}
        >
          <RotateCcw size={14} />
        </button>
      )}
    </div>
  );

  if (messages.length === 0) {
    return (
      <div className="assistant-window">
        <div className="assistant-window__empty">
          <div className="assistant-window__empty-inner">
            <h2 className="assistant-window__intro-title">{t("assistantTitle")}</h2>
            {renderInputRow()}
            <div className="assistant-window__starters">
              {starters(language, t).map((starter) => (
                <button
                  key={starter.label}
                  type="button"
                  className="assistant-window__starter"
                  onClick={() => handleSend(starter.prompt)}
                >
                  {starter.label}
                </button>
              ))}
            </div>
            {error && (
              <div className="assistant-window__error">
                <span>{error}</span>
                <button type="button" onClick={handleRetry}>
                  {t("retry")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="assistant-window">
      {header}

      <div className="assistant-window__messages" ref={messagesRef}>
        {messages.map((m, i) => (
          <div key={i} className={`assistant-msg assistant-msg--${m.role}`}>
            <div className="assistant-msg__icon">
              {m.role === "user" ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className="assistant-msg__bubble">
              {m.role === "assistant" ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: renderAnswer(m.content),
                  }}
                />
              ) : (
                <p>{m.content}</p>
              )}
              {m.sources && m.sources.length > 0 && (
                <div className="assistant-msg__sources">
                  {m.sources.map((source) => (
                    <button
                      key={source}
                      type="button"
                      className="assistant-msg__source"
                      onClick={() => onOpenDoc?.(source)}
                      title={source}
                    >
                      📄 {sourceLabel(source, t)}
                    </button>
                  ))}
                </div>
              )}
              {m.stats && i !== streamingIndex && (
                <div className="assistant-msg__stats">
                  <span className="assistant-msg__stat" title={t("assistantStatModel")}>
                    <Cpu size={11} strokeWidth={2} />
                    {m.stats.model}
                  </span>
                  <span className="assistant-msg__stat" title={t("assistantStatTokens")}>
                    <Hash size={11} strokeWidth={2} />
                    {m.stats.inputTokens}→{m.stats.outputTokens}
                  </span>
                  <span className="assistant-msg__stat" title={t("assistantStatTime")}>
                    <Clock size={11} strokeWidth={2} />
                    {(m.stats.elapsedMs / 1000).toFixed(1)}s
                  </span>
                  <span className="assistant-msg__stat" title={t("assistantStatSpeed")}>
                    <Gauge size={11} strokeWidth={2} />
                    {m.stats.tokensPerSecond.toFixed(1)} t/s
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {!busy && lastMessage?.role === "assistant" && lastMessage.followups && lastMessage.followups.length > 0 && (
          <div className="assistant-window__followups" aria-label={t("assistantFollowups")}>
            {lastMessage.followups.map((question) => (
              <button
                key={question}
                type="button"
                className="assistant-window__starter"
                onClick={() => handleSend(question)}
              >
                {question}
              </button>
            ))}
          </div>
        )}

        {!busy && !contactDismissed && answerCount >= CONTACT_AFTER_ANSWERS && (
          <div className="assistant-contact">
            <div className="assistant-contact__head">
              <span>{t("assistantContactPrompt")}</span>
              <button
                type="button"
                className="assistant-contact__close"
                onClick={() => setContactDismissed(true)}
                aria-label={t("close")}
              >
                <X size={14} />
              </button>
            </div>
            <div className="assistant-contact__actions">
              {contacts?.frontmatter.email && (
                <a className="assistant-contact__action" href={`mailto:${contacts.frontmatter.email}`}>
                  <Mail size={14} /> {t("assistantContactEmail")}
                </a>
              )}
              {socials?.frontmatter.linkedin && (
                <a className="assistant-contact__action" href={socials.frontmatter.linkedin} target="_blank" rel="noreferrer">
                  <LinkedinIcon width={14} height={14} /> LinkedIn
                </a>
              )}
              <button type="button" className="assistant-contact__action" onClick={() => window.print()}>
                <Download size={14} /> {t("download")}
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="assistant-msg assistant-msg--assistant">
            <div className="assistant-msg__icon">
              <Bot size={14} />
            </div>
            <div className="assistant-msg__bubble assistant-msg__bubble--loading" aria-label={t("assistantThinking")}>
              <span className="assistant-dot" />
              <span className="assistant-dot" />
              <span className="assistant-dot" />
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="assistant-window__error">
          <span>{error}</span>
          <button type="button" onClick={handleRetry}>
            {t("retry")}
          </button>
        </div>
      )}

      {renderInputRow()}
    </div>
  );
}
