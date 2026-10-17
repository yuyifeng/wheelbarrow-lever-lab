import type { ForceMeterData } from "../domain/experiment";
import { ForceMeter } from "./ForceMeter";

interface ExperimentDashboardProps {
  effortArm: number;
  loadArm: number;
  force: number;
  meter: ForceMeterData;
}

export function ExperimentDashboard({
  effortArm,
  loadArm,
  force,
  meter,
}: ExperimentDashboardProps) {
  return (
    <section className="dashboard" aria-label="实时实验数据">
      <div className="stat">
        <span className="stat__label">阻力臂</span>
        <strong className="stat__value">{Math.round(loadArm)} cm</strong>
      </div>
      <div className="stat">
        <span className="stat__label">动力臂</span>
        <strong className="stat__value">{Math.round(effortArm)} cm</strong>
      </div>
      <div className="stat stat--force">
        <span className="stat__label">需要的拉力</span>
        <strong className="stat__value stat__value--force">
          {Math.round(force)} N
        </strong>
        <ForceMeter force={force} meter={meter} />
      </div>
    </section>
  );
}
