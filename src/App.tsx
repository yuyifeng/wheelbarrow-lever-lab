import { Scale } from "lucide-react";

import { ExperimentDashboard } from "./components/ExperimentDashboard";
import { ExperimentRecords } from "./components/ExperimentRecords";
import { ExperimentTabs } from "./components/ExperimentTabs";
import { LeverRulerSimulation } from "./components/LeverRulerSimulation";
import { WheelbarrowSimulation } from "./components/WheelbarrowSimulation";
import { useLeverRulerExperiment } from "./hooks/useLeverRulerExperiment";
import { useWheelbarrowExperiment } from "./hooks/useWheelbarrowExperiment";

export default function App() {
  const experiment = useWheelbarrowExperiment();
  const leverRulerExperiment = useLeverRulerExperiment();
  const { state, force, meter } = experiment;
  const isLeverRuler = state.mode === "lever-ruler";

  return (
    <main className="app-shell">
      <header className="page-heading">
        <Scale aria-hidden="true" />
        <div>
          <h1>杠杆尺实验</h1>
        </div>
      </header>

      <section className="experiment-panel" aria-label="杠杆实验">
        <ExperimentTabs mode={state.mode} onChange={experiment.setMode} />
        {isLeverRuler ? (
          <LeverRulerSimulation experiment={leverRulerExperiment} />
        ) : (
          <>
            <WheelbarrowSimulation experiment={experiment} />
            <ExperimentDashboard
              effortArm={state.effortArm}
              loadArm={state.loadArm}
              force={force}
              meter={meter}
            />
            <ExperimentRecords
              records={state.records}
              onAdd={experiment.addRecord}
              onDelete={experiment.deleteRecord}
              onClear={experiment.clearRecords}
            />
          </>
        )}
      </section>
    </main>
  );
}
