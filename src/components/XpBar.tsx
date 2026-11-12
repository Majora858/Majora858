import { levelFromXp } from "@/lib/gamification";

export function XpBar({ xp, compact = false }: { xp: number; compact?: boolean }) {
  const { level, xpIntoLevel, xpForNextLevel } = levelFromXp(xp);
  const pct = Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100));

  return (
    <div className={compact ? "w-full" : "w-full max-w-xs"}>
      <div className="flex items-center justify-between text-xs font-medium text-gray-500 mb-1">
        <span>Level {level}</span>
        <span>
          {xpIntoLevel} / {xpForNextLevel} XP
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
