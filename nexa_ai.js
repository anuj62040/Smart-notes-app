class NexaWebAssistant {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    }

    speak(text) {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            let cleanText = text.replace(/[*#()]/g, '');
            let utterance = new SpeechSynthesisUtterance(cleanText);
            
            // Fetching all available system voices
            let voices = window.speechSynthesis.getVoices();
            
            // Filtering to find a professional English Male Voice
            let maleVoice = voices.find(voice => 
                (voice.name.toLowerCase().includes('male') || 
                 voice.name.toLowerCase().includes('google uk english') ||
                 voice.name.toLowerCase().includes('natural')) && 
                voice.lang.startsWith('en')
            );

            if (maleVoice) {
                utterance.voice = maleVoice;
            }
            
            utterance.rate = 1.0;
            utterance.pitch = 0.9; // Lower pitch slightly for a deeper male voice tone
            window.speechSynthesis.speak(utterance);
        } else {
            console.error("Text-to-speech not supported in this browser.");
        }
    }

    async askNexa(prompt) {
        const url = `${this.endpoint}?key=${this.apiKey}`;
        const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        const smartPrompt = `
        SYSTEM INSTRUCTIONS:
        1. Your name is Nexa. You are an advanced personal AI male voice assistant developed by Anuj.
        2. CORRECT CURRENT DATE & TIME: ${currentDate}, ${currentTime}. Always use this context accurately.
        3. MULTILINGUAL: If user asks in Hindi/Hinglish, reply in Hindi. If in English, reply in English.
        4. Keep responses strictly under 2 lines for high-speed delivery.
        
        User Question: ${prompt}`;

        const payload = {
            contents: [{ parts: [{ text: smartPrompt }] }]
        };

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            return "Connection Error: Unable to reach Nexa servers.";
        }
    }
}

// Trigger voice loading for browser compatibility
if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
}
