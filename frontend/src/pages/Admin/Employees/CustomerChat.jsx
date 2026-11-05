import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import {
    MessageCircle,
    Search,
    Send,
    RefreshCw,
    User,
    Clock,
    MessageSquare,
    Headphones
} from "lucide-react";

const API_URL = "http://localhost:5000/api/customer-chat";

function CustomerChat() {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const messagesEndRef = useRef(null);

    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");

    const getHeaders = () => ({
        Authorization: `Bearer ${token}`
    });

    // =====================================================
    // GET CONVERSATIONS
    // =====================================================

    const fetchConversations = useCallback(async () => {
        try {
            const response = await axios.get(
                `${API_URL}/conversations`,
                { headers: getHeaders() }
            );

            const data = Array.isArray(response.data)
                ? response.data
                : [];

            setConversations(data);

            setSelectedConversation((current) => {
                if (!current) return current;

                return data.find(
                    (item) => item.id === current.id
                ) || current;
            });
        } catch (error) {
            console.error(
                "Fetch conversations error:",
                error
            );
        } finally {
            setLoading(false);
        }
    }, [token]);

    // =====================================================
    // GET MESSAGES
    // =====================================================

    const fetchMessages = useCallback(async (conversationId) => {
        if (!conversationId) return;

        try {
            const response = await axios.get(
                `${API_URL}/${conversationId}/messages`,
                { headers: getHeaders() }
            );

            setMessages(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (error) {
            console.error(
                "Fetch messages error:",
                error
            );
        }
    }, [token]);

    // =====================================================
    // INITIAL LOAD AND AUTO REFRESH
    // =====================================================

    useEffect(() => {
        fetchConversations();

        const interval = setInterval(() => {
            fetchConversations();
        }, 3000);

        return () => clearInterval(interval);
    }, [fetchConversations]);

    useEffect(() => {
        if (!selectedConversation) {
            setMessages([]);
            return;
        }

        fetchMessages(selectedConversation.id);

        const interval = setInterval(() => {
            fetchMessages(selectedConversation.id);
        }, 3000);

        return () => clearInterval(interval);
    }, [selectedConversation?.id, fetchMessages]);

    // =====================================================
    // AUTO SCROLL
    // =====================================================

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [messages]);

    // =====================================================
    // SEND MESSAGE
    // =====================================================

    const handleSendMessage = async (e) => {
        e.preventDefault();

        const content = message.trim();

        if (!content || !selectedConversation || sending) {
            return;
        }

        try {
            setSending(true);

            await axios.post(
                `${API_URL}/${selectedConversation.id}/messages`,
                {
                    message: content
                },
                {
                    headers: getHeaders()
                }
            );

            setMessage("");

            await Promise.all([
                fetchMessages(selectedConversation.id),
                fetchConversations()
            ]);

        } catch (error) {
            console.error(
                "Send message error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Unable to send message."
            );
        } finally {
            setSending(false);
        }
    };

    // =====================================================
    // FILTER CONVERSATIONS
    // =====================================================

    const filteredConversations = conversations.filter(
        (conversation) =>
            String(conversation.customer_name || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            String(conversation.customer_email || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
    );

    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatTime = (date) => {
        if (!date) return "";

        return new Date(date).toLocaleTimeString(
            "en-US",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    };

    const formatDate = (date) => {
        if (!date) return "";

        return new Date(date).toLocaleDateString(
            "en-US"
        );
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="space-y-6">

            {/* HEADER */}

            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Customer Chat
                </h1>

                <p className="text-gray-500 mt-2">
                    Manage customer conversations and provide support.
                </p>
            </div>

            {/* CHAT WORKSPACE */}

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

                <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] min-h-[650px]">

                    {/* CONVERSATION SIDEBAR */}

                    <div className="border-r border-gray-200 flex flex-col">

                        <div className="p-5 border-b border-gray-200">

                            <div className="flex items-center justify-between mb-4">

                                <h2 className="font-bold text-gray-900 text-lg">
                                    Conversations
                                </h2>

                                <button
                                    onClick={fetchConversations}
                                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                                    title="Refresh conversations"
                                >
                                    <RefreshCw size={17} />
                                </button>

                            </div>

                            <div className="relative">

                                <Search
                                    size={17}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    placeholder="Search customers..."
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                />

                            </div>

                        </div>

                        <div className="flex-1 overflow-y-auto">

                            {loading ? (

                                <div className="p-8 text-center text-gray-400">
                                    Loading conversations...
                                </div>

                            ) : filteredConversations.length === 0 ? (

                                <div className="p-8 text-center">

                                    <MessageCircle
                                        size={35}
                                        className="mx-auto text-gray-300 mb-3"
                                    />

                                    <p className="text-gray-500 text-sm">
                                        No conversations found.
                                    </p>

                                </div>

                            ) : (

                                filteredConversations.map((conversation) => (

                                    <button
                                        key={conversation.id}
                                        onClick={() =>
                                            setSelectedConversation(conversation)
                                        }
                                        className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition ${
                                            selectedConversation?.id === conversation.id
                                                ? "bg-blue-50 border-l-4 border-l-blue-500"
                                                : ""
                                        }`}
                                    >

                                        <div className="flex items-start gap-3">

                                            <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                                <User size={20} />
                                            </div>

                                            <div className="flex-1 min-w-0">

                                                <div className="flex items-center justify-between gap-2">

                                                    <h3 className="font-semibold text-gray-900 truncate">
                                                        {conversation.customer_name}
                                                    </h3>

                                                    <span className="text-xs text-gray-400 shrink-0">
                                                        {formatDate(
                                                            conversation.last_message_at ||
                                                            conversation.updated_at
                                                        )}
                                                    </span>

                                                </div>

                                                <p className="text-xs text-gray-400 mt-1 truncate">
                                                    {conversation.customer_email}
                                                </p>

                                                <p className="text-sm text-gray-500 mt-2 truncate">
                                                    {conversation.last_message ||
                                                        "Start a conversation"}
                                                </p>

                                                <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                                                    conversation.status === "OPEN"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-600"
                                                }`}>
                                                    {conversation.status}
                                                </span>

                                            </div>

                                        </div>

                                    </button>

                                ))

                            )}

                        </div>

                    </div>

                    {/* CHAT CONTENT */}

                    <div className="flex flex-col min-w-0">

                        {selectedConversation ? (

                            <>

                                {/* CHAT HEADER */}

                                <div className="p-5 border-b border-gray-200 flex items-center gap-3">

                                    <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <User size={21} />
                                    </div>

                                    <div>

                                        <h2 className="font-bold text-gray-900">
                                            {selectedConversation.customer_name}
                                        </h2>

                                        <p className="text-sm text-gray-500">
                                            {selectedConversation.customer_email}
                                        </p>

                                    </div>

                                </div>

                                {/* MESSAGES */}

                                <div className="flex-1 p-5 overflow-y-auto bg-gray-50 space-y-4 min-h-[400px]">

                                    {messages.length === 0 ? (

                                        <div className="h-full flex flex-col items-center justify-center text-gray-400">

                                            <MessageSquare size={40} />

                                            <p className="mt-3">
                                                No messages yet.
                                            </p>

                                        </div>

                                    ) : (

                                        messages.map((item) => {

                                            const isMine =
                                                Number(item.sender_id) ===
                                                Number(
                                                    JSON.parse(
                                                        localStorage.getItem("user") || "{}"
                                                    ).id
                                                );

                                            return (

                                                <div
                                                    key={item.id}
                                                    className={`flex ${
                                                        isMine
                                                            ? "justify-end"
                                                            : "justify-start"
                                                    }`}
                                                >

                                                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                                                        isMine
                                                            ? "bg-blue-600 text-white rounded-br-md"
                                                            : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
                                                    }`}>

                                                        <p className="text-sm whitespace-pre-wrap break-words">
                                                            {item.message}
                                                        </p>

                                                        <div className={`flex items-center gap-1 mt-2 text-xs ${
                                                            isMine
                                                                ? "text-blue-100 justify-end"
                                                                : "text-gray-400"
                                                        }`}>
                                                            <Clock size={12} />
                                                            {formatTime(item.created_at)}
                                                        </div>

                                                    </div>

                                                </div>

                                            );

                                        })

                                    )}

                                    <div ref={messagesEndRef} />

                                </div>

                                {/* MESSAGE INPUT */}

                                <form
                                    onSubmit={handleSendMessage}
                                    className="p-4 border-t border-gray-200"
                                >

                                    <div className="flex items-center gap-3">

                                        <input
                                            type="text"
                                            value={message}
                                            onChange={(e) =>
                                                setMessage(e.target.value)
                                            }
                                            placeholder="Type your message..."
                                            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                            disabled={
                                                selectedConversation.status !== "OPEN" ||
                                                sending
                                            }
                                        />

                                        <button
                                            type="submit"
                                            disabled={
                                                !message.trim() ||
                                                sending ||
                                                selectedConversation.status !== "OPEN"
                                            }
                                            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >

                                            <Send size={18} />

                                            <span className="hidden sm:inline">
                                                Send
                                            </span>

                                        </button>

                                    </div>

                                    {selectedConversation.status !== "OPEN" && (
                                        <p className="text-sm text-red-500 mt-2">
                                            This conversation is closed.
                                        </p>
                                    )}

                                </form>

                            </>

                        ) : (

                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">

                                <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                                    <Headphones size={38} />
                                </div>

                                <h2 className="text-lg font-bold text-gray-800 mt-5">
                                    Customer Support Workspace
                                </h2>

                                <p className="text-gray-500 mt-2 max-w-sm">
                                    Select a conversation to view messages and reply to customers.
                                </p>

                            </div>

                        )}

                    </div>

                </div>

            </div>

        </div>
    );
}

export default CustomerChat;