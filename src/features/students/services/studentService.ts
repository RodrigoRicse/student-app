import axios from "axios";
import type { Student } from "../types/Student";

const API_URL = "/students";

/* ----------------------------------------------------
   Obtener todos los estudiantes
---------------------------------------------------- */
async function getAll(): Promise<Student[]> {
  const { data } = await axios.get<Student[]>(API_URL);
  return data;
}

/* ----------------------------------------------------
   Buscar estudiante por DNI (retorna SOLO UNO)
   JSON Server retorna arreglo -> tomamos data[0]
---------------------------------------------------- */
async function getByDni(dni: string): Promise<Student> {
  const { data } = await axios.get<Student[]>(`${API_URL}?dni=${dni}`);

  if (!data.length) {
    throw new Error(`Estudiante con DNI ${dni} no encontrado`);
  }

  return data[0];
}

/* ----------------------------------------------------
   Crear estudiante
   - JSON Server genera el ID internamente
---------------------------------------------------- */
async function create(student: Omit<Student, "id">): Promise<Student> {
  const { data } = await axios.post<Student>(API_URL, student);
  return data;
}

/* ----------------------------------------------------
   Actualizar usando DNI (no ID)
   - Buscar por DNI -> obtener ID -> actualizar por ID
---------------------------------------------------- */
async function updateByDni(
  dni: string,
  student: Omit<Student, "id">
): Promise<Student> {
  const existing = await getByDni(dni); // este trae id interno
  const id = existing.id;

  const { data } = await axios.put<Student>(`${API_URL}/${id}`, student);
  return data;
}

/* ----------------------------------------------------
   Eliminar usando DNI
   - Buscar por DNI -> obtener ID -> eliminar por ID
---------------------------------------------------- */
async function removeByDni(dni: string): Promise<void> {
  const existing = await getByDni(dni);
  const id = existing.id;

  await axios.delete(`${API_URL}/${id}`);
}

export const studentService = {
  getAll,
  getByDni,
  create,
  updateByDni,
  removeByDni,
};
