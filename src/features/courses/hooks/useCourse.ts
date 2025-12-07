import { useEffect, useState } from "react";
import { courseService } from "../services/courseService";
import type { Course } from "../types/Course";

export function useCourse(id?: string) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchCourse = async () => {
      setLoading(true);
      try {
        const data = await courseService.getById(id);
        setCourse(data);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  return { course, loading };
}
