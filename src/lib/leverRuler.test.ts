import { describe, expect, it } from "vitest";

import {
  calculateLeverResult,
  createInitialLeverRulerState,
  leverRulerReducer,
} from "./leverRuler";

describe("leverRuler", () => {
  it("starts balanced with two hooks at grid two and one at grid four", () => {
    const result = calculateLeverResult(createInitialLeverRulerState());

    expect(result.leftMoment).toBe(4);
    expect(result.rightMoment).toBe(4);
    expect(result.outcome).toBe("balanced");
    expect(result.leverType).toBe("effort-saving");
    expect(result.angle).toBe(0);
  });

  it("tilts toward the side with the larger moment", () => {
    const leftHeavy = calculateLeverResult({
      leftCount: 3,
      leftDistance: 3,
      rightCount: 1,
      rightDistance: 2,
      effortSide: "right",
    });
    const rightHeavy = calculateLeverResult({
      leftCount: 1,
      leftDistance: 1,
      rightCount: 2,
      rightDistance: 4,
      effortSide: "right",
    });

    expect(leftHeavy.outcome).toBe("left-down");
    expect(leftHeavy.angle).toBeLessThan(0);
    expect(rightHeavy.outcome).toBe("right-down");
    expect(rightHeavy.angle).toBeGreaterThan(0);
  });

  it("clamps hook counts between one and ten", () => {
    const initial = createInitialLeverRulerState();
    const minimum = leverRulerReducer(initial, {
      type: "change-count",
      side: "right",
      delta: -10,
    });
    const maximum = leverRulerReducer(initial, {
      type: "change-count",
      side: "left",
      delta: 10,
    });

    expect(minimum.rightCount).toBe(1);
    expect(maximum.leftCount).toBe(10);
  });

  it("rounds and clamps hook positions to the five ruler grids", () => {
    let state = leverRulerReducer(createInitialLeverRulerState(), {
      type: "set-distance",
      side: "left",
      distance: 3.6,
    });
    state = leverRulerReducer(state, {
      type: "set-distance",
      side: "right",
      distance: 10,
    });

    expect(state.leftDistance).toBe(4);
    expect(state.rightDistance).toBe(5);
  });

  it("classifies the lever by comparing effort and resistance arms", () => {
    const effortSaving = calculateLeverResult({
      leftCount: 2,
      leftDistance: 2,
      rightCount: 1,
      rightDistance: 4,
      effortSide: "right",
    });
    const equalArm = calculateLeverResult({
      leftCount: 1,
      leftDistance: 3,
      rightCount: 1,
      rightDistance: 3,
      effortSide: "right",
    });
    const effortConsuming = calculateLeverResult({
      leftCount: 1,
      leftDistance: 5,
      rightCount: 2,
      rightDistance: 2,
      effortSide: "right",
    });
    const leftEffortSaving = calculateLeverResult({
      leftCount: 1,
      leftDistance: 5,
      rightCount: 2,
      rightDistance: 2,
      effortSide: "left",
    });

    expect(effortSaving.leverType).toBe("effort-saving");
    expect(equalArm.leverType).toBe("equal-arm");
    expect(effortConsuming.leverType).toBe("effort-consuming");
    expect(leftEffortSaving.leverType).toBe("effort-saving");
  });

  it("changes which side is the effort point", () => {
    const state = leverRulerReducer(createInitialLeverRulerState(), {
      type: "set-effort-side",
      side: "left",
    });

    expect(state.effortSide).toBe("left");
    expect(calculateLeverResult(state).leverType).toBe("effort-consuming");
  });
});
