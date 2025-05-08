import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw, Settings } from "lucide-react";

interface TimerSettings {
  workDuration: number;
  breakDuration: number;
  cycles: number;
}

type TimerState = "idle" | "work" | "break";

const FocusTimer = () => {
  const [settings, setSettings] = useState<TimerSettings>({
    workDuration: 25,
    breakDuration: 5,
    cycles: 4,
  });

  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [isRunning, setIsRunning] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [activeTab, setActiveTab] = useState("timer");

  // Calculate progress percentage
  const totalTime =
    timerState === "work"
      ? settings.workDuration * 60
      : settings.breakDuration * 60;
  const progress = 100 - (timeLeft / totalTime) * 100;

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer completed
            if (timerState === "work") {
              // Work period completed, start break
              setTimerState("break");
              return settings.breakDuration * 60;
            } else {
              // Break period completed
              if (currentCycle < settings.cycles) {
                // Start next cycle
                setCurrentCycle((prev) => prev + 1);
                setTimerState("work");
                return settings.workDuration * 60;
              } else {
                // All cycles completed
                setIsRunning(false);
                setTimerState("idle");
                setCurrentCycle(1);
                return settings.workDuration * 60;
              }
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timerState, currentCycle, settings]);

  // Start/pause timer
  const toggleTimer = () => {
    if (timerState === "idle") {
      setTimerState("work");
      setTimeLeft(settings.workDuration * 60);
    }
    setIsRunning(!isRunning);
  };

  // Reset timer
  const resetTimer = () => {
    setIsRunning(false);
    setTimerState("idle");
    setTimeLeft(settings.workDuration * 60);
    setCurrentCycle(1);
  };

  // Update settings
  const handleSettingChange = (key: keyof TimerSettings, value: number) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));

    // If timer is idle, update the time left based on work duration
    if (timerState === "idle") {
      if (key === "workDuration") {
        setTimeLeft(value * 60);
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-background shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Focus Timer
        </CardTitle>
        <CardDescription className="text-center">
          Stay productive with Pomodoro technique
        </CardDescription>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="timer">Timer</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent>
        <TabsContent value="timer" className="space-y-4">
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-64 h-64 flex items-center justify-center rounded-full border-8 border-primary/20">
              <div
                className="absolute inset-0 rounded-full border-8 border-primary"
                style={{
                  clipPath: `polygon(50% 50%, 50% 0%, ${progress <= 25 ? 50 + progress * 2 : 100}% 0%, ${progress > 25 && progress <= 50 ? 100 : 50 + (progress - 50) * 2}% ${progress > 25 && progress <= 50 ? (progress - 25) * 4 : 0}%, ${progress > 50 && progress <= 75 ? 100 - (progress - 50) * 4 : 0}% ${progress > 50 ? 100 : 50 + (progress - 25) * 2}%, ${progress > 75 ? 50 - (progress - 75) * 2 : 0}% ${progress > 75 ? 100 - (progress - 75) * 4 : 100}%)`,
                }}
              />
              <div className="text-4xl font-bold">{formatTime(timeLeft)}</div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-lg font-medium">
                {timerState === "work"
                  ? "Focus Time"
                  : timerState === "break"
                    ? "Break Time"
                    : "Ready"}
              </p>
              <p className="text-sm text-muted-foreground">
                Cycle {currentCycle} of {settings.cycles}
              </p>
            </div>
          </div>

          <div className="flex justify-center space-x-4 mt-6">
            <Button
              variant="outline"
              size="icon"
              onClick={resetTimer}
              disabled={timerState === "idle" && !isRunning}
            >
              <RotateCcw className="h-5 w-5" />
            </Button>

            <Button
              variant="default"
              size="lg"
              className="w-32"
              onClick={toggleTimer}
            >
              {isRunning ? (
                <>
                  <Pause className="mr-2 h-5 w-5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Start
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setActiveTab("settings")}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="work-duration">Work Duration (minutes)</Label>
                <span>{settings.workDuration}</span>
              </div>
              <Slider
                id="work-duration"
                min={1}
                max={60}
                step={1}
                value={[settings.workDuration]}
                onValueChange={(value) =>
                  handleSettingChange("workDuration", value[0])
                }
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="break-duration">Break Duration (minutes)</Label>
                <span>{settings.breakDuration}</span>
              </div>
              <Slider
                id="break-duration"
                min={1}
                max={30}
                step={1}
                value={[settings.breakDuration]}
                onValueChange={(value) =>
                  handleSettingChange("breakDuration", value[0])
                }
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="cycles">Number of Cycles</Label>
                <span>{settings.cycles}</span>
              </div>
              <Slider
                id="cycles"
                min={1}
                max={10}
                step={1}
                value={[settings.cycles]}
                onValueChange={(value) =>
                  handleSettingChange("cycles", value[0])
                }
              />
            </div>
          </div>

          <Button
            variant="default"
            className="w-full"
            onClick={() => setActiveTab("timer")}
          >
            Apply Settings
          </Button>
        </TabsContent>
      </CardContent>

      <CardFooter className="flex justify-center border-t pt-4">
        <p className="text-xs text-muted-foreground text-center">
          The Pomodoro Technique helps improve productivity by breaking work
          into focused intervals with short breaks.
        </p>
      </CardFooter>
    </Card>
  );
};

export default FocusTimer;
