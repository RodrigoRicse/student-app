import axios from "axios";
import type { Schedule } from "../types/Schedule";

const API_URL = "/schedules";

async function getAll(): Promise<Schedule[]> {
  const { data } = await axios.get<Schedule[]>(API_URL);
  return data;
}

async function create(schedule: Omit<Schedule, "id">): Promise<Schedule> {
  const { data } = await axios.post<Schedule>(API_URL, schedule);
  return data;
}

async function update(id: string, schedule: Omit<Schedule, "id">): Promise<Schedule> {
  const { data } = await axios.put<Schedule>(`${API_URL}/${id}`, schedule);
  return data;
}

async function remove(id: string): Promise<void> {
  await axios.delete(`${API_URL}/${id}`);
}

export const scheduleService = {
  getAll,
  create,
  update,
  remove,
};
