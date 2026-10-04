import { UNIT_IMAGES } from "@/lib/game-data";

// Public columns for team queries matching database schema
export const TEAM_PUBLIC_COLUMNS =
  "id, room_id, team_index, name, points, score, available_strikes, is_ready, joined, member_id, tools, used_tools, shield_active, pit_active, updated_at";

// Base points budget for each team during deployment
export const STARTING_POINTS = 4000;

// Maximum unit allocation limits per army
export const UNIT_LIMITS: Record<string, number> = {
  infantry: 15,
  armored: 7,
  tank: 4,
  aircraft: 3,
  submarine: 2,
  mine: 2,
};

// Unit specifications, cost, and metadata
export const UNIT_SPECS: Record<
  string,
  { name: string; cost: number; image: string; description: string }
> = {
  infantry: {
    name: "جندي",
    cost: 20,
    image: UNIT_IMAGES.infantry,
    description: "وحدة مشاة أساسية",
  },
  armored: {
    name: "مدرعة",
    cost: 100,
    image: UNIT_IMAGES.armored,
    description: "مركبة مدرعة خفيفة",
  },
  tank: {
    name: "دبابة",
    cost: 200,
    image: UNIT_IMAGES.tank,
    description: "دبابة ثقيلة",
  },
  aircraft: {
    name: "طائرة",
    cost: 400,
    image: UNIT_IMAGES.aircraft,
    description: "طائرة قتالية جوية",
  },
  submarine: {
    name: "غواصة",
    cost: 500,
    image: UNIT_IMAGES.submarine,
    description: "غواصة بحرية ثقيلة",
  },
  mine: {
    name: "لغم",
    cost: 0,
    image: UNIT_IMAGES.mine,
    description: "لغم أرضي (يخصم 250 نقطة)",
  },
};
