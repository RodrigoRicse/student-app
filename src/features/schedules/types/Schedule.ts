export type Shift = "MANANA" | "TARDE";
export type ScheduleSection = "A" | "B" | "C" | "D" | "ROTATIVO";
export type ScheduleGrade = number | "ALL";

export interface Schedule {
  id?: string;
  teacherDni: string;
  shift: Shift;
  grade: ScheduleGrade;
  section: ScheduleSection;
  courses: string[]; // ids de cursos asignados
}
