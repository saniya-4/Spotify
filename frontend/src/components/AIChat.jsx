import React, { useState, useRef, useEffect } from "react";
import { sendMessage } from "../api/ai";

const AIChat = () => {
  const [messages, setMessages]                     = useState([]);
  const [input, setInput]                           = useState("");
  const [collectedData, setCollectedData]           = useState({});
  const [customerData, setCustomerData]             = useState({});
  const [lastAskedField, setLastAskedField]         = useState(null);
  const [awaitingConfirmation, setAwaitingConfirmation]         = useState(false);
  const [collectingCustomer, setCollectingCustomer]             = useState(false);
  const [awaitingCustomerConfirm, setAwaitingCustomerConfirm]   = useState(false);
  const [isComplete, setIsComplete]                 = useState(false);
  const [loading, setLoading]                       = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isComplete) return;

    const userMsg = input.trim();
    setInput("");
    setLoading(true);
    setMessages((prev) => [...prev, { type: "user", text: userMsg }]);

    try {
      const res = await sendMessage(
        userMsg,
        collectedData,
        customerData,
        lastAskedField,
        awaitingConfirmation,
        collectingCustomer,
        awaitingCustomerConfirm
      );

      setMessages((prev) => [
        ...prev,
        { type: "ai", text: res.reply || "Got it. Let me help you with that..." },
      ]);

      // ✅ Update every single flag — this is what was breaking before
      setCollectedData(res.collectedData || {});
      setCustomerData(res.customerData || {});
      setLastAskedField(res.lastAskedField || null);
      setAwaitingConfirmation(res.awaitingConfirmation || false);
      setCollectingCustomer(res.collectingCustomer || false);
      setAwaitingCustomerConfirm(res.awaitingCustomerConfirm || false);

      if (res.status === "complete") {
        setLastAskedField(null);
        setCollectedData({});
        setCustomerData({});
        setAwaitingConfirmation(false);
        setCollectingCustomer(false);
        setAwaitingCustomerConfirm(false);
        setIsComplete(true);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { type: "ai", text: "⚠️ Something went wrong. Please try again." },
      ]);
    }

    setLoading(false);
  };

  const handleStartOver = () => {
    setMessages([]);
    setCollectedData({});
    setCustomerData({});
    setLastAskedField(null);
    setAwaitingConfirmation(false);
    setCollectingCustomer(false);
    setAwaitingCustomerConfirm(false);
    setIsComplete(false);
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const getPhaseLabel = () => {
    if (isComplete)              return { label: "✅ Complete",           color: "text-green-400 border-green-400" };
    if (awaitingCustomerConfirm) return { label: "📋 Confirm your details", color: "text-yellow-400 border-yellow-400" };
    if (collectingCustomer)      return { label: "📋 Step 2: Your Details", color: "text-blue-400 border-blue-400" };
    if (awaitingConfirmation)    return { label: "🎯 Confirm ad info",     color: "text-yellow-400 border-yellow-400" };
    return                              { label: "🎯 Step 1: Ad Info",     color: "text-gray-400 border-gray-600" };
  };

  const getPlaceholder = () => {
    if (isComplete)              return "Brief generated! Click Start Over to create another.";
    if (awaitingCustomerConfirm) return "Type yes to confirm your details or no to re-enter...";
    if (collectingCustomer)      return "Enter your detail (or type 'skip' for optional fields)...";
    if (awaitingConfirmation)    return "Type yes to confirm or no to restart...";
    return "Describe your ad idea...";
  };

  const phase = getPhaseLabel();

  return (
    <div className="flex flex-col w-full h-full text-white bg-black p-4 overflow-hidden">

      {/* Header */}
      <div className="mb-4 flex-shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">🎯 Create Your Own Ad</h2>
          <p className="text-gray-400 text-sm">
            Describe your idea and I'll help you structure it perfectly.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-xs px-3 py-1 rounded-full border ${phase.color}`}>
            {phase.label}
          </span>
          {isComplete && (
            <button
              onClick={handleStartOver}
              className="text-sm text-green-400 border border-green-400 px-3 py-1 rounded-full hover:bg-green-400 hover:text-black transition"
            >
              Start Over
            </button>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-3 border border-gray-700 rounded-lg p-4 bg-[#121212] min-h-0">
        {messages.length === 0 && (
          <p className="text-gray-500 text-sm">
            Try: "I want to advertise stuffed toys on Instagram"
          </p>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.type === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`px-4 py-2 rounded-lg max-w-[75%] text-sm whitespace-pre-wrap ${
                m.type === "user"
                  ? "bg-green-500 text-black"
                  : "bg-gray-800 text-white"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-2 rounded-lg bg-gray-800 text-gray-400 text-sm animate-pulse">
              Typing...
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-2 flex-shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isComplete}
          placeholder={getPlaceholder()}
          className={`flex-1 bg-[#1e1e1e] border border-gray-700 rounded-full px-4 py-2 outline-none text-white text-sm transition ${
            isComplete ? "opacity-50 cursor-not-allowed" : "focus:border-green-500"
          }`}
        />
        <button
          onClick={handleSend}
          disabled={loading || isComplete}
          className="bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2 rounded-full text-black font-semibold text-sm transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default AIChat;