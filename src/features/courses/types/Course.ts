export interface Course {
  id: string; // nombre convertido a slug
  name: string;
  teacherDni: string; // asignacion del docente
  status: "ACTIVO" | "INACTIVO";
}
