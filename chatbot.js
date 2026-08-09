// chatbot.js

document.addEventListener("DOMContentLoaded", () => {
  // Select DOM Elements
  const triggerBtn = document.getElementById("chatbot-trigger");
  const chatWindow = document.getElementById("chatbot-window");
  const closeBtn = document.getElementById("chatbot-close");
  const clearBtn = document.getElementById("chatbot-clear");
  const chatMessages = document.getElementById("chat-messages");
  const chatInput = document.getElementById("chat-input");
  const sendBtn = document.getElementById("chat-send");
  const quickActionsContainer = document.getElementById("quick-actions");

  // State Management
  let isChatOpen = false;
  let chatHistory = []; // Local history to build conversational context for Gemini API

  // Toggle Chat Window Window Open/Close
  const toggleChat = () => {
    isChatOpen = !isChatOpen;
    if (isChatOpen) {
      chatWindow.classList.add("active");
      chatInput.focus();
      // Auto-load welcome message if empty
      if (chatMessages.children.length === 0) {
        showWelcomeMessage();
      }
    } else {
      chatWindow.classList.remove("active");
    }
  };

  triggerBtn.addEventListener("click", toggleChat);
  closeBtn.addEventListener("click", toggleChat);

  // Clear Chat Conversation
  clearBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear your conversation history?")) {
      chatMessages.innerHTML = "";
      chatHistory = [];
      showWelcomeMessage();
    }
  });

  // Display initial localized friendly greeting message
  const showWelcomeMessage = () => {
    const welcomeHtml = `
      🙏 <strong>Welcome to Ramnagri Tourism!</strong><br><br>
      I can assist you with:<br>
      🏨 Hotel Recommendations<br>
      🚖 Cab Booking Guidance<br>
      🛕 Ayodhya Tourist Places<br>
      📍 Nearby Attractions<br>
      💰 Tour Packages<br>
      📞 Contact Support<br><br>
      You can ask me questions in <strong>Hindi, English, or Hinglish</strong>.
    `;
    appendMessage("bot", welcomeHtml);
  };

  // Helper: Append new message to UI
  const appendMessage = (sender, text) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("msg-wrapper", sender);

    // Format plain text breaks
    const formattedText = text.replace(/\n/g, "<br>");

    const bubble = document.createElement("div");
    bubble.classList.add("msg-bubble");
    bubble.innerHTML = formattedText;

    const time = document.createElement("span");
    time.classList.add("msg-time");
    const now = new Date();
    time.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    wrapper.appendChild(bubble);
    wrapper.appendChild(time);
    chatMessages.appendChild(wrapper);

    // Auto Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  // Show / Hide Typing Indicator
  const showTypingIndicator = () => {
    const indicatorHtml = `
      <div class="msg-wrapper bot" id="typing-indicator-wrapper">
        <div class="msg-bubble" style="padding: 8px 12px;">
          <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      </div>
    `;
    chatMessages.insertAdjacentHTML("beforeend", indicatorHtml);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  const removeTypingIndicator = () => {
    const element = document.getElementById("typing-indicator-wrapper");
    if (element) {
      element.remove();
    }
  };

  // Quick Action Button Clicks
  quickActionsContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("quick-btn")) {
      const actionText = e.target.getAttribute("data-action");
      const userLabel = e.target.innerText;
      handleUserSendMessage(userLabel, actionText);
    }
  });

  // Core Send Logic
  const handleUserSendMessage = async (displayMsg, systemQuery = "") => {
    const textToSend = (systemQuery || displayMsg).trim();
    if (!textToSend) return;

    // 1. Add user message to UI
    appendMessage("user", displayMsg);
    chatInput.value = "";

    // 2. Prepare Context for conversational history
    chatHistory.push({ role: "user", parts: [{ text: textToSend }] });

    // 3. Show loading state
    showTypingIndicator();

    try {
      let replyText = "";
      
      // Determine if a real Gemini API Key is configured
      const isGeminiConfigured = ChatbotConfig.GEMINI_API_KEY && ChatbotConfig.GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY_HERE";

      if (isGeminiConfigured) {
        replyText = await fetchGeminiResponse();
      } else {
        // Fallback to local rule engine responses simulation
        replyText = await simulateLocalFallbackResponse(textToSend);
      }

      removeTypingIndicator();
      appendMessage("bot", replyText);
      
      // Keep track in session history context
      chatHistory.push({ role: "model", parts: [{ text: replyText }] });

    } catch (error) {
      console.error("Error generating response:", error);
      removeTypingIndicator();
      appendMessage("bot", "I apologize, I am experiencing a brief connection issue. Please try again or reach out to our support.");
    }
  };

  // Connect to Google Gemini API
  const fetchGeminiResponse = async () => {
    const formattedContents = chatHistory.slice(-10); // Pass latest context depth (up to 10 cycles)
    
    const requestPayload = {
      contents: formattedContents,
      systemInstruction: {
        parts: [{ text: ChatbotConfig.SYSTEM_INSTRUCTION }]
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500
      }
    };

    const response = await fetch(`${ChatbotConfig.API_URL}?key=${ChatbotConfig.GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned code: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  };

  // Fallback Rule-based Matcher (Simulating intelligent matching offline or without API Key)
  const simulateLocalFallbackResponse = (query) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lowerQuery = query.toLowerCase();
        
        if (lowerQuery.includes("hotel") || lowerQuery.includes("stay") || lowerQuery.includes("ruko")) {
          resolve(ChatbotConfig.FALLBACKS.hotels);
        } else if (lowerQuery.includes("cab") || lowerQuery.includes("taxi") || lowerQuery.includes("gaadi") || lowerQuery.includes("transport")) {
          resolve(ChatbotConfig.FALLBACKS.cabs);
        } else if (lowerQuery.includes("place") || lowerQuery.includes("temple") || lowerQuery.includes("mandir") || lowerQuery.includes("darshan") || lowerQuery.includes("visit")) {
          resolve(ChatbotConfig.FALLBACKS.places);
        } else if (lowerQuery.includes("package") || lowerQuery.includes("tour") || lowerQuery.includes("trip")) {
          resolve(ChatbotConfig.FALLBACKS.packages);
        } else if (lowerQuery.includes("contact") || lowerQuery.includes("phone") || lowerQuery.includes("call") || lowerQuery.includes("support")) {
          resolve(ChatbotConfig.FALLBACKS.contact);
        } else if (lowerQuery.includes("hello") || lowerQuery.includes("hi") || lowerQuery.includes("namaste") || lowerQuery.includes("hey")) {
          resolve(ChatbotConfig.FALLBACKS.greetings);
        } else {
          resolve(ChatbotConfig.FALLBACKS.unknown);
        }
      }, 1000); // 1-second dynamic artificial lag for natural experience
    });
  };

  // Event Listeners for Input Submissions
  sendBtn.addEventListener("click", () => {
    handleUserSendMessage(chatInput.value);
  });

  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      handleUserSendMessage(chatInput.value);
    }
  });
});

