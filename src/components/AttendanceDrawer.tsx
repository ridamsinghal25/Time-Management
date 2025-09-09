import { useEffect, useState } from "react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import type { AttendanceSummary } from "@/types/types";
import { Textarea } from "./ui/textarea";
import { RefreshCcw } from "lucide-react";

export function SheetDemo() {
  const [authToken, setAuthToken] = useState("");
  const [attendance, setAttendance] = useState<AttendanceSummary>();
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const sendMessageWithRetry = (
      message: any,
      callback: (response: any) => void,
      retries = 3
    ) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          if (retries > 0) {
            // Retry after a short delay
            console.log("Retrying...");
            setTimeout(
              () => sendMessageWithRetry(message, callback, retries - 1),
              100
            );
            return;
          }
          console.error("Chrome runtime error:", chrome.runtime.lastError);
          return;
        }
        callback(response);
      });
    };

    sendMessageWithRetry(
      {
        type: "FETCH_FROM_LOCALHOST",
        endpoint: "/api/attendance/student/438390/term/67",
        token: localStorage.getItem("attendanceToken") || "",
      },
      (response) => {
        if (response && response.success) {
          console.log("Response data:", response.data);
          setAttendance(response.data);
        } else {
          console.error(
            "Error fetching data:",
            response?.error || "No response received"
          );
        }
      }
    );
  }, [refresh]);

  const handleTokenSubmit = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAuthToken(e.target.value);
    localStorage.setItem("attendanceToken", e.target.value);
    setRefresh(!refresh);
  };

  const overallPct = useMemo(() => {
    if (typeof attendance?.percentage !== "number") return "-";
    return `${(Math.round(attendance.percentage * 10) / 10).toFixed(1)}%`;
  }, [attendance?.percentage]);

  const overallPctValue =
    typeof attendance?.percentage === "number"
      ? Math.max(0, Math.min(100, attendance.percentage))
      : 0;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="default">View Attendance</Button>
      </SheetTrigger>
      <SheetContent side={"right"} className="w-full sm:max-w-md">
        <ScrollArea className="h-full">
          <SheetHeader>
            <SheetTitle>Attendance</SheetTitle>
            <SheetDescription>
              <Textarea
                placeholder="Enter auth token"
                value={authToken}
                onChange={handleTokenSubmit}
                className="h-12 my-2 select-none break-all"
              />
            </SheetDescription>

            <Button onClick={() => setRefresh(!refresh)} className="w-30">
              <RefreshCcw />
              Refresh
            </Button>
          </SheetHeader>

          <div className={"mt-4 flex flex-col gap-5 p-3 sm:p-4"}>
            <section
              aria-labelledby="overall-attendance"
              className="flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <h3
                  id="overall-attendance"
                  className="text-sm font-semibold text-balance"
                >
                  Overall attendance
                </h3>
                <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium">
                  {overallPct}
                </span>
              </div>

              <Progress
                value={overallPctValue}
                className="h-2"
                aria-labelledby="overall-attendance"
              />

              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Present</span>
                  <span className="text-sm text-center font-medium bg-green-500 w-10 rounded-md">
                    {attendance?.totalPresent ?? "-"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Absent</span>
                  <span className="text-sm text-center font-medium bg-red-500 w-10 rounded-md">
                    {attendance?.totalAbsent ?? "-"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">
                    Total Classes
                  </span>
                  <span className="text-sm font-medium">
                    {attendance?.totalClasses ?? "-"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">
                    Unapproved Leaves
                  </span>
                  <span className="text-sm font-medium">
                    {attendance?.unapprovedLeaves ?? "-"}
                  </span>
                </div>
              </div>
            </section>

            {Array.isArray(attendance?.courseAttendance) &&
            attendance.courseAttendance.length > 0 ? (
              <section
                aria-labelledby="per-course"
                className="flex flex-col gap-3"
              >
                <h3 id="per-course" className="text-sm font-semibold">
                  Subject Attendance
                </h3>
                <ul className="flex flex-col gap-3">
                  {attendance.courseAttendance.map((c) => {
                    const coursePct =
                      typeof c.percentage === "number"
                        ? `${(Math.round(c.percentage * 10) / 10).toFixed(1)}%`
                        : "-";
                    return (
                      <li key={c.courseId} className="rounded-md border p-4">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-pretty">
                              {c.courseName || "Course"}
                            </p>
                          </div>
                          <span
                            className={`rounded px-2 py-0.5 text-xs ${
                              Number(coursePct.replace("%", "")) < 75
                                ? "text-white bg-red-900"
                                : "text-white bg-green-900"
                            }`}
                          >
                            {coursePct}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 mt-5">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground">
                              Present
                            </span>
                            <span className="text-sm font-medium">
                              {c.totalPresent}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground">
                              Absent
                            </span>
                            <span className="text-sm font-medium">
                              {c.totalAbsent}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground">
                              Total Classes
                            </span>
                            <span className="text-sm font-medium">
                              {c.totalClasses}
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : (
              <div className="rounded-md border p-4 text-sm text-muted-foreground">
                No per-course details available.
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
