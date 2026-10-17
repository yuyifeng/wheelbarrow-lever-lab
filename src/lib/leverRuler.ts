export type LeverSide = "left" | "right";
export type LeverOutcome = "left-down" | "balanced" | "right-down";
export type LeverType = "effort-saving" | "equal-arm" | "effort-consuming";

export interface LeverRulerState {
  leftCount: number;
  leftDistance: number;
  rightCount: number;
  rightDistance: number;
}

export type LeverRulerAction =
  | { type: "set-distance"; side: LeverSide; distance: number }
  | { type: "change-count"; side: LeverSide; delta: number };

export interface LeverRulerResult {
  leftMoment: number;
  rightMoment: number;
  outcome: LeverOutcome;
  leverType: LeverType;
  angle: number;
}

export const MIN_HOOK_COUNT = 1;
export const MAX_HOOK_COUNT = 5;
export const MIN_HOOK_DISTANCE = 1;
export const MAX_HOOK_DISTANCE = 5;

export const createInitialLeverRulerState = (): LeverRulerState => ({
  leftCount: 2,
  leftDistance: 2,
  rightCount: 1,
  rightDistance: 4,
});

const clampInteger = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(value)));

export function calculateLeverResult(
  state: LeverRulerState,
): LeverRulerResult {
  const leftMoment = state.leftCount * state.leftDistance;
  const rightMoment = state.rightCount * state.rightDistance;
  const difference = rightMoment - leftMoment;
  const outcome: LeverOutcome =
    difference === 0
      ? "balanced"
      : difference > 0
        ? "right-down"
        : "left-down";
  const leverType: LeverType =
    state.rightDistance === state.leftDistance
      ? "equal-arm"
      : state.rightDistance > state.leftDistance
        ? "effort-saving"
        : "effort-consuming";
  const angle =
    difference === 0
      ? 0
      : Math.sign(difference) *
        Math.min(9, 3 + Math.abs(difference) * 0.75);

  return { leftMoment, rightMoment, outcome, leverType, angle };
}

export function leverRulerReducer(
  state: LeverRulerState,
  action: LeverRulerAction,
): LeverRulerState {
  if (action.type === "set-distance") {
    return {
      ...state,
      [`${action.side}Distance`]: clampInteger(
        action.distance,
        MIN_HOOK_DISTANCE,
        MAX_HOOK_DISTANCE,
      ),
    };
  }

  const countKey = `${action.side}Count` as
    | "leftCount"
    | "rightCount";
  return {
    ...state,
    [countKey]: clampInteger(
      state[countKey] + action.delta,
      MIN_HOOK_COUNT,
      MAX_HOOK_COUNT,
    ),
  };
}
