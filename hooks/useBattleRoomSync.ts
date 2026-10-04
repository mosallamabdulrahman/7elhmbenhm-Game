"use client";

import { useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { TEAM_PUBLIC_COLUMNS } from "@/components/battle/battle-constants";
import { useBattleStore } from "@/stores/useBattleStore";
import { useAuthStore } from "@/stores/useAuthStore";
import type { CombatEvent, GameRoom, Team } from "@/types/game";

// Manages database synchronization and Supabase realtime subscriptions
export function useBattleRoomSync() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.authLoading);
  const initAuth = useAuthStore((s) => s.initAuth);

  const {
    roomId,
    teamIndex,
    role,
    teamToken,
    room,
    setRoomId,
    setTeamIndex,
    setRole,
    setTeamToken,
    setTeamLinkTokens,
    setRoom,
    setTeams,
    setQuestions,
    setCategoryInfoMap,
    setCombatEvents,
    setDbLoading,
    setDbError,
    setActiveAnswer,
    setLatestCombatEvent,
    setRadarRevealsByTeam,
    setAlertMsg,
  } = useBattleStore();

  const userId = user?.id || null;

  // Trigger floating alert
  const showAlert = useCallback(
    (message: string, type: "error" | "success" | "info" | "warning" = "info") => {
      setAlertMsg({ message, type });
      setTimeout(() => setAlertMsg(null), 4000);
    },
    [setAlertMsg],
  );

  // Parse URL query parameters reactively
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!searchParams.get("room_id")) {
      const savedPath = window.localStorage.getItem("sovereignty_active_battle_path");
      if (savedPath?.startsWith("/battle?")) {
        router.replace(savedPath);
        return;
      }
    }

    setRoomId(searchParams.get("room_id"));
    const t = searchParams.get("team");
    setTeamIndex(t ? Number(t) : null);
    setRole(searchParams.get("role"));
    setTeamToken(searchParams.get("token"));

    if (searchParams.get("room_id")) {
      window.localStorage.setItem(
        "sovereignty_active_battle_path",
        `${window.location.pathname}?${searchParams.toString()}`,
      );
    }
  }, [searchParams, router, setRoomId, setTeamIndex, setRole, setTeamToken]);

  // Initialize auth once on mount
  useEffect(() => {
    const cleanupAuth = initAuth();
    return () => {
      cleanupAuth();
    };
  }, [initAuth]);

  // Clear room radar reveals on room change
  useEffect(() => {
    setRadarRevealsByTeam({});
  }, [roomId, setRadarRevealsByTeam]);

  // Fetch initial room, teams, and questions from Supabase
  const loadDatabaseData = useCallback(async () => {
    if (!roomId) return;
    setDbLoading(true);
    setDbError(null);

    try {
      const { data: rData, error: rError } = await supabase
        .from("game_rooms")
        .select("*")
        .eq("id", roomId)
        .single();

      if (rError) throw rError;
      setRoom(rData);

      const { data: tData, error: tError } = await supabase
        .from("teams")
        .select(TEAM_PUBLIC_COLUMNS as any)
        .eq("room_id", roomId)
        .order("team_index");

      if (tError) throw tError;
      let visibleTeams = ((tData as any[]) || []).map((team: any) => ({
        ...team,
        board: [],
      }));

      const visibleBoardIndexes = role === "judge" ? [1, 2] : teamIndex ? [teamIndex] : [];

      for (const visibleTeamIndex of visibleBoardIndexes) {
        const { data: board, error: boardError } = await supabase.rpc("get_team_board", {
          p_room_id: roomId,
          p_team_index: visibleTeamIndex,
          p_token: visibleTeamIndex === teamIndex ? teamToken : null,
        });

        if (boardError) throw boardError;
        visibleTeams = visibleTeams.map((team) =>
          team.team_index === visibleTeamIndex ? { ...team, board } : team,
        );
      }

      setTeams(visibleTeams);

      if (role === "judge" && rData.judge_id === userId) {
        const { data: tokens } = await supabase.rpc("get_team_tokens", { p_room_id: roomId });
        if (tokens) setTeamLinkTokens(tokens);
      }

      const { data: questionData, error: questionError } = await supabase
        .from("room_questions")
        .select("*")
        .eq("room_id", roomId)
        .order("category_id")
        .order("position");

      if (questionError) throw questionError;

      let categoryImageMap = new Map();
      let newCategoryInfoMap = new Map();
      const categoryIds = [...new Set((questionData || []).map((question) => question.category_id))];
      if (categoryIds.length > 0) {
        const { data: categoryData } = await supabase
          .from("question_categories")
          .select("id,image_url,name")
          .in("id", categoryIds);

        categoryImageMap = new Map((categoryData || []).map((c) => [c.id, c.image_url]));
        newCategoryInfoMap = new Map(
          (categoryData || []).map((c) => [c.id, { name: c.name, image_url: c.image_url || "" }]),
        );
      }
      setCategoryInfoMap(newCategoryInfoMap);

      const bankIds = [
        ...new Set((questionData || []).map((q) => q.question_bank_id).filter(Boolean)),
      ];
      let bankQuestionMap = new Map();
      if (bankIds.length > 0) {
        try {
          const { data: bankData } = await supabase
            .from("question_bank")
            .select("id,show_question_first,image_duration,media_play_count")
            .in("id", bankIds);
          if (bankData) {
            bankQuestionMap = new Map(bankData.map((b) => [b.id, b]));
          }
        } catch (e) {
          console.warn("Could not enrich from question_bank:", e);
        }
      }

      setQuestions(
        (questionData || []).map((question) => {
          const bank = bankQuestionMap.get(question.question_bank_id);
          return {
            ...question,
            show_question_first:
              question.show_question_first !== undefined && question.show_question_first !== null
                ? Boolean(question.show_question_first)
                : Boolean(bank?.show_question_first),
            image_duration:
              question.image_duration !== undefined && question.image_duration !== null
                ? question.image_duration
                : (bank?.image_duration ?? null),
            media_play_count:
              question.media_play_count !== undefined && question.media_play_count !== null
                ? question.media_play_count
                : (bank?.media_play_count ?? null),
            category_image_url:
              categoryImageMap.get(question.category_id) || question.category_image_url || "",
          };
        }),
      );

      const { data: eventData, error: eventError } = await supabase
        .from("combat_events")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: false });

      if (eventError) throw eventError;

      setCombatEvents((prev) => {
        const map = new Map();
        (prev || []).forEach((e) => {
          if (e) {
            const key =
              e.event_type === "strike"
                ? `strike-${e.target_team_index}-${e.cell_index}`
                : e.id || `event-${Math.random()}`;
            map.set(key, e);
          }
        });
        (eventData || []).forEach((e) => {
          if (e && e.id) {
            const strikeKey =
              e.event_type === "strike" ? `strike-${e.target_team_index}-${e.cell_index}` : null;
            if (strikeKey) {
              map.set(strikeKey, e);
            } else {
              map.set(e.id, e);
            }
          }
        });
        return Array.from(map.values()).sort(
          (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime(),
        );
      });

      const radarEvents = (eventData || []).filter(
        (e: any) =>
          e.event_type === "radar_scan" &&
          Array.isArray(e.metadata?.cells) &&
          !e.metadata?.pregame &&
          e.result !== "pregame_radar",
      );
      if (radarEvents.length > 0) {
        setRadarRevealsByTeam((prev: any) => {
          const updated = { ...(prev || {}) };
          radarEvents.forEach((ev: any) => {
            const targetIdx = ev.target_team_index;
            if (targetIdx) {
              const current = updated[targetIdx] || [];
              const merged = [...current];
              ev.metadata.cells.forEach((cell: any) => {
                if (!merged.some((c: any) => c.cell_index === cell.cell_index)) {
                  merged.push(cell);
                }
              });
              updated[targetIdx] = merged;
            }
          });
          return updated;
        });
      }
    } catch (err: any) {
      console.error(err);
      setDbError(err?.message || "ما قدرنا نحمل بيانات حيلهم بينهم.");
    } finally {
      setDbLoading(false);
    }
  }, [roomId, role, teamIndex, teamToken, userId, setRoom, setTeams, setCategoryInfoMap, setQuestions, setCombatEvents, setRadarRevealsByTeam, setDbLoading, setDbError, setTeamLinkTokens]);

  // Trigger database data load when room or auth becomes ready
  useEffect(() => {
    if (!roomId || authLoading) return;
    loadDatabaseData();
  }, [authLoading, roomId, userId, teamIndex, teamToken, loadDatabaseData]);

  // Realtime Supabase channel subscriptions for rooms, teams, questions, and events
  useEffect(() => {
    if (!roomId) return;

    const roomChannel = supabase
      .channel(`realtime:room-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_rooms",
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          setRoom(payload.new as GameRoom);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "teams",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const updatedTeam = payload.new as Team;
          setTeams((prev) =>
            prev.map((t) => (t.id === updatedTeam.id ? { ...t, ...updatedTeam } : t)),
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "room_questions",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setQuestions((previous) =>
            previous.map((question) =>
              question.id === (payload.new as any).id
                ? {
                    ...question,
                    ...(payload.new as any),
                    category_image_url:
                      question.category_image_url ||
                      (payload.new as any).category_image_url ||
                      "",
                  }
                : question,
            ),
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "combat_events",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const newEvent = payload.new as CombatEvent;
          setCombatEvents((previous) => {
            const filtered = (previous || []).filter((e) => {
              if (e.id === newEvent.id) return false;
              if (
                e.event_type === "strike" &&
                newEvent.event_type === "strike" &&
                Number(e.target_team_index) === Number(newEvent.target_team_index) &&
                Number(e.cell_index) === Number(newEvent.cell_index)
              ) {
                return false;
              }
              return true;
            });
            return [newEvent, ...filtered];
          });
          if (newEvent.event_type === "strike") {
            setLatestCombatEvent(newEvent);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomChannel);
    };
  }, [roomId, teamIndex, setRoom, setTeams, setQuestions, setCombatEvents, setLatestCombatEvent]);

  // Load question answer for referee when active question changes
  useEffect(() => {
    if (role !== "judge" || !room?.active_question_id) {
      setActiveAnswer({ text: "", imageUrl: "" });
      return;
    }

    const loadAnswer = async () => {
      const { data, error } = await supabase.rpc("get_question_answer", {
        p_question_id: room.active_question_id,
      });

      if (error) {
        showAlert(`ما قدرنا نحمل الإجابة: ${error.message}`, "error");
        return;
      }

      setActiveAnswer({
        text: data?.answer_text || "",
        imageUrl: data?.answer_image_url || "",
      });
    };

    loadAnswer();
  }, [role, room?.active_question_id, setActiveAnswer, showAlert]);

  return { loadDatabaseData, showAlert };
}
