"use client";

import { useCallback, useRef } from "react";

/**
 * Custom hook providing Web Audio API synthesized sound effects for the battle system.
 * Handles timeouts, timer ticks, action-packed strikes, distinct mine detonations, and blocked hits
 * with robust per-cell and per-event deduplication to guarantee exactly one sound playback per strike.
 */
// Module-level deduplication state to survive component re-renders and multi-instances
const globalPlayedStrikes = new Set<string>();
let globalLastSoundTime = 0;

export function markStrikeAsPlayed(targetTeamIndex: number | string, cellIndex: number | string) {
  const key = `cell_${targetTeamIndex}_${cellIndex}`;
  globalPlayedStrikes.add(key);
}

export function useBattleAudio() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") return null;
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume().catch(() => {});
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback(
    (
      frequency: number,
      duration: number = 0.12,
      type: OscillatorType = "sine",
      gainValue: number = 0.05
    ) => {
      const context = getAudioContext();
      if (!context) return;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, context.currentTime);
      gain.gain.setValueAtTime(gainValue, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        context.currentTime + duration
      );
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + duration);
    },
    [getAudioContext]
  );

  const playNoise = useCallback(
    (duration: number = 0.25, gainValue: number = 0.1) => {
      const context = getAudioContext();
      if (!context) return;
      const bufferSize = Math.max(1, Math.floor(context.sampleRate * duration));
      const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let index = 0; index < bufferSize; index += 1) {
        data[index] = (Math.random() * 2 - 1) * (1 - index / bufferSize);
      }
      const source = context.createBufferSource();
      const gain = context.createGain();
      source.buffer = buffer;
      gain.gain.setValueAtTime(gainValue, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        context.currentTime + duration
      );
      source.connect(gain);
      gain.connect(context.destination);
      source.start();
    },
    [getAudioContext]
  );

  // 💥 Action-packed Strike Sound: Single, unified cinematic punch & blast (no delayed secondary sounds)
  const playActionHitSound = useCallback(() => {
    const context = getAudioContext();
    if (!context) return;
    const now = context.currentTime;

    // 1. Heavy bass punch drop (240Hz -> 45Hz in 0.22s)
    const osc = context.createOscillator();
    const oscGain = context.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.22);

    oscGain.gain.setValueAtTime(0.25, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(oscGain);
    oscGain.connect(context.destination);
    osc.start(now);
    osc.stop(now + 0.22);

    // 2. Tightly integrated low-pass noise transient (0.18s)
    const duration = 0.18;
    const bufferSize = Math.floor(context.sampleRate * duration);
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.5);
    }
    const noiseSource = context.createBufferSource();
    noiseSource.buffer = buffer;

    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1100, now);
    filter.frequency.exponentialRampToValueAtTime(180, now + duration);

    const noiseGain = context.createGain();
    noiseGain.gain.setValueAtTime(0.22, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(context.destination);
    noiseSource.start(now);
  }, [getAudioContext]);

  // ⚠️ Mine Sound: Single, deep, thunderous detonation (no delayed chirps)
  const playMineSound = useCallback(() => {
    const context = getAudioContext();
    if (!context) return;
    const now = context.currentTime;

    // Deep sub-bass boom (150Hz -> 25Hz)
    const boomOsc = context.createOscillator();
    const boomGain = context.createGain();
    boomOsc.type = "triangle";
    boomOsc.frequency.setValueAtTime(150, now);
    boomOsc.frequency.exponentialRampToValueAtTime(25, now + 0.55);

    boomGain.gain.setValueAtTime(0.35, now);
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    boomOsc.connect(boomGain);
    boomGain.connect(context.destination);
    boomOsc.start(now);
    boomOsc.stop(now + 0.55);

    // Subdued muffled rumble noise (0.45s)
    const duration = 0.45;
    const bufferSize = Math.floor(context.sampleRate * duration);
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.2);
    }
    const noiseSource = context.createBufferSource();
    noiseSource.buffer = buffer;

    const noiseFilter = context.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.setValueAtTime(360, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(70, now + duration);

    const noiseGain = context.createGain();
    noiseGain.gain.setValueAtTime(0.35, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(context.destination);
    noiseSource.start(now);
  }, [getAudioContext]);

  // Shield block sound (metallic ricochet ping)
  const playBlockedSound = useCallback(() => {
    const context = getAudioContext();
    if (!context) return;
    const now = context.currentTime;
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(750, now);
    osc.frequency.exponentialRampToValueAtTime(460, now + 0.22);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }, [getAudioContext]);

  // Miss sound (soft swoosh splash)
  const playMissSound = useCallback(() => {
    const context = getAudioContext();
    if (!context) return;
    const now = context.currentTime;
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(360, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.16);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }, [getAudioContext]);

  const playGameSound = useCallback(
    (type: string) => {
      if (type === "tick") {
        playTone(880, 0.07, "square", 0.025);
      } else if (type === "timeout") {
        playTone(220, 0.25, "sawtooth", 0.06);
        window.setTimeout(() => playTone(165, 0.25, "sawtooth", 0.05), 150);
      } else if (type === "hit") {
        playActionHitSound();
      } else if (type === "mine") {
        playMineSound();
      } else if (type === "blocked") {
        playBlockedSound();
      } else if (type === "miss") {
        playMissSound();
      }
    },
    [
      playActionHitSound,
      playBlockedSound,
      playMineSound,
      playMissSound,
      playTone,
    ]
  );

  /**
   * Guaranteed single playback per strike across entire application lifecycle:
   * Uses module-level global set + cell coordinates + 500ms throttle.
   */
  const triggerCombatEventSound = useCallback(
    (event: any) => {
      if (!event || event.event_type !== "strike") return;

      const eventIdKey = event.id ? String(event.id) : null;
      const targetTeam = event.target_team_index ?? event.targetTeamIndex;
      const cellIdx = event.cell_index ?? event.cellIndex;
      const cellKey =
        targetTeam !== undefined && cellIdx !== undefined
          ? `cell_${targetTeam}_${cellIdx}`
          : null;

      // If already marked as played, ignore completely
      if (eventIdKey && globalPlayedStrikes.has(eventIdKey)) {
        return;
      }
      if (cellKey && globalPlayedStrikes.has(cellKey)) {
        return;
      }

      // Enforce 500ms global throttle
      const now = Date.now();
      if (now - globalLastSoundTime < 500) {
        return;
      }
      globalLastSoundTime = now;

      // Mark immediately before playing
      if (eventIdKey) globalPlayedStrikes.add(eventIdKey);
      if (cellKey) globalPlayedStrikes.add(cellKey);

      const isMine =
        event.result === "mine" ||
        event.unit_type === "mine" ||
        String(event.unit_type || "").toLowerCase().includes("mine");

      if (isMine) {
        playMineSound();
      } else if (event.result === "hit") {
        playActionHitSound();
      } else if (event.result === "blocked") {
        playBlockedSound();
      } else {
        playMissSound();
      }
    },
    [playActionHitSound, playBlockedSound, playMineSound, playMissSound]
  );

  return {
    playGameSound,
    triggerCombatEventSound,
    playActionHitSound,
    playMineSound,
    playBlockedSound,
    playMissSound,
    playTone,
    playNoise,
  };
}
