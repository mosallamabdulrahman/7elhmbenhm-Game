"use client";

import { Suspense, useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { AbandonedGameView } from "@/components/battle/CombatShared";
import { RefereeGameScreen } from "@/components/battle/RefereeGameScreen";
import {
  BattleAlert,
  BattleAuthCheckingView,
  BattleLoginRequiredView,
  BattleDbLoadingView,
  BattleDbErrorView,
  BattleRoomSetupView,
  BattleUnauthorizedJudgeView,
  BattleSandboxFallbackView,
} from "@/components/battle/BattleGateways";
import { useBattleRoomSync } from "@/hooks/useBattleRoomSync";
import { useBattleTimer } from "@/hooks/useBattleTimer";
import { useBattleActions } from "@/hooks/useBattleActions";
import { useBattleStore } from "@/stores/useBattleStore";
import { useAuthStore } from "@/stores/useAuthStore";

function BattlePageInner() {
  const [mounted, setMounted] = useState(false);

  // Auth Store - Atomic selectors
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.authLoading);

  // Battle Store - Atomic selectors
  const roomId = useBattleStore((s) => s.roomId);
  const role = useBattleStore((s) => s.role);
  const room = useBattleStore((s) => s.room);
  const teams = useBattleStore((s) => s.teams);
  const dbLoading = useBattleStore((s) => s.dbLoading);
  const dbError = useBattleStore((s) => s.dbError);
  const alertMsg = useBattleStore((s) => s.alertMsg);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync data & realtime channels
  const { loadDatabaseData, showAlert } = useBattleRoomSync();

  // Timer controls & audio triggers
  const { handlePauseTimer, handleResumeTimer, handleResetTimer } =
    useBattleTimer();

  // Battle actions
  const {
    handleSelectQuestion,
    handleResolveQuestion,
    handleResolveDraw,
    handleSetCurrentTurn,
    handleUseTool,
    handleGrantExtraStrike,
    handleGrantPoints,
    handleEndGameNow,
    handleDeselectQuestion,
    handleExitGame,
  } = useBattleActions({
    loadDatabaseData,
    showAlert,
  });

  if (!mounted) return null;

  // 1. Standalone sandbox view when no room ID is present
  if (!roomId) {
    return <BattleSandboxFallbackView />;
  }

  // 2. Auth loading state
  if (authLoading) {
    return <BattleAuthCheckingView />;
  }

  // 3. Unauthenticated guest view
  if (!user) {
    return (
      <BattleLoginRequiredView
        returnPath={`/battle?room_id=${roomId}&role=judge`}
      />
    );
  }

  // 4. Initial database query in-flight
  if (roomId && dbLoading && !room) {
    return <BattleDbLoadingView />;
  }

  // 5. Database error view
  if (roomId && dbError) {
    return <BattleDbErrorView error={dbError} />;
  }

  // 6. Room setup initialization view
  if (roomId && !room) {
    return <BattleRoomSetupView />;
  }

  // 7. Judge authorization verification
  if (roomId && room && role === "judge" && room.judge_id !== user?.id) {
    return <BattleUnauthorizedJudgeView />;
  }

  // 8. Abandoned room view
  if (roomId && room?.status === "abandoned") {
    return (
      <AbandonedGameView
        room={room}
        onReturnHome={() => {
          window.localStorage.removeItem("sovereignty_active_room");
          window.localStorage.removeItem("sovereignty_active_battle_path");
          window.location.assign("/");
        }}
      />
    );
  }

  // 9. Active referee game screen (Direct instant access for judge)
  if (roomId && room) {
    return (
      <>
        <BattleAlert alert={alertMsg} />
        <RefereeGameScreen
          onSelectQuestion={handleSelectQuestion}
          onResolveQuestion={handleResolveQuestion}
          onResolveDraw={handleResolveDraw}
          onSetCurrentTurn={handleSetCurrentTurn}
          onUseTool={handleUseTool}
          onGrantExtraStrike={handleGrantExtraStrike}
          onGrantPoints={handleGrantPoints}
          onEndGameNow={handleEndGameNow}
          onDeselectQuestion={handleDeselectQuestion}
          onPauseTimer={handlePauseTimer}
          onResumeTimer={handleResumeTimer}
          onResetTimer={handleResetTimer}
          onExit={handleExitGame}
        />
      </>
    );
  }

  return null;
}

export default function BattlePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      }
    >
      <BattlePageInner />
    </Suspense>
  );
}
