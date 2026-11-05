import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FaHeadset, FaTimes, FaPaperPlane } from "react-icons/fa";

const API_URL = "http://localhost:5000/api/customer-chat";

function CustomerSupportChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    const messagesEndRef = useRef(null);

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    const isCustomer =
        String(user?.role || "").trim().toUpperCase() === "CUSTOMER";

    const headers = {
        Authorization: `Bearer ${token}`,
    };

   const loadConversation = async () => {
    try {
        setLoading(true);

        const response = await axios.get(
            `${API_URL}/my-conversation`,
            { headers }
        );

        let currentConversation = response.data?.conversation || null;

        if (!currentConversation) {
            const createResponse = await axios.post(
                `${API_URL}/conversations`,
                {},
                { headers }
            );

            currentConversation = createResponse.data?.conversation || null;
        }

        setConversation(currentConversation);
    } catch (error) {
        console.error("LOAD CONVERSATION ERROR:", error);
    } finally {
        setLoading(false);
    }
};

   const loadMessages = async () => {
    if (!conversation?.id) return;

    try {
        const response = await axios.get(
            `${API_URL}/${conversation.id}/messages`,
            { headers }
        );

        const data =
            Array.isArray(response.data)
                ? response.data
                : Array.isArray(response.data?.messages)
                    ? response.data.messages
                    : Array.isArray(response.data?.data)
                        ? response.data.data
                        : [];

        setMessages(data);

    } catch (error) {
        console.error("LOAD MESSAGES ERROR:", error);
    }
};

    // Send message
    const handleSendMessage = async (event) => {
        event.preventDefault();

        const content = message.trim();

        if (!content || !conversation?.id || sending) return;

        try {
            setSending(true);

            await axios.post(
                `${API_URL}/${conversation.id}/messages`,
                { message: content },
                { headers }
            );

            setMessage("");
            await loadMessages();
        } catch (error) {
            console.error("SEND MESSAGE ERROR:", error);
            alert(
                error.response?.data?.message ||
                "Unable to send message. Please try again."
            );
        } finally {
            setSending(false);
        }
    };

    useEffect(() => {
    if (isOpen && isCustomer && token && !conversation) {
        loadConversation();
    }
}, [isOpen, isCustomer, token]);

    // Refresh messages every 3 seconds
    useEffect(() => {
        if (!isOpen || !conversation?.id) return;

        loadMessages();

        const interval = setInterval(() => {
            loadMessages();
        }, 3000);

        return () => clearInterval(interval);
    }, [isOpen, conversation?.id]);

    // Scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages]);

    // Only show for logged-in customers
   // if (!token || !isCustomer) return null;

    return (
        <div className="fixed bottom-5 left-5 z-[9998]">
            {/* Chat Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-3 rounded-full bg-blue-600 px-5 py-3 text-white shadow-lg transition hover:bg-blue-700"
                >
                    <FaHeadset size={20} />
                    <span className="font-medium">Customer Support</span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="flex h-[500px] w-[350px] max-w-[calc(100vw-40px)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between bg-blue-600 px-4 py-3 text-white">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                                <FaHeadset size={20} />
                            </div>

                            <div>
                                <h3 className="font-semibold">
                                    Customer Support
                                </h3>
                                <p className="text-xs text-blue-100">
                                    We are here to help you
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsOpen(false)}
                            className="rounded-full p-2 transition hover:bg-white/20"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
                        {loading && (
                            <p className="text-center text-sm text-gray-500">
                                Loading conversation...
                            </p>
                        )}

                        {!loading && messages.length === 0 && (
                            <div className="mt-10 text-center">
                                <FaHeadset className="mx-auto text-3xl text-blue-500" />
                                <p className="mt-3 font-medium text-gray-700">
                                    Welcome to Customer Support!
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                    Send us a message if you need assistance.
                                </p>
                            </div>
                        )}

                        {messages.map((item) => {
                            const isOwnMessage =
                                Number(item.sender_id) === Number(user.id);

                            return (
                                <div
                                    key={item.id}
                                    className={`flex ${
                                        isOwnMessage
                                            ? "justify-end"
                                            : "justify-start"
                                    }`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                                            isOwnMessage
                                                ? "rounded-br-sm bg-blue-600 text-white"
                                                : "rounded-bl-sm border border-gray-200 bg-white text-gray-800"
                                        }`}
                                    >
                                        <p className="break-words">
                                            {item.message}
                                        </p>

                                        <p
                                            className={`mt-1 text-[10px] ${
                                                isOwnMessage
                                                    ? "text-blue-100"
                                                    : "text-gray-400"
                                            }`}
                                        >
                                            {item.created_at
                                                ? new Date(
                                                      item.created_at
                                                  ).toLocaleTimeString(
                                                      "vi-VN",
                                                      {
                                                          hour: "2-digit",
                                                          minute: "2-digit",
                                                      }
                                                  )
                                                : ""}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <form
                        onSubmit={handleSendMessage}
                        className="flex items-center gap-2 border-t bg-white p-3"
                    >
                        <input
                            type="text"
                            value={message}
                            onChange={(event) =>
                                setMessage(event.target.value)
                            }
                            placeholder="Type your message..."
                            className="min-w-0 flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500"
                            disabled={!conversation || sending}
                        />

                        <button
                            type="submit"
                            disabled={!message.trim() || sending || !conversation}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <FaPaperPlane size={15} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default CustomerSupportChat;