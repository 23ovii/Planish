import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addHours,
  isSameDay,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface TimeBlock {
  id: string;
  title: string;
  start: Date;
  end: Date;
  category: string;
}

interface CalendarProps {
  timeBlocks?: TimeBlock[];
  onAddTimeBlock?: (timeBlock: Omit<TimeBlock, "id">) => void;
  onUpdateTimeBlock?: (timeBlock: TimeBlock) => void;
}

const categoryColors: Record<string, string> = {
  work: "bg-blue-500",
  personal: "bg-green-500",
  study: "bg-purple-500",
  health: "bg-red-500",
  other: "bg-gray-500",
};

const hours = Array.from({ length: 24 }, (_, i) => i);

const DashboardCalendar: React.FC<CalendarProps> = ({
  timeBlocks = [
    {
      id: "1",
      title: "Project Meeting",
      start: new Date(new Date().setHours(10, 0, 0, 0)),
      end: new Date(new Date().setHours(11, 30, 0, 0)),
      category: "work",
    },
    {
      id: "2",
      title: "Gym Session",
      start: new Date(new Date().setHours(17, 0, 0, 0)),
      end: new Date(new Date().setHours(18, 0, 0, 0)),
      category: "health",
    },
    {
      id: "3",
      title: "Study Time",
      start: addDays(new Date(new Date().setHours(14, 0, 0, 0)), 1),
      end: addDays(new Date(new Date().setHours(16, 0, 0, 0)), 1),
      category: "study",
    },
  ],
  onAddTimeBlock = () => {},
  onUpdateTimeBlock = () => {},
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [isAddingTimeBlock, setIsAddingTimeBlock] = useState(false);
  const [newTimeBlock, setNewTimeBlock] = useState({
    title: "",
    start: new Date(),
    end: addHours(new Date(), 1),
    category: "work",
  });

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const handlePrevWeek = () => {
    setCurrentDate(subDays(currentDate, 7));
  };

  const handleNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  const handleAddTimeBlock = () => {
    onAddTimeBlock(newTimeBlock);
    setIsAddingTimeBlock(false);
    setNewTimeBlock({
      title: "",
      start: new Date(),
      end: addHours(new Date(), 1),
      category: "work",
    });
  };

  const getTimeBlockPosition = (block: TimeBlock, day: Date) => {
    if (!isSameDay(block.start, day)) return null;

    const startHour = block.start.getHours();
    const startMinutes = block.start.getMinutes();
    const endHour = block.end.getHours();
    const endMinutes = block.end.getMinutes();

    const top = startHour * 60 + startMinutes;
    const height = endHour * 60 + endMinutes - top;

    return {
      top: `${top}px`,
      height: `${height}px`,
      left: "5px",
      right: "5px",
    };
  };

  return (
    <Card className="w-full h-full bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Calendar</CardTitle>
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 border-dashed">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={handlePrevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-medium">
              {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
            </div>
            <Button variant="outline" size="icon" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button size="sm" onClick={() => setIsAddingTimeBlock(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Event
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-8 gap-2">
          {/* Time labels column */}
          <div className="col-span-1">
            <div className="h-10"></div> {/* Empty cell for header alignment */}
            <div className="relative h-[1440px]">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="absolute w-full"
                  style={{ top: `${hour * 60}px` }}
                >
                  <div className="text-xs text-gray-500 -mt-2">
                    {hour === 0
                      ? "12 AM"
                      : hour < 12
                        ? `${hour} AM`
                        : hour === 12
                          ? "12 PM"
                          : `${hour - 12} PM`}
                  </div>
                  <div className="border-t border-gray-200 w-full"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Days columns */}
          {daysOfWeek.map((day, index) => (
            <div key={index} className="col-span-1">
              <div className="text-center py-2 font-medium border-b">
                <div>{format(day, "EEE")}</div>
                <div className="text-sm">{format(day, "d")}</div>
              </div>
              <div className="relative h-[1440px] border-l first:border-l-0">
                {/* Hour grid lines */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="absolute w-full border-t border-gray-100"
                    style={{ top: `${hour * 60}px` }}
                  ></div>
                ))}

                {/* Time blocks */}
                {timeBlocks.map((block) => {
                  const position = getTimeBlockPosition(block, day);
                  if (!position) return null;

                  return (
                    <div
                      key={block.id}
                      className={`absolute rounded-md p-2 ${categoryColors[block.category] || "bg-gray-500"} text-white text-xs overflow-hidden`}
                      style={position}
                    >
                      <div className="font-medium">{block.title}</div>
                      <div>
                        {format(block.start, "h:mm a")} -{" "}
                        {format(block.end, "h:mm a")}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {isAddingTimeBlock && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Add New Event</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md"
                      value={newTimeBlock.title}
                      onChange={(e) =>
                        setNewTimeBlock({
                          ...newTimeBlock,
                          title: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Category
                    </label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={newTimeBlock.category}
                      onChange={(e) =>
                        setNewTimeBlock({
                          ...newTimeBlock,
                          category: e.target.value,
                        })
                      }
                    >
                      <option value="work">Work</option>
                      <option value="personal">Personal</option>
                      <option value="study">Study</option>
                      <option value="health">Health</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        className="w-full p-2 border rounded-md"
                        value={format(newTimeBlock.start, "HH:mm")}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value
                            .split(":")
                            .map(Number);
                          const newStart = new Date(selectedDate || new Date());
                          newStart.setHours(hours, minutes, 0, 0);
                          setNewTimeBlock({ ...newTimeBlock, start: newStart });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        className="w-full p-2 border rounded-md"
                        value={format(newTimeBlock.end, "HH:mm")}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value
                            .split(":")
                            .map(Number);
                          const newEnd = new Date(selectedDate || new Date());
                          newEnd.setHours(hours, minutes, 0, 0);
                          setNewTimeBlock({ ...newTimeBlock, end: newEnd });
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingTimeBlock(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddTimeBlock}>Save</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardCalendar;
