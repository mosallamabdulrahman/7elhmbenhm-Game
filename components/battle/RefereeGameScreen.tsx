"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FinishedCelebration, ImageModal } from "./CombatShared";
import { SequentialQuestionGrid } from "./referee/SequentialQuestionGrid";
import { ConfirmActionModal } from "./modals/ConfirmActionModal";
import { GameSupportModal } from "./modals/GameSupportModal";
import { RefereeHeader } from "./referee/RefereeHeader";
import { ActiveQuestionView } from "./referee/ActiveQuestionView";
import { TeamToolsCard } from "./referee/TeamControls";
import { useBattleStore } from "@/stores/useBattleStore";
import type { GameRoom, Team, Question, CombatEvent } from "@/types/game";

interface RefereeGameScreenProps {
  room?: GameRoom | null;
  teams?: Team[];
  questions?: Question[];
  events?: CombatEvent[];
  answerText?: string | null;
  answerImageUrl?: string | null;
  isBusy?: boolean;
  questionSeconds?: number;
  timerPaused?: boolean;
  onSelectQuestion: (q: Question) => void;
  onResolveQuestion: (questionId: string, winnerIndex: number | null) => void;
  onResolveDraw: (questionId: string) => void;
  onSetCurrentTurn: (teamIndex: number) => void;
  onStrike?: (teamIndex: number, cellIndex: number) => void;
  onUseTool?: (teamIndex: number, toolKey: string, cellIndex?: number) => void;
  onGrantPoints: (teamIndex: number, pointsDelta: number) => void;
  onGrantExtraStrike: (teamIndex: number) => void;
  onEndGameNow: () => void;
  onDeselectQuestion: (questionId: string) => void;
  onPauseTimer: () => void;
  onResumeTimer: () => void;
  onResetTimer: () => void;
  onCancelStrike?: (teamIndex: number) => Promise<void> | void;
  onExit: () => void;
}

export function RefereeGameScreen({
  room: propRoom,
  teams: propTeams,
  questions: propQuestions,
  events: propEvents,
  answerText: propAnswerText,
  answerImageUrl: propAnswerImageUrl,
  isBusy: propIsBusy,
  onSelectQuestion,
  onResolveQuestion,
  onResolveDraw,
  onSetCurrentTurn,
  onUseTool = () => {},
  onGrantPoints,
  onGrantExtraStrike,
  onEndGameNow,
  onDeselectQuestion,
  onPauseTimer,
  onResumeTimer,
  onResetTimer,
  onExit,
}: RefereeGameScreenProps) {
  const storeRoom = useBattleStore((s) => s.room);
  const storeTeams = useBattleStore((s) => s.teams);
  const storeQuestions = useBattleStore((s) => s.questions);
  const storeEvents = useBattleStore((s) => s.combatEvents);
  const storeAnswerText = useBattleStore((s) => s.activeAnswer.text);
  const storeAnswerImageUrl = useBattleStore((s) => s.activeAnswer.imageUrl);
  const storeIsBusy = useBattleStore((s) => s.isActionBusy);

  const room = propRoom ?? storeRoom;
  const teams = propTeams ?? storeTeams;
  const questions = propQuestions ?? storeQuestions;
  const events = propEvents ?? storeEvents;
  const answerText =
    propAnswerText !== undefined ? propAnswerText : storeAnswerText;
  const answerImageUrl =
    propAnswerImageUrl !== undefined ? propAnswerImageUrl : storeAnswerImageUrl;
  const isBusy = propIsBusy !== undefined ? propIsBusy : storeIsBusy;

  const showAnswer = useBattleStore((s) => s.showAnswer);
  const setShowAnswer = useBattleStore((s) => s.setShowAnswer);
  const teamSelectOpen = useBattleStore((s) => s.teamSelectOpen);
  const setTeamSelectOpen = useBattleStore((s) => s.setTeamSelectOpen);
  const forceGridView = useBattleStore((s) => s.forceGridView);
  const setForceGridView = useBattleStore((s) => s.setForceGridView);
  const supportModalOpen = useBattleStore((s) => s.supportModalOpen);
  const setSupportModalOpen = useBattleStore((s) => s.setSupportModalOpen);

  const [lastQuestionId, setLastQuestionId] = useState(
    room?.active_question_id,
  );
  const [mediaRevealed, setMediaRevealed] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"end" | "exit" | null>(
    null,
  );
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  // Sync question change states
  useEffect(() => {
    if (room?.active_question_id !== lastQuestionId) {
      setLastQuestionId(room?.active_question_id);
      setShowAnswer(false);
      setTeamSelectOpen(false);
      setForceGridView(false);
      setMediaRevealed(false);
    }
  }, [
    room?.active_question_id,
    lastQuestionId,
    setShowAnswer,
    setTeamSelectOpen,
    setForceGridView,
  ]);

  // Load team colors from local storage if saved
  const teamColors = useMemo<{ [teamIndex: number]: string }>(() => {
    if (typeof window !== "undefined" && room?.id) {
      try {
        const saved = window.localStorage.getItem(
          `sovereignty_room_colors_${room.id}`,
        );
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            1: parsed.team1 || "#2563EB",
            2: parsed.team2 || "#F59E0B",
          };
        }
      } catch {
        // ignore
      }
    }
    return {
      1: "#2563EB",
      2: "#F59E0B",
    };
  }, [room?.id]);

  // Early return strictly AFTER all hooks (React Rules of Hooks)
  if (!room) return null;

  const activeQuestion = questions.find(
    (question) => question.id === room.active_question_id,
  );
  const team1 = teams.find((t) => t.team_index === 1);
  const team2 = teams.find((t) => t.team_index === 2);
  const currentTeam = teams.find((t) => t.team_index === room.current_turn);

  const step = teamSelectOpen
    ? "select-winner"
    : showAnswer
      ? "answer"
      : activeQuestion && !forceGridView
        ? "question"
        : "grid";

  const handlePickWinner = (choice: number | "draw" | "none") => {
    if (!activeQuestion) return;
    if (choice === "draw") return onResolveDraw(activeQuestion.id);
    if (choice === "none") return onResolveQuestion(activeQuestion.id, null);
    return onResolveQuestion(activeQuestion.id, choice);
  };

  return (
    <div
      className={`min-h-[100dvh] flex flex-col dir-rtl ${
        step === "grid"
          ? "h-[100dvh] max-h-[100dvh] overflow-hidden p-0 m-0"
          : "justify-between overflow-x-auto overflow-y-auto"
      }`}
    >
      <RefereeHeader
        room={room}
        currentTeam={currentTeam}
        step={step}
        isBusy={isBusy}
        onOpenSupport={() => setSupportModalOpen(true)}
        onConfirmEnd={() => setConfirmAction("end")}
        onConfirmExit={() => setConfirmAction("exit")}
        onReturnToGrid={() => {
          setShowAnswer(false);
          setTeamSelectOpen(false);
          setForceGridView(true);
          if (activeQuestion) onDeselectQuestion(activeQuestion.id);
        }}
        onSetCurrentTurn={onSetCurrentTurn}
      />

      <main
        className={`w-full flex-1 flex flex-col justify-center items-center min-h-0 ${
          step === "grid" ? "p-0 m-0 overflow-hidden" : "px-1 sm:px-2 md:px-4"
        }`}
      >
        {room.status === "finished" ? (
          <FinishedCelebration room={room} teams={teams} onExit={onExit} />
        ) : step === "grid" ? (
          <AnimatePresence mode="wait">
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="w-full h-full p-0 m-0 flex items-center justify-center overflow-hidden"
            >
              <SequentialQuestionGrid
                questions={questions}
                activeQuestionId={room.active_question_id}
                events={events}
                teams={teams}
                teamColors={teamColors}
                disabled={room.status !== "playing"}
                selectedCategories={room.selected_categories}
                onSelect={onSelectQuestion}
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="w-full max-w-[98rem] mx-auto my-auto flex flex-col-reverse md:grid md:grid-cols-4 gap-6 items-start mt-2">
            {/* Right Sidebar: Team Cards with Name, Score, and Helper Tools */}
            {team1 && team2 && (
              <aside className="w-full md:col-span-1 grid grid-cols-2 md:grid-cols-1 gap-4 sticky top-4">
                <TeamToolsCard
                  team={team1}
                  teamColor={teamColors[1]}
                  isCurrentTurn={room.current_turn === 1}
                />
                <TeamToolsCard
                  team={team2}
                  teamColor={teamColors[2]}
                  isCurrentTurn={room.current_turn === 2}
                />
              </aside>
            )}

            {/* Main Question View */}
            <div className="w-full md:col-span-3">
              <ActiveQuestionView
                step={step}
                activeQuestion={activeQuestion}
                teams={teams}
                answerText={answerText}
                answerImageUrl={answerImageUrl}
                isBusy={isBusy}
                mediaRevealed={mediaRevealed}
                onPauseTimer={onPauseTimer}
                onResumeTimer={onResumeTimer}
                onResetTimer={onResetTimer}
                onMediaReveal={() => setMediaRevealed(true)}
                onShowAnswer={() => setShowAnswer(true)}
                onBackToQuestion={() => setShowAnswer(false)}
                onOpenTeamSelect={() => setTeamSelectOpen(true)}
                onBackToAnswer={() => setTeamSelectOpen(false)}
                onPickWinner={handlePickWinner}
                onExpandImage={(url: string) => setExpandedImage(url)}
              />
            </div>
          </div>
        )}
      </main>

      {confirmAction === "end" && (
        <ConfirmActionModal
          title="إنهاء اللعبة"
          message="هل تريد إنهاء اللعبة؟"
          confirmLabel="إنهاء اللعبة"
          onCancel={() => setConfirmAction(null)}
          onConfirm={() => {
            setConfirmAction(null);
            onEndGameNow();
          }}
        />
      )}

      {confirmAction === "exit" && (
        <ConfirmActionModal
          title="خروج"
          message="هل تريد الخروج من اللعبة ؟"
          confirmLabel="خروج"
          onCancel={() => setConfirmAction(null)}
          onConfirm={() => {
            setConfirmAction(null);
            onExit();
          }}
        />
      )}

      {/* Lightbox Pop-up for Question and Answer Images */}
      <ImageModal
        imageUrl={expandedImage}
        onClose={() => setExpandedImage(null)}
      />

      <AnimatePresence>
        {supportModalOpen && (
          <GameSupportModal
            roomId={room.id}
            onClose={() => setSupportModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
