export interface Teacher {
  id?: number;

  dni: string;
  name: string;
  lastname: string;

  email: string;
  sex: "M" | "F";

  birthdate: string;
  specialty: string; // area que ensena
  grade: number; // Grado asignado 1-6
  section: string; // A-D

  role: "DIRECTOR" | "DOCENTE";
  status: "ACTIVO" | "INACTIVO";
}
