"use client";

import { Suspense, useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import {
  AbandonedGameView,
  CombatEventModal,
} from "@/components/battle/CombatShared";
import { RefereeGameScreen } from "@/components/battle/RefereeGameScreen";
import { FullScanModal } from "@/components/battle/modals/FullScanModal";
import { PreGameRadarScreen } from "@/components/battle/referee/PreGameRadarScreen";
import { JudgeLobbyScreen } from "@/components/battle/referee/JudgeLobbyScreen";
import { TeamDeploymentScreen } from "@/components/battle/team/TeamDeploymentScreen";
import {
  BattleAlert,
  BattleAuthCheckingView,
  BattleLoginRequiredView,
  BattleDbLoadingView,
  BattleDbErrorView,
  BattleRoomSetupView,
  BattleUnauthorizedJudgeView,
  BattleGatewayRoleSelectView,
  BattleSandboxFallbackView,
} from "@/components/battle/BattleGateways";
import { useBattleRoomSync } from "@/hooks/useBattleRoomSync";
import { useBattleTimer } from "@/hooks/useBattleTimer";
import { useBattleActions } from "@/hooks/useBattleActions";
import { useBattleStore } from "@/stores/useBattleStore";
import { useAuthStore } from "@/stores/useAuthStore";

function BattlePageInner() {
  const [mounted, setMounted] = useState(false);

  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.authLoading);

  const {
    roomId,
    teamIndex,
    role,
    teamToken,
    room,
    teams,
    categoryInfoMap,
    combatEvents,
    dbLoading,
    dbError,
    isAutoFilling,
    latestCombatEvent,
    lastPlacedCell,
    selectedUnit,
    alertMsg,
    preGameRadarManualActive,
    preGameRadarDismissed,
    fullScanData,
    setLatestCombatEvent,
    setSelectedUnit,
    setPreGameRadarManualActive,
    setPreGameRadarDismissed,
    setFullScanData,
  } = useBattleStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync data & realtime channels
  const { loadDatabaseData, showAlert } = useBattleRoomSync();

  // Timer controls & audio triggers
  const { handlePauseTimer, handleResumeTimer, handleResetTimer } =
    useBattleTimer();

  // Battle and deployment actions (includes smart auto-fill)
  const {
    handleCellClick,
    handleAutoFill,
    handleSetTeamReady,
    handleSelectQuestion,
    handleResolveQuestion,
    handleResolveDraw,
    handleGrantExtraStrike,
    handleGrantPoints,
    handleSetCurrentTurn,
    handleEndGameNow,
    handleDeselectQuestion,
    handleStrike,
    handleCancelStrike,
    handleUseTool,
    handleExecutePreGameRadar,
    handleExitGame,
    getTeamUrl,
  } = useBattleActions({ loadDatabaseData, showAlert });

  const getCurrentBattlePath = () => {
    if (typeof window === "undefined") return "/battle";
    return `${window.location.pathname}${window.location.search}`;
  };

  // 1. Authentication gateway view
  if (!mounted || authLoading) {
    return <BattleAuthCheckingView />;
  }

  // 2. Authentication check for room entrance
  if (roomId && !user && !(teamIndex && teamToken)) {
    return <BattleLoginRequiredView returnPath={getCurrentBattlePath()} />;
  }

  // 3. Database loading view
  if (roomId && dbLoading) {
    return <BattleDbLoadingView />;
  }

  // 4. Database error view
  if (roomId && dbError) {
    return <BattleDbErrorView error={dbError} />;
  }

  // 5. Room setup initialization view
  if (roomId && !room) {
    return <BattleRoomSetupView />;
  }

  // 6. Judge authorization verification
  if (roomId && room && role === "judge" && room.judge_id !== user?.id) {
    return <BattleUnauthorizedJudgeView />;
  }

  // 7. Abandoned room view
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

  const pregameScansCount = (combatEvents || []).filter(
    (e) => e.event_type === "radar_scan" && e.metadata?.pregame,
  ).length;
  const hasGameStarted =
    (combatEvents || []).some((e) => e.event_type === "strike") ||
    Boolean(room?.active_question_id) ||
    Boolean(room?.winner_team_index) ||
    room?.status === "finished";

  const shouldShowPreGameRadar =
    role === "judge" &&
    !preGameRadarDismissed &&
    !hasGameStarted &&
    (preGameRadarManualActive ||
      (room?.status === "playing" && pregameScansCount < 2));

  // 8. Pre-game radar exploration view
  if (roomId && room && shouldShowPreGameRadar) {
    if (room.judge_id !== user?.id) {
      return <BattleUnauthorizedJudgeView />;
    }

    return (
      <>
        <BattleAlert alert={alertMsg} />
        <PreGameRadarScreen
          room={room}
          teams={teams}
          onExecuteRadar={handleExecutePreGameRadar}
          onComplete={() => {
            setPreGameRadarDismissed(true);
            setPreGameRadarManualActive(false);
          }}
          onExit={handleExitGame}
        />
      </>
    );
  }

  // 9. Active battle referee game screen
  if (
    roomId &&
    room &&
    ["playing", "finished"].includes(room.status) &&
    role === "judge"
  ) {
    if (room.judge_id !== user?.id) {
      return <BattleUnauthorizedJudgeView />;
    }

    return (
      <>
        <BattleAlert alert={alertMsg} />
        <RefereeGameScreen
          onSelectQuestion={handleSelectQuestion}
          onResolveQuestion={handleResolveQuestion}
          onResolveDraw={handleResolveDraw}
          onSetCurrentTurn={handleSetCurrentTurn}
          onStrike={handleStrike}
          onUseTool={handleUseTool}
          onGrantExtraStrike={handleGrantExtraStrike}
          onGrantPoints={handleGrantPoints}
          onEndGameNow={handleEndGameNow}
          onDeselectQuestion={handleDeselectQuestion}
          onPauseTimer={handlePauseTimer}
          onResumeTimer={handleResumeTimer}
          onResetTimer={handleResetTimer}
          onCancelStrike={handleCancelStrike}
          onExit={handleExitGame}
        />
        <CombatEventModal
          event={latestCombatEvent}
          onClose={() => setLatestCombatEvent(null)}
        />
        {fullScanData && (
          <FullScanModal
            isOpen={fullScanData.isOpen}
            enemyTeamName={fullScanData.enemyTeamName}
            cells={fullScanData.cells}
            durationSeconds={10}
            onClose={() => setFullScanData(null)}
          />
        )}
      </>
    );
  }

  // 10. Role selection portal
  if (roomId && room && !teamIndex && !role) {
    return (
      <BattleGatewayRoleSelectView
        room={room}
        isJudgeOwner={room.judge_id === user?.id}
        onExitGame={handleExitGame}
      />
    );
  }

  // 11. Pre-battle referee waiting lobby
  if (roomId && room && role === "judge") {
    return (
      <>
        <BattleAlert alert={alertMsg} />
        <JudgeLobbyScreen
          room={room}
          teams={teams}
          categoryInfoMap={categoryInfoMap}
          getTeamUrl={getTeamUrl}
          onExitGame={handleExitGame}
          onStartPreGameRadar={() => setPreGameRadarManualActive(true)}
          onShowAlert={showAlert}
        />
      </>
    );
  }

  // 12. Team participant board deployment view
  if (roomId && room && teamIndex) {
    const activeTeam = teams.find((t) => t.team_index === teamIndex);

    if (!activeTeam) {
      return <BattleRoomSetupView />;
    }

    const isJudgeDevice = Boolean(
      user?.id && room.judge_id && user.id === room.judge_id,
    );

    return (
      <>
        <BattleAlert alert={alertMsg} />
        <TeamDeploymentScreen
          room={room}
          activeTeam={activeTeam}
          isJudgeDevice={isJudgeDevice}
          isAutoFilling={isAutoFilling}
          selectedUnit={selectedUnit}
          lastPlacedCell={lastPlacedCell}
          onSelectUnit={(unit) => setSelectedUnit(unit as any)}
          onCellClick={handleCellClick}
          onAutoFill={handleAutoFill}
          onSetTeamReady={handleSetTeamReady}
        />
      </>
    );
  }

  // 13. Default offline sandbox fallback
  return <BattleSandboxFallbackView />;
}

// Fallback loading indicator for Suspense
function BattlePageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center dir-rtl">
      <div className="text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-600 mx-auto" />
        <p className="text-xs font-bold text-slate-700 mt-4">
          قاعدين نشيك على تفاصيل المعركة...
        </p>
      </div>
    </div>
  );
}

// Battle page root component wrapped in Suspense
export default function BattlePage() {
  return (
    <Suspense fallback={<BattlePageLoading />}>
      <BattlePageInner />
    </Suspense>
  );
}
