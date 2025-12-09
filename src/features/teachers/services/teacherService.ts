import axios from "axios";
import type { Teacher } from "../types/Teacher";

const API_URL = "/teachers";
const USERS_URL = "/users";

async function getAll(): Promise<Teacher[]> {
  const { data } = await axios.get<Teacher[]>(API_URL);
  return data;
}

async function getByDni(dni: string): Promise<Teacher | null> {
  const { data } = await axios.get<Teacher[]>(`${API_URL}?dni=${dni}`);
  return data[0] || null;
}

async function create(teacher: Omit<Teacher, "id">): Promise<Teacher> {
  const { data } = await axios.post<Teacher>(API_URL, teacher);
  await syncUser(data);
  return data;
}

async function updateByDni(dni: string, teacher: Omit<Teacher, "id">) {
  const existing = await getByDni(dni);
  if (!existing) throw new Error("Docente no encontrado");

  const { data } = await axios.put<Teacher>(`${API_URL}/${existing.id}`, teacher);
  await syncUser(data);
  return data;
}

async function deleteByDni(dni: string) {
  const existing = await getByDni(dni);
  if (!existing) throw new Error("Docente no encontrado");

  // borrar el usuario vinculado al docente, si existe
  const { data: users } = await axios.get<Array<{ id: string }>>(
    `${USERS_URL}?teacherDni=${existing.dni}`
  );
  if (users.length > 0) {
    await axios.delete(`${USERS_URL}/${users[0].id}`);
  }

  await axios.delete(`${API_URL}/${existing.id}`);
}

export const teacherService = {
  getAll,
  getByDni,
  create,
  updateByDni,
  deleteByDni,
};

async function syncUser(teacher: Teacher) {
  const payload = {
    email: teacher.email,
    password: teacher.dni, // password = DNI
    role: "DOCENTE",
    name: `${teacher.name} ${teacher.lastname}`,
    teacherDni: teacher.dni,
  };

  // buscar usuario por teacherDni
  const { data: users } = await axios.get<Array<{ id: string }>>(
    `${USERS_URL}?teacherDni=${teacher.dni}`
  );

  if (users.length > 0) {
    const userId = users[0].id;
    await axios.put(`${USERS_URL}/${userId}`, payload);
  } else {
    await axios.post(USERS_URL, payload);
  }
}
