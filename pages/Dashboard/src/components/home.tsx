import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Clock,
  Calendar as CalendarIcon,
  CheckSquare,
  BarChart3,
  Timer,
} from "lucide-react";
import { default as CalendarComponent } from "./Dashboard/Calendar";
import TaskMatrix from "./Dashboard/TaskMatrix";
import Analytics from "./Dashboard/Analytics";
import FocusTimer from "./Dashboard/FocusTimer";

export default function Home() {
  const [activeTab, setActiveTab] = useState("calendar");

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <Clock className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">TimeWise</h1>
        </div>

        <nav className="space-y-2 flex-1">
          <Button
            variant={activeTab === "calendar" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("calendar")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            Calendar
          </Button>
          <Button
            variant={activeTab === "tasks" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("tasks")}
          >
            <CheckSquare className="mr-2 h-4 w-4" />
            Task Matrix
          </Button>
          <Button
            variant={activeTab === "analytics" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("analytics")}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </Button>
          <Button
            variant={activeTab === "focus" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("focus")}
          >
            <Timer className="mr-2 h-4 w-4" />
            Focus Timer
          </Button>
        </nav>

        <div className="mt-auto pt-4 border-t">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user123" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">User Name</p>
              <p className="text-xs text-muted-foreground">user@example.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Time Management Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track, plan, and optimize your daily time usage
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="tasks">Task Matrix</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="focus">Focus Timer</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mt-0">
            <Card>
              <CardContent className="p-6">
                <CalendarComponent />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="mt-0">
            <Card>
              <CardContent className="p-6">
                <TaskMatrix />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <Card>
              <CardContent className="p-6">
                <Analytics />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="focus" className="mt-0">
            <Card className="max-w-md mx-auto">
              <CardContent className="p-6">
                <FocusTimer />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
