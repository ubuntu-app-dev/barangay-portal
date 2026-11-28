"use client";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp, RotateCcw, Sparkles, Square, X } from "lucide-react";
import type { WorkspaceKey } from "@/config/workspaces";
import { STARTERS } from "@/data/assistant-starters";

type Msg = { role: "user" | "assistant"; content: string; error?: boolean };

const STORE = (ws: WorkspaceKey) => `lgu-assistant:${ws}`;

/* ---------- Minimal, safe Markdown: paragraphs, lists, **bold**, and internal links ---------- */

function inline(text: string, onNavigate: () => void): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) {
      // Only links inside the app are clickable; anything else is shown as plain text.
      out.push(
        m[2].startsWith("/") && !m[2].startsWith("//") ? (
          <Link key={m.index} href={m[2]} onClick={onNavigate} className="font-semibold text-brand underline decoration-brand/30 underline-offset-2 hover:decoration-brand">
            {m[1]}
          </Link>
        ) : (
          m[1]
        ),
      );
    } else out.push(<strong key={m.index}>{m[3]}</strong>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function Markdown({ text, onNavigate }: { text: string; onNavigate: () => void }) {
  const blocks = text.trim().split(/\n{2,}/);
  return (
    <>
      {blocks.map((b, i) => {
        const lines = b.split("\n").filter((l) => l.trim());
        if (lines.length && lines.every((l) => /^\s*(\d+[.)]|[-*•])\s+/.test(l))) {
          const ordered = /^\s*\d/.test(lines[0]);
          const items = lines.map((l) => l.replace(/^\s*(\d+[.)]|[-*•])\s+/, ""));
          const List = ordered ? "ol" : "ul";
          return (
            <List key={i} className={`my-1.5 space-y-1 pl-5 ${ordered ? "list-decimal" : "list-disc"}`}>
              {items.map((it, j) => (
                <li key={j}>{inline(it, onNavigate)}</li>
              ))}
            </List>
          );
        }
        return (
          <p key={i} className="my-1.5 first:mt-0 last:mb-0">
            {lines.map((l, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {inline(l.replace(/^#+\s*/, ""), onNavigate)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
}

/* ---------- Widget ---------- */

/**
 * Floating AI assistant for signed-in users. Answers come from /api/assistant, which looks up
 * help guides and aggregate figures within the user's own scope before answering.
 * The conversation lives in this browser tab only (sessionStorage).
 */
export default function AssistantWidget({ ws, firstName }: { ws: WorkspaceKey; firstName: string }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const loaded = useRef(false);

  // Keep this tab's conversation (restored when the panel first opens).
  useEffect(() => {
    if (!loaded.current) return;
    try {
      sessionStorage.setItem(STORE(ws), JSON.stringify(messages.slice(-30)));
    } catch {}
  }, [messages, ws]);

  function openPanel() {
    if (!loaded.current) {
      loaded.current = true;
      try {
        const saved = sessionStorage.getItem(STORE(ws));
        if (saved) setMessages(JSON.parse(saved));
      } catch {}
    }
    setOpen(true);
  }

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [messages, status, reduce]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    const history: Msg[] = [...messages.filter((m) => !m.error), { role: "user", content: q }];
    setMessages([...messages, { role: "user", content: q }, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    setStatus("Thinking…");
    const ctrl = new AbortController();
    abort.current = ctrl;

    const append = (chunk: string, error = false) =>
      setMessages((all) => {
        const next = [...all];
        const last = next[next.length - 1];
        next[next.length - 1] = { ...last, content: error ? chunk : last.content + chunk, error: error || last.error };
        return next;
      });

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-20).map(({ role, content }) => ({ role, content })) }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => null);
        append(err?.error ?? "The assistant is unavailable right now.", true);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (!line) continue;
          const e = JSON.parse(line) as { t: string; v?: string };
          if (e.t === "text" && e.v) {
            setStatus(null);
            append(e.v);
          } else if (e.t === "tool" && e.v) setStatus(e.v);
          else if (e.t === "error" && e.v) append(e.v, true);
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") append("Connection lost. Please try again.", true);
    } finally {
      setBusy(false);
      setStatus(null);
      abort.current = null;
      // Drop an empty answer bubble (stopped before any text arrived).
      setMessages((all) => (all.at(-1)?.role === "assistant" && !all.at(-1)!.content ? all.slice(0, -1) : all));
    }
  }

  const closeOnSmall = () => window.matchMedia("(max-width: 639px)").matches && setOpen(false);
  const panelMotion = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 24, scale: 0.94, rotateX: 8 },
        animate: { opacity: 1, y: 0, scale: 1, rotateX: 0 },
        exit: { opacity: 0, y: 16, scale: 0.96 },
      };

  return (
    <div className="no-print">
      {/* Launcher */}
      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            onClick={openPanel}
            aria-label="Open the LGU Connect assistant"
            initial={reduce ? false : { scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={reduce ? undefined : { scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
            className="group fixed bottom-5 right-5 z-[60] flex h-14 items-center gap-2 rounded-full bg-brand-fill pl-4 pr-5 text-white shadow-[0_12px_32px_rgb(0_56_168/0.45)] sm:bottom-6 sm:right-6"
          >
            <span className="relative flex h-7 w-7 items-center justify-center">
              {!reduce && <span className="absolute inset-0 animate-ping rounded-full bg-white/30 [animation-duration:2.4s]" />}
              <Sparkles aria-hidden="true" className="relative h-5 w-5" />
            </span>
            <span className="text-[14px] font-semibold">Ask AI</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.section
            role="dialog"
            aria-label="LGU Connect assistant"
            {...panelMotion}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            style={{ transformOrigin: "bottom right", transformPerspective: 900 }}
            className="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-panel sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[min(640px,calc(100dvh-3rem))] sm:w-[400px] sm:rounded-2xl sm:border sm:border-rule sm:shadow-[0_24px_64px_rgb(0_0_0/0.28)]"
          >
            {/* Header */}
            <header className="relative flex items-center gap-3 overflow-hidden bg-[linear-gradient(135deg,var(--color-flag-blue),color-mix(in_srgb,var(--color-flag-blue)_60%,black))] px-4 py-3.5 text-white">
              <span aria-hidden="true" className="absolute -right-6 -top-10 h-28 w-28 rounded-full bg-flag-gold/25 blur-2xl" />
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white p-0.5 shadow">
                {/* eslint-disable-next-line @next/next/no-img-element -- small static SVG */}
                <img src="/brand/lgu-icon.svg" alt="" className="h-full w-full" />
              </span>
              <div className="relative min-w-0 flex-1">
                <p className="font-display text-[15px] font-bold leading-tight">LGU Connect Assistant</p>
                <p className="flex items-center gap-1.5 text-[12px] text-white/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Help guides and your figures
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  abort.current?.abort();
                  setMessages([]);
                }}
                aria-label="Start a new conversation"
                title="New conversation"
                className="relative flex h-9 w-9 items-center justify-center rounded-lg text-white/85 hover:bg-white/15 hover:text-white"
              >
                <RotateCcw aria-hidden="true" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close the assistant"
                className="relative flex h-9 w-9 items-center justify-center rounded-lg text-white/85 hover:bg-white/15 hover:text-white"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </header>

            {/* Conversation */}
            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
              {messages.length === 0 && (
                <motion.div initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <p className="font-display text-lg font-bold">Hi {firstName}! 👋</p>
                  <p className="mt-1 text-[14px] text-ink-secondary">
                    Ask me how to do something in LGU Connect, where to find a page, or about your figures. I look up the help guides and your records before I answer.
                  </p>
                  <div className="mt-4 grid gap-2">
                    {STARTERS[ws].map((s, i) => (
                      <motion.button
                        key={s}
                        type="button"
                        onClick={() => send(s)}
                        initial={reduce ? false : { opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + i * 0.06 }}
                        className="rounded-xl border border-rule bg-ground px-3.5 py-2.5 text-left text-[14px] transition-colors hover:border-brand/50 hover:bg-dash-primary-soft"
                      >
                        {s}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "user" ? (
                    <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-brand-fill px-3.5 py-2 text-[14px] text-white">{m.content}</p>
                  ) : m.content ? (
                    <div
                      className={`max-w-[92%] rounded-2xl rounded-bl-md px-3.5 py-2.5 text-[14px] leading-relaxed ${
                        m.error ? "border border-dash-danger/30 bg-dash-danger-soft text-dash-danger" : "bg-ground-muted text-ink"
                      }`}
                    >
                      <Markdown text={m.content} onNavigate={closeOnSmall} />
                    </div>
                  ) : null}
                </motion.div>
              ))}

              {busy && status && (
                <div className="flex items-center gap-2 text-[13px] text-ink-secondary">
                  <span className="flex gap-1" aria-hidden="true">
                    {[0, 1, 2].map((d) => (
                      <motion.span
                        key={d}
                        className="h-1.5 w-1.5 rounded-full bg-brand"
                        animate={reduce ? undefined : { y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }}
                      />
                    ))}
                  </span>
                  {status}
                </div>
              )}
            </div>

            {/* Composer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="border-t border-rule bg-panel px-3 pb-3 pt-2.5"
            >
              <div className="flex items-end gap-2 rounded-2xl border border-rule bg-ground px-3 py-2 focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value.slice(0, 2000))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  rows={1}
                  placeholder="Ask a question…"
                  aria-label="Your question"
                  className="max-h-32 min-h-[24px] flex-1 resize-none bg-transparent text-[14px] outline-none focus-visible:outline-none placeholder:text-ink-secondary/70 [field-sizing:content]"
                />
                {busy ? (
                  <button
                    type="button"
                    onClick={() => abort.current?.abort()}
                    aria-label="Stop the answer"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-panel"
                  >
                    <Square aria-hidden="true" className="h-3.5 w-3.5" fill="currentColor" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    aria-label="Send"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-fill text-white transition-opacity disabled:opacity-35"
                  >
                    <ArrowUp aria-hidden="true" className="h-4 w-4" strokeWidth={2.5} />
                  </button>
                )}
              </div>
              <p className="mt-2 text-center text-[11px] text-ink-secondary">
                AI can make mistakes. It sees totals only, never personal records.
              </p>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
