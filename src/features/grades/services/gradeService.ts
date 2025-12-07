import axios from "axios";
import type { Grade } from "../types/Grade";

const API_URL = "/grades";

async function getAll(): Promise<Grade[]> {
  const { data } = await axios.get<Grade[]>(API_URL);
  return data;
}

async function create(grade: Omit<Grade, "id">): Promise<Grade> {
  const { data } = await axios.post<Grade>(API_URL, grade);
  return data;
}

async function update(id: string, grade: Omit<Grade, "id">): Promise<Grade> {
  const { data } = await axios.put<Grade>(`${API_URL}/${id}`, grade);
  return data;
}

export const gradeService = {
  getAll,
  create,
  update,
};
