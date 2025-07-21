// API Configuration
const API_CONFIG = {
  BASE_URL: "https://reactflaskchatbot.vercel.app/",
  // BASE_URL: "http://127.0.0.1:5000",
  HEADERS: {
    "Content-Type": "application/json",
  },
};

// API Service for Chatbot
export const chatbotAPI = {
  // Send message to chatbot API with streaming response
  sendMessage: async (message, history, onChunk) => {
    try {
      const response = await fetch(API_CONFIG.BASE_URL, {
        method: "POST",
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify({
          message: message,
          history: history
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let botMessage = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        botMessage += chunk;

        // Call the callback function with the updated message
        if (onChunk) {
          onChunk(botMessage);
        }
      }

      return botMessage;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  // Alternative method for non-streaming response (if needed)
  sendMessageSync: async (message, history) => {
    try {
      const response = await fetch(API_CONFIG.BASE_URL, {
        method: "POST",
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify({
          message: message,
          history: history
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.answer || data.response || "No response";
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }
};

// Export API configuration for external use if needed
export { API_CONFIG };
