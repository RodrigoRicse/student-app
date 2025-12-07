import { useParams } from "react-router-dom";
import { useCourse } from "../hooks/useCourse";
import { CourseForm } from "../components/CourseForm";

export function CourseEditPage() {
  const { id } = useParams();
  const { course, loading } = useCourse(id!);

  if (loading) return <p>Cargando...</p>;
  if (!course) return <p>Curso no encontrado</p>;

  return <CourseForm initialCourse={course} />;
}
