import { describe, expect, it } from "vitest";

import { calculateRequiredForce, getForceMeter } from "./leverPhysics";

describe("leverPhysics", () => {
  it("calculates the initial 30 N force", () => {
    expect(calculateRequiredForce(100, 30)).toBe(30);
  });

  it("requires more force when the effort arm becomes shorter", () => {
    expect(calculateRequiredForce(50, 30)).toBe(60);
  });

  it("requires less force when the load moves toward the wheel", () => {
    expect(calculateRequiredForce(100, 10)).toBe(10);
  });

  it("represents a partial force segment precisely", () => {
    const meter = getForceMeter(11);

    expect(meter.tone).toBe("easy");
    expect(meter.segments[0]).toBe(1);
    expect(meter.segments[1]).toBeCloseTo(0.1);
    expect(meter.segments.slice(2).every((segment) => segment === 0)).toBe(
      true,
    );
  });

  it("uses medium and hard tones at the configured thresholds", () => {
    expect(getForceMeter(36).tone).toBe("medium");
    expect(getForceMeter(66).tone).toBe("hard");
  });
});
