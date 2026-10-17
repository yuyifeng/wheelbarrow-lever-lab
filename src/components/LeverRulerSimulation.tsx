import {
  Minus,
  MoveHorizontal,
  Plus,
  Scale,
  SearchCheck,
} from "lucide-react";
import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

import type { LeverRulerExperimentModel } from "../hooks/useLeverRulerExperiment";
import {
  MAX_HOOK_COUNT,
  MIN_HOOK_COUNT,
  type LeverOutcome,
  type LeverSide,
  type LeverType,
} from "../lib/leverRuler";

interface LeverRulerSimulationProps {
  experiment: LeverRulerExperimentModel;
}

const outcomeText: Record<LeverOutcome, string> = {
  "left-down": "左端下沉",
  balanced: "杠杆平衡",
  "right-down": "右端下沉",
};

const sideText: Record<LeverSide, string> = {
  left: "阻力点",
  right: "用力点",
};

const leverTypeText: Record<LeverType, string> = {
  "effort-saving": "省力杠杆",
  "equal-arm": "等臂杠杆",
  "effort-consuming": "费力杠杆",
};

const leverTypeReason: Record<LeverType, string> = {
  "effort-saving": "用力臂比阻力臂长",
  "equal-arm": "用力臂与阻力臂相等",
  "effort-consuming": "用力臂比阻力臂短",
};

export function LeverRulerSimulation({
  experiment,
}: LeverRulerSimulationProps) {
  const { state, result } = experiment;
  const stageRef = useRef<HTMLDivElement>(null);
  const [revealedArms, setRevealedArms] = useState<string | null>(null);
  const currentArms = `${state.leftDistance}-${state.rightDistance}`;
  const isLeverTypeVisible = revealedArms === currentArms;
  const rulerStyle = {
    "--ruler-angle": `${result.angle}deg`,
    "--ruler-counter-angle": `${-result.angle}deg`,
  } as CSSProperties;

  const updateDistanceFromPointer = (
    side: LeverSide,
    event: PointerEvent<HTMLDivElement>,
  ) => {
    const stage = stageRef.current;
    if (!stage) return;

    const rect = stage.getBoundingClientRect();
    const beamWidth = rect.width * 0.9;
    const centerX = rect.left + rect.width / 2;
    const gridWidth = beamWidth / 10;
    const distance =
      side === "left"
        ? (centerX - event.clientX) / gridWidth
        : (event.clientX - centerX) / gridWidth;
    experiment.setDistance(side, distance);
  };

  const startDrag = (
    side: LeverSide,
    event: PointerEvent<HTMLDivElement>,
  ) => {
    event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
    updateDistanceFromPointer(side, event);
  };

  const moveDrag = (
    side: LeverSide,
    event: PointerEvent<HTMLDivElement>,
  ) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    event.preventDefault();
    updateDistanceFromPointer(side, event);
  };

  const handlePositionKey = (
    side: LeverSide,
    event: KeyboardEvent<HTMLDivElement>,
  ) => {
    const distance =
      side === "left" ? state.leftDistance : state.rightDistance;
    const direction = side === "left" ? -1 : 1;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      experiment.setDistance(side, distance - direction);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      experiment.setDistance(side, distance + direction);
    }
    if (event.key === "Home") {
      event.preventDefault();
      experiment.setDistance(side, 1);
    }
    if (event.key === "End") {
      event.preventDefault();
      experiment.setDistance(side, 5);
    }
  };

  const renderHookGroup = (side: LeverSide) => {
    const count = side === "left" ? state.leftCount : state.rightCount;
    const distance =
      side === "left" ? state.leftDistance : state.rightDistance;
    const position = 50 + (side === "left" ? -1 : 1) * distance * 10;

    return (
      <div
        className={`hook-group hook-group--${side}`}
        style={{ left: `${position}%` }}
        role="slider"
        tabIndex={0}
        aria-label={`${sideText[side]}钩码位置`}
        aria-valuemin={1}
        aria-valuemax={5}
        aria-valuenow={distance}
        aria-valuetext={`距离支点 ${distance} 格`}
        onPointerDown={(event) => startDrag(side, event)}
        onPointerMove={(event) => moveDrag(side, event)}
        onKeyDown={(event) => handlePositionKey(side, event)}
      >
        <span className="hook-group__handle">
          <MoveHorizontal aria-hidden="true" />
          {sideText[side]} {distance} 格
        </span>
        <span className="hook-group__line" />
        <span className="hook-group__hook" />
        <span className="hook-weights" aria-hidden="true">
          {Array.from({ length: count }, (_, index) => (
            <span className="hook-weight" key={index} />
          ))}
        </span>
      </div>
    );
  };

  const renderCountControl = (side: LeverSide) => {
    const count = side === "left" ? state.leftCount : state.rightCount;
    const distance =
      side === "left" ? state.leftDistance : state.rightDistance;
    const moment =
      side === "left" ? result.leftMoment : result.rightMoment;

    return (
      <section className={`hook-control hook-control--${side}`}>
        <strong>{sideText[side]}钩码</strong>
        <div className="hook-stepper" aria-label={`${sideText[side]}钩码数量`}>
          <button
            type="button"
            title="减少钩码"
            aria-label={`减少${sideText[side]}钩码`}
            disabled={count === MIN_HOOK_COUNT}
            onClick={() => experiment.changeCount(side, -1)}
          >
            <Minus aria-hidden="true" />
          </button>
          <output aria-live="polite">{count} 个</output>
          <button
            type="button"
            title="增加钩码"
            aria-label={`增加${sideText[side]}钩码`}
            disabled={count === MAX_HOOK_COUNT}
            onClick={() => experiment.changeCount(side, 1)}
          >
            <Plus aria-hidden="true" />
          </button>
        </div>
        <span>
          {count} × {distance} = <b>{moment}</b>
        </span>
      </section>
    );
  };

  return (
    <div className="lever-ruler-experiment">
      <div className="lever-ruler-stage" ref={stageRef}>
        <div className="lever-ruler-status" aria-live="polite">
          <Scale aria-hidden="true" />
          <strong>{outcomeText[result.outcome]}</strong>
        </div>

        <div className="ruler-assembly" style={rulerStyle}>
          <div className="ruler-beam">
            {Array.from({ length: 11 }, (_, index) => (
              <span
                className={`ruler-tick${index === 5 ? " is-center" : ""}`}
                key={index}
              >
                <i>{Math.abs(index - 5)}</i>
              </span>
            ))}
          </div>
          {renderHookGroup("left")}
          {renderHookGroup("right")}
        </div>

        <div className="ruler-fulcrum" aria-label="固定支点">
          <span />
          <strong>支点</strong>
        </div>
        <p className="lever-ruler-caption">
          拖动阻力点和用力点，比较力臂长度与两侧力矩
        </p>
      </div>

      <div className="lever-ruler-dashboard">
        {renderCountControl("left")}
        <section className={`moment-result moment-result--${result.outcome}`}>
          <span>力矩比较</span>
          <strong>
            {result.leftMoment} {result.outcome === "balanced" ? "=" : result.leftMoment > result.rightMoment ? ">" : "<"}{" "}
            {result.rightMoment}
          </strong>
          <b>{outcomeText[result.outcome]}</b>
          <div className="lever-type-slot" aria-live="polite">
            {isLeverTypeVisible ? (
              <div className={`lever-type lever-type--${result.leverType}`}>
                <em>{leverTypeText[result.leverType]}</em>
                <small>{leverTypeReason[result.leverType]}</small>
              </div>
            ) : (
              <button
                type="button"
                className="lever-type-button"
                onClick={() => setRevealedArms(currentArms)}
              >
                <SearchCheck aria-hidden="true" />
                判断杠杆类型
              </button>
            )}
          </div>
        </section>
        {renderCountControl("right")}
      </div>
    </div>
  );
}
