// config.js
const ChatbotConfig = {
  // Replace with your actual Gemini API Key
  // To get a key, visit: https://aistudio.google.com/
  GEMINI_API_KEY: "YOUR_GEMINI_API_KEY_HERE",
  
  // API Endpoint configuration
  API_URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",

  // System instructions to maintain the persona and control output behavior
  SYSTEM_INSTRUCTION: `You are the official AI Travel Assistant for "Ramnagri Tourism", a premier travel platform for Ayodhya.
Your tone should be helpful, respectful, warm, and culturally aware.
You assist users in planning their trip to Ayodhya.

Key Information to use:
- Temples & Places: Shri Ram Janmabhoomi Mandir (Timings: 6:30 AM to 12:00 PM, 2:00 PM to 10:00 PM), Hanuman Garhi, Kanak Bhawan, Saryu Ghat (Aarti: Sunset), Ram Ki Paidi, Guptar Ghat.
- Facilities: Assist with hotel recommendations (luxury, budget, family, near temple), cab booking help (airport pickups, local sightseeing), custom travel packages.
- Support Details: Phone: +91-9999-XXXXXX, Email: support@ramnagritourism.com, Office: Near Ram Ki Paidi, Ayodhya, Business Hours: 9 AM to 8 PM.

Rules:
1. Respond in English, Hindi, or mixed Hinglish depending on how the user greets or asks.
2. Keep responses concise, structured, and easy to read using lists or short paragraphs.
3. If asked about booking or direct contact, provide the support options gently.
4. Keep instructions respectful (e.g., use "Jai Shree Ram" or "Namaste" where appropriate).`,

  // Fallback responses when API key is missing or API call fails
  FALLBACKS: {
    greetings: "🙏 Namaste! Welcome to Ramnagri Tourism. I can help you plan your journey to Ayodhya. Would you like to know about tourist places, hotels, cabs, or tour packages?",
    hotels: "🏨 **Hotels in Ayodhya**:\n\n1. **Premium/Luxury**: Rama Palace, Saket Hotel (near Ram Mandir area)\n2. **Budget-friendly**: Standard Dharamshalas and Homestays near Railway Station starting from ₹1,000/night.\n3. **Family Stays**: Multi-bedroom family suites near Saryu Ghat.\n\nWould you like me to share contact details for booking?",
    cabs: "🚖 **Cab & Travel Services**:\n\nWe provide reliable local and outstation cab services:\n- **Airport Pickup/Drop**: Ayodhya Airport (AYJ) & Lucknow Airport (LKO).\n- **Local Sightseeing**: ₹1,500 to ₹2,500 per day depending on vehicle (Sedan/SUV).\n- **Railway Station Pickup**: Available 24/7.",
    places: "🛕 **Must-Visit Places in Ayodhya**:\n\n- **Shri Ram Janmabhoomi Mandir**: Main temple complex (6:30 AM - 10:00 PM).\n- **Hanuman Garhi**: Holy temple dedicated to Lord Hanuman, situated on a hillock.\n- **Saryu Ghat**: Beautiful evening Aarti by the holy river.\n- **Ram Ki Paidi**: A series of beautiful ghats on the banks of Saryu River.\n- **Kanak Bhawan**: Historically significant palace temple.",
    packages: "💰 **Tour Packages**:\n\n1. **Divya Ayodhya One-Day Tour**: Covered sights include Ram Mandir, Hanuman Garhi, and Saryu Aarti.\n2. **Weekend Spiritual Retreat (2D/1N)**: Includes hotel stay, guided tour, and private cab transport.\n3. **Ramayan Circuit Tour (Customized)**: Tailored package including nearby historic destinations.\n\nWhich one fits your requirements?",
    contact: "📞 **Contact Ramnagri Tourism**:\n\n- **Phone**: +91-9999-XXXXXX\n- **Email**: support@ramnagritourism.com\n- **Office**: Ram Ki Paidi Complex, Ayodhya\n- **WhatsApp**: +91-9999-XXXXXX\n- **Hours**: 9:00 AM - 8:00 PM (Everyday)",
    unknown: "I understand you are planning your visit to Ayodhya. To give you the most accurate help regarding that, could you please specify if you're looking for hotels, travel cabs, historic places, or custom tour packages?"
  }
};

