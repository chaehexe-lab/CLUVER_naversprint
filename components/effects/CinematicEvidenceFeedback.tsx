"use client";

import { useEffect, useRef, type CSSProperties } from "react";

type FeedbackDetail = {
  importance?: "standard" | "critical";
  material?: "paper" | "metal" | "wood" | "cloth" | "organic";
  x?: number;
  y?: number;
};

const PARTICLES = Array.from({ length: 16 }, (_, index) => {
  const angle = (Math.PI * 2 * index) / 16 + (index % 3) * 0.12;
  const distance = 46 + (index % 5) * 14;
  return {
    dx: Number((Math.cos(angle) * distance).toFixed(3)),
    dy: Number((Math.sin(angle) * distance).toFixed(3)),
    delay: (index % 4) * 12
  };
});

export default function CinematicEvidenceFeedback() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    let audioContext: AudioContext | undefined;
    let resetTimer = 0;
    let hitStopTimer = 0;

    const unlockAudio = () => {
      if (!audioContext) audioContext = new AudioContext();
      if (audioContext.state === "suspended") void audioContext.resume();
    };

    const noiseBurst = (duration: number, frequency: number, volume: number, delay = 0) => {
      if (!audioContext || audioContext.state !== "running") return;
      const start = audioContext.currentTime + delay;
      const buffer = audioContext.createBuffer(1, Math.ceil(audioContext.sampleRate * duration), audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      for (let index = 0; index < data.length; index += 1) {
        const decay = Math.pow(1 - index / data.length, 1.8);
        data[index] = (Math.random() * 2 - 1) * decay;
      }
      const source = audioContext.createBufferSource();
      const filter = audioContext.createBiquadFilter();
      const gain = audioContext.createGain();
      source.buffer = buffer;
      filter.type = frequency < 300 ? "lowpass" : "bandpass";
      filter.frequency.value = frequency;
      filter.Q.value = 0.8;
      gain.gain.setValueAtTime(volume, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      source.connect(filter).connect(gain).connect(audioContext.destination);
      source.start(start);
    };

    const tone = (frequency: number, duration: number, volume: number, type: OscillatorType, delay = 0) => {
      if (!audioContext || audioContext.state !== "running") return;
      const start = audioContext.currentTime + delay;
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, start);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(28, frequency * 0.72), start + duration);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.02);
    };

    const playMaterialSound = (material: FeedbackDetail["material"], critical: boolean) => {
      const volume = critical ? 0.07 : 0.038;
      if (material === "paper" || material === "cloth") noiseBurst(0.2, material === "paper" ? 1650 : 720, volume);
      else if (material === "metal") {
        tone(740, 0.25, volume, "triangle");
        tone(1010, 0.19, volume * 0.55, "sine", 0.018);
      } else if (material === "wood") tone(118, 0.16, volume, "triangle");
      else noiseBurst(0.16, 380, volume);

      if (!critical) return;
      tone(55, 0.72, 0.075, "sawtooth");
      tone(61, 0.66, 0.052, "sine", 0.018);
      noiseBurst(0.11, 2200, 0.045);
      noiseBurst(0.62, 420, 0.022, 0.24);
    };

    const handleFeedback = (event: Event) => {
      const detail = (event as CustomEvent<FeedbackDetail>).detail || {};
      const shell = document.querySelector<HTMLElement>(".game-shell");
      const bounds = shell?.getBoundingClientRect();
      const x = bounds && Number.isFinite(detail.x) ? ((detail.x! - bounds.left) / bounds.width) * 100 : 50;
      const y = bounds && Number.isFinite(detail.y) ? ((detail.y! - bounds.top) / bounds.height) * 100 : 50;
      const critical = detail.importance === "critical";

      window.clearTimeout(resetTimer);
      window.clearTimeout(hitStopTimer);
      layer.style.setProperty("--impact-x", `${Math.max(0, Math.min(100, x))}%`);
      layer.style.setProperty("--impact-y", `${Math.max(0, Math.min(100, y))}%`);
      layer.dataset.importance = critical ? "critical" : "standard";
      layer.classList.remove("active");
      void layer.offsetWidth;
      layer.classList.add("active");

      if (critical && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        shell?.classList.add("cinematic-hitstop");
        hitStopTimer = window.setTimeout(() => shell?.classList.remove("cinematic-hitstop"), 140);
      }
      playMaterialSound(detail.material || "organic", critical);
      resetTimer = window.setTimeout(() => layer.classList.remove("active"), critical ? 720 : 430);
    };

    window.addEventListener("samunmong:evidence-feedback", handleFeedback);
    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });
    return () => {
      window.clearTimeout(resetTimer);
      window.clearTimeout(hitStopTimer);
      window.removeEventListener("samunmong:evidence-feedback", handleFeedback);
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      if (audioContext) void audioContext.close();
    };
  }, []);

  return (
    <div ref={layerRef} className="cinematic-feedback-layer" data-importance="standard" aria-hidden="true">
      <span className="cinematic-vignette" />
      <span className="cinematic-flash" />
      <span className="cinematic-shockwave" />
      <span className="cinematic-glitch cinematic-glitch-a" />
      <span className="cinematic-glitch cinematic-glitch-b" />
      <span className="cinematic-impact-core" />
      {PARTICLES.map((particle, index) => (
        <i
          key={index}
          className="cinematic-particle"
          style={{
            "--particle-x": `${particle.dx}px`,
            "--particle-y": `${particle.dy}px`,
            "--particle-delay": `${particle.delay}ms`
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
