import { useGameStore } from "@/store/useGameStore";
import Card from "@/components/common/Card";
import { CAPTURE_TOOL_CONFIGS, MONSTER_DEFAULT_STATS } from "@/game/config";
import type { CaptureToolType } from "@/types/game";

export default function CaptureToolSelect() {
  const {
    captureTools,
    gold,
    buyCaptureTool,
    selectedCaptureTool,
    selectCaptureTool,
    capturedMonsters,
  } = useGameStore();

  const handleSelect = (type: CaptureToolType) => {
    const tool = captureTools.find((t) => t.type === type);
    if (!tool || tool.count <= 0) return;
    if (selectedCaptureTool === type) {
      selectCaptureTool(null);
    } else {
      selectCaptureTool(type);
    }
  };

  return (
    <Card title="捕获工具" icon="🪤" className="mb-4">
      <div className="space-y-3">
        {captureTools.map((tool) => {
          const cfg = CAPTURE_TOOL_CONFIGS[tool.type];
          const isSelected = selectedCaptureTool === tool.type;
          const canBuy1 = gold >= cfg.cost;
          const canBuy5 = gold >= cfg.cost * 5;
          const disabled = tool.count <= 0;

          return (
            <div
              key={tool.type}
              className={`p-3 rounded-lg border-2 transition-all ${
                isSelected
                  ? "bg-green-50 border-green-400 shadow-md scale-[1.02]"
                  : "bg-gradient-to-r from-slate-50 to-indigo-50 border-indigo-200 hover:border-indigo-400"
              } ${disabled && !isSelected ? "opacity-60" : ""}`}
            >
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => !disabled && handleSelect(tool.type)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{cfg.emoji}</span>
                  <div>
                    <div className="font-bold text-slate-800">{cfg.name}</div>
                    <div className="text-xs text-slate-500">
                      成功率 {Math.floor(cfg.baseSuccessRate * 100)}%
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">数量</div>
                  <div
                    className={`font-bold text-lg ${
                      tool.count > 0 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    x{tool.count}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-2 mb-2">
                {cfg.description}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    buyCaptureTool(tool.type, 1);
                  }}
                  disabled={!canBuy1}
                  className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-all ${
                    canBuy1
                      ? "bg-indigo-500 text-white hover:bg-indigo-600 shadow"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  补购💰{cfg.cost}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    buyCaptureTool(tool.type, 5);
                  }}
                  disabled={!canBuy5}
                  className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-all ${
                    canBuy5
                      ? "bg-purple-500 text-white hover:bg-purple-600 shadow"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  x5 💰{cfg.cost * 5}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100">
        <div className="text-xs text-slate-600 flex items-center gap-1 mb-1">
          <span>📖</span>
          <span>
            敌人血量 ≤ {MONSTER_DEFAULT_STATS.captureHpThreshold * 100}% 时可捕获
          </span>
        </div>
        <div className="text-xs text-slate-600 flex items-center gap-1">
          <span>🏠</span>
          <span>已收编: {capturedMonsters.length} 只食材怪</span>
        </div>
      </div>
    </Card>
  );
}
