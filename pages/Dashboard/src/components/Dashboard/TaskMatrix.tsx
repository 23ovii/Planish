import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PlusCircle, Edit, Trash2, CheckCircle } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  urgency: "high" | "low";
  importance: "high" | "low";
  dueDate: string;
  status: "pending" | "completed";
}

const TaskMatrix = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Complete project proposal",
      description: "Finish the quarterly project proposal for client review",
      urgency: "high",
      importance: "high",
      dueDate: "2023-06-15",
      status: "pending",
    },
    {
      id: "2",
      title: "Weekly team meeting",
      description: "Regular sync-up with the development team",
      urgency: "high",
      importance: "low",
      dueDate: "2023-06-10",
      status: "pending",
    },
    {
      id: "3",
      title: "Learn new framework",
      description: "Study the documentation for the new framework",
      urgency: "low",
      importance: "high",
      dueDate: "2023-06-30",
      status: "pending",
    },
    {
      id: "4",
      title: "Organize digital files",
      description: "Clean up and organize project files and documents",
      urgency: "low",
      importance: "low",
      dueDate: "2023-06-25",
      status: "pending",
    },
  ]);

  const [newTask, setNewTask] = useState<Omit<Task, "id">>({
    title: "",
    description: "",
    urgency: "low",
    importance: "low",
    dueDate: "",
    status: "pending",
  });

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleAddTask = () => {
    const task: Task = {
      id: Date.now().toString(),
      ...newTask,
    };
    setTasks([...tasks, task]);
    setNewTask({
      title: "",
      description: "",
      urgency: "low",
      importance: "low",
      dueDate: "",
      status: "pending",
    });
    setIsAddDialogOpen(false);
  };

  const handleEditTask = () => {
    if (editingTask) {
      setTasks(
        tasks.map((task) => (task.id === editingTask.id ? editingTask : task)),
      );
      setEditingTask(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          return {
            ...task,
            status: task.status === "pending" ? "completed" : "pending",
          };
        }
        return task;
      }),
    );
  };

  const getTasksByQuadrant = (
    urgency: "high" | "low",
    importance: "high" | "low",
  ) => {
    return tasks.filter(
      (task) => task.urgency === urgency && task.importance === importance,
    );
  };

  const renderTaskCard = (task: Task) => (
    <Card
      key={task.id}
      className={`mb-3 ${task.status === "completed" ? "opacity-60" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3
              className={`font-medium ${task.status === "completed" ? "line-through" : ""}`}
            >
              {task.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {task.description}
            </p>
            <p className="text-xs mt-2">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </p>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleToggleStatus(task.id)}
            >
              <CheckCircle
                className={
                  task.status === "completed"
                    ? "text-green-500"
                    : "text-gray-300"
                }
                size={18}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setEditingTask(task);
                setIsEditDialogOpen(true);
              }}
            >
              <Edit size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteTask(task.id)}
            >
              <Trash2 size={18} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="bg-background p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Task Prioritization Matrix</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2" size={18} />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="urgency">Urgency</Label>
                  <Select
                    value={newTask.urgency}
                    onValueChange={(value: "high" | "low") =>
                      setNewTask({ ...newTask, urgency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="importance">Importance</Label>
                  <Select
                    value={newTask.importance}
                    onValueChange={(value: "high" | "low") =>
                      setNewTask({ ...newTask, importance: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select importance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) =>
                    setNewTask({ ...newTask, dueDate: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddTask}>Add Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Task Dialog */}
        {editingTask && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Task</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editingTask.title}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, title: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editingTask.description}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-urgency">Urgency</Label>
                    <Select
                      value={editingTask.urgency}
                      onValueChange={(value: "high" | "low") =>
                        setEditingTask({ ...editingTask, urgency: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-importance">Importance</Label>
                    <Select
                      value={editingTask.importance}
                      onValueChange={(value: "high" | "low") =>
                        setEditingTask({ ...editingTask, importance: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select importance" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-dueDate">Due Date</Label>
                  <Input
                    id="edit-dueDate"
                    type="date"
                    value={editingTask.dueDate}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        dueDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editingTask.status}
                    onValueChange={(value: "pending" | "completed") =>
                      setEditingTask({ ...editingTask, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleEditTask}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Quadrant 1: Urgent & Important */}
        <Card className="border-red-500 border-t-4">
          <CardHeader>
            <CardTitle className="text-lg">Urgent & Important</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Do these tasks immediately
            </p>
            <div className="space-y-2">
              {getTasksByQuadrant("high", "high").map(renderTaskCard)}
            </div>
          </CardContent>
        </Card>

        {/* Quadrant 2: Not Urgent & Important */}
        <Card className="border-blue-500 border-t-4">
          <CardHeader>
            <CardTitle className="text-lg">Important, Not Urgent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Schedule time for these tasks
            </p>
            <div className="space-y-2">
              {getTasksByQuadrant("low", "high").map(renderTaskCard)}
            </div>
          </CardContent>
        </Card>

        {/* Quadrant 3: Urgent & Not Important */}
        <Card className="border-yellow-500 border-t-4">
          <CardHeader>
            <CardTitle className="text-lg">Urgent, Not Important</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Delegate these tasks if possible
            </p>
            <div className="space-y-2">
              {getTasksByQuadrant("high", "low").map(renderTaskCard)}
            </div>
          </CardContent>
        </Card>

        {/* Quadrant 4: Not Urgent & Not Important */}
        <Card className="border-gray-500 border-t-4">
          <CardHeader>
            <CardTitle className="text-lg">Not Urgent, Not Important</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Eliminate these tasks when possible
            </p>
            <div className="space-y-2">
              {getTasksByQuadrant("low", "low").map(renderTaskCard)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskMatrix;
