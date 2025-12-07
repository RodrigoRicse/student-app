export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "DOCENTE";
  teacherDni?: string;
}
