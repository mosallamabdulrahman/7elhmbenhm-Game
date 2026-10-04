"use client";

import { useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  STARTING_POINTS,
  TEAM_PUBLIC_COLUMNS,
  UNIT_LIMITS,
  UNIT_SPECS,
} from "@/components/battle/battle-constants";
import { useBattleStore } from "@/stores/useBattleStore";
import type { CombatEvent } from "@/types/game";

interface UseBattleActionsOptions {
  loadDatabaseData: () => Promise<void>;
  showAlert: (message: string, type?: "error" | "success" | "info" | "warning") => void;
}

// Manages all interactive battle actions for referee and team players
export function useBattleActions({ loadDatabaseData, showAlert }: UseBattleActionsOptions) {
  const {
    roomId,
    teamIndex,
    role,
    teamToken,
    teamLinkTokens,
    room,
    teams,
    selectedUnit,
    isAutoFilling,
    setTeams,
    setCombatEvents,
    setIsActionBusy,
    setIsAutoFilling,
    setLatestCombatEvent,
    setRadarRevealsByTeam,
    setLastPlacedCell,
    setActiveAnswer,
    setFullScanData,
  } = useBattleStore();

  const deploymentTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingBoardRef = useRef<{ board: (string | null)[]; points: number } | null>(null);

  // Generic async action runner with busy state and error notification
  const runAction = useCallback(
    async (action: () => Promise<void>) => {
      setIsActionBusy(true);
      try {
        await action();
      } catch (error: any) {
        showAlert(error?.message || "ما قدرنا نسوي هالعملية.", "error");
      } finally {
        setIsActionBusy(false);
      }
    },
    [setIsActionBusy, showAlert],
  );

  const finalizeRoomIfComplete = useCallback(async () => {
    const { error } = await supabase.rpc("finalize_room_if_complete", { p_room_id: roomId });
    if (error) {
      const message = error.message || "";
      const canIgnore =
        message.includes("Could not find the function") ||
        message.includes("permission denied for function finalize_room_if_complete") ||
        error.code === "42501";
      if (!canIgnore) throw error;
    }
  }, [roomId]);

  // Deploy or remove unit on grid cell click
  const handleCellClick = useCallback(
    (cellIndex: number) => {
      if (!room || teams.length < 2 || !teamIndex) return;

      const activeTeam = teams.find((t) => t.team_index === teamIndex);
      if (!activeTeam) return;

      if (activeTeam.is_ready) {
        showAlert("قفلنا توزيعك وخشينا جنودك، انطر الفريق الثاني يخلص.", "warning");
        return;
      }

      const pendingState = pendingBoardRef.current;
      const rawBoard = pendingState ? pendingState.board : activeTeam.board || [];
      const currentBoard = Array.from({ length: 36 }, (_, i) => rawBoard[i] ?? null);
      const currentSpent = currentBoard.reduce(
        (sum, unit) => sum + (unit ? UNIT_SPECS[unit]?.cost || 0 : 0),
        0,
      );
      let currentPoints = STARTING_POINTS - currentSpent;

      if (currentBoard[cellIndex]) {
        const refundCost = UNIT_SPECS[currentBoard[cellIndex]!]?.cost || 0;
        currentPoints += refundCost;
        currentBoard[cellIndex] = null;
        setLastPlacedCell(null);
      } else {
        const cost = UNIT_SPECS[selectedUnit].cost;
        if (currentPoints < cost) {
          showAlert("ما عندك نقاط كافية عشان تضيف هالجنود.", "error");
          return;
        }

        const currentUnitCount = currentBoard.filter((cell) => cell === selectedUnit).length;
        const maxAllowed = UNIT_LIMITS[selectedUnit];
        if (currentUnitCount >= maxAllowed) {
          showAlert(
            `الحد الأقصى حق "${UNIT_SPECS[selectedUnit].name}" هو ${maxAllowed} بالخريطة.`,
            "error",
          );
          return;
        }

        currentPoints -= cost;
        currentBoard[cellIndex] = selectedUnit;
        setLastPlacedCell(cellIndex);
      }

      setTeams((prev) =>
        prev.map((t) =>
          t.team_index === teamIndex ? { ...t, board: currentBoard, points: currentPoints } : t,
        ),
      );

      const snapshot = { board: currentBoard, points: currentPoints };
      pendingBoardRef.current = snapshot;
      if (deploymentTimerRef.current) clearTimeout(deploymentTimerRef.current);
      deploymentTimerRef.current = setTimeout(async () => {
        const pending = pendingBoardRef.current;
        if (!pending) return;
        const { error } = await supabase.rpc("update_team_deployment", {
          p_room_id: roomId,
          p_team_index: teamIndex,
          p_board: pending.board,
          p_token: teamToken,
        });
        if (pendingBoardRef.current === pending) {
          if (error) {
            showAlert(error.message, "error");
            Promise.all([
              supabase.from("teams").select(TEAM_PUBLIC_COLUMNS as any).eq("room_id", roomId),
              supabase.rpc("get_team_board", {
                p_room_id: roomId,
                p_team_index: teamIndex,
                p_token: teamToken,
              }),
            ]).then(([{ data: teamRows }, { data: board }]: [any, any]) => {
              if (!teamRows) return;
              setTeams((prev) =>
                teamRows.map((row: any) => {
                  const existing = prev.find((t) => t.id === row.id);
                  return {
                    ...row,
                    board:
                      row.team_index === teamIndex
                        ? (board ?? existing?.board ?? [])
                        : (existing?.board ?? []),
                  };
                }),
              );
            });
          }
          pendingBoardRef.current = null;
        }
      }, 350);
    },
    [room, teams, teamIndex, selectedUnit, roomId, teamToken, setTeams, setLastPlacedCell, showAlert],
  );

  // Smart random auto-fill: preserves placed units and distributes remaining units into empty cells
  const handleAutoFill = useCallback(async () => {
    if (!teamIndex || isAutoFilling) return;
    const activeTeam = teams.find((t) => t.team_index === teamIndex);
    if (!activeTeam || activeTeam.is_ready) return;

    // 1. Snapshot current board
    const currentBoard = Array.from(
      { length: 36 },
      (_, i) => (activeTeam.board && activeTeam.board[i]) ?? null,
    );

    // 2. Identify empty cell indexes
    const emptyIndexes: number[] = [];
    currentBoard.forEach((cell, idx) => {
      if (!cell) emptyIndexes.push(idx);
    });

    // 3. Count already placed units
    const placedCounts: Record<string, number> = {};
    currentBoard.forEach((cell) => {
      if (cell) placedCounts[cell] = (placedCounts[cell] || 0) + 1;
    });

    // 4. Calculate remaining units needed per unit type
    const remainingUnitsToPlace: string[] = [];
    Object.keys(UNIT_LIMITS).forEach((unitKey) => {
      const maxLimit = UNIT_LIMITS[unitKey] || 0;
      const alreadyPlaced = placedCounts[unitKey] || 0;
      const needed = Math.max(0, maxLimit - alreadyPlaced);
      for (let i = 0; i < needed; i++) {
        remainingUnitsToPlace.push(unitKey);
      }
    });

    // 5. Shuffle empty cells only
    for (let i = emptyIndexes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [emptyIndexes[i], emptyIndexes[j]] = [emptyIndexes[j], emptyIndexes[i]];
    }

    // 6. Fill empty cells with remaining units
    remainingUnitsToPlace.forEach((unit, idx) => {
      const targetPos = emptyIndexes[idx];
      if (targetPos !== undefined) {
        currentBoard[targetPos] = unit;
      }
    });

    // 7. Calculate new points balance
    const totalCost = currentBoard.reduce(
      (sum, unit) => sum + (unit ? UNIT_SPECS[unit]?.cost || 0 : 0),
      0,
    );
    const newPoints = Math.max(0, STARTING_POINTS - totalCost);

    // Optimistic UI update
    setTeams((prev) =>
      prev.map((t) =>
        t.team_index === teamIndex ? { ...t, board: currentBoard, points: newPoints } : t,
      ),
    );

    setIsAutoFilling(true);
    const { error } = await supabase.rpc("update_team_deployment", {
      p_room_id: roomId,
      p_team_index: teamIndex,
      p_board: currentBoard,
      p_token: teamToken,
    });
    setIsAutoFilling(false);

    if (error) {
      showAlert(error.message, "error");
    } else {
      pendingBoardRef.current = null;
    }
  }, [teamIndex, isAutoFilling, teams, roomId, teamToken, setTeams, setIsAutoFilling, showAlert]);

  // Lock team board and flag readiness
  const handleSetTeamReady = useCallback(async () => {
    if (!teamIndex) return;
    const activeTeam = teams.find((t) => t.team_index === teamIndex);
    if (!activeTeam) return;

    const currentBoard = pendingBoardRef.current
      ? pendingBoardRef.current.board
      : Array.isArray(activeTeam.board)
        ? activeTeam.board
        : [];
    const placedCount = (currentBoard || []).filter(Boolean).length;

    if (placedCount < 33 || placedCount > 36) {
      showAlert(`لازم توزع كل الجنود على الخريطة (الحين حاط: ${placedCount}/33).`, "error");
      return;
    }

    if (pendingBoardRef.current) {
      if (deploymentTimerRef.current) clearTimeout(deploymentTimerRef.current);
      const snapshot = pendingBoardRef.current;
      pendingBoardRef.current = null;
      const { error: flushError } = await supabase.rpc("update_team_deployment", {
        p_room_id: roomId,
        p_team_index: teamIndex,
        p_board: snapshot.board,
        p_token: teamToken,
      });
      if (flushError) {
        showAlert(flushError.message, "error");
        return;
      }
    }

    setTeams((prev) =>
      prev.map((t) => (t.team_index === teamIndex ? { ...t, board: currentBoard, is_ready: true } : t)),
    );

    const { error } = await supabase.rpc("set_team_ready", {
      p_room_id: roomId,
      p_team_index: teamIndex,
      p_token: teamToken,
    });

    if (error) {
      showAlert(error.message, "error");
      loadDatabaseData();
    }
  }, [teamIndex, teams, roomId, teamToken, setTeams, showAlert, loadDatabaseData]);

  // Referee question selection
  const handleSelectQuestion = useCallback(
    (question: any) =>
      runAction(async () => {
        const notReadyTeam = teams.find((t) => !t.is_ready);
        if (notReadyTeam) {
          throw new Error(`ما تقدر تختار السؤال — ${notReadyTeam.name} للحين ما وزع جنوده.`);
        }
        const { error } = await supabase.rpc("select_room_question", {
          p_room_id: roomId,
          p_question_id: question.id,
          p_team_index: role === "judge" ? null : teamIndex,
        });
        if (error) throw error;
      }),
    [teams, roomId, role, teamIndex, runAction],
  );

  // Referee question resolution
  const handleResolveQuestion = useCallback(
    (questionId: string, winnerTeamIndex: number | null) =>
      runAction(async () => {
        const { error } = await supabase.rpc("resolve_room_question", {
          p_room_id: roomId,
          p_question_id: questionId,
          p_winner_team_index: winnerTeamIndex,
        });
        if (error) throw error;
        await finalizeRoomIfComplete();
        setActiveAnswer({ text: "", imageUrl: "" });
      }),
    [roomId, finalizeRoomIfComplete, setActiveAnswer, runAction],
  );

  // Draw resolution: both teams win strike
  const handleResolveDraw = useCallback(
    (questionId: string) =>
      runAction(async () => {
        const { error } = await supabase.rpc("resolve_room_question", {
          p_room_id: roomId,
          p_question_id: questionId,
          p_winner_team_index: 0,
        });
        if (error) throw error;
        await finalizeRoomIfComplete();
        setActiveAnswer({ text: "", imageUrl: "" });
      }),
    [roomId, finalizeRoomIfComplete, setActiveAnswer, runAction],
  );

  // Manually grant or deduct strikes
  const handleGrantExtraStrike = useCallback(
    (grantTeamIndex: number, count = 1) =>
      runAction(async () => {
        const { error } = await supabase.rpc("grant_extra_strikes", {
          p_room_id: roomId,
          p_team_index: grantTeamIndex,
          p_count: count,
        });
        if (error) throw error;
        const team = teams.find((t) => t.team_index === grantTeamIndex);
        const absCount = Math.abs(count);
        const label = absCount === 1 ? "طقة وحدة" : absCount === 2 ? "طقتين" : `${absCount} طقات`;
        showAlert(
          `✓ ${count >= 0 ? "عطينا" : "خصمنا"} ${label} ${count >= 0 ? "حق" : "من"} ${team?.name || "الفريق"}`,
          "success",
        );
      }),
    [roomId, teams, showAlert, runAction],
  );

  // Manually grant or deduct team points
  const handleGrantPoints = useCallback(
    (grantTeamIndex: number, points: number) =>
      runAction(async () => {
        const { error } = await supabase.rpc("grant_team_points", {
          p_room_id: roomId,
          p_team_index: grantTeamIndex,
          p_points: points,
        });
        if (error) throw error;
        const team = teams.find((t) => t.team_index === grantTeamIndex);
        showAlert(
          `✓ ${points >= 0 ? "عطينا" : "خصمنا"} ${Math.abs(points)} نقطة ${points >= 0 ? "حق" : "من"} ${team?.name || "الفريق"}`,
          "success",
        );
      }),
    [roomId, teams, showAlert, runAction],
  );

  // Change active team turn
  const handleSetCurrentTurn = useCallback(
    (targetTeamIndex: number) =>
      runAction(async () => {
        const { error } = await supabase.rpc("set_current_turn", {
          p_room_id: roomId,
          p_team_index: targetTeamIndex,
        });
        if (error) throw error;
      }),
    [roomId, runAction],
  );

  // End match immediately
  const handleEndGameNow = useCallback(
    () =>
      runAction(async () => {
        const { error } = await supabase.rpc("end_room_now", { p_room_id: roomId });
        if (error) throw error;
      }),
    [roomId, runAction],
  );

  // Deselect active question
  const handleDeselectQuestion = useCallback(
    (questionId: string) =>
      runAction(async () => {
        const { error } = await supabase.rpc("deselect_room_question", {
          p_room_id: roomId,
          p_question_id: questionId,
        });
        if (error) throw error;
      }),
    [roomId, runAction],
  );

  // Strike execution
  const handleStrike = useCallback(
    (attackerTeamIndex: number, cellIndex: number) =>
      runAction(async () => {
        const targetTeam = teams.find((t) => t.team_index !== attackerTeamIndex);
        const targetTeamIndex = targetTeam ? targetTeam.team_index : attackerTeamIndex === 1 ? 2 : 1;

        const tempId = `optimistic-strike-${targetTeamIndex}-${cellIndex}`;
        const optimisticEvent: CombatEvent = {
          id: tempId,
          room_id: roomId || "",
          event_type: "strike",
          actor_team_index: attackerTeamIndex,
          target_team_index: targetTeamIndex,
          cell_index: cellIndex,
          result: "pending",
          unit_type: null,
          points_delta: 0,
          is_optimistic: true,
          created_at: new Date().toISOString(),
        };

        setCombatEvents((prev) => {
          if (
            (prev || []).some(
              (e) => e.target_team_index === targetTeamIndex && e.cell_index === cellIndex,
            )
          ) {
            return prev;
          }
          return [optimisticEvent, ...(prev || [])];
        });

        setTeams((prev) =>
          prev.map((t) =>
            t.team_index === attackerTeamIndex
              ? { ...t, available_strikes: Math.max(0, (t.available_strikes || 0) - 1) }
              : t,
          ),
        );

        try {
          const { data: serverEvent, error } = await supabase.rpc("execute_strike", {
            p_room_id: roomId,
            p_attacker_team_index: attackerTeamIndex,
            p_cell_index: cellIndex,
          });

          if (error) {
            if (
              error.message &&
              (error.message.includes("uq_combat_events_one_strike_per_cell") ||
                error.message.includes("already attacked"))
            ) {
              console.warn("Cell was already struck in DB, keeping struck state.");
              return;
            }
            setCombatEvents((prev) => (prev || []).filter((e) => e.id !== tempId));
            throw error;
          }

          if (serverEvent && serverEvent.id) {
            if (serverEvent.metadata?.pit_stolen_points > 0) {
              const stolen = serverEvent.metadata.pit_stolen_points;
              const attacker = teams.find((t) => t.team_index === attackerTeamIndex);
              showAlert(
                `🔥 حفرة ناجحة! تم خصم ${stolen} نقطة من الخصم وإضافتها لرصيد ${attacker?.name || "فريقك"}!`,
                "success",
              );
              setTeams((prev) =>
                prev.map((t) =>
                  t.team_index === attackerTeamIndex
                    ? { ...t, pit_active: false, score: (t.score || 0) + stolen }
                    : t,
                ),
              );
            }

            setCombatEvents((prev) => {
              const filtered = (prev || []).filter(
                (e) =>
                  e.id !== tempId &&
                  e.id !== serverEvent.id &&
                  !(
                    e.event_type === "strike" &&
                    Number(e.target_team_index) === Number(targetTeamIndex) &&
                    Number(e.cell_index) === Number(cellIndex)
                  ),
              );
              return [serverEvent, ...filtered];
            });
            setLatestCombatEvent(serverEvent);
          }

          await finalizeRoomIfComplete();
        } catch (err) {
          setCombatEvents((prev) => (prev || []).filter((e) => e.id !== tempId));
          throw err;
        }
      }),
    [teams, roomId, setCombatEvents, setTeams, showAlert, setLatestCombatEvent, finalizeRoomIfComplete, runAction],
  );

  // Cancel strikes for team
  const handleCancelStrike = useCallback(
    (attackerTeamIndex: number) =>
      runAction(async () => {
        setTeams((prev) =>
          prev.map((t) => (t.team_index === attackerTeamIndex ? { ...t, available_strikes: 0 } : t)),
        );

        const { error } = await supabase.rpc("cancel_team_strikes", {
          p_room_id: roomId,
          p_team_index: attackerTeamIndex,
        });

        if (error) {
          console.error("Failed to cancel strikes:", error);
          throw error;
        }
      }),
    [roomId, setTeams, runAction],
  );

  // Activate team tool
  const handleUseTool = useCallback(
    (forTeamIndex: number, toolId: string, cellIndex?: number) =>
      runAction(async () => {
        if (
          (toolId === "shield" || toolId === "extra_strike" || toolId === "pit") &&
          room?.active_question_id
        ) {
          throw new Error("لازم تشغل هالفزعة قبل لا تبطل السؤال.");
        }

        const { data, error } = await supabase.rpc("use_team_tool", {
          p_room_id: roomId,
          p_team_index: forTeamIndex,
          p_tool: toolId,
          p_cell_index: cellIndex,
        });
        if (error) throw error;

        if (toolId === "pit") {
          setTeams((prev: any[]) =>
            prev.map((t) => (t.team_index === forTeamIndex ? { ...t, pit_active: true } : t)),
          );
        }

        if (toolId === "scan") {
          const targetTeam = teams.find((t) => t.team_index !== forTeamIndex);
          setFullScanData({
            isOpen: true,
            enemyTeamName: targetTeam?.name || "الفريق المنافس",
            cells: data?.cells || [],
          });
        }

        if (toolId === "radar_scan") {
          const newCells = data?.cells || [];
          const targetTeam = teams.find((t) => t.team_index !== forTeamIndex);
          if (targetTeam) {
            setRadarRevealsByTeam((prev: any) => {
              const existing = prev?.[targetTeam.team_index] || [];
              const merged = [...existing];
              newCells.forEach((cell: any) => {
                if (!merged.some((c: any) => c.cell_index === cell.cell_index)) {
                  merged.push(cell);
                }
              });
              return { ...prev, [targetTeam.team_index]: merged };
            });
          }
        }
      }),
    [room?.active_question_id, roomId, teams, setTeams, setFullScanData, setRadarRevealsByTeam, runAction],
  );

  // Pre-game radar scan
  const handleExecutePreGameRadar = useCallback(
    async (forTeamIndex: number, cellIndex: number) => {
      const { data, error } = await supabase.rpc("execute_pregame_radar", {
        p_room_id: roomId,
        p_team_index: forTeamIndex,
        p_cell_index: cellIndex,
      });
      if (error) throw error;
      return { cells: data?.cells || [] };
    },
    [roomId],
  );

  // Abandon and exit game room
  const handleExitGame = useCallback(
    () =>
      runAction(async () => {
        if (room?.status !== "finished") {
          const { error } = await supabase.rpc("abandon_game", {
            p_room_id: roomId,
            p_actor_role: "judge",
            p_team_index: null,
          });
          if (error) throw error;
        }

        window.localStorage.removeItem("sovereignty_active_room");
        window.localStorage.removeItem("sovereignty_active_battle_path");
        window.location.assign("/");
      }),
    [room?.status, roomId, runAction],
  );

  const getTeamUrl = useCallback(
    (rId: string, tIndex: number) => {
      const token = tIndex === 1 ? teamLinkTokens?.team_1_token : teamLinkTokens?.team_2_token;
      const tokenParam = token ? `&token=${token}` : "";
      if (typeof window !== "undefined") {
        return `${window.location.origin}/battle?room_id=${rId}&team=${tIndex}${tokenParam}`;
      }
      return `/battle?room_id=${rId}&team=${tIndex}${tokenParam}`;
    },
    [teamLinkTokens],
  );

  return {
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
  };
}
