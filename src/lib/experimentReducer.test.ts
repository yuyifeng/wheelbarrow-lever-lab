import { describe, expect, it } from "vitest";

import { createInitialExperimentState } from "../domain/experiment";
import { experimentReducer } from "./experimentReducer";

describe("experimentReducer", () => {
  it("locks the load in effort-distance mode", () => {
    const initial = createInitialExperimentState();
    const dragging = experimentReducer(initial, {
      type: "start-drag",
      target: "load",
    });
    const moved = experimentReducer(initial, {
      type: "update-load",
      loadArm: 10,
    });

    expect(dragging).toBe(initial);
    expect(moved.loadArm).toBe(30);
  });

  it("clamps the effort arm and angle in effort-distance mode", () => {
    const initial = createInitialExperimentState();
    const moved = experimentReducer(initial, {
      type: "update-effort",
      effortArm: 20,
      angle: 70,
    });

    expect(moved.effortArm).toBe(45);
    expect(moved.angle).toBe(35);
  });

  it("locks the effort distance and clamps the load in load-distance mode", () => {
    const initial = experimentReducer(createInitialExperimentState(), {
      type: "set-mode",
      mode: "load-distance",
    });
    const effortMoved = experimentReducer(initial, {
      type: "update-effort",
      effortArm: 50,
      angle: 12,
    });
    const loadMoved = experimentReducer(effortMoved, {
      type: "update-load",
      loadArm: 2,
    });

    expect(effortMoved.effortArm).toBe(100);
    expect(effortMoved.angle).toBe(12);
    expect(loadMoved.loadArm).toBe(10);
  });

  it("moves the fulcrum while keeping the load and hand positions fixed", () => {
    let state = experimentReducer(createInitialExperimentState(), {
      type: "set-mode",
      mode: "fulcrum-distance",
    });
    state = experimentReducer(state, {
      type: "update-fulcrum",
      position: 12,
    });
    const lifted = experimentReducer(state, {
      type: "update-effort",
      effortArm: 40,
      angle: 12,
    });
    const ignoredLoadMove = experimentReducer(lifted, {
      type: "update-load",
      loadArm: 25,
    });

    expect(state.fulcrumPosition).toBe(12);
    expect(state.effortArm).toBe(88);
    expect(state.loadArm).toBe(48);
    expect(lifted.effortArm).toBe(88);
    expect(lifted.angle).toBe(12);
    expect(ignoredLoadMove.loadArm).toBe(48);
  });

  it("keeps the fulcrum to the left of the load", () => {
    const state = experimentReducer(
      experimentReducer(createInitialExperimentState(), {
        type: "set-mode",
        mode: "fulcrum-distance",
      }),
      { type: "update-fulcrum", position: 100 },
    );

    expect(state.fulcrumPosition).toBe(45);
    expect(state.loadArm).toBe(15);
    expect(state.effortArm).toBe(55);
  });

  it("drops the lever to zero without going negative", () => {
    let state = {
      ...createInitialExperimentState(),
      angle: 3,
      isDropping: true,
    };
    state = experimentReducer(state, { type: "drop-step" });
    state = experimentReducer(state, { type: "drop-step" });

    expect(state.angle).toBe(0);
    expect(state.isDropping).toBe(false);
  });

  it("resets parameters on mode change but keeps records", () => {
    let state = experimentReducer(createInitialExperimentState(), {
      type: "update-effort",
      effortArm: 60,
      angle: 10,
    });
    state = experimentReducer(state, { type: "add-record" });
    state = experimentReducer(state, {
      type: "set-mode",
      mode: "load-distance",
    });

    expect(state.effortArm).toBe(100);
    expect(state.loadArm).toBe(30);
    expect(state.fulcrumPosition).toBe(0);
    expect(state.angle).toBe(0);
    expect(state.records).toHaveLength(1);
  });

  it("adds, deletes, and clears records", () => {
    let state = experimentReducer(createInitialExperimentState(), {
      type: "add-record",
    });
    state = experimentReducer(state, { type: "add-record" });

    expect(state.records.map((record) => record.id)).toEqual([2, 1]);

    state = experimentReducer(state, { type: "delete-record", id: 1 });
    expect(state.records.map((record) => record.id)).toEqual([2]);

    state = experimentReducer(state, { type: "clear-records" });
    expect(state.records).toEqual([]);
  });
});
