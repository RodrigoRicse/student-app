import type { Student } from "../../features/students/types/Student";
import type { Teacher } from "../../features/teachers/types/Teacher";

const ALLOWED_SECTIONS: Array<"A" | "B" | "C" | "D"> = ["A", "B", "C", "D"];
const ALLOWED_TEACHER_SECTIONS: Teacher["section"][] = ["A", "B", "C", "D", "ROTATIVO"];
const ALLOWED_SHIFTS: Array<"MANANA" | "TARDE"> = ["MANANA", "TARDE"];
const ALLOWED_SPECIALTIES: Teacher["specialty"][] = [
  "Primaria General",
  "Idiomas",
  "Artes",
  "Deportes",
  "Computo",
];

export function validateStudent(student: Student): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!student.dni || student.dni.length !== 8) {
    errors.dni = "El DNI debe tener 8 digitos.";
  }

  if (!student.name.trim()) {
    errors.name = "El nombre es obligatorio.";
  }

  if (!student.lastname.trim()) {
    errors.lastname = "El apellido es obligatorio.";
  }

  if (!student.email.includes("@")) {
    errors.email = "Correo invalido.";
  }

  if (!student.birthdate) {
    errors.birthdate = "La fecha de nacimiento es obligatoria.";
  }

  if (student.age < 5 || student.age > 12) {
    errors.age = "La edad debe ser entre 5 y 12 anos.";
  }

  if (student.level !== "Primaria") {
    errors.level = "Nivel invalido.";
  }

  if (student.grade < 1 || student.grade > 6) {
    errors.grade = "El grado debe estar entre 1 y 6.";
  }

  if (!student.section || !ALLOWED_SECTIONS.includes(student.section)) {
    errors.section = "La seccion es obligatoria.";
  }

  if (!student.shift || !ALLOWED_SHIFTS.includes(student.shift)) {
    errors.shift = "El turno es obligatorio.";
  }

  if (student.shift === "MANANA" && !["A", "B"].includes(student.section)) {
    errors.section = "Las secciones A y B solo son validas para el turno MANANA.";
  }

  if (student.shift === "TARDE" && !["C", "D"].includes(student.section)) {
    errors.section = "Las secciones C y D solo son validas para el turno TARDE.";
  }

  return errors;
}

export function validateTeacher(teacher: Teacher) {
  const errors: Record<string, string> = {};

  if (!teacher.dni || teacher.dni.length !== 8) errors.dni = "DNI invalido";
  if (!teacher.name.trim()) errors.name = "Nombre obligatorio";
  if (!teacher.lastname.trim()) errors.lastname = "Apellido obligatorio";
  if (!teacher.email.includes("@")) errors.email = "Correo invalido";
  if (!teacher.birthdate) errors.birthdate = "Fecha requerida";
  if (teacher.grade !== "ALL" && (teacher.grade < 1 || teacher.grade > 6)) errors.grade = "Grado invalido";
  if (!ALLOWED_SPECIALTIES.includes(teacher.specialty)) errors.specialty = "Especialidad invalida";
  if (!ALLOWED_TEACHER_SECTIONS.includes(teacher.section)) errors.section = "Seccion invalida";

  return errors;
}

