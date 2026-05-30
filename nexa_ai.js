class NexaWebAssistant {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    }

    speak(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            let cleanText = text.replace(/[*#()]/g, '');
            let utterance = new SpeechSynthesisUtterance(cleanText);
            let voices = window.speechSynthesis.getVoices();
            
            // Selecting professional male voice signature compatible with Android/Chrome
            let maleVoice = voices.find(voice => 
                (voice.name.toLowerCase().includes('male') || 
                 voice.name.toLowerCase().includes('google uk english male') ||
                 voice.name.toLowerCase().includes('natural')) && 
                voice.lang.startsWith('en')
            );

            if (maleVoice) utterance.voice = maleVoice;
            utterance.rate = 1.0;
            utterance.pitch = 0.88; // Deep male frequency setting
            window.speechSynthesis.speak(utterance);
        }
    }

    async askNexa(prompt) {
        const url = `${this.endpoint}?key=${this.apiKey}`;
        const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        const smartPrompt = `
        SYSTEM INSTRUCTIONS:
        1. Your name is Nexa. You are an advanced personal AI male voice assistant developed by Anuj.
        2. CURRENT SYSTEM DATE & TIME: ${currentDate}, ${currentTime}. Always use this exact data if asked.
        3. MULTILINGUAL: If user types in Hindi/Hinglish, reply fully in Hindi/Hinglish. If in English, reply in English.
        4. Keep responses strictly under 2 lines so it is crisp and clear to listen.
        
        User Question: ${prompt}`;

        const payload = { contents: [{ parts: [{ text: smartPrompt }] }] };

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            return "Connection Error: Server routes are busy.";
        }
    }
}
