import { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Trash2, Sparkles } from "lucide-react";

const API = "http://localhost:8000";

export default function Analyze({ addToast, darkMode }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [streamingContent, setStreamingContent] = useState("");
    const bottomRef = useRef(null);

    useEffect(() => {
        const saved = localStorage.getItem("chatHistory");
        if (saved) {
            setMessages(JSON.parse(saved));
        }
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, streamingContent]);

    useEffect(() => {
        localStorage.setItem("chatHistory", JSON.stringify(messages));
    }, [messages]);

    function clearChat() {
        setMessages([]);
        localStorage.removeItem("chatHistory");
    }

    async function handleSend() {
        const question = input.trim();
        if (!question || loading) return;

        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: question }]);
        setLoading(true);
        setStreamingContent("");

        try {
            const res = await axios.post(`${API}/analyze`, { question });
            setMessages((prev) => [...prev, { role: "assistant", content: res.data.answer }]);
        } catch {
            setMessages((prev) => [...prev, { role: "assistant", content: "Error: could not get a response." }]);
            addToast("Failed to get AI response", "error");
        } finally {
            setLoading(false);
            setStreamingContent("");
        }
    }

    function handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4 shrink-0">
                <h1 className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles size={18} className="text-[#00b894]" />
                    Analyze
                </h1>
                {messages.length > 0 && (
                    <button
                        onClick={clearChat}
                        className={`text-xs ${darkMode ? "text-[#7b82a0] hover:text-[#e17055]" : "text-[#636e72] hover:text-[#e17055]"} transition-colors flex items-center gap-1`}
                    >
                        <Trash2 size={14} />
                        Clear chat
                    </button>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
                <AnimatePresence>
                    {messages.length === 0 && (
                        <motion.div
                            className="text-center py-16 space-y-2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <p className={`text-sm ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"}`}>Ask anything about your squad or transfer targets.</p>
                            <div className="flex flex-wrap justify-center gap-2 mt-4">
                                {SUGGESTIONS.map((s) => (
                                    <motion.button
                                        key={s}
                                        onClick={() => setInput(s)}
                                        className={`px-3 py-1.5 ${darkMode ? "bg-[#1a1f2e]/50 border-white/10 text-[#7b82a0] hover:text-[#e8eaf0] hover:border-[#00b894]" : "bg-gray-100 border-gray-200 text-[#636e72] hover:text-[#2d3436] hover:border-[#00b894]"} backdrop-blur border rounded text-xs transition-all duration-200`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {s}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className={`max-w-[85%] rounded-lg px-4 py-3 text-xs leading-relaxed ${
                                msg.role === "user"
                                    ? "bg-[#00b89420] border-[#00b89440]"
                                    : darkMode ? "bg-[#1a1f2e]/80 backdrop-blur border-white/10" : "bg-white/80 backdrop-blur border-gray-200"
                            } ${darkMode ? "text-[#e8eaf0]" : "text-[#2d3436]"}`}>
                                {msg.role === "assistant" ? (
                                    <div className={`text-xs space-y-2 [&_strong]:${darkMode ? "text-[#e8eaf0]" : "text-[#2d3436]"} [&_h3]:font-semibold [&_h3]:mt-3 [&_h4]:font-semibold [&_h4]:mt-2 [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mb-0.5`}>
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {loading && (
                    <motion.div
                        className="flex justify-start"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className={`${darkMode ? "bg-[#1a1f2e]/80 border-white/10" : "bg-white/80 border-gray-200"} backdrop-blur border rounded-lg px-4 py-3`}>
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-[#00b894] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-1.5 h-1.5 bg-[#00b894] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-1.5 h-1.5 bg-[#00b894] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="shrink-0 flex gap-2">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about your squad, a transfer target, tactics..."
                    rows={2}
                    className={`flex-1 ${
                        darkMode 
                            ? "bg-[#1a1f2e]/80 border-white/10 text-[#e8eaf0] placeholder-[#7b82a0]" 
                            : "bg-white/80 border-gray-200 text-[#2d3436] placeholder-[#636e72]"
                    } backdrop-blur border rounded-lg px-3 py-2 text-xs resize-none focus:outline-none focus:border-[#00b894]`}
                />
                <motion.button
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className="px-4 bg-[#00b894] text-[#0f1117] text-xs font-semibold rounded-lg hover:bg-[#00a884] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Send size={14} />
                    Send
                </motion.button>
            </div>
            <p className={`text-[10px] ${darkMode ? "text-[#7b82a0]" : "text-[#636e72]"} mt-1.5 shrink-0`}>
                Enter to send · Shift+Enter for new line
            </p>
        </div>
    );
}

const SUGGESTIONS = [
    "Should I sign any of my transfer targets?",
    "What position does my squad need most?",
    "Who are my weakest players?",
    "Analyze my squad depth",
];