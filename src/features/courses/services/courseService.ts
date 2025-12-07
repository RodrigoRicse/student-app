import axios from "axios";
import type { Course } from "../types/Course";

const API_URL = "/courses";

async function getAll(): Promise<Course[]> {
  const { data } = await axios.get<Course[]>(API_URL);
  return data;
}

async function getById(id: string): Promise<Course> {
  const { data } = await axios.get<Course[]>(`${API_URL}?id=${id}`);
  if (!data.length) throw new Error("Curso no encontrado");
  return data[0];
}

async function create(course: Course): Promise<Course> {
  const { data } = await axios.post<Course>(API_URL, course);
  return data;
}

async function update(id: string, course: Course): Promise<Course> {
  const existing = await getById(id);
  const { data } = await axios.put<Course>(`${API_URL}/${existing.id}`, course);
  return data;
}

async function remove(id: string): Promise<void> {
  const existing = await getById(id);
  await axios.delete(`${API_URL}/${existing.id}`);
}

export const courseService = {
  getAll,
  getById,
  create,
  update,
  remove,
};
