class NexaWebAssistant {
    constructor(apiKey) {
        this.apiKey = apiKey;
        // Updated secure endpoint for Gemini
        this.endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    }

    speak(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            let cleanText = text.replace(/[*#()]/g, '');
            let utterance = new SpeechSynthesisUtterance(cleanText);
            let voices = window.speechSynthesis.getVoices();
            
            let maleVoice = voices.find(voice => 
                (voice.name.toLowerCase().includes('male') || 
                 voice.name.toLowerCase().includes('google uk english male') ||
                 voice.name.toLowerCase().includes('natural')) && 
                voice.lang.startsWith('en')
            );

            if (maleVoice) utterance.voice = maleVoice;
            utterance.rate = 1.0;
            utterance.pitch = 0.88; 
            window.speechSynthesis.speak(utterance);
        }
    }

    async askNexa(prompt) {
        if (!this.apiKey) {
            return "Error: API Key is completely missing in browser storage.";
        }

        const url = `${this.endpoint}?key=${this.apiKey}`;
        const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        const smartPrompt = `
        SYSTEM INSTRUCTIONS:
        1. Your name is Nexa. You are an advanced personal AI male voice assistant developed by Anuj.
        2. CORRECT CURRENT DATE & TIME: ${currentDate}, ${currentTime}. Always use this context accurately.
        3. MULTILINGUAL: If user types in Hindi/Hinglish, reply fully in Hindi/Hinglish. If in English, reply in English.
        4. Keep responses strictly under 2 lines for high-speed delivery.
        
        User Question: ${prompt}`;

        const payload = { contents: [{ parts: [{ text: smartPrompt }] }] };

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            
            // Checking if server threw any key restriction or quota error
            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.error && errorData.error.message) {
                    return `Google Server Error: ${errorData.error.message}`;
                }
                return `Server Error: Status Code ${response.status}`;
            }

            const data = await response.json();
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            }
            return "Nexa received an empty response structure from the cloud.";
            
        } catch (error) {
            return "Connection Error: Unable to reach Google API servers.";
        }
    }
}
