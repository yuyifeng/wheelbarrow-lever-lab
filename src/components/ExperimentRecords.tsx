import { Camera, Eraser, Trash2 } from "lucide-react";

import type { ExperimentRecord } from "../domain/experiment";
import { getForceMeter } from "../lib/leverPhysics";
import { ForceMeter } from "./ForceMeter";

interface ExperimentRecordsProps {
  records: ExperimentRecord[];
  onAdd: () => void;
  onDelete: (id: number) => void;
  onClear: () => void;
}

const observationLabels = {
  "effort-distance": "手越远，抬起越省力",
  "load-distance": "石头越近，抬起越省力",
  "fulcrum-distance": "支点越近石头，抬起越省力",
  "lever-ruler": "两侧力矩相等时，杠杆保持平衡",
} as const;

export function ExperimentRecords({
  records,
  onAdd,
  onDelete,
  onClear,
}: ExperimentRecordsProps) {
  const confirmClear = () => {
    if (window.confirm("确定清空全部实验记录吗？")) {
      onClear();
    }
  };

  return (
    <section className="records" aria-labelledby="records-title">
      <div className="records__actions">
        <button type="button" className="record-button" onClick={onAdd}>
          <Camera aria-hidden="true" />
          记录此时数据
        </button>
        {records.length > 0 && (
          <button
            type="button"
            className="clear-button"
            onClick={confirmClear}
          >
            <Eraser aria-hidden="true" />
            清空全部
          </button>
        )}
      </div>

      <div className="records__heading">
        <div>
          <p className="section-kicker">实验记录</p>
          <h2 id="records-title">比较每一次变化</h2>
        </div>
        <span className="record-count">{records.length} 条</span>
      </div>

      {records.length === 0 ? (
        <div className="records__empty">
          <Camera aria-hidden="true" />
          <p>拖动并观察力量变化，再记录一组数据。</p>
        </div>
      ) : (
        <div className="records__table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">手的位置</th>
                <th scope="col">石头位置</th>
                <th scope="col">拉力</th>
                <th scope="col">力量格子</th>
                <th scope="col">发现</th>
                <th scope="col">
                  <span className="visually-hidden">操作</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => {
                const meter = getForceMeter(record.force);
                return (
                  <tr key={record.id}>
                    <td>{Math.round(record.effortArm)} cm</td>
                    <td>{Math.round(record.loadArm)} cm</td>
                    <td className="records__force">
                      {Math.round(record.force)} N
                    </td>
                    <td>
                      <ForceMeter
                        force={record.force}
                        meter={meter}
                        compact
                      />
                    </td>
                    <td>{observationLabels[record.mode]}</td>
                    <td>
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => onDelete(record.id)}
                        aria-label={`删除第 ${record.id} 条实验记录`}
                        title="删除记录"
                      >
                        <Trash2 aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
