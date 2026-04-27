import React, { useEffect, useState, useMemo } from 'react';
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';

export interface GanttChartProps {
  projectId: string;
  readOnly?: boolean;
  className?: string;
}

interface TaskRow {
  _id: string;
  name: string;
  start_date?: string;
  due_date?: string;
  status?: string;
  milestone?: string;
  parent_task?: string;
}

interface MilestoneRow {
  _id: string;
  name: string;
  due_date?: string;
}

const STATUS_PROGRESS: Record<string, number> = {
  todo: 0,
  in_progress: 50,
  completed: 100,
  cancelled: 0,
};

function toDate(s?: string): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

export const GanttChart: React.FC<GanttChartProps> = ({ projectId, readOnly, className }) => {
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [milestones, setMilestones] = useState<MilestoneRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>(ViewMode.Day);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    setLoading(true);
    const filters = encodeURIComponent(JSON.stringify([['project', '=', projectId]]));
    Promise.all([
      fetch(`/api/v6/data/pm_task?filters=${filters}&skip=0&top=200`).then((r) => r.json()),
      fetch(`/api/v6/data/pm_milestone?filters=${filters}&skip=0&top=50`).then((r) => r.json()),
    ])
      .then(([tRes, mRes]) => {
        if (cancelled) return;
        setTasks(tRes.data || []);
        setMilestones(mRes.data || []);
      })
      .catch((e) => !cancelled && setError(String(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const ganttTasks: Task[] = useMemo(() => {
    const result: Task[] = [];
    for (const m of milestones) {
      const due = toDate(m.due_date);
      if (!due) continue;
      result.push({
        id: `m_${m._id}`,
        name: m.name,
        type: 'milestone',
        start: due,
        end: due,
        progress: 0,
        isDisabled: readOnly,
      });
    }
    for (const t of tasks) {
      const start = toDate(t.start_date);
      const end = toDate(t.due_date);
      if (!start || !end) continue;
      result.push({
        id: t._id,
        name: t.name,
        type: 'task',
        start,
        end,
        progress: STATUS_PROGRESS[t.status || 'todo'] ?? 0,
        project: t.milestone ? `m_${t.milestone}` : undefined,
        dependencies: t.parent_task ? [t.parent_task] : undefined,
        isDisabled: readOnly,
      });
    }
    return result;
  }, [tasks, milestones, readOnly]);

  const handleDateChange = async (task: Task) => {
    if (readOnly || task.type === 'milestone') return;
    try {
      await fetch(`/api/v6/data/pm_task/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_date: task.start.toISOString().slice(0, 10),
          due_date: task.end.toISOString().slice(0, 10),
        }),
      });
    } catch (e) {
      console.error('[pm-gantt] update failed', e);
    }
  };

  if (loading) return <div className={`pm-gantt-wrap ${className || ''}`}><div className="pm-gantt-empty">加载中…</div></div>;
  if (error) return <div className={`pm-gantt-wrap ${className || ''}`}><div className="pm-gantt-empty">加载失败：{error}</div></div>;
  if (ganttTasks.length === 0) return <div className={`pm-gantt-wrap ${className || ''}`}><div className="pm-gantt-empty">暂无任务或里程碑（请填写开始/截止日期）</div></div>;

  return (
    <div className={`pm-gantt-wrap ${className || ''}`}>
      <div className="pm-gantt-toolbar">
        <button onClick={() => setView(ViewMode.Day)}>日</button>
        <button onClick={() => setView(ViewMode.Week)}>周</button>
        <button onClick={() => setView(ViewMode.Month)}>月</button>
      </div>
      <Gantt
        tasks={ganttTasks}
        viewMode={view}
        onDateChange={handleDateChange}
        listCellWidth=""
      />
    </div>
  );
};
