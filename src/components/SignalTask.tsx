import { useEffect, useState } from "react";
import type { Task } from "@/types/types";
import RenderTask from "@/components/RenderTask";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "./ui/scroll-area";

function SignalTask() {
  const [signalTask, setSignalTask] = useState<Task[]>();
  const [checkedSignalTask, setCheckedSignalTask] = useState<
    Record<string, boolean>
  >({});
  const [newItemLabel, setNewItemLabel] = useState("");

  useEffect(() => {
    if (signalTask) {
      localStorage.setItem("signalTask", JSON.stringify(signalTask));
      localStorage.setItem(
        "checkedSignalTask",
        JSON.stringify(checkedSignalTask)
      );
    }
  }, [signalTask, checkedSignalTask]);

  useEffect(() => {
    const storedSignalTask = localStorage.getItem("signalTask");
    const storedCheckedSignalTask = localStorage.getItem("checkedSignalTask");

    if (storedCheckedSignalTask) {
      setCheckedSignalTask(JSON.parse(storedCheckedSignalTask));
    }

    if (storedSignalTask) {
      setSignalTask(JSON.parse(storedSignalTask));
    }
  }, []);

  const addTask = (
    parentId: string | null,
    title: string,
    priority: "l" | "m" | "h"
  ) => {
    if (!title) {
      return;
    }

    const newTask = {
      id: String(Date.now()),
      title,
      subtasks: [],
      priority,
    };

    setSignalTask((prevTask) => {
      const addTaskToNode = (nodes: Task[]): Task[] => {
        return nodes.map((node) => {
          if (parentId === node.id) {
            return {
              ...node,
              subtasks: [...(node.subtasks || []), newTask],
            };
          }

          if (node?.subtasks) {
            return {
              ...node,
              subtasks: addTaskToNode(node?.subtasks),
            };
          }

          return node;
        });
      };

      if (!prevTask) {
        return [newTask];
      }

      if (parentId === null) {
        return [...prevTask, newTask];
      }

      return addTaskToNode(prevTask);
    });

    setNewItemLabel("");
  };

  const editTask = (
    nodeId: string,
    title: string,
    priority: "l" | "m" | "h"
  ) => {
    setSignalTask((prevTask) => {
      if (!prevTask) return [];

      const updateNode = (nodes: Task[]): Task[] => {
        return nodes.map((node) => {
          if (node.id === nodeId) {
            return { ...node, title, priority };
          }

          if (node.subtasks) {
            return { ...node, subtasks: updateNode(node.subtasks) };
          }

          return node;
        });
      };

      return updateNode(prevTask);
    });
  };

  const deleteTask = (nodeId: string) => {
    // Remove task from signal tasks
    setSignalTask((prevTask) => {
      if (!prevTask) return [];

      const deleteTaskFromNode = (nodes: Task[]): Task[] => {
        return nodes
          .filter((node) => node.id !== nodeId)
          .map((node) => ({
            ...node,
            subtasks: node?.subtasks ? deleteTaskFromNode(node?.subtasks) : [],
          }));
      };
      return deleteTaskFromNode(prevTask);
    });

    // Remove tasks from the checked state
    setCheckedSignalTask((checkedTasks) => {
      const newCheckedState = { ...checkedTasks };

      const removeCheckedTasks = (nodeId: string) => {
        delete newCheckedState[nodeId];

        const findAndRemoveChildrenCheckedTasks = (nodes: Task[]) => {
          nodes.forEach((node) => {
            if (node.id === nodeId && node.subtasks) {
              node.subtasks.forEach((child) => {
                delete newCheckedState[child.id];
                if (child.subtasks) {
                  findAndRemoveChildrenCheckedTasks(child.subtasks);
                }
              });
            }

            if (node.subtasks) {
              findAndRemoveChildrenCheckedTasks(node.subtasks);
            }
          });
        };
        findAndRemoveChildrenCheckedTasks(signalTask ? signalTask : []);
      };

      removeCheckedTasks(nodeId);
      return newCheckedState;
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-2">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Signal Task</h1>
      </div>

      <div className="bg-card border rounded-lg p-4">
        {signalTask && signalTask.length > 0 ? (
          <ScrollArea className="h-[450px] pr-4">
            <RenderTask
              task={signalTask ? signalTask : []}
              checked={checkedSignalTask}
              setChecked={setCheckedSignalTask}
              onAddItem={addTask}
              onDeleteItem={deleteTask}
              onEditItem={editTask}
            />
          </ScrollArea>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-300">No tasks found</p>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 mt-4">
        <Input
          type="text"
          placeholder="Task name - priority (l/m/h)"
          value={newItemLabel || ""}
          onChange={(e) => setNewItemLabel(e.target.value)}
          onKeyDown={(e) => {
            const splittedText = newItemLabel.split("-");
            const label =
              splittedText[splittedText.length - 2]?.trim() ||
              newItemLabel.trim();
            const rawPriority =
              splittedText[splittedText.length - 1]?.toLowerCase().trim() ||
              "l";

            const priority: "l" | "m" | "h" =
              rawPriority === "l" || rawPriority === "m" || rawPriority === "h"
                ? rawPriority
                : "l";

            if (e.key === "Enter") {
              addTask(null, label, priority);
            }
          }}
          className="flex-1 h-8 w-full"
          autoFocus
        />
        <Button
          size="sm"
          onClick={() => {
            const splittedText = newItemLabel.split("-");
            const label =
              splittedText[splittedText.length - 2]?.trim() ||
              newItemLabel.trim();
            const rawPriority =
              splittedText[splittedText.length - 1]?.toLowerCase().trim() ||
              "l";

            const priority: "l" | "m" | "h" =
              rawPriority === "l" || rawPriority === "m" || rawPriority === "h"
                ? rawPriority
                : "l";

            addTask(null, label, priority);
          }}
          className="h-8"
        >
          <PlusCircle className="h-3 w-3 mr-1" />
          Add
        </Button>
      </div>
    </div>
  );
}

export default SignalTask;
