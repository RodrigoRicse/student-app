import { useEffect, useState } from "react";
import type { Schedule } from "../types/Schedule";
import { scheduleService } from "../services/scheduleService";

export function useSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await scheduleService.getAll();
      setSchedules(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los horarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return { schedules, loading, error, reload: load };
}
