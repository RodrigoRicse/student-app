import axios from "axios";
import type { Enrollment } from "../types/Enrollment";

const API_URL = "/enrollments";

async function getAll(): Promise<Enrollment[]> {
  const { data } = await axios.get<Enrollment[]>(API_URL);
  return data;
}

async function create(enrollment: Omit<Enrollment, "id">): Promise<Enrollment> {
  const { data } = await axios.post<Enrollment>(API_URL, enrollment);
  return data;
}

async function remove(id: string | number): Promise<void> {
  await axios.delete(`${API_URL}/${id}`);
}

export const enrollmentService = {
  getAll,
  create,
  remove,
};
