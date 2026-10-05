"use client";

import { useEffect, useRef, useCallback } from "react";
import { useBattleAudio } from "@/hooks/useBattleAudio";
import { useBattleStore } from "@/stores/useBattleStore";

// Manages question countdown timer, pause/resume/reset controls, and sound triggers
export function useBattleTimer() {
  const {
    room,
    questions,
    timerPaused,
    timerOverrideStart,
    latestCombatEvent,
    setQuestionSeconds,
    setTimerPaused,
    setTimerOverrideStart,
  } = useBattleStore();

  const lastActiveQuestionIdRef = useRef<string | null>(null);
  const questionStartedAtRef = useRef<number | null>(null);

  const { playGameSound, triggerCombatEventSound } = useBattleAudio();

  // Reset or adjust question timer when active question changes
  useEffect(() => {
    const currentQuestionId = room?.active_question_id || null;
    const previousQuestionId = lastActiveQuestionIdRef.current;
    const qSeconds = 30;

    if (currentQuestionId && currentQuestionId !== previousQuestionId) {
      setQuestionSeconds(qSeconds);
      setTimerPaused(false);
      setTimerOverrideStart(null);
    }

    if (previousQuestionId && !currentQuestionId) {
      setQuestionSeconds(30);
      setTimerPaused(false);
      setTimerOverrideStart(null);
      questionStartedAtRef.current = null;
    }

    lastActiveQuestionIdRef.current = currentQuestionId;
  }, [questions, room?.active_question_id, setQuestionSeconds, setTimerPaused, setTimerOverrideStart]);

  // Synchronized countdown timer based on server question_started_at
  useEffect(() => {
    if (
      !room?.active_question_id ||
      !room?.question_started_at ||
      room.status !== "playing" ||
      timerPaused
    ) {
      return undefined;
    }

    const totalSeconds = 30;
    const startedAt = timerOverrideStart ?? new Date(room.question_started_at).getTime();
    let lastPlayedSecond: number | null = null;

    const tick = () => {
      const elapsed = Math.max(0, (Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, Math.ceil(totalSeconds - elapsed));

      setQuestionSeconds(remaining);

      if (remaining === 0 && lastPlayedSecond !== 0) {
        playGameSound("timeout");
      } else if (remaining > 0 && remaining <= 10 && remaining !== lastPlayedSecond) {
        playGameSound("tick");
      }
      lastPlayedSecond = remaining;
    };

    tick();
    const interval = window.setInterval(tick, 250);
    return () => window.clearInterval(interval);
  }, [
    playGameSound,
    questions,
    room?.active_question_id,
    room?.question_started_at,
    room?.status,
    timerPaused,
    timerOverrideStart,
    setQuestionSeconds,
  ]);

  const getActiveQuestionTimerSeconds = useCallback(() => {
    return 30;
  }, []);

  const handlePauseTimer = useCallback(() => setTimerPaused(true), [setTimerPaused]);

  const handleResumeTimer = useCallback(() => {
    const total = getActiveQuestionTimerSeconds();
    const elapsedAtPause = total - useBattleStore.getState().questionSeconds;
    setTimerOverrideStart(Date.now() - elapsedAtPause * 1000);
    setTimerPaused(false);
  }, [getActiveQuestionTimerSeconds, setTimerOverrideStart, setTimerPaused]);

  const handleResetTimer = useCallback(() => {
    const total = getActiveQuestionTimerSeconds();
    setTimerOverrideStart(Date.now());
    setTimerPaused(false);
    setQuestionSeconds(total);
  }, [getActiveQuestionTimerSeconds, setTimerOverrideStart, setTimerPaused, setQuestionSeconds]);

  // Play audio when combat event triggers
  useEffect(() => {
    triggerCombatEventSound(latestCombatEvent);
  }, [latestCombatEvent, triggerCombatEventSound]);

  return {
    handlePauseTimer,
    handleResumeTimer,
    handleResetTimer,
  };
}
