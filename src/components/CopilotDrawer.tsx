"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  ShieldCheck,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react";

interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
}

interface Message {
  role: "user" | "copilot";
  text: string;
  model?: string;
  source?: string;
  policyViolations?: string[];
  multimodalAlternativesCount?: number;
  suggestedFollowUps?: string[];
  toolCallsExecuted?: Array<{
    toolName: string;
    arguments: Record<string, any>;
    resultSummary: string;
    executionTimeMs: number;
  }>;
}

const INITIAL_MESSAGE: Message = {
  role: "copilot",
  text: "Hello! I am your **ReMode Gemini Copilot**, equipped with real-time transit intelligence and passenger protection rules.\n\nI can assist you with:\n• **Risk & Buffer Audits**: Analyze tight connections and weather disruptions\n• **Multimodal Re-routing**: Search flights, Vande Bharat trains, and Volvo coaches\n• **Passenger Rights**: Calculate guaranteed DGCA & IRCTC cancellation refunds\n• **Nearby Logistics**: Locate pre-screened emergency hotel hubs and transfers\n\nHow can I help safeguard your journey today?",
  model: "Gemini 2.5 Flash",
  source: "GEMINI_RECOVERY_AGENT",
};

const QUICK_PROMPTS = [
  { label: "⚡ Scan Connection Risk", prompt: "Inspect my active itinerary connection buffers and highlight any at-risk legs." },
  { label: "🌧️ Live Weather Impact", prompt: "What is the live weather forecast along my corridor and how might it affect my transit?" },
  { label: "💰 DGCA Refund Policy", prompt: "Explain my passenger rights and refund eligibility under DGCA CAR regulations if my flight is delayed or cancelled." },
  { label: "🔄 Multimodal Routes", prompt: "What multimodal alternative routes (Vande Bharat train, Volvo coach, or cabs) exist for this journey?" },
  { label: "🏨 Emergency Hotels", prompt: "Are there pre-screened emergency hotels available near my transit hubs if delays occur?" },
];

function parseInlineMarkdown(text: string): React.ReactNode {
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return tokens.map((token, idx) => {
    if (token.startsWith("`") && token.endsWith("`") && token.length > 2) {
      return (
        <code
          key={idx}
          className="font-mono text-[11px] bg-[#EAF5FF] text-[#1C6FD9] px-1.5 py-0.5 rounded-md border border-[#74BCFB]/30 font-semibold"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith("**") && token.endsWith("**") && token.length > 4) {
      return (
        <strong key={idx} className="font-bold text-[#0F1B2B]">
          {token.slice(2, -2)}
        </strong>
      );
    }
    return token;
  });
}

function FormattedMessageText({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="space-y-1.5 text-[13px] leading-relaxed">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1" />;

        // Header ###
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={i} className="font-sans font-extrabold text-[#0F1B2B] text-sm mt-2 mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1C6FD9]" />
              {parseInlineMarkdown(trimmed.replace(/^###\s+/, ""))}
            </h4>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={i} className="font-sans font-black text-[#0F1B2B] text-sm mt-2 mb-1">
              {parseInlineMarkdown(trimmed.replace(/^##\s+/, ""))}
            </h3>
          );
        }

        // Bullet point
        if (trimmed.startsWith("• ") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <div key={i} className="flex items-start gap-2 pl-1 text-[#334155]">
              <span className="text-[#1C6FD9] font-bold text-xs mt-0.5">•</span>
              <span className="flex-1">{parseInlineMarkdown(trimmed.replace(/^([•\-*])\s+/, ""))}</span>
            </div>
          );
        }

        return (
          <p key={i} className="text-[#0F1B2B]/90">
            {parseInlineMarkdown(line)}
          </p>
        );
      })}
    </div>
  );
}

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({
  isOpen,
  onClose,
  tripId,
}) => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedToolIndices, setExpandedToolIndices] = useState<Set<number>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {}
  };

  const toggleToolTrace = (index: number) => {
    setExpandedToolIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleResetChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setExpandedToolIndices(new Set());
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const newMsgs: Message[] = [...messages, { role: "user", text }];
    setMessages(newMsgs);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/copilot/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId, message: text }),
      });
      const data = await res.json();
      setMessages([
        ...newMsgs,
        {
          role: "copilot",
          text: data.reply || data.error || "I was unable to complete the analysis. Please try again.",
          model: data.model || "Gemini 2.5 Flash",
          source: data.agentSource,
          policyViolations: data.policyViolationsPrevented,
          multimodalAlternativesCount: data.multimodalAlternatives?.length,
          suggestedFollowUps: data.suggestedFollowUps,
          toolCallsExecuted: data.toolCallsExecuted,
        },
      ]);
    } catch {
      setMessages([
        ...newMsgs,
        {
          role: "copilot",
          text: "Unable to reach the recovery agent right now. All deterministic plans remain fully functional on your dashboard.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Soft Blurred Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-[#0F1B2B]/30 backdrop-blur-xs z-50 animate-in fade-in duration-200 transition-opacity"
        onClick={onClose}
      />

      {/* Main Drawer Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[520px] bg-white border-l border-[#74BCFB]/40 shadow-[-16px_0px_50px_rgba(10,61,115,0.14)] flex flex-col justify-between animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="bg-white/95 backdrop-blur-xl border-b border-gray-100 p-4 sm:p-5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#EAF5FF] to-[#D5EBFD] border border-[#74BCFB]/50 flex items-center justify-center text-[#1C6FD9] shadow-xs shrink-0">
              <Sparkles className="w-5 h-5 text-[#1C6FD9]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-sans text-base font-extrabold tracking-tight text-[#0F1B2B]">
                  ReMode AI Copilot
                </h3>
                <span className="bg-[#E6FBF7] text-[#047857] border border-[#A7F3D0] text-[10px] font-bold py-0.5 px-2 rounded-full inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Gemini 2.5
                </span>
              </div>
              <p className="text-[11px] text-[#4A5B70] font-medium mt-0.5">
                Real-time transit resilience, passenger rights & recovery
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleResetChat}
              className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-gray-100 text-[#4A5B70] hover:text-[#0F1B2B] flex items-center justify-center transition border border-gray-200 hover:scale-105 cursor-pointer shadow-2xs"
              title="Reset conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-gray-100 text-[#4A5B70] hover:text-[#0F1B2B] flex items-center justify-center transition border border-gray-200 hover:scale-105 cursor-pointer shadow-2xs"
              title="Close Copilot"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-gradient-to-b from-[#F8FBFF] via-white to-[#F8FBFF]">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${
                m.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-xs border ${
                  m.role === "user"
                    ? "bg-[#0F1B2B] text-white border-gray-700"
                    : "bg-[#EAF5FF] text-[#1C6FD9] border-[#74BCFB]/40"
                }`}
              >
                {m.role === "user" ? (
                  <User className="w-3.5 h-3.5 text-white" />
                ) : (
                  <Bot className="w-3.5 h-3.5 text-[#1C6FD9]" />
                )}
              </div>

              <div
                className={`p-3.5 sm:p-4 rounded-2xl max-w-[88%] ${
                  m.role === "user"
                    ? "bg-gradient-to-r from-[#1C6FD9] to-[#2563EB] text-white rounded-tr-xs shadow-[0_4px_16px_rgba(28,111,217,0.2)] font-medium text-[13px] leading-relaxed"
                    : "bg-white text-[#0F1B2B] rounded-tl-xs border border-gray-200/90 shadow-[0_2px_12px_rgba(10,61,115,0.04)]"
                }`}
              >
                {/* Copilot Tool Execution Summary (Collapsible) */}
                {m.role === "copilot" && m.toolCallsExecuted && m.toolCallsExecuted.length > 0 && (
                  <div className="mb-2.5">
                    <button
                      type="button"
                      onClick={() => toggleToolTrace(idx)}
                      className="text-[10px] font-bold text-[#1C6FD9] bg-[#EAF5FF] hover:bg-[#D5EBFD] px-2.5 py-1 rounded-lg border border-[#74BCFB]/40 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Zap className="w-3 h-3 text-[#1C6FD9]" />
                      <span>{m.toolCallsExecuted.length} Agent Tool{m.toolCallsExecuted.length > 1 ? "s" : ""} Executed</span>
                      {expandedToolIndices.has(idx) ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>

                    {expandedToolIndices.has(idx) && (
                      <div className="mt-2 p-2.5 bg-[#F8FBFF] rounded-xl border border-gray-200 text-[10px] space-y-1.5 animate-fadeIn">
                        {m.toolCallsExecuted.map((t, tIdx) => (
                          <div key={tIdx} className="bg-white p-2 rounded-lg border border-gray-200/80 shadow-2xs">
                            <div className="flex items-center justify-between font-mono font-bold text-[#0F1B2B]">
                              <span className="text-[#1C6FD9] flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                {t.toolName}
                              </span>
                              <span className="text-gray-400 text-[9px]">{t.executionTimeMs}ms</span>
                            </div>
                            <div className="text-emerald-700 font-medium text-[10.5px] mt-0.5">
                              ➔ {t.resultSummary}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Formatted Message Content */}
                {m.role === "user" ? (
                  <div className="whitespace-pre-wrap">{m.text}</div>
                ) : (
                  <FormattedMessageText text={m.text} />
                )}

                {/* Policy Violations Prevented */}
                {m.policyViolations && m.policyViolations.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-gray-100 text-[10.5px] space-y-0.5">
                    <div className="font-extrabold text-[#047857] flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Enforced Compliance:</span>
                    </div>
                    {m.policyViolations.map((v, i) => (
                      <div key={i} className="text-[#4A5B70] pl-3.5 text-[10px]">
                        • {v}
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggested Follow-up Chips */}
                {m.suggestedFollowUps && m.suggestedFollowUps.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-gray-100">
                    <span className="text-[10px] font-extrabold text-[#1C6FD9] uppercase tracking-wider block mb-1.5">
                      Suggested Next Steps:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {m.suggestedFollowUps.map((chip, chipIdx) => (
                        <button
                          key={chipIdx}
                          type="button"
                          onClick={() => handleSend(chip)}
                          className="text-[11px] font-semibold bg-[#F0F6FC] hover:bg-[#EAF5FF] text-[#1C6FD9] hover:text-[#0F1B2B] border border-[#74BCFB]/35 px-2.5 py-1 rounded-xl text-left transition-all hover:scale-[1.02] flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <span>{chip}</span>
                          <ArrowRight className="w-2.5 h-2.5 shrink-0 text-[#1C6FD9]" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message Footer Actions */}
                {m.role === "copilot" && (
                  <div className="mt-2 pt-1.5 flex items-center justify-between border-t border-gray-50 text-[10px] text-gray-400">
                    <span className="font-mono">{m.model || "Gemini 2.5"}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(m.text, idx)}
                      className="p-1 rounded-md text-gray-400 hover:text-[#1C6FD9] hover:bg-gray-100 transition-colors cursor-pointer"
                      title="Copy response to clipboard"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2.5 text-[#4A5B70] text-xs p-3 bg-white/95 rounded-2xl border border-[#74BCFB]/30 shadow-xs animate-pulse">
              <Sparkles className="w-4 h-4 animate-spin text-[#1C6FD9]" />
              <span className="font-medium">Gemini Copilot analyzing itinerary graph & evaluating resilience...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Action Prompt Pills (Horizontal Scrollable Tray) */}
        <div className="p-2.5 bg-white border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {QUICK_PROMPTS.map((qp, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(qp.prompt)}
              disabled={isLoading}
              className="whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-bold bg-[#F8FBFF] hover:bg-[#EAF5FF] text-[#1C6FD9] border border-[#74BCFB]/30 hover:border-[#1C6FD9]/50 transition-all cursor-pointer shadow-2xs disabled:opacity-50 shrink-0 hover:scale-[1.02] active:scale-[0.98]"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3.5 bg-white border-t border-gray-100 flex items-center gap-2 shadow-sm">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask Copilot about transit risks, refunds, or rerouting..."
            className="flex-1 text-xs px-3.5 py-2.5 bg-[#F8FBFF] hover:bg-white focus:bg-white rounded-xl border border-gray-200 focus:border-[#1C6FD9] focus:ring-2 focus:ring-[#1C6FD9]/15 font-medium transition text-[#0F1B2B] placeholder:text-[#4A5B70]/60 outline-none"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#1C6FD9] to-[#2563EB] hover:from-[#1558B0] hover:to-[#1D4ED8] flex items-center justify-center text-white shadow-[0_4px_14px_rgba(28,111,217,0.25)] hover:scale-105 active:scale-95 transition disabled:opacity-40 disabled:hover:scale-100 cursor-pointer shrink-0"
            title="Send query to Gemini Copilot"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
};
