"use client";

import { Square, Volume2 } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/** Gönderi durumunu tarayıcının yerleşik konuşma sentezi ile Türkçe okur (Web Speech API). */
export function SpeakButton({ text, className = "" }: { text: string; className?: string }) {
  const supported = useSyncExternalStore(noopSubscribe, () => "speechSynthesis" in window, () => false);
  const [speaking, setSpeaking] = useState(false);

  // Sayfadan ayrılırken okumayı durdur
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  if (!supported) return null;

  function toggle() {
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "tr-TR";
    u.rate = 0.9;
    const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith("tr"));
    if (voice) u.voice = voice;
    u.onend = u.onerror = () => setSpeaking(false);
    synth.cancel();
    synth.speak(u);
    setSpeaking(true);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={speaking}
      className={`inline-flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-800 hover:bg-brand-100 ${className}`}
    >
      {speaking ? <Square size={16} aria-hidden /> : <Volume2 size={16} aria-hidden />}
      {speaking ? "Okumayı durdur" : "Sesli dinle"}
    </button>
  );
}
