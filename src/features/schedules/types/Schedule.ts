export type Shift = "MANANA" | "TARDE" | "NOCHE";

export interface Schedule {
  id?: string;
  teacherDni: string;
  shift: Shift;
  grade: number;
  section: string;
  courses: string[]; // ids de cursos asignados
}
