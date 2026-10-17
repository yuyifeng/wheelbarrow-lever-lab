import {
  LOAD_FORCE,
  type ForceMeterData,
  type ForceTone,
} from "../domain/experiment";

export function calculateRequiredForce(
  effortArm: number,
  loadArm: number,
): number {
  if (effortArm <= 0) return 0;
  return (LOAD_FORCE * loadArm) / effortArm;
}

export function getForceTone(force: number): ForceTone {
  if (force > 65) return "hard";
  if (force > 35) return "medium";
  return "easy";
}

export function getForceMeter(force: number): ForceMeterData {
  return {
    tone: getForceTone(force),
    segments: Array.from({ length: 10 }, (_, index) =>
      clamp((force - index * 10) / 10, 0, 1),
    ),
  };
}

export function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}
