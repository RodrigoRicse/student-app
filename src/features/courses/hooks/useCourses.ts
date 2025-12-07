import { useEffect, useState } from "react";
import { courseService } from "../services/courseService";
import type { Course } from "../types/Course";

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await courseService.getAll();
      setCourses(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // efecto seguro
    (async () => {
      await load();
    })();
  }, []);

  return { courses, loading, reload: load };
}
