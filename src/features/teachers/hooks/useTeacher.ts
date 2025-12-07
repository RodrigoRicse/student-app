import { useState, useEffect } from "react";
import type { Teacher } from "../types/Teacher";
import { teacherService } from "../services/teacherService";

export function useTeacher(dni: string) {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await teacherService.getByDni(dni);
        setTeacher(data);
      } catch {
        setError("No se pudo cargar el docente");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [dni]);

  return { teacher, loading, error };
}
