import { useParams } from "react-router-dom";
import { useTeacher } from "../hooks/useTeacher";
import { TeacherForm } from "../components/TeacherForm";

export function TeacherEditPage() {
  const { dni } = useParams();
  const { teacher, loading, error } = useTeacher(dni!);

  if (loading) return <p>Cargando docente...</p>;
  if (error) return <p className="text-error">{error}</p>;
  if (!teacher) return <p className="text-error">No encontrado</p>;

  return (
    <section className="page">
      <TeacherForm initialTeacher={teacher} />
    </section>
  );
}
