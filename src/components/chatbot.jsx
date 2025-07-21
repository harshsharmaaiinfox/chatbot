import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import "../assets/style.css";
import { chatbotAPI } from "../services/apiservice";

function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const updateTimeout = useRef(null); // <-- Move this here, at the top level

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    let fullResponse = "";
    let tempMessageId = Date.now(); // Unique ID to track the streaming message

    // Add a temporary bot message to stream into
    setMessages((prev) => [...prev, { from: "bot", text: "", tempId: tempMessageId }]);

    try {
      await chatbotAPI.sendMessage(input, [], (chunk) => {
        if (chunk && typeof chunk === "string") {
          fullResponse = chunk; // <-- Replace, don't append

          if (!updateTimeout.current) {
            updateTimeout.current = setTimeout(() => {
              setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                  msg.tempId === tempMessageId
                    ? { ...msg, text: fullResponse }
                    : msg
                )
              );
              updateTimeout.current = null;
            }, 100); // Update at most every 100ms
          }
        }
      });

      // Replace temp message with final cleaned message
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.tempId === tempMessageId
            ? { from: "bot", text: fullResponse.trim() }
            : msg
        )
      );
    } catch (err) {
      setMessages((prev) => [...prev, { from: "bot", text: "❌ Something went wrong." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputKey = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="chat-screen">
      {messages.length === 0 ? (
        <div className="intro-screen">
        
          <div className="input-bar">
            <input
              type="text"
              placeholder="Ask me about a country's inteventions"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleInputKey}
            />
            <div className="input-icons">
              <button onClick={sendMessage}>
                <i className="fa-regular fa-paper-plane"></i>
              </button>
            </div>
          </div>
          <div className="example-question">
            <span><strong>Example Question:</strong> What did Russia say about cybersecurity capacity building?</span>
          </div>
        </div>
      ) : (
        <>
          <div className="chat-body">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-msg ${msg.from}`}>
                {msg.from === "bot" ? (
                  <ReactMarkdown
                    components={{
                      a: ({ node, ...props }) => (
                        <a {...props} target="_blank" rel="noopener noreferrer" />
                      ),
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                ) : (
                  <span>{msg.text}</span>
                )}
              </div>
            ))}

            {loading && (
              <div className="chat-msg bot">
                <span className="dot-loader"></span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <div className="input-bar">
            <input
              type="text"
              placeholder="Ask me about a country's inteventions"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleInputKey}
            />
            <div className="input-icons">
              <button onClick={sendMessage}>
                <i className="fa-regular fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ChatBot;
