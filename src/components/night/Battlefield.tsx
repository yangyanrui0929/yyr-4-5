import { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/store/useGameStore";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  CELL_SIZE,
  GRID_COLS,
  GRID_ROWS,
} from "@/game/config";
import { gameTick, drawBattlefield, spawnWaveEnemies, isSpawnActive } from "@/game/towerEngine";

export default function Battlefield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverCell, setHoverCell] = useState<{ x: number; y: number } | null>(null);
  const animationRef = useRef<number>();
  const lastSpawnWaveRef = useRef<number>(-1);
  const [captureToast, setCaptureToast] = useState<string | null>(null);

  const {
    phase,
    waveInProgress,
    currentWave,
    placeTower,
    selectTower,
    towers,
    selectedTowerType,
    selectedCaptureTool,
    enemies,
    tryCaptureEnemy,
  } = useGameStore();

  const showToast = (msg: string) => {
    setCaptureToast(msg);
    setTimeout(() => setCaptureToast(null), 1500);
  };

  useEffect(() => {
    if (phase !== "night") return;

    let lastTime = 0;
    const tick = (now: number) => {
      if (now - lastTime >= 16) {
        gameTick(now);
        lastTime = now;
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) drawBattlefield(ctx, hoverCell);
      }

      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [phase, hoverCell]);

  useEffect(() => {
    if (phase !== "night") return;
    if (!waveInProgress) return;
    if (lastSpawnWaveRef.current === currentWave && isSpawnActive()) return;
    if (lastSpawnWaveRef.current === currentWave) return;

    lastSpawnWaveRef.current = currentWave;
    spawnWaveEnemies(currentWave);
  }, [waveInProgress, currentWave, phase]);

  useEffect(() => {
    if (phase !== "night") {
      lastSpawnWaveRef.current = -1;
    }
  }, [phase]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedTowerType) {
      if (hoverCell) setHoverCell(null);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const gx = Math.floor(x / CELL_SIZE);
    const gy = Math.floor(y / CELL_SIZE);
    if (gx >= 0 && gx < GRID_COLS && gy >= 0 && gy < GRID_ROWS) {
      if (!hoverCell || hoverCell.x !== gx || hoverCell.y !== gy) {
        setHoverCell({ x: gx, y: gy });
      }
    } else if (hoverCell) {
      setHoverCell(null);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const gx = Math.floor(x / CELL_SIZE);
    const gy = Math.floor(y / CELL_SIZE);

    if (selectedCaptureTool) {
      let nearestEnemy = null as null | typeof enemies[0];
      let nearestDist = 40;
      for (const en of enemies) {
        const dx = en.x - x;
        const dy = en.y - y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < nearestDist) {
          nearestDist = d;
          nearestEnemy = en;
        }
      }
      if (nearestEnemy) {
        const res = tryCaptureEnemy(nearestEnemy.id, selectedCaptureTool);
        showToast(res.message);
      } else {
        showToast("请点击敌人进行捕获");
      }
      return;
    }

    if (selectedTowerType) {
      placeTower(gx, gy);
      return;
    }

    const clickedTower = towers.find(
      (t) => t.gridX === gx && t.gridY === gy
    );
    if (clickedTower) {
      selectTower(clickedTower.id);
    } else {
      selectTower(null);
    }
  };

  const handleMouseLeave = () => {
    if (hoverCell) setHoverCell(null);
  };

  if (phase !== "night") return null;

  let cursorClass = "cursor-pointer";
  let hintText = "💡 点击防御塔查看详情与升级，或选择左侧塔进行放置";
  if (selectedTowerType) {
    cursorClass = "cursor-crosshair";
    hintText = "💡 点击空地放置防御塔，绿色区域可放置";
  } else if (selectedCaptureTool) {
    cursorClass = "cursor-grab";
    hintText = "🎯 选中了捕获道具，点击血量≤30%的敌人进行收编！BOSS无法收编";
  }

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-kitchen-brown"
        style={{ background: "#3E2723" }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={cursorClass}
          style={{
            display: "block",
            maxWidth: "100%",
            height: "auto",
            imageRendering: "pixelated",
          }}
        />
        {captureToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce-in text-sm font-medium pointer-events-none">
            {captureToast}
          </div>
        )}
      </div>
      <div className="mt-2 text-xs text-gray-500 text-center max-w-md">
        {hintText}
      </div>
    </div>
  );
}
