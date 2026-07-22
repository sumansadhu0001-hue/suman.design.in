import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, X, Send, Sparkles, Bot, User, Loader2, 
  Trash2, Volume2, VolumeX, Mic, MicOff, Copy, Check 
} from "lucide-react";

interface Message {
  role: "user" | "model";
  text: string;
}

const STARTER_PROMPTS = [
  "Show me Suman's portfolio projects",
  "What web design services do you offer?",
  "Switch to dark mode",
  "How much do custom development plans cost?"
];

// Helper to parse actions like [NAVIGATE: page] or [TOGGLE_THEME] out of model responses
const parseActionsAndText = (fullText: string) => {
  let text = fullText;
  const actions: string[] = [];
  
  const actionRegex = /\[(NAVIGATE:\s*[a-zA-Z]+|TOGGLE_THEME)\]/gi;
  let match;
  while ((match = actionRegex.exec(fullText)) !== null) {
    actions.push(match[0]);
  }
  
  // Clean action tags out of the readable response
  text = text.replace(actionRegex, "").trim();
  
  return { text, actions };
};

// Custom parser to format bold, code, bullets, and headings elegantly without any external dependency
function FormattedMessage({ text }: { text: string }) {
  const lines = text.split("\n");
  
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        
        // Headers
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={i} className="text-xs font-bold text-zinc-900 dark:text-white mt-3 mb-1">
              {parseInlineStyles(trimmed.slice(4))}
            </h4>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={i} className="text-sm font-bold text-zinc-900 dark:text-white mt-3 mb-1">
              {parseInlineStyles(trimmed.slice(3))}
            </h3>
          );
        }
        
        // Bullet lists
        if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
          return (
            <div key={i} className="flex gap-2 items-start pl-1 text-xs text-zinc-700 dark:text-zinc-350">
              <span className="text-violet-500 font-bold shrink-0 mt-0.5">•</span>
              <span className="flex-1 leading-relaxed">
                {parseInlineStyles(trimmed.slice(2))}
              </span>
            </div>
          );
        }

        // Numbered list items
        const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
        if (numMatch) {
          return (
            <div key={i} className="flex gap-2 items-start pl-1 text-xs text-zinc-700 dark:text-zinc-350">
              <span className="text-violet-500 font-bold shrink-0 text-[10px] bg-violet-50 dark:bg-violet-950/40 px-1 rounded">
                {numMatch[1]}
              </span>
              <span className="flex-1 leading-relaxed">
                {parseInlineStyles(numMatch[2])}
              </span>
            </div>
          );
        }
        
        // Normal paragraph
        if (trimmed.length > 0) {
          return (
            <p key={i} className="text-xs text-zinc-700 dark:text-zinc-350 leading-relaxed">
              {parseInlineStyles(line)}
            </p>
          );
        }
        
        // Line spacing
        return <div key={i} className="h-1" />;
      })}
    </div>
  );
}

// Sub-helper to parse **bold** and `code` styles inside a string
function parseInlineStyles(line: string): React.ReactNode[] {
  const tokenRegex = /(\*\*.*?\*\*|`.*?`)/g;
  const parts = line.split(tokenRegex);
  
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-zinc-950 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    } else if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={index} className="font-mono text-[10px] bg-zinc-200 dark:bg-zinc-800 text-violet-600 dark:text-violet-400 px-1.5 py-0.5 rounded">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Welcome to Suman.design. I am your elite AI digital consultant. How can I assist you with your custom web application, boutique e-commerce, or corporate portal today? Speak or type your request below."
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Voice Synthesis (TTS) & Dictation State
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen, messages, isLoading]);

  // Adjust input textarea height dynamically on typing
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 110)}px`;
    }
  }, [input]);

  // Setup Browser speech recognition (dictation)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "en-US";
        
        rec.onstart = () => setIsListening(true);
        rec.onend = () => setIsListening(false);
        rec.onerror = (e: any) => {
          console.error("Speech Recognition Error:", e.error);
          setIsListening(false);
        };
        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(prev => prev + (prev ? " " : "") + transcript);
        };
        recognitionRef.current = rec;
      }
    }

    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleVoiceDictation = () => {
    if (!recognitionRef.current) {
      alert("Voice speech recognition is not supported in your browser. Please try Google Chrome or Safari.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSpeak = (text: string, index: number) => {
    if (typeof window === "undefined") return;

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    
    // Clean speech of any stray codes
    const cleanSpeech = text.replace(/\[(NAVIGATE:\s*[a-zA-Z]+|TOGGLE_THEME)\]/gi, "").trim();
    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);
    
    // Choose natural sounding English voice if available
    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural")));
    if (premiumVoice) {
      utterance.voice = premiumVoice;
    }
    
    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (text: string, index: number) => {
    const cleanText = text.replace(/\[(NAVIGATE:\s*[a-zA-Z]+|TOGGLE_THEME)\]/gi, "").trim();
    navigator.clipboard.writeText(cleanText).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    });
  };

  const handleClearChat = () => {
    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel();
    }
    setSpeakingIndex(null);
    setMessages([
      {
        role: "model",
        text: "Conversation thread cleared. How can Suman.design architect your luxury digital presence today?"
      }
    ]);
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    setError(null);
    const userMessage: Message = { role: "user", text: textToSend };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    // Cancel text speech if speaking
    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel();
    }
    setSpeakingIndex(null);

    try {
      const contents = updatedMessages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

      const response = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned error status ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.text || "I apologize, I could not process that request.";
      
      // Parse out actions like [NAVIGATE: Work] or [TOGGLE_THEME]
      const { text: cleanResponse, actions } = parseActionsAndText(rawText);

      setMessages(prev => [
        ...prev,
        { role: "model", text: cleanResponse }
      ]);

      // Execute actions inside the browser!
      actions.forEach(actionTag => {
        const tag = actionTag.toUpperCase();
        if (tag.includes("NAVIGATE:")) {
          const pageMatch = actionTag.match(/NAVIGATE:\s*([a-zA-Z]+)/i);
          if (pageMatch && pageMatch[1]) {
            const page = pageMatch[1].toLowerCase();
            window.location.hash = `#${page}`;
          }
        } else if (tag.includes("TOGGLE_THEME")) {
          window.dispatchEvent(new Event("toggle-theme"));
        }
      });

    } catch (err: any) {
      console.error("Chat Error:", err);
      setError("Unable to process request right now. Let's try again.");
      setMessages(prev => [
        ...prev,
        { role: "model", text: "I apologize, but I am experiencing connectivity issues right now. Please check your network and try again." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 font-sans">
      {/* Floating Action Button */}
      <motion.button
        id="chatbot-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center shadow-xl shadow-violet-600/35 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200 border border-violet-400/30 dark:border-violet-500/40 relative group"
        whileHover={{ rotate: isOpen ? -90 : 8 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <X key="close" className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : (
            <div key="open" className="relative flex items-center justify-center">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              {/* Premium Glow ring */}
              <span className="absolute -inset-1 rounded-full bg-violet-400/30 animate-ping opacity-75 pointer-events-none" />
              {/* Mini AI Indicator dot */}
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-violet-700" />
            </div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="chatbot-panel"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="fixed bottom-20 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[410px] h-[550px] sm:h-[600px] max-h-[calc(100vh-120px)] rounded-2xl bg-white/95 dark:bg-[#0c0c0e]/95 border border-zinc-200/80 dark:border-zinc-900 shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-zinc-200/60 dark:border-zinc-900 bg-zinc-50/50 dark:bg-[#121215]/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-md shadow-violet-500/20">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    Suman.design AI
                  </h3>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Bespoke UI Assistant</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {messages.length > 1 && (
                  <button
                    onClick={handleClearChat}
                    title="Clear Conversation"
                    className="text-zinc-400 hover:text-red-500 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Conversation Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.map((msg, index) => {
                const isModel = msg.role === "model";
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.22 }}
                    className={`flex gap-3 max-w-[88%] ${isModel ? "mr-auto" : "ml-auto flex-row-reverse"}`}
                  >
                    {/* Role Icon */}
                    <div className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center shrink-0 ${isModel ? "bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-200/20" : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"}`}>
                      {isModel ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    
                    {/* Message Card */}
                    <div className="flex flex-col gap-1.5 items-start">
                      <div
                        className={`p-3.5 rounded-2xl ${
                          isModel
                            ? "bg-zinc-100/70 dark:bg-[#16161a]/95 text-zinc-800 dark:text-zinc-200 border border-zinc-250/20 dark:border-zinc-800/40 rounded-tl-none shadow-xs"
                            : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-tr-none shadow-sm"
                        }`}
                      >
                        {isModel ? (
                          <FormattedMessage text={msg.text} />
                        ) : (
                          <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        )}
                      </div>

                      {/* Action Bar (Only for AI responses) */}
                      {isModel && (
                        <div className="flex items-center gap-2 pl-1 text-[10px] text-zinc-400 dark:text-zinc-500">
                          <button
                            onClick={() => handleSpeak(msg.text, index)}
                            className="flex items-center gap-1 hover:text-violet-500 transition-colors cursor-pointer"
                            title="Speak Response"
                          >
                            {speakingIndex === index ? (
                              <>
                                <VolumeX className="w-3.5 h-3.5 text-violet-500" />
                                <span className="text-violet-500 font-medium">Mute</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>Listen</span>
                              </>
                            )}
                          </button>
                          
                          <span className="text-zinc-300 dark:text-zinc-800">|</span>

                          <button
                            onClick={() => handleCopy(msg.text, index)}
                            className="flex items-center gap-1 hover:text-violet-500 transition-colors cursor-pointer"
                            title="Copy Response"
                          >
                            {copiedIndex === index ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-emerald-500 font-medium">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Typing Loader Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 max-w-[85%] mr-auto"
                >
                  <div className="w-7.5 h-7.5 rounded-lg bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-zinc-100/70 dark:bg-[#16161a]/95 border border-zinc-200/20 dark:border-zinc-800/40 rounded-2xl rounded-tl-none p-3.5 text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-500" />
                    <span className="font-medium animate-pulse text-[11px]">Executing digital analysis...</span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Suggestions */}
            {messages.length === 1 && !isLoading && (
              <div className="px-4 pb-4 pt-1.5 border-t border-zinc-100 dark:border-zinc-900/40">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2 block">
                  How can I help you?
                </span>
                <div className="flex flex-col gap-1.5">
                  {STARTER_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(prompt)}
                      className={`text-[11px] text-left px-3.5 py-2.5 rounded-xl border border-zinc-200/50 dark:border-zinc-900/80 bg-zinc-50/50 dark:bg-[#121215]/50 text-zinc-700 dark:text-zinc-300 hover:bg-violet-50/50 dark:hover:bg-violet-950/20 hover:border-violet-500/30 hover:text-violet-600 dark:hover:text-violet-400 transition-all cursor-pointer hover:translate-x-1 ${
                        idx >= 2 ? "hidden sm:block" : "block"
                      }`}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Input Controls */}
            <div className="p-3.5 border-t border-zinc-200/60 dark:border-zinc-900 bg-zinc-50/50 dark:bg-[#121215]/50 flex items-end gap-2 relative">
              {/* Speech Recognition Indicator Popover */}
              {isListening && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full bg-violet-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 mb-2 border border-violet-500 animate-bounce">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  Listening closely...
                </div>
              )}

              {/* Speech Input Trigger */}
              <button
                type="button"
                onClick={toggleVoiceDictation}
                title={isListening ? "Stop listening" : "Dictate query with voice"}
                className={`w-9.5 h-9.5 shrink-0 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  isListening 
                    ? "bg-red-500 text-white animate-pulse shadow-md" 
                    : "bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 text-zinc-500 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-300"
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Main Input Textarea */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask Suman.design AI anything..."
                className="flex-1 resize-none bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 dark:focus:ring-violet-400 text-zinc-900 dark:text-white max-h-[110px] min-h-[38px] placeholder-zinc-400 leading-normal"
                rows={1}
              />

              {/* Send Button */}
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim() || isLoading}
                className="w-9.5 h-9.5 shrink-0 rounded-xl bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm hover:shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
