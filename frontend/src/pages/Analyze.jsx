import { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const API = "http://localhost:8000";

export default function Analyze() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function handleSend() {
        const question = input.trim();
        if (!question || loading) return;

        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: question }]);
        setLoading(true);

        try {
            const res = await axios.post(`${API}/analyze`, { question });
            setMessages((prev) => [...prev, { role: "assistant", content: res.data.answer }]);
        } catch {
            setMessages((prev) => [...prev, { role: "assistant", content: "Error: could not get a response." }]);
        } finally {
            setLoading(false);
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
            <h1 className="text-lg font-semibold mb-4 shrink-0">Analyze</h1>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
                {messages.length === 0 && (
                    <div className="text-center py-16 space-y-2">
                        <p className="text-sm text-[#7b82a0]">Ask anything about your squad or transfer targets.</p>
                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                            {SUGGESTIONS.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setInput(s)}
                                    className="px-3 py-1.5 bg-[#1a1f2e] border border-[#2d3448] rounded text-xs text-[#7b82a0] hover:text-[#e8eaf0] hover:border-[#00b894] transition-colors"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] rounded-lg px-4 py-3 text-xs leading-relaxed ${
                            msg.role === "user"
                                ? "bg-[#00b89420] text-[#e8eaf0] border border-[#00b89440]"
                                : "bg-[#1a1f2e] text-[#e8eaf0] border border-[#2d3448]"
                        }`}>
                            {msg.role === "assistant" ? (
                                <div className="text-xs space-y-2 [&_strong]:text-[#e8eaf0] [&_h3]:font-semibold [&_h3]:mt-3 [&_h4]:font-semibold [&_h4]:mt-2 [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mb-0.5">
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                            ) : (
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-[#1a1f2e] border border-[#2d3448] rounded-lg px-4 py-3">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-[#00b894] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-1.5 h-1.5 bg-[#00b894] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-1.5 h-1.5 bg-[#00b894] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </div>
                    </div>
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
            className="flex-1 bg-[#1a1f2e] border border-[#2d3448] rounded-lg px-3 py-2 text-xs resize-none focus:outline-none focus:border-[#00b894] placeholder-[#7b82a0]"
        />
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className="px-4 bg-[#00b894] text-[#0f1117] text-xs font-semibold rounded-lg hover:bg-[#00a884] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    Send
                </button>
            </div>
            <p className="text-[10px] text-[#7b82a0] mt-1.5 shrink-0">
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