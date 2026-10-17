import {
  EXPERIMENT_THREE_LOAD_POSITION,
  INITIAL_EFFORT_ARM,
  INITIAL_LOAD_ARM,
  MAX_ANGLE,
  MAX_FULCRUM_POSITION,
  MIN_ARM_GAP,
  MIN_LOAD_ARM,
  type DragTarget,
  type ExperimentMode,
  type ExperimentState,
} from "../domain/experiment";
import { calculateRequiredForce, clamp } from "./leverPhysics";

export type ExperimentAction =
  | { type: "set-mode"; mode: ExperimentMode }
  | { type: "start-drag"; target: Exclude<DragTarget, null> }
  | { type: "update-effort"; effortArm: number; angle: number }
  | { type: "update-load"; loadArm: number }
  | { type: "update-fulcrum"; position: number }
  | { type: "set-angle"; angle: number }
  | { type: "end-drag" }
  | { type: "drop-step" }
  | { type: "add-record" }
  | { type: "delete-record"; id: number }
  | { type: "clear-records" };

export function experimentReducer(
  state: ExperimentState,
  action: ExperimentAction,
): ExperimentState {
  switch (action.type) {
    case "set-mode":
      return {
        ...state,
        mode: action.mode,
        effortArm: INITIAL_EFFORT_ARM,
        loadArm:
          action.mode === "fulcrum-distance"
            ? EXPERIMENT_THREE_LOAD_POSITION
            : INITIAL_LOAD_ARM,
        fulcrumPosition: 0,
        angle: 0,
        dragTarget: null,
        isDropping: false,
      };

    case "start-drag": {
      const canDrag =
        action.target === "effort" ||
        (action.target === "load" && state.mode === "load-distance") ||
        (action.target === "fulcrum" &&
          state.mode === "fulcrum-distance");
      if (!canDrag) {
        return state;
      }
      return {
        ...state,
        dragTarget: action.target,
        isDropping: false,
      };
    }

    case "update-effort": {
      const effortArm =
        state.mode === "effort-distance"
          ? clamp(
              action.effortArm,
              state.loadArm + MIN_ARM_GAP,
              INITIAL_EFFORT_ARM,
            )
          : state.effortArm;

      return {
        ...state,
        effortArm,
        angle: clamp(action.angle, 0, MAX_ANGLE),
      };
    }

    case "update-load":
      if (state.mode !== "load-distance") {
        return state;
      }
      return {
        ...state,
        loadArm: clamp(
          action.loadArm,
          MIN_LOAD_ARM,
          state.effortArm - MIN_ARM_GAP,
        ),
      };

    case "update-fulcrum": {
      if (state.mode !== "fulcrum-distance") return state;
      const fulcrumPosition = clamp(
        action.position,
        0,
        MAX_FULCRUM_POSITION,
      );
      return {
        ...state,
        fulcrumPosition,
        effortArm: INITIAL_EFFORT_ARM - fulcrumPosition,
        loadArm: EXPERIMENT_THREE_LOAD_POSITION - fulcrumPosition,
      };
    }

    case "set-angle":
      return {
        ...state,
        angle: clamp(action.angle, 0, MAX_ANGLE),
        isDropping: false,
      };

    case "end-drag":
      return {
        ...state,
        dragTarget: null,
        isDropping: state.angle > 0,
      };

    case "drop-step": {
      if (!state.isDropping) return state;
      const angle = Math.max(0, state.angle - 2);
      return {
        ...state,
        angle,
        isDropping: angle > 0,
      };
    }

    case "add-record": {
      const record = {
        id: state.nextRecordId,
        mode: state.mode,
        effortArm: state.effortArm,
        loadArm: state.loadArm,
        fulcrumPosition: state.fulcrumPosition,
        force: calculateRequiredForce(state.effortArm, state.loadArm),
      };
      return {
        ...state,
        records: [record, ...state.records],
        nextRecordId: state.nextRecordId + 1,
      };
    }

    case "delete-record":
      return {
        ...state,
        records: state.records.filter((record) => record.id !== action.id),
      };

    case "clear-records":
      return {
        ...state,
        records: [],
      };

    default:
      return state;
  }
}
