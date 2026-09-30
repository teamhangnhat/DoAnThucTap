import { useState } from "react";
import { sendMessage } from "../../services/chatbotService";

export default function AIChatBox() {
    const [isOpen, setIsOpen] = useState(false);

    const [messages, setMessages] = useState([
        {
            sender: "ai",
            text: "Hello 👋 I'm DK AI. I can help you choose products, sizes, orders and promotions."
        }
    ]);

    const [input, setInput] = useState("");

    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input.trim();

        setMessages((prev) => [
            ...prev,
            {
                sender: "user",
                text: userMessage
            }
        ]);

        setInput("");
        setLoading(true);

        try {
            const data = await sendMessage(userMessage);

            setMessages((prev) => [
                ...prev,
                {
                    sender: "ai",
                    text:
                        data.reply ||
                        "Sorry, I don't have an answer."
                }
            ]);
        } catch (error) {
            console.error(error);

            setMessages((prev) => [
                ...prev,
                {
                    sender: "ai",
                    text:
                        "Sorry, the AI server is unavailable."
                }
            ]);
        }

        setLoading(false);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: "fixed",
                    bottom: "25px",
                    right: "25px",
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "26px",
                    zIndex: 9999
                }}
            >
                🤖
            </button>

            {isOpen && (
                <div
                    style={{
                        position: "fixed",
                        bottom: "95px",
                        right: "25px",
                        width: "360px",
                        height: "520px",
                        background: "#ffffff",
                        borderRadius: "15px",
                        boxShadow: "0 0 20px rgba(0,0,0,.15)",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                        zIndex: 9999
                    }}
                >
                    <div
                        style={{
                            background: "#111827",
                            color: "#ffffff",
                            padding: "16px",
                            fontWeight: "bold"
                        }}
                    >
                        DK AI Assistant
                    </div>

                    <div
                        style={{
                            flex: 1,
                            overflowY: "auto",
                            padding: "15px",
                            background: "#f8f8f8"
                        }}
                    >
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                style={{
                                    display: "flex",
                                    justifyContent:
                                        message.sender === "user"
                                            ? "flex-end"
                                            : "flex-start",
                                    marginBottom: "12px"
                                }}
                            >
                                <div
                                    style={{
                                        maxWidth: "80%",
                                        padding: "10px 14px",
                                        borderRadius: "12px",
                                        background:
                                            message.sender === "user"
                                                ? "#1677ff"
                                                : "#e5e7eb",
                                        color:
                                            message.sender === "user"
                                                ? "#fff"
                                                : "#111"
                                    }}
                                >
                                    {message.text}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <p style={{ color: "#777" }}>
                                Gemini is typing...
                            </p>
                        )}
                    </div>

                    <div
                        style={{
                            display: "flex",
                            borderTop: "1px solid #ddd"
                        }}
                    >
                        <input
                            type="text"
                            value={input}
                            placeholder="Ask anything..."
                            onChange={(e) =>
                                setInput(e.target.value)
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSend();
                                }
                            }}
                            style={{
                                flex: 1,
                                border: "none",
                                outline: "none",
                                padding: "15px"
                            }}
                        />

                        <button
                            onClick={handleSend}
                            style={{
                                width: "90px",
                                border: "none",
                                cursor: "pointer",
                                background: "#1677ff",
                                color: "#fff"
                            }}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}