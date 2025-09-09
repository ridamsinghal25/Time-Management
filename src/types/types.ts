export interface Task {
  id: string;
  title: string;
  dueDate?: string;
  subtasks: Task[];
  priority: "l" | "m" | "h";
}

export const priorityOrder: Record<NonNullable<Task["priority"]>, number> = {
  h: 1,
  m: 2,
  l: 3,
};

export type CourseAttendance = {
  totalPresent: number;
  totalAbsent: number;
  totalDoNotConsiderForAttendance: number;
  totalClasses: number;
  percentage: number;
  approvedLeaves: number;
  unapprovedLeaves: number;
  sessionsBeforeJoiningClassGroup?: number;
  courseId?: number;
  courseName?: string;
};

export type AttendanceSummary = {
  totalPresent: number;
  totalAbsent: number;
  totalDoNotConsiderForAttendance: number;
  totalClasses: number;
  percentage: number;
  approvedLeaves: number;
  unapprovedLeaves: number;
  sessionsBeforeJoiningClassGroup?: number;
  termId?: number;
  courseAttendance?: CourseAttendance[];
};
