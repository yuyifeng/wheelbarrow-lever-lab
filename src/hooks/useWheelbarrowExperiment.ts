import { useEffect, useMemo, useReducer } from "react";

import { createInitialExperimentState } from "../domain/experiment";
import { experimentReducer } from "../lib/experimentReducer";
import {
  calculateRequiredForce,
  getForceMeter,
} from "../lib/leverPhysics";

export function useWheelbarrowExperiment() {
  const [state, dispatch] = useReducer(
    experimentReducer,
    undefined,
    createInitialExperimentState,
  );

  const force = useMemo(
    () => calculateRequiredForce(state.effortArm, state.loadArm),
    [state.effortArm, state.loadArm],
  );
  const meter = useMemo(() => getForceMeter(force), [force]);

  useEffect(() => {
    if (!state.isDropping) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      dispatch({ type: "set-angle", angle: 0 });
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      dispatch({ type: "drop-step" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [state.angle, state.isDropping]);

  return {
    state,
    force,
    meter,
    setMode: (mode: typeof state.mode) =>
      dispatch({ type: "set-mode", mode }),
    startDrag: (target: "effort" | "load" | "fulcrum") =>
      dispatch({ type: "start-drag", target }),
    updateEffort: (effortArm: number, angle: number) =>
      dispatch({ type: "update-effort", effortArm, angle }),
    updateLoad: (loadArm: number) =>
      dispatch({ type: "update-load", loadArm }),
    updateFulcrum: (position: number) =>
      dispatch({ type: "update-fulcrum", position }),
    setAngle: (angle: number) =>
      dispatch({ type: "set-angle", angle }),
    endDrag: () => dispatch({ type: "end-drag" }),
    addRecord: () => dispatch({ type: "add-record" }),
    deleteRecord: (id: number) =>
      dispatch({ type: "delete-record", id }),
    clearRecords: () => dispatch({ type: "clear-records" }),
  };
}

export type WheelbarrowExperimentModel = ReturnType<
  typeof useWheelbarrowExperiment
>;
