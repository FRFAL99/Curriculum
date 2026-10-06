import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Bot, User, Send, RotateCcw, Cpu, Hash, Clock, Gauge } from "lucide-react";
import { useLanguage } from "../../context/useLanguage";
import { conversationStarters } from "../../context/translations";
import { readJSON, writeJSON } from "../../utils/storage";
import { renderBlock } from "../../lib/markdown";
import { getAllDocs, getDocTitle } from "../../lib/knowledgeBase";
import type { TranslationKey } from "../../context/translations";
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
  stats?: ChatStats;
}

const STORAGE_KEY = "assistantConversation";
const MAX_HISTORY = 10;
const MAX_STARTERS = 5;

// Fonti senza un titolo nel frontmatter (documenti lang-neutral).
const SOURCE_LABEL_KEY: Record<string, TranslationKey> = {
  skills: "skillsTitle",
  contact: "contactTitle",
  social: "contactTitle",
};

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
  const [revealedLength, setRevealedLength] = useState(0);
  const [revealingIndex, setRevealingIndex] = useState<number | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const revealTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    writeJSON(STORAGE_KEY, messages);
  }, [messages]);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight });
  }, [messages, loading, revealedLength]);

  useEffect(() => {
    return () => {
      if (revealTimerRef.current) clearInterval(revealTimerRef.current);
    };
  }, []);

  function startReveal(fullText: string, index: number) {
    if (revealTimerRef.current) clearInterval(revealTimerRef.current);
    setRevealingIndex(index);
    setRevealedLength(0);
    const TOTAL_TICKS = 60;
    const TICK_MS = 18;
    const charsPerTick = Math.max(3, Math.ceil(fullText.length / TOTAL_TICKS));
    revealTimerRef.current = setInterval(() => {
      setRevealedLength((prev) => {
        const next = prev + charsPerTick;
        if (next >= fullText.length) {
          if (revealTimerRef.current) clearInterval(revealTimerRef.current);
          revealTimerRef.current = null;
          setRevealingIndex(null);
          return fullText.length;
        }
        return next;
      });
    }, TICK_MS);
  }

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

      // Parsing difensivo: la function può mancare (es. `npm run dev` senza
      // Netlify) o rispondere con corpo vuoto/non JSON.
      const raw = await res.text();
      let data: { answer?: string; sources?: string[]; stats?: ChatStats; error?: string } = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        // gestito sotto: niente `answer`
      }

      const { answer, sources, stats } = data;
      if (!res.ok || typeof answer !== "string") {
        console.error(`Assistant error ${res.status}:`, data.error ?? raw.slice(0, 200));
        if (import.meta.env.DEV) {
          throw new AssistantError(
            `${t("assistantUnavailable")} (HTTP ${res.status}${data.error ? `, ${data.error}` : ""}; in locale serve \`npm run dev:full\`)`,
          );
        }
        throw new AssistantError(t("assistantUnavailable"));
      }

      startReveal(answer, currentMessages.length);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: answer, sources, stats },
      ]);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      if (!(err instanceof AssistantError)) console.error("Assistant request failed:", err);
      setError(err instanceof AssistantError ? err.message : t("assistantUnavailable"));
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
        abortRef.current = null;
      }
    }
  }

  function handleSend(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
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
    if (revealTimerRef.current) clearInterval(revealTimerRef.current);
    setRevealingIndex(null);
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
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()} aria-label={t("send")}>
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
              {conversationStarters[language].slice(0, MAX_STARTERS).map((starter) => (
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
                    __html: renderAnswer(i === revealingIndex ? m.content.slice(0, revealedLength) : m.content),
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
              {m.stats && i !== revealingIndex && (
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
