import { useState } from "react";
import { useGameStore } from "@/store/useGameStore";
import Card from "@/components/common/Card";
import { MONSTER_ABILITY_CONFIGS, MONSTER_DEFAULT_STATS } from "@/game/config";
import type { CapturedMonster } from "@/types/game";
import { UtensilsCrossed, Heart, Star, AlertTriangle, Trash2 } from "lucide-react";

function StatBar({
  label,
  value,
  max,
  color,
  icon,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  icon: string;
}) {
  const ratio = Math.max(0, Math.min(1, value / max));
  const low = ratio <= 0.25;
  return (
    <div className="mb-1.5">
      <div className="flex justify-between text-xs mb-0.5">
        <span className="text-slate-600 flex items-center gap-1">
          <span>{icon}</span>
          {label}
        </span>
        <span className={`font-bold ${low ? "text-red-500 animate-pulse" : "text-slate-700"}`}>
          {Math.floor(value)} / {max}
        </span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${color}`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}

function MonsterCard({ monster }: { monster: CapturedMonster }) {
  const { recipes, feedMonster, releaseMonster, day } = useGameStore();
  const [feedMsg, setFeedMsg] = useState<string | null>(null);

  const abilityCfg = MONSTER_ABILITY_CONFIGS[monster.type as keyof typeof MONSTER_ABILITY_CONFIGS];
  const preferredRecipe = recipes.find((r) => r.id === monster.preferredRecipeId);
  const daysCaptured = day - monster.capturedDay + 1;

  const showMsg = (msg: string) => {
    setFeedMsg(msg);
    setTimeout(() => setFeedMsg(null), 1200);
  };

  const handleFeed = (recipeId: string) => {
    const recipe = recipes.find((r) => r.id === recipeId);
    if (!recipe || recipe.prepared <= 0) return;
    const ok = feedMonster(monster.id, recipeId);
    if (ok) {
      const isPreferred = recipeId === monster.preferredRecipeId;
      showMsg(
        isPreferred
          ? `💕 最爱！饱腹+${MONSTER_DEFAULT_STATS.hungerFedFull} 忠诚+${MONSTER_DEFAULT_STATS.loyaltyFedPreferred}`
          : `😋 饱腹+${MONSTER_DEFAULT_STATS.hungerFedOther} 忠诚+${MONSTER_DEFAULT_STATS.loyaltyFedOther}`
      );
    }
  };

  const hungerLow = monster.hunger / monster.maxHunger <= 0.25;
  const loyaltyLow = monster.loyalty / monster.maxLoyalty <= 0.25;

  const abilityDesc = abilityCfg?.description ?? "暂无能力";

  return (
    <div
      className={`p-3 rounded-xl border-2 relative ${
        monster.willDefect
          ? "bg-red-50 border-red-400 animate-pulse"
          : hungerLow || loyaltyLow
          ? "bg-yellow-50 border-yellow-300"
          : "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200"
      }`}
    >
      {monster.willDefect && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-md">
          ⚠️ 将叛逃
        </div>
      )}

      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-4xl drop-shadow-sm">{monster.emoji}</span>
          <div>
            <div className="font-bold text-slate-800">{monster.name}</div>
            <div className="text-xs text-slate-500">
              收编第 {daysCaptured} 天
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            if (confirm(`确定要释放 ${monster.name} 吗？`)) releaseMonster(monster.id);
          }}
          className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
          title="释放怪物"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <StatBar
        label="饱腹度"
        value={monster.hunger}
        max={monster.maxHunger}
        color="bg-gradient-to-r from-amber-400 to-orange-500"
        icon="🍗"
      />
      <StatBar
        label="忠诚度"
        value={monster.loyalty}
        max={monster.maxLoyalty}
        color="bg-gradient-to-r from-pink-400 to-rose-500"
        icon="💖"
      />

      <div className="mt-2 p-2 bg-white/60 rounded-lg border border-white">
        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 mb-1">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          专属能力
        </div>
        <div className="text-xs text-slate-600">{abilityDesc}</div>
      </div>

      <div className="mt-2">
        <div className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
          <UtensilsCrossed className="w-3 h-3" />
          投喂菜品
          {preferredRecipe && (
            <span className="text-pink-500 ml-1">
              (最爱: {preferredRecipe.emoji} {preferredRecipe.name})
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {recipes
            .filter((r) => r.prepared > 0)
            .map((r) => {
              const isPreferred = r.id === monster.preferredRecipeId;
              return (
                <button
                  key={r.id}
                  onClick={() => handleFeed(r.id)}
                  className={`px-2 py-1 rounded-md text-xs font-medium shadow-sm transition-all hover:scale-105 ${
                    isPreferred
                      ? "bg-gradient-to-r from-pink-400 to-rose-400 text-white hover:shadow-md"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                  }`}
                  title={isPreferred ? "投喂喜爱食物，加成更多！" : "普通食物"}
                >
                  {r.emoji} {r.name}
                  <span className="opacity-70 ml-1">x{r.prepared}</span>
                </button>
              );
            })}
          {recipes.every((r) => r.prepared <= 0) && (
            <span className="text-xs text-slate-400 italic">
              还没准备菜品，先去菜单里做一些吧
            </span>
          )}
        </div>
        {feedMsg && (
          <div className="mt-1.5 text-xs font-medium text-emerald-600 animate-bounce-in">
            {feedMsg}
          </div>
        )}
      </div>

      {(hungerLow || loyaltyLow) && !monster.willDefect && (
        <div className="mt-2 p-1.5 bg-yellow-100 rounded text-xs text-yellow-800 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          {hungerLow && !loyaltyLow && "快饿扁了！赶紧投喂～"}
          {!hungerLow && loyaltyLow && "忠诚度偏低，建议投喂最爱菜品～"}
          {hungerLow && loyaltyLow && "情况危险！饥饿加忠诚双低！"}
        </div>
      )}
      {monster.willDefect && (
        <div className="mt-2 p-1.5 bg-red-100 rounded text-xs text-red-700 font-bold flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          警告：今晚将带队叛逃反扑！快投喂最爱菜品挽回！
        </div>
      )}
    </div>
  );
}

export default function MonsterPanel() {
  const {
    capturedMonsters,
    getIngredientDiscount,
    getTowerDamageBoost,
    getOrganizeStockBonus,
    todayDefections,
  } = useGameStore();

  const discount = getIngredientDiscount();
  const damageBoost = getTowerDamageBoost();
  const stockBonus = getOrganizeStockBonus();

  return (
    <Card title="食材怪伙伴" icon="👾" className="h-full">
      {todayDefections.length > 0 && (
        <div className="mb-3 p-3 bg-red-50 border-2 border-red-300 rounded-lg">
          <div className="text-sm font-bold text-red-700 mb-1 flex items-center gap-1">
            ⚔️ 昨晚有 {todayDefections.length} 只怪物叛逃并带队反扑！
          </div>
          <div className="flex flex-wrap gap-1">
            {todayDefections.map((d, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 bg-white rounded shadow-sm text-red-600"
              >
                {d.monsterName}
              </span>
            ))}
          </div>
        </div>
      )}

      {capturedMonsters.length > 0 && (
        <div className="mb-4 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
          <div className="text-sm font-bold text-emerald-800 mb-2 flex items-center gap-1">
            <Heart className="w-4 h-4 fill-emerald-500 text-emerald-500" />
            当前激活加成
          </div>
          <div className="grid grid-cols-1 gap-1.5 text-xs">
            {discount > 0 && (
              <div className="flex items-center justify-between bg-white/70 px-2 py-1 rounded">
                <span>🥔 土豆怪采购折扣</span>
                <span className="font-bold text-green-600">-{Math.floor(discount * 100)}%</span>
              </div>
            )}
            {damageBoost > 0 && (
              <div className="flex items-center justify-between bg-white/70 px-2 py-1 rounded">
                <span>🥩 肉块怪塔伤加成</span>
                <span className="font-bold text-red-600">+{Math.floor(damageBoost * 100)}%</span>
              </div>
            )}
            {stockBonus.length > 0 && (
              <div className="bg-white/70 px-2 py-1 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span>🥬 白菜/番茄怪整理库存</span>
                  <span className="font-bold text-emerald-600">今日赠送</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {stockBonus.map((b, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded"
                    >
                      {b.count}个食材
                    </span>
                  ))}
                </div>
              </div>
            )}
            {discount === 0 && damageBoost === 0 && stockBonus.length === 0 && (
              <div className="text-slate-500 italic text-center py-1">
                暂无激活加成，多收编不同怪物吧～
              </div>
            )}
          </div>
        </div>
      )}

      {capturedMonsters.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <div className="text-5xl mb-3">🥺</div>
          <div className="font-medium text-slate-700 mb-1">还没收编任何伙伴</div>
          <div className="text-xs">
            夜晚用捕网锅或安抚菜，抓住血量 ≤ 30% 的食材怪
          </div>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {capturedMonsters.map((m) => (
            <MonsterCard key={m.id} monster={m} />
          ))}
        </div>
      )}
    </Card>
  );
}
