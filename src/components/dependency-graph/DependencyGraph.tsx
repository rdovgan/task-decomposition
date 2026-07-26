"use client";

import { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeTypes,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { useRouter } from "next/navigation";
import { Task, Dependency, TaskStatus } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";

interface DependencyGraphProps {
  tasks: Task[];
  dependencies: Dependency[];
}

interface TaskNodeData {
  task: Task;
  dependents: string[];
}

// Custom Task Node component
function TaskNode({ data }: { data: TaskNodeData }) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const isBlocked = data.task.status === "BLOCKED";
  const isUnblocked = !isBlocked && data.task.status !== "DONE" && data.task.status !== "CANCELLED";

  const nodeColor = isBlocked
    ? "bg-danger/10 border-danger/40"
    : isUnblocked
      ? "bg-success/10 border-success/40"
      : "bg-muted border-border";

  return (
    <div
      className={`px-4 py-2 shadow-md rounded-lg border-2 ${nodeColor} min-w-[200px] transition-all text-foreground cursor-pointer hover:opacity-80`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => router.push(`/tasks/${data.task.id}`)}
      title="Open task"
    >
      <div className="font-bold text-sm">{data.task.title}</div>
      <div className="text-xs mt-1">
        <StatusBadge status={data.task.status} />
      </div>

      {isHovered && data.dependents.length > 0 && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-popover text-popover-foreground border border-border rounded-lg shadow-lg z-10 min-w-[200px]">
          <div className="text-xs font-semibold mb-1">Blocks {data.dependents.length} task(s):</div>
          {data.dependents.map(depId => {
            const dependentTask = data.task.epic?._count?.tasks
              ? // @ts-ignore - we'll get this from the tasks prop
                data.tasks?.find((t: Task) => t.id === depId)
              : null;
            return dependentTask ? (
              <div key={depId} className="text-xs text-muted-foreground truncate">
                • {dependentTask.title}
              </div>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}

const nodeTypes: NodeTypes = {
  taskNode: TaskNode,
};

export function DependencyGraph({ tasks, dependencies }: DependencyGraphProps) {
  // Build a map of task dependencies
  const { dependentsMap } = useMemo(() => {
    const dependentsMap = new Map<string, string[]>();

    // Initialize empty arrays for all tasks
    tasks.forEach(task => {
      dependentsMap.set(task.id, []);
    });

    // Populate dependents (reverse of dependencies)
    dependencies.forEach(dep => {
      const current = dependentsMap.get(dep.dependsOnTaskId) || [];
      dependentsMap.set(dep.dependsOnTaskId, [...current, dep.taskId]);
    });

    return { dependentsMap };
  }, [tasks, dependencies]);

  // Create initial nodes and edges for React Flow
  const graphData = useMemo(() => {
    const nodes: Node<TaskNodeData>[] = tasks.map((task, index) => {
      // Calculate position based on index to create a simple layout
      const row = Math.floor(index / 4);
      const col = index % 4;

      return {
        id: task.id,
        type: "taskNode",
        position: { x: col * 300, y: row * 150 },
        data: {
          task,
          dependents: dependentsMap.get(task.id) || [],
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };
    });

    const edges: Edge[] = dependencies.map(dep => ({
      id: dep.id,
      source: dep.dependsOnTaskId,
      target: dep.taskId,
      animated: true,
      type: "smoothstep",
      style: { stroke: "#8b87c9" },
    }));

    return { nodes, edges };
  }, [tasks, dependencies, dependentsMap]);

  const [nodes, setNodes, onNodesChange] = useNodesState(graphData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graphData.edges);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges(eds => addEdge(params, eds)),
    [setEdges]
  );

  // Handle empty state
  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted/40 rounded-lg border border-border">
        <p className="text-muted-foreground">No tasks to display in the dependency graph</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-muted/40 rounded-lg border border-border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="!bg-transparent"
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={node => {
            const data = node.data as TaskNodeData;
            const isBlocked = data.task.status === "BLOCKED";
            const isUnblocked =
              !isBlocked && data.task.status !== "DONE" && data.task.status !== "CANCELLED";

            if (isBlocked) return "#e5484d";
            if (isUnblocked) return "#4fb87b";
            return "#a3a3c2";
          }}
          className="!bg-muted"
        />
      </ReactFlow>
    </div>
  );
}
