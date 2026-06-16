import { useGameStore } from "@/store/useGameStore";
import Card from "@/components/common/Card";
import { ShoppingCart, TrendingDown } from "lucide-react";

export default function ShopPanel() {
  const { ingredients, gold, buyIngredient, getIngredientDiscount } = useGameStore();
  const discount = getIngredientDiscount();

  const handleBuy = (id: string, amount: number) => {
    buyIngredient(id, amount);
  };

  return (
    <Card title="食材采购" icon="🛒" className="h-full">
      {discount > 0 && (
        <div className="mb-3 p-2.5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-300 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-green-600" />
          <div className="text-sm">
            <span className="font-bold text-green-700">土豆怪折扣生效中：</span>
            <span className="text-green-600">-{Math.floor(discount * 100)}%</span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {ingredients.map((ing) => {
          const realPrice = Math.max(1, Math.floor(ing.price * (1 - discount)));
          const canAfford1 = gold >= realPrice;
          const canAfford5 = gold >= realPrice * 5;
          return (
            <div
              key={ing.id}
              className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 hover:border-kitchen-warm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{ing.emoji}</span>
                <div>
                  <div className="font-medium text-kitchen-brown">
                    {ing.name}
                  </div>
                  <div className="text-sm text-amber-700">
                    库存: <span className="font-bold">{ing.count}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <div className="text-sm font-bold text-yellow-700 flex items-center gap-1.5">
                  <span>💰 {realPrice}/个</span>
                  {discount > 0 && (
                    <span className="text-[10px] line-through text-gray-400">
                      {ing.price}
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleBuy(ing.id, 1)}
                    disabled={!canAfford1}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                      canAfford1
                        ? "bg-kitchen-warm text-white hover:bg-orange-500 shadow hover:shadow-md"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    买1
                  </button>
                  <button
                    onClick={() => handleBuy(ing.id, 5)}
                    disabled={!canAfford5}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                      canAfford5
                        ? "bg-orange-600 text-white hover:bg-orange-700 shadow hover:shadow-md"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    买5
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-sm text-yellow-800">
        <ShoppingCart className="w-4 h-4 inline mr-1" />
        提示：收编土豆怪可永久降低采购价！
      </div>
    </Card>
  );
}
