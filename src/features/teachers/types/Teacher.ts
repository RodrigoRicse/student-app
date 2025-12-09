export interface Teacher {
  id?: number;

  dni: string;
  name: string;
  lastname: string;

  email: string;
  sex: "M" | "F";

  birthdate: string;
  specialty: "Primaria General" | "Idiomas" | "Artes" | "Deportes" | "Computo";
  grade: number | "ALL"; // 1-6 o TODOS
  section: "A" | "B" | "C" | "D" | "ROTATIVO"; // A-D o rotativo

  role: "DIRECTOR" | "DOCENTE";
  status: "ACTIVO" | "INACTIVO";
}
