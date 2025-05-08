import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PieChart, BarChart, Activity, Calendar } from "lucide-react";

interface TimeData {
  category: string;
  hours: number;
  color: string;
}

const Analytics = () => {
  const [view, setView] = useState<"daily" | "weekly">("daily");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Mock data for time usage
  const dailyData: TimeData[] = [
    { category: "Work", hours: 6, color: "#4f46e5" },
    { category: "Study", hours: 2, color: "#10b981" },
    { category: "Exercise", hours: 1, color: "#f59e0b" },
    { category: "Leisure", hours: 3, color: "#ec4899" },
    { category: "Sleep", hours: 8, color: "#6366f1" },
    { category: "Other", hours: 4, color: "#8b5cf6" },
  ];

  const weeklyData: TimeData[] = [
    { category: "Work", hours: 30, color: "#4f46e5" },
    { category: "Study", hours: 10, color: "#10b981" },
    { category: "Exercise", hours: 5, color: "#f59e0b" },
    { category: "Leisure", hours: 15, color: "#ec4899" },
    { category: "Sleep", hours: 56, color: "#6366f1" },
    { category: "Other", hours: 20, color: "#8b5cf6" },
  ];

  const currentData = view === "daily" ? dailyData : weeklyData;
  const filteredData =
    selectedCategory === "all"
      ? currentData
      : currentData.filter((item) => item.category === selectedCategory);

  const totalHours = filteredData.reduce((sum, item) => sum + item.hours, 0);

  return (
    <div className="bg-background p-6 rounded-lg w-full h-full">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Time Usage Analytics</h2>
          <div className="flex space-x-4">
            <Tabs
              defaultValue="daily"
              value={view}
              onValueChange={(value) => setView(value as "daily" | "weekly")}
            >
              <TabsList>
                <TabsTrigger value="daily" className="flex items-center gap-2">
                  <Activity size={16} />
                  Daily
                </TabsTrigger>
                <TabsTrigger value="weekly" className="flex items-center gap-2">
                  <Calendar size={16} />
                  Weekly
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {currentData.map((item) => (
                  <SelectItem key={item.category} value={item.category}>
                    {item.category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Time Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="relative w-64 h-64">
                {/* Simple SVG pie chart */}
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {filteredData.map((item, index, array) => {
                    // Calculate the slice angles
                    const total = array.reduce((sum, i) => sum + i.hours, 0);
                    const startAngle = array
                      .slice(0, index)
                      .reduce((sum, i) => sum + (i.hours / total) * 360, 0);
                    const endAngle = startAngle + (item.hours / total) * 360;

                    // Convert angles to radians and calculate coordinates
                    const startRad = ((startAngle - 90) * Math.PI) / 180;
                    const endRad = ((endAngle - 90) * Math.PI) / 180;

                    const x1 = 50 + 40 * Math.cos(startRad);
                    const y1 = 50 + 40 * Math.sin(startRad);
                    const x2 = 50 + 40 * Math.cos(endRad);
                    const y2 = 50 + 40 * Math.sin(endRad);

                    // Determine if the arc should be drawn as a large arc
                    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

                    // Create the SVG path for the slice
                    const path = [
                      `M 50 50`,
                      `L ${x1} ${y1}`,
                      `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                      `Z`,
                    ].join(" ");

                    return (
                      <path
                        key={item.category}
                        d={path}
                        fill={item.color}
                        stroke="#ffffff"
                        strokeWidth="0.5"
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-3xl font-bold">{totalHours}</span>
                  <span className="text-sm text-muted-foreground">hours</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Time by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredData.map((item) => (
                  <div key={item.category} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {item.category}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {item.hours} hours
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(item.hours / totalHours) * 100}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Productivity Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-lg">
              <p className="text-muted-foreground">
                Productivity trend chart will be displayed here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
