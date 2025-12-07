import { enrollmentService } from "../services/enrollmentService";
import { useEnrollments } from "../hooks/useEnrollments";
import { EnrollmentForm } from "../components/EnrollmentForm";
import { EnrollmentTable } from "../components/EnrollmentTable";
import { useSchedules } from "../../schedules/hooks/useSchedules";
import { useStudents } from "../../students/hooks/useStudents";
import { useTeachers } from "../../teachers/hooks/useTeachers";
import { useCourses } from "../../courses/hooks/useCourses";

export function EnrollmentsPage() {
  const { enrollments, loading, error, reload } = useEnrollments();
  const { schedules } = useSchedules();
  const { students } = useStudents();
  const { teachers } = useTeachers();
  const { courses } = useCourses();

  const handleDelete = async (id: string | number) => {
    if (!confirm("Eliminar matricula?")) return;
    await enrollmentService.remove(id);
    reload();
  };

  const handleSaved = async () => {
    await reload();
  };

  return (
    <section className="page">
      <div className="page__header">
        <h1 className="page-title">Matriculas</h1>
      </div>

      {error && <p className="text-error">{error}</p>}

      <div className="form__grid">
        <EnrollmentForm
          schedules={schedules}
          students={students}
          teachers={teachers}
          courses={courses}
          onSaved={handleSaved}
        />

        <div className="card">
          <h2 className="card__title">Matriculas registradas</h2>
          {loading ? (
            <p>Cargando...</p>
          ) : (
            <EnrollmentTable
              enrollments={enrollments}
              schedules={schedules}
              students={students}
              teachers={teachers}
              courses={courses}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </section>
  );
}
