import { Link } from "react-router-dom";
import { useTeachers } from "../hooks/useTeachers";
import { teacherService } from "../services/teacherService";
import { TeacherTable } from "../components/TeacherTable";

export function TeacherListPage() {
  const { teachers, loading, error, reload } = useTeachers();

  const handleDelete = async (dni: string) => {
    const c = confirm("Eliminar docente?");
    if (!c) return;

    await teacherService.deleteByDni(dni);
    reload();
  };

  return (
    <section className="page">
      <div className="page__header">
        <h1 className="page-title">Docentes</h1>
        <Link to="/teachers/new" className="btn">+ Nuevo docente</Link>
      </div>

      {loading && <p>Cargando...</p>}
      {error && <p className="text-error">{error}</p>}

      {!loading && !error && (
        <TeacherTable teachers={teachers} onDelete={handleDelete} />
      )}
    </section>
  );
}
