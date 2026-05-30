class NexaWebAssistant {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.endpoint = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";
        
        
        
        // AUTOMATIC BYPASS: If key is fake or missing, prompt the user on the live site
        if (this.apiKey === "abcdef123" || !this.apiKey || this.apiKey.length < 10) {
            let savedKey = localStorage.getItem("nexa_key");
            if (!savedKey || savedKey === "null" || savedKey.length < 10) {
                let userKey = prompt("🔒 Please enter your FRESH Gemini API Key for Nexa:");
                if (userKey) {
                    localStorage.setItem("nexa_key", userKey.trim());
                    this.apiKey = userKey.trim();
                }
            } else {
                this.apiKey = savedKey;
            }
        }
    }

    speak(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            let cleanText = text.replace(/[*#()]/g, '');
            let utterance = new SpeechSynthesisUtterance(cleanText);
            let voices = window.speechSynthesis.getVoices();
            
            let maleVoice = voices.find(voice => 
                (voice.name.toLowerCase().includes('male') || 
                 voice.name.toLowerCase().includes('google uk english male')) && 
                voice.lang.startsWith('en')
            );

            if (maleVoice) utterance.voice = maleVoice;
            utterance.rate = 1.0;
            utterance.pitch = 0.88; 
            window.speechSynthesis.speak(utterance);
        }
    }

    async askNexa(prompt) {
        if (!this.apiKey || this.apiKey === "abcdef123") {
            return "Error: Valid API Key is required. Please refresh and enter a real key.";
        }

        const url = `${this.endpoint}?key=${this.apiKey}`;
        const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        const smartPrompt = `Your name is Nexa. You are a personal AI male assistant developed by Anuj. Date: ${currentDate}, Time: ${currentTime}. Keep replies strictly under 2 lines. User: ${prompt}`;
        const payload = { contents: [{ parts: [{ text: smartPrompt }] }] };

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.error && errorData.error.message) {
                    return `Google Error: ${errorData.error.message}`;
                }
                return `Server Error: Code ${response.status}`;
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            return "Connection Error: Cannot reach Google servers.";
        }
    }
}
