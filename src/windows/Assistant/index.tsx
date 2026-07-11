import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Bot, User, Send, RotateCcw } from "lucide-react";
import { useLanguage } from "../../context/useLanguage";
import { conversationStarters } from "../../context/translations";
import { readJSON, writeJSON } from "../../utils/storage";
import { renderBlock } from "../../lib/markdown";
import "./Assistant.css";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

const STORAGE_KEY = "assistantConversation";
const MAX_HISTORY = 10;

export function AssistantWindow() {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>(() => readJSON(STORAGE_KEY, []));
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    writeJSON(STORAGE_KEY, messages);
  }, [messages]);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight });
  }, [messages, loading]);

  async function callAssistant(currentMessages: ChatMessage[]) {
    const lastUserMessage = currentMessages[currentMessages.length - 1];
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
      });
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Errore sconosciuto");

      setMessages((prev) => [...prev, { role: "assistant", content: data.answer, sources: data.sources }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
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
    setMessages([]);
    setError(null);
  }

  return (
    <div className="assistant-window">
      <div className="assistant-window__messages" ref={messagesRef}>
        {messages.length === 0 && (
          <div className="assistant-window__starters">
            <p className="assistant-window__starters-intro">{t("assistantIntro")}</p>
            {conversationStarters[language].map((starter) => (
              <button
                key={starter}
                type="button"
                className="assistant-window__starter"
                onClick={() => handleSend(starter)}
              >
                {starter}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`assistant-msg assistant-msg--${m.role}`}>
            <div className="assistant-msg__icon">
              {m.role === "user" ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className="assistant-msg__bubble">
              {m.role === "assistant" ? (
                <div dangerouslySetInnerHTML={{ __html: renderBlock(m.content) }} />
              ) : (
                <p>{m.content}</p>
              )}
              {m.sources && m.sources.length > 0 && (
                <div className="assistant-msg__sources">
                  {m.sources.map((source) => (
                    <span key={source} className="assistant-msg__source">
                      📄 {source}
                    </span>
                  ))}
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
            <div className="assistant-msg__bubble assistant-msg__bubble--loading">{t("assistantThinking")}</div>
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

      {messages.length > 0 && (
        <button type="button" className="assistant-window__reset" onClick={handleReset}>
          <RotateCcw size={12} />
          {t("resetConversation")}
        </button>
      )}
    </div>
  );
}
