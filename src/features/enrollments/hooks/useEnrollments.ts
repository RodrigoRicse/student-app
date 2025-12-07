import { useEffect, useState } from "react";
import type { Enrollment } from "../types/Enrollment";
import { enrollmentService } from "../services/enrollmentService";

export function useEnrollments() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await enrollmentService.getAll();
      setEnrollments(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las matriculas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return { enrollments, loading, error, reload: load };
}
