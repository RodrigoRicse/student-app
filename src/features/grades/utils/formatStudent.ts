import type { Student } from "../../students/types/Student";

export function formatStudentLabel(student: Student): string {
  return `${student.name} ${student.lastname} - Grado ${student.grade} Seccion ${student.section} (${student.dni})`;
}
