export interface Student {
  id?: number;

  dni: string;
  name: string;
  lastname: string;

  email: string; // correo del apoderado

  sex: "M" | "F";
  birthdate: string;
  age: number;

  level: "Primaria"; // fijo
  grade: number; // 1-6
  section: string; // A/B/C/D
  shift: "MANANA" | "TARDE" | "NOCHE";

  status: "ACTIVO" | "INACTIVO";
}
