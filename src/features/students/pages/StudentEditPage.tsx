import { useParams } from "react-router-dom";
import { useStudent } from "../hooks/useStudent";
import { StudentForm } from "../components/StudentForm";

export function StudentEditPage() {
  const params = useParams();
  const dni = params.dni;

  const { student, loading, error } = useStudent(dni);

  if (!dni) {
    return <p className="text-error">DNI no valido.</p>;
  }

  if (loading) {
    return <p>Cargando estudiante...</p>;
  }

  if (error) {
    return <p className="text-error">{error}</p>;
  }

  if (!student) {
    return <p className="text-error">Estudiante no encontrado.</p>;
  }

  return (
    <section className="page">
      <StudentForm initialStudent={student} />
    </section>
  );
}
