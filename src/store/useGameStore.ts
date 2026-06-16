import { create } from "zustand";
import type {
  GameState,
  TowerType,
  Enemy,
  Bullet,
  FloatingText,
  CaptureToolType,
  CapturedMonster,
  EnemyType,
  DefectionEvent,
} from "@/types/game";
import {
  INITIAL_GOLD,
  INITIAL_LIVES,
  INITIAL_INGREDIENTS,
  INITIAL_RECIPES,
  PIXEL_PATH,
  GRID_PATH,
  TOWER_CONFIGS,
  ENEMY_CONFIGS,
  CELL_SIZE,
  generateWaves,
  INITIAL_CAPTURE_TOOLS,
  CAPTURE_TOOL_CONFIGS,
  MONSTER_ABILITY_CONFIGS,
  MONSTER_DEFAULT_STATS,
} from "@/game/config";
import { loadGame, saveGame } from "@/utils/storage";

let idCounter = 0;
const genId = () => `${Date.now()}-${idCounter++}`;

interface GameActions {
  resetGame: () => void;
  loadFromSave: () => boolean;
  saveProgress: () => void;

  buyIngredient: (ingredientId: string, amount: number) => boolean;
  cookRecipe: (recipeId: string, amount: number) => boolean;
  cookMax: (recipeId: string) => number;

  startNight: () => void;
  startDay: () => void;

  selectTowerType: (type: TowerType | null) => void;
  selectTower: (towerId: string | null) => void;
  placeTower: (gridX: number, gridY: number) => boolean;
  upgradeTower: (towerId: string) => boolean;
  sellTower: (towerId: string) => void;

  startWave: () => void;
  togglePause: () => void;

  addEnemy: (enemy: Omit<Enemy, "id">) => void;
  updateEnemy: (id: string, updates: Partial<Enemy>) => void;
  removeEnemy: (id: string) => void;
  addBullet: (bullet: Omit<Bullet, "id">) => void;
  removeBullet: (id: string) => void;
  addFloatingText: (text: Omit<FloatingText, "id" | "createdAt">) => void;
  removeFloatingText: (id: string) => void;

  addGold: (amount: number) => void;
  addWaveReward: (amount: number) => void;
  loseLife: (amount: number) => void;
  setWaveInProgress: (inProgress: boolean) => void;
  nextWave: () => void;
  finishAllWaves: () => void;
  setGameOver: () => void;
  getCurrentWaves: () => ReturnType<typeof generateWaves>;

  buyCaptureTool: (type: CaptureToolType, amount: number) => boolean;
  selectCaptureTool: (type: CaptureToolType | null) => void;
  tryCaptureEnemy: (
    enemyId: string,
    toolType: CaptureToolType
  ) => { success: boolean; message: string };

  feedMonster: (monsterId: string, recipeId: string) => boolean;
  releaseMonster: (monsterId: string) => void;

  getIngredientDiscount: () => number;
  getTowerDamageBoost: () => number;
  getOrganizeStockBonus: () => { ingredientId: string; count: number }[];

  processDailyHunger: () => void;
  processDefections: () => void;
  triggerOrganizeStock: () => void;
  addDefectedMonsterToWave: (monsters: CapturedMonster[]) => Enemy[];
  clearPendingDefections: () => void;
}

const createInitialState = (): GameState => {
  const saved = loadGame();
  if (saved) {
    return {
      day: saved.day ?? 1,
      phase: saved.phase ?? "day",
      gold: saved.gold ?? INITIAL_GOLD,
      lives: saved.lives ?? INITIAL_LIVES,
      ingredients: saved.ingredients ?? INITIAL_INGREDIENTS.map((i) => ({ ...i })),
      recipes: saved.recipes ?? INITIAL_RECIPES.map((r) => ({ ...r })),
      towers: [],
      enemies: [],
      bullets: [],
      floatingTexts: [],
      currentWave: 0,
      totalWaves: 0,
      waveInProgress: false,
      todayRevenue: 0,
      todayExpense: 0,
      waveReward: 0,
      selectedTowerType: null,
      selectedTowerId: null,
      path: PIXEL_PATH,
      gridPath: GRID_PATH,
      isPaused: false,
      gameOver: false,
      captureTools: saved.captureTools ?? INITIAL_CAPTURE_TOOLS.map((t) => ({ ...t })),
      selectedCaptureTool: null,
      capturedMonsters: saved.capturedMonsters ?? [],
      todayDefections: [],
      defectMonstersPending: [],
    };
  }

  return {
    day: 1,
    phase: "day",
    gold: INITIAL_GOLD,
    lives: INITIAL_LIVES,
    ingredients: INITIAL_INGREDIENTS.map((i) => ({ ...i })),
    recipes: INITIAL_RECIPES.map((r) => ({ ...r })),
    towers: [],
    enemies: [],
    bullets: [],
    floatingTexts: [],
    currentWave: 0,
    totalWaves: 0,
    waveInProgress: false,
    todayRevenue: 0,
    todayExpense: 0,
    waveReward: 0,
    selectedTowerType: null,
    selectedTowerId: null,
    path: PIXEL_PATH,
    gridPath: GRID_PATH,
    isPaused: false,
    gameOver: false,
    captureTools: INITIAL_CAPTURE_TOOLS.map((t) => ({ ...t })),
    selectedCaptureTool: null,
    capturedMonsters: [],
    todayDefections: [],
    defectMonstersPending: [],
  };
};

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...createInitialState(),

  resetGame: () => {
    localStorage.removeItem("kitchen_tower_defense_save");
    idCounter = 0;
    set({
      day: 1,
      phase: "day",
      gold: INITIAL_GOLD,
      lives: INITIAL_LIVES,
      ingredients: INITIAL_INGREDIENTS.map((i) => ({ ...i })),
      recipes: INITIAL_RECIPES.map((r) => ({ ...r, prepared: 0 })),
      towers: [],
      enemies: [],
      bullets: [],
      floatingTexts: [],
      currentWave: 0,
      totalWaves: 0,
      waveInProgress: false,
      todayRevenue: 0,
      todayExpense: 0,
      waveReward: 0,
      selectedTowerType: null,
      selectedTowerId: null,
      isPaused: false,
      gameOver: false,
      captureTools: INITIAL_CAPTURE_TOOLS.map((t) => ({ ...t })),
      selectedCaptureTool: null,
      capturedMonsters: [],
      todayDefections: [],
      defectMonstersPending: [],
    });
  },

  loadFromSave: () => {
    const saved = loadGame();
    if (!saved) return false;
    set({
      day: saved.day ?? 1,
      phase: saved.phase ?? "day",
      gold: saved.gold ?? INITIAL_GOLD,
      lives: saved.lives ?? INITIAL_LIVES,
      ingredients: saved.ingredients ?? INITIAL_INGREDIENTS.map((i) => ({ ...i })),
      recipes: saved.recipes ?? INITIAL_RECIPES.map((r) => ({ ...r })),
      captureTools: saved.captureTools ?? INITIAL_CAPTURE_TOOLS.map((t) => ({ ...t })),
      capturedMonsters: saved.capturedMonsters ?? [],
    });
    return true;
  },

  saveProgress: () => {
    saveGame(get());
  },

  getIngredientDiscount: () => {
    const state = get();
    let discount = 0;
    for (const m of state.capturedMonsters) {
      if (m.ability === "reduce_cost" && !m.willDefect) {
        discount += m.abilityValue;
      }
    }
    return Math.min(discount, 0.8);
  },

  getTowerDamageBoost: () => {
    const state = get();
    let boost = 0;
    for (const m of state.capturedMonsters) {
      if (m.ability === "enhance_tower" && !m.willDefect) {
        boost += m.abilityValue;
      }
    }
    return boost;
  },

  getOrganizeStockBonus: () => {
    const state = get();
    const bonuses: { ingredientId: string; count: number }[] = [];
    const ingredientIds = state.ingredients.map((i) => i.id);
    for (const m of state.capturedMonsters) {
      if (m.ability === "organize_stock" && !m.willDefect) {
        for (let i = 0; i < m.abilityValue; i++) {
          const randomId = ingredientIds[Math.floor(Math.random() * ingredientIds.length)];
          const existing = bonuses.find((b) => b.ingredientId === randomId);
          if (existing) {
            existing.count += 1;
          } else {
            bonuses.push({ ingredientId: randomId, count: 1 });
          }
        }
      }
    }
    return bonuses;
  },

  buyIngredient: (ingredientId: string, amount: number) => {
    const state = get();
    const ingredient = state.ingredients.find((i) => i.id === ingredientId);
    if (!ingredient) return false;

    const discount = get().getIngredientDiscount();
    const unitPrice = Math.max(1, Math.floor(ingredient.price * (1 - discount)));
    const totalCost = unitPrice * amount;

    if (state.gold < totalCost) return false;

    set((s) => ({
      gold: s.gold - totalCost,
      todayExpense: s.todayExpense + totalCost,
      ingredients: s.ingredients.map((i) =>
        i.id === ingredientId ? { ...i, count: i.count + amount } : i
      ),
    }));
    return true;
  },

  cookRecipe: (recipeId: string, amount: number) => {
    const state = get();
    const recipe = state.recipes.find((r) => r.id === recipeId);
    if (!recipe) return false;
    if (recipe.prepared + amount > recipe.maxPrepare) return false;

    for (const req of recipe.ingredients) {
      const ing = state.ingredients.find((i) => i.id === req.ingredientId);
      if (!ing || ing.count < req.count * amount) return false;
    }

    set((s) => {
      const newIngredients = s.ingredients.map((i) => {
        const req = recipe.ingredients.find((r) => r.ingredientId === i.id);
        if (req) {
          return { ...i, count: i.count - req.count * amount };
        }
        return i;
      });
      const newRecipes = s.recipes.map((r) =>
        r.id === recipeId ? { ...r, prepared: r.prepared + amount } : r
      );
      return { ingredients: newIngredients, recipes: newRecipes };
    });
    return true;
  },

  cookMax: (recipeId: string) => {
    const state = get();
    const recipe = state.recipes.find((r) => r.id === recipeId);
    if (!recipe) return 0;

    let maxByPrepared = recipe.maxPrepare - recipe.prepared;
    if (maxByPrepared <= 0) return 0;

    let maxByIngredients = Infinity;
    for (const req of recipe.ingredients) {
      const ing = state.ingredients.find((i) => i.id === req.ingredientId);
      if (!ing) return 0;
      const canMake = Math.floor(ing.count / req.count);
      if (canMake < maxByIngredients) maxByIngredients = canMake;
    }

    const amount = Math.min(maxByPrepared, maxByIngredients);
    if (amount <= 0) return 0;

    set((s) => {
      const newIngredients = s.ingredients.map((i) => {
        const req = recipe.ingredients.find((r) => r.ingredientId === i.id);
        if (req) {
          return { ...i, count: i.count - req.count * amount };
        }
        return i;
      });
      const newRecipes = s.recipes.map((r) =>
        r.id === recipeId ? { ...r, prepared: r.prepared + amount } : r
      );
      return { ingredients: newIngredients, recipes: newRecipes };
    });
    return amount;
  },

  startNight: () => {
    const state = get();
    const waves = generateWaves(state.day);

    const defectMonsters = state.capturedMonsters.filter((m) => m.willDefect);
    const defectionEvents: DefectionEvent[] = defectMonsters.map((m) => ({
      day: state.day,
      monsterName: m.name,
      monsterType: m.type,
    }));

    set({
      phase: "night",
      currentWave: 0,
      totalWaves: waves.length,
      waveInProgress: false,
      towers: [],
      enemies: [],
      bullets: [],
      floatingTexts: [],
      waveReward: 0,
      selectedTowerType: null,
      selectedTowerId: null,
      isPaused: false,
      selectedCaptureTool: null,
      capturedMonsters: state.capturedMonsters.filter((m) => !m.willDefect),
      todayDefections: defectionEvents,
      defectMonstersPending: defectMonsters,
    });
  },

  startDay: () => {
    set((s) => ({
      phase: "day",
      day: s.day + 1,
      todayRevenue: 0,
      todayExpense: 0,
      waveReward: 0,
      recipes: s.recipes.map((r) => ({ ...r, prepared: 0 })),
      towers: [],
      enemies: [],
      bullets: [],
      floatingTexts: [],
      currentWave: 0,
      totalWaves: 0,
      waveInProgress: false,
      selectedTowerType: null,
      selectedTowerId: null,
      selectedCaptureTool: null,
      isPaused: false,
      todayDefections: [],
      defectMonstersPending: [],
    }));

    const afterDayState = get();
    afterDayState.processDailyHunger();
    afterDayState.triggerOrganizeStock();
    get().saveProgress();
  },

  selectTowerType: (type) => set({ selectedTowerType: type, selectedTowerId: null, selectedCaptureTool: null }),

  selectTower: (towerId) => set({ selectedTowerId: towerId, selectedTowerType: null, selectedCaptureTool: null }),

  placeTower: (gridX: number, gridY: number) => {
    const state = get();
    if (!state.selectedTowerType) return false;
    const config = TOWER_CONFIGS[state.selectedTowerType];
    if (state.gold < config.cost) return false;

    const pathCells = new Set(state.gridPath.map((p) => `${p.x},${p.y}`));
    if (pathCells.has(`${gridX},${gridY}`)) return false;

    const occupied = state.towers.some(
      (t) => t.gridX === gridX && t.gridY === gridY
    );
    if (occupied) return false;

    const pathSegs: Set<string> = new Set();
    for (let i = 0; i < state.gridPath.length - 1; i++) {
      const a = state.gridPath[i];
      const b = state.gridPath[i + 1];
      if (a.x === b.x) {
        const [s2, e] = a.y < b.y ? [a.y, b.y] : [b.y, a.y];
        for (let y = s2; y <= e; y++) pathSegs.add(`${a.x},${y}`);
      } else {
        const [s2, e] = a.x < b.x ? [a.x, b.x] : [b.x, a.x];
        for (let x = s2; x <= e; x++) pathSegs.add(`${x},${a.y}`);
      }
    }
    if (pathSegs.has(`${gridX},${gridY}`)) return false;

    set((s) => ({
      gold: s.gold - config.cost,
      towers: [
        ...s.towers,
        {
          id: genId(),
          type: s.selectedTowerType!,
          gridX,
          gridY,
          level: 1,
          lastFireTime: 0,
        },
      ],
    }));
    return true;
  },

  upgradeTower: (towerId: string) => {
    const state = get();
    const tower = state.towers.find((t) => t.id === towerId);
    if (!tower) return false;
    const config = TOWER_CONFIGS[tower.type];
    const cost = Math.floor(config.upgradeCost * Math.pow(config.upgradeMultiplier, tower.level - 1));
    if (state.gold < cost) return false;
    if (tower.level >= 5) return false;

    set((s) => ({
      gold: s.gold - cost,
      towers: s.towers.map((t) =>
        t.id === towerId ? { ...t, level: t.level + 1 } : t
      ),
    }));
    return true;
  },

  sellTower: (towerId: string) => {
    const state = get();
    const tower = state.towers.find((t) => t.id === towerId);
    if (!tower) return;
    const config = TOWER_CONFIGS[tower.type];
    let totalCost = config.cost;
    for (let l = 1; l < tower.level; l++) {
      totalCost += Math.floor(config.upgradeCost * Math.pow(config.upgradeMultiplier, l - 1));
    }
    const refund = Math.floor(totalCost * 0.6);

    set((s) => ({
      gold: s.gold + refund,
      towers: s.towers.filter((t) => t.id !== towerId),
      selectedTowerId: null,
    }));
  },

  startWave: () => set({ waveInProgress: true }),

  togglePause: () => set((s) => ({ isPaused: !s.isPaused })),

  addEnemy: (enemy) =>
    set((s) => ({
      enemies: [...s.enemies, { ...enemy, id: genId() }],
    })),

  updateEnemy: (id, updates) =>
    set((s) => ({
      enemies: s.enemies.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    })),

  removeEnemy: (id) => {
    const state = get();
    const enemy = state.enemies.find((e) => e.id === id);
    if (enemy) {
      const reward = ENEMY_CONFIGS[enemy.type].reward;
      set((s) => ({
        gold: s.gold + reward,
        waveReward: s.waveReward + reward,
      }));
    }
    set((s) => ({ enemies: s.enemies.filter((e) => e.id !== id) }));
  },

  addBullet: (bullet) =>
    set((s) => ({
      bullets: [...s.bullets, { ...bullet, id: genId() }],
    })),

  removeBullet: (id) =>
    set((s) => ({ bullets: s.bullets.filter((b) => b.id !== id) })),

  addFloatingText: (text) =>
    set((s) => ({
      floatingTexts: [
        ...s.floatingTexts,
        { ...text, id: genId(), createdAt: Date.now() },
      ],
    })),

  removeFloatingText: (id) =>
    set((s) => ({ floatingTexts: s.floatingTexts.filter((t) => t.id !== id) })),

  addGold: (amount) =>
    set((s) => ({
      gold: s.gold + amount,
      todayRevenue: s.todayRevenue + amount,
    })),

  addWaveReward: (amount) =>
    set((s) => ({
      gold: s.gold + amount,
      waveReward: s.waveReward + amount,
    })),

  loseLife: (amount) =>
    set((s) => {
      const newLives = s.lives - amount;
      return {
        lives: newLives,
        gameOver: newLives <= 0,
      };
    }),

  setWaveInProgress: (inProgress) => set({ waveInProgress: inProgress }),

  nextWave: () =>
    set((s) => ({
      currentWave: s.currentWave + 1,
      waveInProgress: false,
    })),

  finishAllWaves: () => {
    const state = get();
    let foodRevenue = 0;
    for (const r of state.recipes) {
      foodRevenue += r.prepared * r.sellPrice;
    }
    set((s) => ({
      phase: "settlement",
      gold: s.gold + foodRevenue,
      todayRevenue: foodRevenue + s.waveReward,
    }));
    get().saveProgress();
  },

  setGameOver: () => set({ gameOver: true, phase: "settlement" }),

  getCurrentWaves: () => generateWaves(get().day),

  buyCaptureTool: (type: CaptureToolType, amount: number) => {
    const state = get();
    const cfg = CAPTURE_TOOL_CONFIGS[type];
    if (!cfg) return false;
    const totalCost = cfg.cost * amount;
    if (state.gold < totalCost) return false;

    set((s) => ({
      gold: s.gold - totalCost,
      todayExpense: s.todayExpense + totalCost,
      captureTools: s.captureTools.map((t) =>
        t.type === type ? { ...t, count: t.count + amount } : t
      ),
    }));
    return true;
  },

  selectCaptureTool: (type) =>
    set({
      selectedCaptureTool: type,
      selectedTowerType: null,
      selectedTowerId: null,
    }),

  tryCaptureEnemy: (enemyId: string, toolType: CaptureToolType) => {
    const state = get();
    const enemy = state.enemies.find((e) => e.id === enemyId);
    if (!enemy) return { success: false, message: "敌人不存在" };
    if (enemy.type === "boss") return { success: false, message: "无法收编BOSS！" };

    const tool = state.captureTools.find((t) => t.type === toolType);
    if (!tool || tool.count <= 0) return { success: false, message: "捕获工具不足" };

    const hpRatio = enemy.hp / enemy.maxHp;
    if (hpRatio > MONSTER_DEFAULT_STATS.captureHpThreshold) {
      return { success: false, message: `敌人血量太高（${Math.floor(hpRatio * 100)}%），先削弱到30%以下！` };
    }

    const hpBonus = (MONSTER_DEFAULT_STATS.captureHpThreshold - hpRatio) * 0.5;
    const cfg = CAPTURE_TOOL_CONFIGS[toolType];
    const successRate = Math.min(0.99, cfg.baseSuccessRate + hpBonus);
    const roll = Math.random();
    const success = roll < successRate;

    set((s) => ({
      captureTools: s.captureTools.map((t) =>
        t.type === toolType ? { ...t, count: t.count - 1 } : t
      ),
      enemies: success ? s.enemies.filter((e) => e.id !== enemyId) : s.enemies,
    }));

    if (success) {
      const abilityCfg = MONSTER_ABILITY_CONFIGS[enemy.type as Exclude<EnemyType, "boss">];
      const enemyCfg = ENEMY_CONFIGS[enemy.type];
      const newMonster: CapturedMonster = {
        id: genId(),
        type: enemy.type,
        name: enemyCfg.name,
        emoji: enemyCfg.emoji,
        hunger: MONSTER_DEFAULT_STATS.startHunger,
        maxHunger: MONSTER_DEFAULT_STATS.maxHunger,
        loyalty: MONSTER_DEFAULT_STATS.startLoyalty,
        maxLoyalty: MONSTER_DEFAULT_STATS.maxLoyalty,
        ability: abilityCfg.ability,
        abilityValue: abilityCfg.abilityValue,
        preferredRecipeId: abilityCfg.preferredRecipeId,
        capturedDay: state.day,
        willDefect: false,
      };
      set((s) => ({
        capturedMonsters: [...s.capturedMonsters, newMonster],
        selectedCaptureTool: null,
      }));
      get().addFloatingText({
        x: enemy.x,
        y: enemy.y - 20,
        text: `✅ 收编成功！`,
        color: "#4CAF50",
      });
      return { success: true, message: `成功收编了${enemyCfg.name}！` };
    } else {
      get().addFloatingText({
        x: enemy.x,
        y: enemy.y - 20,
        text: `❌ 捕获失败`,
        color: "#F44336",
      });
      return { success: false, message: "捕获失败，敌人挣脱了！" };
    }
  },

  feedMonster: (monsterId: string, recipeId: string) => {
    const state = get();
    const monster = state.capturedMonsters.find((m) => m.id === monsterId);
    if (!monster) return false;

    if (monster.preferredRecipeId !== recipeId) return false;

    const recipe = state.recipes.find((r) => r.id === recipeId);
    if (!recipe || recipe.prepared <= 0) return false;

    set((s) => ({
      recipes: s.recipes.map((r) =>
        r.id === recipeId ? { ...r, prepared: r.prepared - 1 } : r
      ),
      capturedMonsters: s.capturedMonsters.map((m) => {
        if (m.id !== monsterId) return m;
        return {
          ...m,
          hunger: Math.min(m.maxHunger, m.hunger + MONSTER_DEFAULT_STATS.hungerFedFull),
          loyalty: Math.min(m.maxLoyalty, m.loyalty + MONSTER_DEFAULT_STATS.loyaltyFedPreferred),
          willDefect: false,
        };
      }),
    }));
    return true;
  },

  releaseMonster: (monsterId: string) => {
    set((s) => ({
      capturedMonsters: s.capturedMonsters.filter((m) => m.id !== monsterId),
    }));
  },

  processDailyHunger: () => {
    set((s) => ({
      capturedMonsters: s.capturedMonsters.map((m) => {
        const newHunger = Math.max(0, m.hunger - MONSTER_DEFAULT_STATS.hungerDecayPerDay);
        const hungerPenalty = newHunger <= 0 ? MONSTER_DEFAULT_STATS.loyaltyDecayPerDay : 0;
        const newLoyalty = Math.max(
          0,
          m.loyalty - MONSTER_DEFAULT_STATS.loyaltyDecayPerDay - hungerPenalty
        );
        const willDefect = newLoyalty <= MONSTER_DEFAULT_STATS.defectionLoyaltyThreshold;
        return {
          ...m,
          hunger: newHunger,
          loyalty: newLoyalty,
          willDefect,
        };
      }),
    }));
  },

  processDefections: () => {
    const state = get();
    const toDefect = state.capturedMonsters.filter((m) => m.willDefect);
    if (toDefect.length === 0) return;

    const events: DefectionEvent[] = toDefect.map((m) => ({
      day: state.day,
      monsterName: m.name,
      monsterType: m.type,
    }));

    set((s) => ({
      todayDefections: events,
      capturedMonsters: s.capturedMonsters.filter((m) => !m.willDefect),
    }));
  },

  triggerOrganizeStock: () => {
    const bonuses = get().getOrganizeStockBonus();
    if (bonuses.length === 0) return;

    set((s) => ({
      ingredients: s.ingredients.map((ing) => {
        const bonus = bonuses.find((b) => b.ingredientId === ing.id);
        if (bonus) {
          return { ...ing, count: ing.count + bonus.count };
        }
        return ing;
      }),
    }));
  },

  addDefectedMonsterToWave: (monsters: CapturedMonster[]) => {
    const state = get();
    const startPos = state.path[0];
    const difficulty = 1 + (state.day - 1) * 0.2;
    const addedEnemies: Enemy[] = [];

    for (const m of monsters) {
      const cfg = ENEMY_CONFIGS[m.type];
      const enemy: Enemy = {
        id: genId(),
        type: m.type,
        hp: Math.floor(cfg.hp * difficulty * 1.3),
        maxHp: Math.floor(cfg.hp * difficulty * 1.3),
        x: startPos.x,
        y: startPos.y,
        pathIndex: 0,
        slowUntil: 0,
        slowFactor: 1,
        hitFlash: 0,
      };
      addedEnemies.push(enemy);
    }

    const extraType: EnemyType[] = ["cabbage", "potato", "tomato"];
    for (let i = 0; i < monsters.length * 2; i++) {
      const t = extraType[i % extraType.length];
      const cfg = ENEMY_CONFIGS[t];
      const enemy: Enemy = {
        id: genId(),
        type: t,
        hp: Math.floor(cfg.hp * difficulty),
        maxHp: Math.floor(cfg.hp * difficulty),
        x: startPos.x,
        y: startPos.y,
        pathIndex: 0,
        slowUntil: 0,
        slowFactor: 1,
        hitFlash: 0,
      };
      addedEnemies.push(enemy);
    }

    set((s) => ({
      enemies: [...s.enemies, ...addedEnemies],
    }));

    return addedEnemies;
  },

  clearPendingDefections: () => set({ defectMonstersPending: [] }),
}));

export function getTowerStats(tower: { type: TowerType; level: number }) {
  const config = TOWER_CONFIGS[tower.type];
  const mult = Math.pow(config.upgradeMultiplier, tower.level - 1);
  const damageBoost = useGameStore.getState().getTowerDamageBoost();
  return {
    damage: Math.floor(config.damage * mult * (1 + damageBoost)),
    range: config.range + (tower.level - 1) * 10,
    fireRate: Math.max(200, config.fireRate - (tower.level - 1) * 80),
    upgradeCost:
      tower.level >= 5
        ? 0
        : Math.floor(
            config.upgradeCost * Math.pow(config.upgradeMultiplier, tower.level - 1)
          ),
  };
}

export function getTowerPixelPos(tower: { gridX: number; gridY: number }) {
  return {
    x: tower.gridX * CELL_SIZE + CELL_SIZE / 2,
    y: tower.gridY * CELL_SIZE + CELL_SIZE / 2,
  };
}
