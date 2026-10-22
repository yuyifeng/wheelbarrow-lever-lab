import { useMemo, useReducer } from "react";

import {
  calculateLeverResult,
  createInitialLeverRulerState,
  leverRulerReducer,
  type LeverSide,
} from "../lib/leverRuler";

export function useLeverRulerExperiment() {
  const [state, dispatch] = useReducer(
    leverRulerReducer,
    undefined,
    createInitialLeverRulerState,
  );
  const result = useMemo(() => calculateLeverResult(state), [state]);

  return {
    state,
    result,
    setEffortSide: (side: LeverSide) =>
      dispatch({ type: "set-effort-side", side }),
    setDistance: (side: LeverSide, distance: number) =>
      dispatch({ type: "set-distance", side, distance }),
    changeCount: (side: LeverSide, delta: number) =>
      dispatch({ type: "change-count", side, delta }),
  };
}

export type LeverRulerExperimentModel = ReturnType<
  typeof useLeverRulerExperiment
>;
