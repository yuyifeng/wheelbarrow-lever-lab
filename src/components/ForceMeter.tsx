import type { ForceMeterData } from "../domain/experiment";

interface ForceMeterProps {
  force: number;
  meter: ForceMeterData;
  compact?: boolean;
}

export function ForceMeter({
  force,
  meter,
  compact = false,
}: ForceMeterProps) {
  return (
    <div
      className={`force-meter force-meter--${meter.tone}${
        compact ? " force-meter--compact" : ""
      }`}
      role="img"
      aria-label={`力量格子，当前拉力 ${Math.round(force)} 牛，每格代表 10 牛`}
    >
      {meter.segments.map((fill, index) => (
        <span className="force-meter__segment" key={index} aria-hidden="true">
          <span
            className="force-meter__fill"
            style={{ width: `${fill * 100}%` }}
          />
        </span>
      ))}
    </div>
  );
}
