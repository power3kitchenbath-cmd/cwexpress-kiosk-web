import { useMemo } from "react";
import { format, differenceInDays, addDays, startOfMonth, endOfMonth } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface GanttChartProps {
  tasks: any[];
  onTaskClick?: (task: any) => void;
}

export function GanttChart({ tasks, onTaskClick }: GanttChartProps) {
  const { timeline, taskPositions } = useMemo(() => {
    if (tasks.length === 0) {
      return { timeline: [], taskPositions: [] };
    }

    // Find the earliest and latest dates
    const dates = tasks.map((task) => new Date(task.due_date));
    const earliestDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const latestDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    // Add padding to the timeline
    const startDate = startOfMonth(addDays(earliestDate, -7));
    const endDate = endOfMonth(addDays(latestDate, 7));

    const totalDays = differenceInDays(endDate, startDate);

    // Generate timeline (show dates every 7 days)
    const timelineArr = [];
    let currentDate = startDate;
    while (currentDate <= endDate) {
      timelineArr.push(new Date(currentDate));
      currentDate = addDays(currentDate, 7);
    }

    // Calculate task positions
    const positions = tasks.map((task) => {
      const taskDate = new Date(task.due_date);
      const daysFromStart = differenceInDays(taskDate, startDate);
      const position = (daysFromStart / totalDays) * 100;

      // Task duration (default 1 day if not specified)
      const duration = task.estimated_hours ? Math.ceil(task.estimated_hours / 8) : 1;
      const width = (duration / totalDays) * 100;

      return {
        ...task,
        position: Math.max(0, Math.min(100, position)),
        width: Math.max(0.5, Math.min(100 - position, width)),
      };
    });

    return { timeline: timelineArr, taskPositions: positions };
  }, [tasks]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500",
      in_progress: "bg-blue-500",
      completed: "bg-green-500",
      blocked: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No tasks to display on timeline. Create your first task to see the Gantt chart.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timeline Header */}
      <div className="relative h-12 border-b border-border">
        <div className="flex h-full">
          {timeline.map((date, index) => (
            <div
              key={index}
              className="flex-1 flex items-center justify-center text-xs text-muted-foreground border-l border-border first:border-l-0"
            >
              {format(date, "MMM dd")}
            </div>
          ))}
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-2">
        {taskPositions.map((task) => (
          <div key={task.id} className="relative group">
            <div className="flex items-center gap-4">
              {/* Task Name */}
              <div className="w-64 flex-shrink-0">
                <div className="text-sm font-medium truncate">{task.task_name}</div>
                <div className="flex gap-1 mt-1">
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      task.status === "completed"
                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                        : task.status === "in_progress"
                        ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                        : task.status === "blocked"
                        ? "bg-red-500/10 text-red-500 border-red-500/20"
                        : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                    }`}
                  >
                    {task.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>

              {/* Timeline Bar */}
              <div className="flex-1 relative h-12 bg-muted/30 rounded">
                {/* Grid lines */}
                <div className="absolute inset-0 flex">
                  {timeline.map((_, index) => (
                    <div
                      key={index}
                      className="flex-1 border-l border-border/50 first:border-l-0"
                    />
                  ))}
                </div>

                {/* Task Bar */}
                <div
                  className={`absolute top-1/2 -translate-y-1/2 h-6 rounded ${getStatusColor(
                    task.status
                  )} cursor-pointer transition-all hover:h-8 hover:shadow-lg`}
                  style={{
                    left: `${task.position}%`,
                    width: `${task.width}%`,
                  }}
                  onClick={() => onTaskClick?.(task)}
                >
                  <div className="h-full flex items-center justify-center text-xs text-white font-medium px-2 overflow-hidden">
                    <span className="truncate">
                      {task.estimated_hours ? `${task.estimated_hours}h` : ""}
                    </span>
                  </div>
                </div>

                {/* Hover Tooltip */}
                <div className="absolute left-0 top-full mt-2 hidden group-hover:block z-10">
                  <div className="bg-popover border border-border rounded-lg shadow-lg p-3 min-w-64">
                    <div className="font-medium mb-2">{task.task_name}</div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div>Type: {task.task_type.replace("_", " ")}</div>
                      <div>Priority: {task.priority}</div>
                      <div>Due: {format(new Date(task.due_date), "MMM dd, yyyy")}</div>
                      {task.estimated_hours && <div>Estimated: {task.estimated_hours}h</div>}
                      {task.actual_hours && <div>Actual: {task.actual_hours}h</div>}
                      {task.description && (
                        <div className="pt-2 border-t border-border">
                          {task.description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 justify-center pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded bg-yellow-500" />
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded bg-blue-500" />
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded bg-green-500" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded bg-red-500" />
          <span>Blocked</span>
        </div>
      </div>
    </div>
  );
}
