export type ExperimentMode =
  | "effort-distance"
  | "load-distance"
  | "fulcrum-distance"
  | "lever-ruler";
export type DragTarget = "effort" | "load" | "fulcrum" | null;
export type ForceTone = "easy" | "medium" | "hard";

export interface ForceMeterData {
  tone: ForceTone;
  segments: number[];
}

export interface ExperimentRecord {
  id: number;
  mode: ExperimentMode;
  effortArm: number;
  loadArm: number;
  fulcrumPosition: number;
  force: number;
}

export interface ExperimentState {
  mode: ExperimentMode;
  effortArm: number;
  loadArm: number;
  fulcrumPosition: number;
  angle: number;
  dragTarget: DragTarget;
  isDropping: boolean;
  records: ExperimentRecord[];
  nextRecordId: number;
}

export const LOAD_FORCE = 100;
export const INITIAL_EFFORT_ARM = 100;
export const INITIAL_LOAD_ARM = 30;
export const EXPERIMENT_THREE_LOAD_POSITION = 60;
export const MIN_LOAD_ARM = 10;
export const MIN_ARM_GAP = 15;
export const MAX_ANGLE = 35;
export const MAX_FULCRUM_POSITION = 45;

export const createInitialExperimentState = (): ExperimentState => ({
  mode: "effort-distance",
  effortArm: INITIAL_EFFORT_ARM,
  loadArm: INITIAL_LOAD_ARM,
  fulcrumPosition: 0,
  angle: 0,
  dragTarget: null,
  isDropping: false,
  records: [],
  nextRecordId: 1,
});
