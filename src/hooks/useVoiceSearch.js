import { useState, useRef, useCallback } from "react";

export function useVoiceSearch({ lang = "bn-BD", onResult, onError } = {}) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(
    typeof window !== "undefined" && (("webkitSpeechRecognition" in window) || ("SpeechRecognition" in window))
  );
  const recRef = useRef(null);

  const start = useCallback(() => {
    if (!supported) { onError?.("Voice search isn't supported in this browser."); return; }
    try {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SR();
      rec.lang = lang;
      rec.continuous = false;
      rec.interimResults = true;
      rec.onresult = (e) => {
        let txt = "";
        for (let i = 0; i < e.results.length; i++) txt += e.results[i][0].transcript;
        setTranscript(txt);
        if (e.results[e.results.length - 1].isFinal && onResult) onResult(txt);
      };
      rec.onend = () => setListening(false);
      rec.onerror = (e) => {
        setListening(false);
        const msg = e?.error === "not-allowed" ? "Microphone access denied. Allow mic permission to use voice search."
          : e?.error === "no-speech" ? "No speech detected. Try again."
          : e?.error === "network" ? "Voice search needs an internet connection."
          : "Voice search failed. Try again.";
        onError?.(msg);
      };
      recRef.current = rec;
      setListening(true);
      rec.start();
    } catch (err) {
      setListening(false);
      onError?.("Voice search couldn't start. Try again.");
    }
  }, [supported, lang, onResult, onError]);

  const stop = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
  }, []);

  const reset = useCallback(() => setTranscript(""), []);

  return { listening, transcript, supported, start, stop, reset };
}