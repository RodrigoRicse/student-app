import { Link } from "react-router-dom";
import { useCourses } from "../hooks/useCourses";
import { useTeachers } from "../../teachers/hooks/useTeachers";
import { CourseTable } from "../components/CourseTable";
import { courseService } from "../services/courseService";

export function CoursesListPage() {
  const { courses, loading, reload } = useCourses();
  const { teachers } = useTeachers();

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar curso?")) return;
    await courseService.remove(id);
    reload();
  };

  return (
    <section className="page">
      <div className="page__header">
        <h2 className="page-title">Cursos</h2>
        <Link to="/courses/new" className="btn">+ Nuevo curso</Link>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <CourseTable
          courses={courses}
          teachers={teachers}
          onDelete={handleDelete}
        />
      )}
    </section>
  );
}
