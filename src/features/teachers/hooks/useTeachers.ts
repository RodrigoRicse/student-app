import { useEffect, useState } from "react";
import type { Teacher } from "../types/Teacher";
import { teacherService } from "../services/teacherService";

export function useTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getAll();
      setTeachers(data);
    } catch {
      setError("No se pudieron cargar los docentes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return { teachers, loading, error, reload: load };
}
