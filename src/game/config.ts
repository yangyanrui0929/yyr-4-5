import type {
  Ingredient,
  Recipe,
  TowerConfig,
  EnemyConfig,
  WaveConfig,
  CaptureToolConfig,
  MonsterAbilities,
  EnemyType,
} from "@/types/game";

export const GRID_COLS = 15;
export const GRID_ROWS = 10;
export const CELL_SIZE = 48;
export const CANVAS_WIDTH = GRID_COLS * CELL_SIZE;
export const CANVAS_HEIGHT = GRID_ROWS * CELL_SIZE;

export const GRID_PATH = [
  { x: 0, y: 5 },
  { x: 3, y: 5 },
  { x: 3, y: 2 },
  { x: 7, y: 2 },
  { x: 7, y: 7 },
  { x: 11, y: 7 },
  { x: 11, y: 4 },
  { x: 14, y: 4 },
];

export const PIXEL_PATH = GRID_PATH.map((p) => ({
  x: p.x * CELL_SIZE + CELL_SIZE / 2,
  y: p.y * CELL_SIZE + CELL_SIZE / 2,
}));

export const INITIAL_INGREDIENTS: Ingredient[] = [
  { id: "cabbage", name: "白菜", emoji: "🥬", price: 8, count: 0 },
  { id: "potato", name: "土豆", emoji: "🥔", price: 6, count: 0 },
  { id: "tomato", name: "番茄", emoji: "🍅", price: 10, count: 0 },
  { id: "meat", name: "猪肉", emoji: "🥩", price: 20, count: 0 },
  { id: "egg", name: "鸡蛋", emoji: "🥚", price: 5, count: 0 },
  { id: "chili", name: "辣椒", emoji: "🌶️", price: 7, count: 0 },
];

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: "stir_fry_cabbage",
    name: "醋溜白菜",
    emoji: "🥗",
    ingredients: [
      { ingredientId: "cabbage", count: 2 },
      { ingredientId: "chili", count: 1 },
    ],
    sellPrice: 35,
    maxPrepare: 10,
    prepared: 0,
  },
  {
    id: "potato_shreds",
    name: "酸辣土豆丝",
    emoji: "🍟",
    ingredients: [
      { ingredientId: "potato", count: 2 },
      { ingredientId: "chili", count: 1 },
    ],
    sellPrice: 30,
    maxPrepare: 10,
    prepared: 0,
  },
  {
    id: "tomato_egg",
    name: "番茄炒蛋",
    emoji: "🍳",
    ingredients: [
      { ingredientId: "tomato", count: 2 },
      { ingredientId: "egg", count: 2 },
    ],
    sellPrice: 40,
    maxPrepare: 10,
    prepared: 0,
  },
  {
    id: "braised_pork",
    name: "红烧肉",
    emoji: "🍖",
    ingredients: [
      { ingredientId: "meat", count: 3 },
      { ingredientId: "potato", count: 1 },
    ],
    sellPrice: 90,
    maxPrepare: 5,
    prepared: 0,
  },
  {
    id: "mapo_tofu",
    name: "麻婆豆腐",
    emoji: "🥘",
    ingredients: [
      { ingredientId: "meat", count: 1 },
      { ingredientId: "chili", count: 2 },
    ],
    sellPrice: 55,
    maxPrepare: 8,
    prepared: 0,
  },
];

export const TOWER_CONFIGS: Record<string, TowerConfig> = {
  spatula: {
    type: "spatula",
    name: "锅铲塔",
    emoji: "🍳",
    cost: 50,
    damage: 15,
    range: 120,
    fireRate: 800,
    special: "平衡型单体攻击",
    upgradeCost: 40,
    upgradeMultiplier: 1.4,
  },
  chili: {
    type: "chili",
    name: "辣椒塔",
    emoji: "🌶️",
    cost: 80,
    damage: 10,
    range: 100,
    fireRate: 1200,
    special: "范围溅射伤害",
    upgradeCost: 60,
    upgradeMultiplier: 1.5,
  },
  freezer: {
    type: "freezer",
    name: "冰柜塔",
    emoji: "🧊",
    cost: 70,
    damage: 5,
    range: 110,
    fireRate: 1000,
    special: "减速敌人 50%",
    upgradeCost: 50,
    upgradeMultiplier: 1.3,
  },
};

export const ENEMY_CONFIGS: Record<string, EnemyConfig> = {
  cabbage: {
    type: "cabbage",
    name: "白菜怪",
    emoji: "🥬",
    hp: 40,
    speed: 0.6,
    reward: 8,
    damage: 1,
  },
  potato: {
    type: "potato",
    name: "土豆怪",
    emoji: "🥔",
    hp: 70,
    speed: 0.4,
    reward: 12,
    damage: 1,
  },
  tomato: {
    type: "tomato",
    name: "番茄怪",
    emoji: "🍅",
    hp: 50,
    speed: 0.8,
    reward: 10,
    damage: 1,
  },
  meat: {
    type: "meat",
    name: "肉块怪",
    emoji: "🥩",
    hp: 120,
    speed: 0.35,
    reward: 20,
    damage: 2,
  },
  boss: {
    type: "boss",
    name: "BOSS大魔王",
    emoji: "👹",
    hp: 500,
    speed: 0.25,
    reward: 100,
    damage: 5,
  },
};

export function generateWaves(day: number): WaveConfig[] {
  const difficulty = 1 + (day - 1) * 0.25;
  const waves: WaveConfig[] = [];
  const waveCount = 3 + Math.min(day, 4);

  for (let i = 0; i < waveCount; i++) {
    const wave: WaveConfig = { enemies: [] };

    wave.enemies.push({
      type: "cabbage",
      count: Math.floor((3 + i * 2) * difficulty),
      delay: 900,
    });

    if (i >= 1) {
      wave.enemies.push({
        type: "potato",
        count: Math.floor((2 + i) * difficulty),
        delay: 1100,
      });
    }

    if (i >= 2) {
      wave.enemies.push({
        type: "tomato",
        count: Math.floor((2 + i) * difficulty),
        delay: 700,
      });
    }

    if (i >= 3) {
      wave.enemies.push({
        type: "meat",
        count: Math.floor((1 + Math.floor(i / 2)) * difficulty),
        delay: 1500,
      });
    }

    if (i === waveCount - 1 && day >= 2) {
      wave.enemies.push({
        type: "boss",
        count: 1,
        delay: 2000,
      });
    }

    waves.push(wave);
  }

  return waves;
}

export const INITIAL_GOLD = 200;
export const INITIAL_LIVES = 10;

export const CAPTURE_TOOL_CONFIGS: Record<string, CaptureToolConfig> = {
  catcher_pot: {
    type: "catcher_pot",
    name: "捕网锅",
    emoji: "🪤",
    cost: 30,
    baseSuccessRate: 0.7,
    description: "抛出锅网抓住低血量敌人，成功率中等",
  },
  comfort_dish: {
    type: "comfort_dish",
    name: "安抚菜",
    emoji: "🍲",
    cost: 50,
    baseSuccessRate: 0.95,
    description: "用美味料理安抚敌人，几乎一定能收编",
  },
};

export const INITIAL_CAPTURE_TOOLS = [
  { type: "catcher_pot" as const, count: 2 },
  { type: "comfort_dish" as const, count: 1 },
];

export interface MonsterAbilityConfig {
  ability: MonsterAbilities;
  abilityValue: number;
  preferredRecipeId: string;
  description: string;
}

export const MONSTER_ABILITY_CONFIGS: Record<Exclude<EnemyType, "boss">, MonsterAbilityConfig> = {
  cabbage: {
    ability: "organize_stock",
    abilityValue: 2,
    preferredRecipeId: "stir_fry_cabbage",
    description: "每天整理库存，自动获得随机食材 x2",
  },
  potato: {
    ability: "reduce_cost",
    abilityValue: 0.2,
    preferredRecipeId: "potato_shreds",
    description: "降低食材采购价 20%",
  },
  tomato: {
    ability: "organize_stock",
    abilityValue: 1,
    preferredRecipeId: "tomato_egg",
    description: "整理库存，自动获得随机食材 x1",
  },
  meat: {
    ability: "enhance_tower",
    abilityValue: 0.25,
    preferredRecipeId: "braised_pork",
    description: "增强所有防御塔伤害 +25%",
  },
};

export const MONSTER_DEFAULT_STATS = {
  maxHunger: 100,
  maxLoyalty: 100,
  startHunger: 80,
  startLoyalty: 60,
  hungerDecayPerDay: 30,
  loyaltyDecayPerDay: 15,
  hungerFedFull: 50,
  loyaltyFedPreferred: 30,
  loyaltyFedOther: 10,
  hungerFedOther: 30,
  captureHpThreshold: 0.3,
  defectionLoyaltyThreshold: 20,
};

