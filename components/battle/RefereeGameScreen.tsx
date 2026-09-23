"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FinishedCelebration, ImageModal, QuestionGrid } from "./CombatShared";
import { RadarScanModal } from "./modals/RadarScanModal";
import { StrikeBoardModal } from "./modals/StrikeBoardModal";
import { ConfirmActionModal } from "./modals/ConfirmActionModal";
import { GameSupportModal } from "./modals/GameSupportModal";
import { TeamToolsCard } from "./referee/TeamControls";
import { GameBottomFooter } from "./referee/GameBottomFooter";
import { RefereeHeader } from "./referee/RefereeHeader";
import { ActiveQuestionView } from "./referee/ActiveQuestionView";
import { useBattleStore } from "@/stores/useBattleStore";

interface RefereeGameScreenProps {
  room?: any;
  teams?: any[];
  questions?: any[];
  events?: any[];
  answerText?: string | null;
  answerImageUrl?: string | null;
  isBusy?: boolean;
  questionSeconds?: number;
  timerPaused?: boolean;
  radarRevealsByTeam?: Record<number, any[]>;
  onSelectQuestion: (q: any) => void;
  onResolveQuestion: (questionId: string, winnerIndex: number | null) => void;
  onResolveDraw: (questionId: string) => void;
  onSetCurrentTurn: (teamIndex: number) => void;
  onStrike: (teamIndex: number, cellIndex: number) => void;
  onUseTool: (teamIndex: number, toolKey: string, cellIndex?: number) => void;
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
  radarRevealsByTeam: propRadarRevealsByTeam,
  onSelectQuestion,
  onResolveQuestion,
  onResolveDraw,
  onSetCurrentTurn,
  onStrike,
  onUseTool,
  onGrantPoints,
  onGrantExtraStrike,
  onEndGameNow,
  onDeselectQuestion,
  onPauseTimer,
  onResumeTimer,
  onResetTimer,
  onCancelStrike,
  onExit,
}: RefereeGameScreenProps) {
  const storeRoom = useBattleStore((s) => s.room);
  const storeTeams = useBattleStore((s) => s.teams);
  const storeQuestions = useBattleStore((s) => s.questions);
  const storeEvents = useBattleStore((s) => s.combatEvents);
  const storeAnswerText = useBattleStore((s) => s.activeAnswer.text);
  const storeAnswerImageUrl = useBattleStore((s) => s.activeAnswer.imageUrl);
  const storeIsBusy = useBattleStore((s) => s.isActionBusy);
  const storeRadarReveals = useBattleStore((s) => s.radarRevealsByTeam);

  const room = propRoom ?? storeRoom;
  const teams = propTeams ?? storeTeams;
  const questions = propQuestions ?? storeQuestions;
  const events = propEvents ?? storeEvents;
  const answerText = propAnswerText !== undefined ? propAnswerText : storeAnswerText;
  const answerImageUrl = propAnswerImageUrl !== undefined ? propAnswerImageUrl : storeAnswerImageUrl;
  const isBusy = propIsBusy !== undefined ? propIsBusy : storeIsBusy;
  const radarRevealsByTeam = propRadarRevealsByTeam ?? storeRadarReveals;

  const showAnswer = useBattleStore((s) => s.showAnswer);
  const setShowAnswer = useBattleStore((s) => s.setShowAnswer);
  const teamSelectOpen = useBattleStore((s) => s.teamSelectOpen);
  const setTeamSelectOpen = useBattleStore((s) => s.setTeamSelectOpen);
  const forceGridView = useBattleStore((s) => s.forceGridView);
  const setForceGridView = useBattleStore((s) => s.setForceGridView);
  const supportModalOpen = useBattleStore((s) => s.supportModalOpen);
  const setSupportModalOpen = useBattleStore((s) => s.setSupportModalOpen);

  const [lastQuestionId, setLastQuestionId] = useState(room?.active_question_id);
  const [mediaRevealed, setMediaRevealed] = useState(false);
  const [radarModalTeam, setRadarModalTeam] = useState<number | null>(null);
  const [strikeModalTeam, setStrikeModalTeam] = useState<number | null>(null);
  const [locallyPendingStrikes, setLocallyPendingStrikes] = useState(
    new Set<number>(),
  );
  const [confirmAction, setConfirmAction] = useState<"end" | "exit" | null>(
    null,
  );
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  if (!room) return null;

  const activeQuestion = questions.find(
    (question) => question.id === room.active_question_id,
  );
  const team1 = teams.find((t) => t.team_index === 1);
  const team2 = teams.find((t) => t.team_index === 2);
  const currentTeam = teams.find((t) => t.team_index === room.current_turn);

  if (room.active_question_id !== lastQuestionId) {
    setLastQuestionId(room.active_question_id);
    setShowAnswer(false);
    setTeamSelectOpen(false);
    setForceGridView(false);
    setMediaRevealed(false);
  }

  const teamsWithStrikes =
    room.status === "playing"
      ? teams.filter((t) => t.available_strikes > 0)
      : [];
  const strikeModalTeamStillPending = teamsWithStrikes.some(
    (t) => t.team_index === strikeModalTeam,
  );
  if (teamsWithStrikes.length > 0 && !strikeModalTeamStillPending) {
    if (strikeModalTeam !== teamsWithStrikes[0].team_index) {
      setLocallyPendingStrikes(new Set());
      setStrikeModalTeam(teamsWithStrikes[0].team_index);
    }
  } else if (teamsWithStrikes.length === 0 && strikeModalTeam !== null) {
    setLocallyPendingStrikes(new Set());
    setStrikeModalTeam(null);
  }

  const step = teamSelectOpen
    ? "select-winner"
    : showAnswer
      ? "answer"
      : activeQuestion && !forceGridView
        ? "question"
        : "grid";

  const radarAttacker = radarModalTeam
    ? teams.find((t) => t.team_index === radarModalTeam)
    : null;
  const radarTarget = radarModalTeam
    ? teams.find((t) => t.team_index !== radarModalTeam)
    : null;
  const radarRevealMap = radarTarget
    ? new Map<number, string | null>(
        (radarRevealsByTeam?.[radarTarget.team_index] || []).map(
          (cell: any) => [cell.cell_index, cell.unit_type],
        ),
      )
    : new Map<number, string | null>();
  const radarHasResult = radarRevealMap.size > 0;

  const handleCloseRadar = () => {
    setRadarModalTeam(null);
  };

  const handlePickWinner = (choice: any) => {
    if (!activeQuestion) return;
    if (choice === "draw") return onResolveDraw(activeQuestion.id);
    if (choice === "none") return onResolveQuestion(activeQuestion.id, null);
    return onResolveQuestion(activeQuestion.id, choice);
  };

  const strikeAttacker = teams.find((t) => t.team_index === strikeModalTeam);
  const strikeTarget = teams.find((t) => t.team_index !== strikeModalTeam);
  const strikeEvents = strikeTarget
    ? events.filter(
        (event) =>
          event.event_type === "strike" &&
          Number(event.target_team_index) === Number(strikeTarget.team_index),
      )
    : [];
  const strikeCellResults = new Map<number, string>();
  const strikeCellUnits = new Map<number, string>();
  strikeEvents.forEach((event) => {
    const cellIdx = Number(event.cell_index);
    const existing = strikeCellResults.get(cellIdx);
    if (!existing || existing === "pending" || event.result !== "pending") {
      strikeCellResults.set(cellIdx, event.result);
      strikeCellUnits.set(cellIdx, event.unit_type);
    }
  });

  const strikeRadarRevealMap = strikeTarget
    ? new Map<number, string | null>(
        (radarRevealsByTeam?.[strikeTarget.team_index] || []).map(
          (cell: any) => [Number(cell.cell_index), cell.unit_type],
        ),
      )
    : new Map<number, string | null>();

  return (
    <div className="min-h-[100dvh] flex flex-col justify-between overflow-x-auto overflow-y-auto dir-rtl">
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

      <main className="w-full max-w-[98rem] mx-auto px-1.5 xs:px-2 sm:px-4 md:px-6 my-auto py-2 sm:py-4 flex-1 flex flex-col justify-center min-h-0">
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
            >
              <QuestionGrid
                questions={questions}
                activeQuestionId={room.active_question_id}
                disabled={
                  room.status !== "playing" ||
                  teams.some((team) => team.available_strikes > 0)
                }
                onSelect={onSelectQuestion}
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex flex-col-reverse md:grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 lg:gap-12 mt-6">
            {team1 && team2 && (
              <div className="md:col-span-1 w-full grid grid-cols-2 md:grid-cols-1 gap-4">
                <TeamToolsCard
                  team={team1}
                  isBusy={isBusy}
                  onOpenRadar={(tIdx: number) => setRadarModalTeam(tIdx)}
                  onOpenStrike={(tIdx: number) => setStrikeModalTeam(tIdx)}
                  onUseTool={onUseTool}
                />
                <TeamToolsCard
                  team={team2}
                  isBusy={isBusy}
                  onOpenRadar={(tIdx: number) => setRadarModalTeam(tIdx)}
                  onOpenStrike={(tIdx: number) => setStrikeModalTeam(tIdx)}
                  onUseTool={onUseTool}
                />
              </div>
            )}

            <div className="md:col-span-3 w-full">
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
      <AnimatePresence>
        {room.status === "playing" && step === "grid" && team1 && team2 && (
          <motion.div
            key="footer"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25 }}
          >
            <GameBottomFooter
              team1={team1}
              team2={team2}
              isBusy={isBusy}
              onOpenRadar={(tIdx: number) => setRadarModalTeam(tIdx)}
              onOpenStrike={(tIdx: number) => setStrikeModalTeam(tIdx)}
              onUseTool={onUseTool}
              onGrantPoints={onGrantPoints}
              onGrantExtraStrike={onGrantExtraStrike}
              onOpenSupport={() => setSupportModalOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <RadarScanModal
        radarModalTeam={radarModalTeam}
        radarAttacker={radarAttacker}
        radarRevealMap={radarRevealMap}
        radarHasResult={radarHasResult}
        isBusy={isBusy}
        onClose={handleCloseRadar}
        onUseTool={onUseTool}
      />

      <StrikeBoardModal
        strikeModalTeam={strikeModalTeam}
        strikeAttacker={strikeAttacker}
        strikeTarget={strikeTarget}
        strikeCellResults={strikeCellResults}
        strikeCellUnits={strikeCellUnits}
        strikeRadarRevealMap={strikeRadarRevealMap}
        locallyPendingStrikes={locallyPendingStrikes}
        isBusy={isBusy}
        onClose={() => {
          setLocallyPendingStrikes(new Set());
          setStrikeModalTeam(null);
        }}
        onStrike={onStrike}
        onCancelStrike={onCancelStrike}
        setLocallyPendingStrikes={setLocallyPendingStrikes}
      />

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
