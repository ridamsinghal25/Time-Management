import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { priorityOrder, type Task } from "@/types/types";
import { useState } from "react";
import type React from "react";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, PlusCircle, Edit } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { MAX_DEPTH } from "@/constants/constants";
import { Badge } from "@/components/ui/badge";
import MessageTooltip from "./MessageTooltip";

function RenderTask({
  task,
  checked,
  setChecked,
  onAddItem,
  onDeleteItem,
  onEditItem,
  depth = 0,
}: {
  task: Task[];
  checked: Record<string, boolean>;
  setChecked: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
  onAddItem: (
    parentId: string | null,
    title: string,
    priority: "l" | "m" | "h"
  ) => void;
  onDeleteItem: (nodeId: string) => void;
  onEditItem: (
    nodeId: string,
    title: string,
    priority: "l" | "m" | "h"
  ) => void;
  depth?: number;
}) {
  const [newItemLabels, setNewItemLabels] = useState<Record<string, string>>(
    {}
  );
  const [showAddInput, setShowAddInput] = useState<Record<string, boolean>>({});
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState<string>("");

  const handleChange = (isChecked: boolean, node: Task) => {
    setChecked((prevCheckedState) => {
      const newCheckedState: Record<string, boolean> = {
        ...prevCheckedState,
        [node.id]: isChecked,
      };

      // Update all children recursively
      const updateChildren = (currentNode: Task) => {
        if (currentNode.subtasks?.length) {
          currentNode.subtasks.forEach((subtask) => {
            newCheckedState[subtask.id] = isChecked;
            updateChildren(subtask);
          });
        }
      };

      // Update parent states based on children
      const updateParent = (currentNode: Task, taskTree: Task[]) => {
        const findParent = (nodeId: string, tree: Task[]): Task | null => {
          for (const item of tree) {
            if (item.subtasks?.some((subtask) => subtask.id === nodeId)) {
              return item;
            }
            const foundParent = findParent(nodeId, item.subtasks || []);
            if (foundParent) return foundParent;
          }
          return null;
        };

        let parent = findParent(currentNode.id, taskTree);
        while (parent) {
          const isAllChildrenChecked =
            parent.subtasks?.every((subtask) => newCheckedState[subtask.id]) ??
            false;
          newCheckedState[parent.id] = isAllChildrenChecked;

          parent = findParent(parent.id, taskTree);
        }
      };

      updateChildren(node);
      updateParent(node, task);

      return newCheckedState;
    });
  };

  const handleAddItem = (parentId: string | null) => {
    const key = parentId || "root";
    const text = newItemLabels[key]?.trim();

    if (!text) {
      return;
    }

    const splittedText = text.split("-");
    const label = splittedText[splittedText.length - 2]?.trim() || text.trim();
    const rawPriority =
      splittedText[splittedText.length - 1]?.toLowerCase().trim() || "l";

    // Type-safe priority assignment with proper validation
    const priority: "l" | "m" | "h" =
      rawPriority === "l" || rawPriority === "m" || rawPriority === "h"
        ? rawPriority
        : "l";

    onAddItem(parentId, label, priority);
    setNewItemLabels((prev) => ({ ...prev, [key]: "" }));
    setShowAddInput((prev) => ({ ...prev, [key]: false }));
  };

  const toggleAddInput = (nodeId: string) => {
    setShowAddInput((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
    setOpenAccordion(`item-${nodeId}`);
  };

  const handleEditStart = (nodeId: string, currentLabel: string) => {
    setEditingId(nodeId);
    setEditLabel(currentLabel);
  };

  const handleEditSave = (nodeId: string) => {
    const trimmedLabel = editLabel.trim();
    const splittedText = trimmedLabel.split("-");
    const label =
      splittedText[splittedText.length - 2]?.trim() || trimmedLabel.trim();
    const rawPriority =
      splittedText[splittedText.length - 1]?.toLowerCase().trim() || "l";
    const priority: "l" | "m" | "h" =
      rawPriority === "l" || rawPriority === "m" || rawPriority === "h"
        ? rawPriority
        : "l";

    if (trimmedLabel) {
      onEditItem(nodeId, label, priority);
      setEditingId(null);
      setEditLabel("");
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditLabel("");
  };

  const sortedTask = [...task].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return (
    <div className="space-y-2">
      <Accordion
        type="single"
        className="w-full"
        collapsible
        value={openAccordion ?? undefined}
        onValueChange={(value) => setOpenAccordion(value)}
      >
        {sortedTask.map((node) => {
          return (
            <AccordionItem
              key={node.id}
              value={`item-${node.id}`}
              className={`border rounded-lg my-2`}
              draggable
            >
              <AccordionTrigger
                className={`hover:no-underline px-4 py-2 data-[state=open]:rounded-none border-b`}
              >
                <div className="flex items-center gap-2 flex-1">
                  <Checkbox
                    checked={checked[node.id] || false}
                    onCheckedChange={(checked: boolean) => {
                      handleChange(checked, node);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className={`w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer  ${
                      priorityOrder[node.priority] === 1
                        ? "border-fuchsia-500 data-[state=checked]:!bg-fuchsia-500 data-[state=checked]:!border-fuchsia-500"
                        : priorityOrder[node.priority] === 2
                        ? "border-yellow-500 data-[state=checked]:!bg-yellow-500 data-[state=checked]:!border-yellow-500"
                        : "border-green-500 data-[state=checked]:!bg-green-500 data-[state=checked]:!border -green-500"
                    }`}
                  />

                  {editingId === node.id ? (
                    <div
                      className="flex items-center gap-2 flex-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Input
                        type="text"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleEditSave(node.id);
                          } else if (e.key === "Escape") {
                            handleEditCancel();
                          }
                        }}
                        className="flex-1 h-8 text-sm"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() => handleEditSave(node.id)}
                        className="h-8 px-2"
                      >
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleEditCancel}
                        className="h-8 px-2"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span
                        className={`flex-1 w-5 text-left font-medium truncate ${
                          checked[node.id] ? "line-through" : ""
                        }  ${
                          priorityOrder[node.priority] === 1
                            ? "text-fuchsia-500"
                            : priorityOrder[node.priority] === 2
                            ? "text-yellow-500"
                            : "text-green-500"
                        }`}
                      >
                        {node.title}
                      </span>

                      <MessageTooltip message={node.title} />

                      <div
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditStart(node.id, node.title)}
                          className="h-8 w-8 p-0 cursor-pointer"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>

                        {depth < MAX_DEPTH ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAddInput(node.id)}
                            className="h-7 w-7 p-0"
                          >
                            <Plus className="h-3 w-3 cursor-pointer" />
                          </Button>
                        ) : (
                          <Badge
                            className="text-xs text-muted-foreground px-2"
                            variant="secondary"
                          >
                            Max depth reached
                          </Badge>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteItem(node.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {showAddInput[node.id] && (
                  <div className="flex items-center gap-2 mb-4 mt-2">
                    <Input
                      type="text"
                      placeholder="Task name - priority (l/m/h)"
                      value={newItemLabels[node.id] || ""}
                      onChange={(e) =>
                        setNewItemLabels((prev) => ({
                          ...prev,
                          [node.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAddItem(node.id);
                        } else if (e.key === "Escape") {
                          toggleAddInput(node.id);
                        }
                      }}
                      className="flex-1 h-8"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={() => handleAddItem(node.id)}
                      className="h-8"
                      disabled={!newItemLabels[node.id]?.trim()}
                    >
                      <PlusCircle className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAddInput(node.id)}
                      className="h-8"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
                {node.subtasks && node.subtasks.length > 0 && (
                  <RenderTask
                    task={node.subtasks || []}
                    checked={checked}
                    setChecked={setChecked}
                    onAddItem={onAddItem}
                    onDeleteItem={onDeleteItem}
                    onEditItem={onEditItem}
                    depth={depth + 1}
                  />
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

export default RenderTask;
