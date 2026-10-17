import { ArrowUp, Lock, MoveHorizontal } from "lucide-react";
import {
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

import type { WheelbarrowExperimentModel } from "../hooks/useWheelbarrowExperiment";
import {
  MAX_ANGLE,
  MAX_FULCRUM_POSITION,
  MIN_LOAD_ARM,
} from "../domain/experiment";
import { ForceMeter } from "./ForceMeter";

interface WheelbarrowSimulationProps {
  experiment: WheelbarrowExperimentModel;
}

export function WheelbarrowSimulation({
  experiment,
}: WheelbarrowSimulationProps) {
  const { state, force, meter } = experiment;
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastTickRef = useRef(0);
  const loadLocked = state.mode !== "load-distance";
  const effortPositionLocked = state.mode !== "effort-distance";
  const fulcrumMovable = state.mode === "fulcrum-distance";

  const ensureAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    if (audioContextRef.current.state === "suspended") {
      void audioContextRef.current.resume();
    }
  };

  const playTick = (value: number) => {
    if (Math.abs(value - lastTickRef.current) < 3) return;
    lastTickRef.current = value;

    const context = audioContextRef.current;
    if (!context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(400, context.currentTime);
    gain.gain.setValueAtTime(0.04, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      context.currentTime + 0.05,
    );
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.05);
  };

  const startDrag = (
    target: "effort" | "load" | "fulcrum",
    event: PointerEvent<HTMLDivElement>,
  ) => {
    if (target === "load" && loadLocked) return;
    if (target === "fulcrum" && !fulcrumMovable) return;
    ensureAudio();
    event.currentTarget.setPointerCapture(event.pointerId);
    experiment.startDrag(target);
  };

  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!state.dragTarget) return;
    event.preventDefault();

    const rect = event.currentTarget.getBoundingClientRect();
    const pixelsPerCentimeter = (rect.width * 0.8) / 100;
    const beamStartX = rect.left + rect.width * 0.1;
    const fulcrumX =
      beamStartX + pixelsPerCentimeter * state.fulcrumPosition;
    const fulcrumY = rect.bottom - rect.height * 0.18;
    const dx = event.clientX - fulcrumX;
    const dy = fulcrumY - event.clientY;

    if (state.dragTarget === "fulcrum") {
      const position =
        (event.clientX - beamStartX) / pixelsPerCentimeter;
      experiment.updateFulcrum(position);
      playTick(Math.round(position));
      return;
    }

    if (state.dragTarget === "effort") {
      const effortArm =
        Math.sqrt(dx * dx + dy * dy) / pixelsPerCentimeter;
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      experiment.updateEffort(effortArm, angle);
      playTick(Math.round(effortArm + angle * 2));
      return;
    }

    const angleInRadians = (state.angle * Math.PI) / 180;
    const projectedDistance =
      dx * Math.cos(angleInRadians) + dy * Math.sin(angleInRadians);
    const loadArm = projectedDistance / pixelsPerCentimeter;
    experiment.updateLoad(loadArm);
    playTick(Math.round(loadArm));
  };

  const handleEffortKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft" && !effortPositionLocked) {
      event.preventDefault();
      experiment.updateEffort(state.effortArm - 2, state.angle);
    }
    if (event.key === "ArrowRight" && !effortPositionLocked) {
      event.preventDefault();
      experiment.updateEffort(state.effortArm + 2, state.angle);
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      experiment.setAngle(state.angle + 2);
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      experiment.setAngle(state.angle - 2);
    }
  };

  const handleEffortKeyUp = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      experiment.endDrag();
    }
  };

  const handleLoadKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (loadLocked) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      experiment.updateLoad(state.loadArm - 2);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      experiment.updateLoad(state.loadArm + 2);
    }
  };

  const handleFulcrumKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
  ) => {
    if (!fulcrumMovable) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      experiment.updateFulcrum(state.fulcrumPosition - 2);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      experiment.updateFulcrum(state.fulcrumPosition + 2);
    }
  };

  const leverStyle = {
    "--lever-angle": `${state.angle}deg`,
    "--fulcrum-position": `${state.fulcrumPosition}%`,
  } as CSSProperties;
  const fulcrumStyle = {
    left: `${10 + state.fulcrumPosition * 0.8}%`,
  } as CSSProperties;
  const loadStyle = {
    left: `${state.loadArm + state.fulcrumPosition}%`,
    "--counter-angle": `${state.angle}deg`,
  } as CSSProperties;
  const effortStyle = {
    left: `${state.effortArm + state.fulcrumPosition}%`,
    "--counter-angle": `${state.angle}deg`,
  } as CSSProperties;
  return (
    <section
      className="simulation-area"
      aria-label="独轮车杠杆互动实验区"
      onPointerMove={moveDrag}
      onPointerUp={experiment.endDrag}
      onPointerCancel={experiment.endDrag}
    >
      <div
        className={`fulcrum-node${fulcrumMovable ? " is-movable" : ""}`}
        style={fulcrumStyle}
        role="slider"
        tabIndex={0}
        aria-label={
          fulcrumMovable
            ? `支点向石头移动了 ${Math.round(state.fulcrumPosition)} 厘米`
            : "支点位置固定"
        }
        aria-disabled={!fulcrumMovable}
        aria-valuemin={0}
        aria-valuemax={MAX_FULCRUM_POSITION}
        aria-valuenow={Math.round(state.fulcrumPosition)}
        onPointerDown={(event) => startDrag("fulcrum", event)}
        onKeyDown={handleFulcrumKeyDown}
      >
        {fulcrumMovable && (
          <span className="fulcrum-state">
            <MoveHorizontal aria-hidden="true" />
            可左右移动
          </span>
        )}
        <div className="wheel">
          <span className="wheel__hub" />
        </div>
        <span className="fulcrum-label">支点</span>
      </div>

      <div className="lever-wrapper" style={leverStyle}>
        <div className="lever">
          <div className="lever__marks">
            {Array.from({ length: 10 }, (_, index) => (
              <span key={index} />
            ))}
          </div>
        </div>

        <div
          className={`simulation-element load-element${
            loadLocked ? " is-locked" : ""
          }`}
          style={loadStyle}
          role="slider"
          tabIndex={0}
          aria-label={
            loadLocked
              ? state.mode === "fulcrum-distance"
                ? "石头位置固定"
                : "石头位置固定在 30 厘米"
              : `石头位置 ${Math.round(state.loadArm)} 厘米`
          }
          aria-disabled={loadLocked}
          aria-valuemin={MIN_LOAD_ARM}
          aria-valuemax={85}
          aria-valuenow={Math.round(state.loadArm)}
          onPointerDown={(event) => startDrag("load", event)}
          onKeyDown={handleLoadKeyDown}
        >
          <span className="element-state">
            {loadLocked ? (
              <>
                <Lock aria-hidden="true" />
                位置固定
              </>
            ) : (
              <>
                <MoveHorizontal aria-hidden="true" />
                可左右移动
              </>
            )}
          </span>
          <div className="load-box" aria-hidden="true">
            <strong>100N</strong>
          </div>
        </div>

        <div
          className="simulation-element effort-element"
          style={effortStyle}
          role="slider"
          tabIndex={0}
          aria-label={`手的位置 ${Math.round(state.effortArm)} 厘米，可用上下方向键抬起`}
          aria-valuemin={45}
          aria-valuemax={100}
          aria-valuenow={Math.round(state.effortArm)}
          onPointerDown={(event) => startDrag("effort", event)}
          onKeyDown={handleEffortKeyDown}
          onKeyUp={handleEffortKeyUp}
        >
          <span className="effort-cue">
            <ArrowUp aria-hidden="true" />
            按住向上拉起
          </span>
          <div className="force-tooltip">
            <strong>{Math.round(force)} N</strong>
            <ForceMeter force={force} meter={meter} compact />
          </div>
          <span className="element-state element-state--effort">
            {effortPositionLocked ? (
              <>
                <Lock aria-hidden="true" />
                距离固定，可抬起
              </>
            ) : (
              <>
                <MoveHorizontal aria-hidden="true" />
                可改变距离
              </>
            )}
          </span>
          <span className="effort-hand" aria-hidden="true">
            👆
          </span>
        </div>
      </div>

      <p className="simulation-caption" aria-live="polite">
        {state.mode === "effort-distance"
          ? "石头位置固定，拖动手改变远近并向上抬起。"
          : state.mode === "load-distance"
            ? "手的距离固定，先移动石头，再拖动手向上抬起。"
            : "手和石头位置固定，先移动支点，再拖动手向上抬起。"}
      </p>
      <span className="angle-status visually-hidden" aria-live="polite">
        当前抬起角度 {Math.round(Math.min(state.angle, MAX_ANGLE))} 度
      </span>
    </section>
  );
}
