import { useEffect, useState } from "react";
import type { Student } from "../types/Student";
import { studentService } from "../services/studentService";

/**
 * Hook para obtener un estudiante por su DNI (identificador real del sistema)
 */
export function useStudent(dni?: string) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudent = async () => {
      if (!dni) return;

      try {
        setLoading(true);
        setError(null);

        const data = await studentService.getByDni(dni);
        setStudent(data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el estudiante.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [dni]);

  return { student, loading, error };
}
