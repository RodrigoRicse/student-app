import { Link } from "react-router-dom";
import { useState } from "react";
import { useStudents } from "../hooks/useStudents";
import { studentService } from "../services/studentService";
import { StudentTable } from "../components/StudentTable";
import { useAuth } from "../../auth/hooks/useAuth";
import { useEnrollments } from "../../enrollments/hooks/useEnrollments";
import { useSchedules } from "../../schedules/hooks/useSchedules";

export function StudentsListPage() {
  const { students, loading, error, reload } = useStudents();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const { enrollments } = useEnrollments();
  const { schedules } = useSchedules();
  const [gradeFilter, setGradeFilter] = useState<string>("");
  const [sectionFilter, setSectionFilter] = useState<string>("");

  const visibleStudents = (() => {
    // Admin ve todos (con filtro opcional); docentes solo alumnos activos
    const base = isAdmin || !user?.teacherDni ? students : students.filter((st) => st.status === "ACTIVO");

    const withGrade = gradeFilter ? base.filter((st) => String(st.grade) === gradeFilter) : base;
    const withSection = sectionFilter ? withGrade.filter((st) => st.section === sectionFilter) : withGrade;

    if (isAdmin || !user?.teacherDni) return withSection;

    const scheduleIds = schedules
      .filter((s) => s.teacherDni === user.teacherDni)
      .map((s) => String(s.id));

    const allowedDnis = new Set(
      enrollments
        .filter((e) => scheduleIds.includes(String(e.scheduleId)))
        .map((e) => e.studentDni)
    );

    return withSection.filter((st) => allowedDnis.has(st.dni));
  })();

  // Eliminar por DNI
  const handleDelete = async (dni: string) => {
    const confirmar = confirm("Seguro que deseas eliminar este estudiante?");
    if (!confirmar) return;

    await studentService.removeByDni(dni);
    reload();
  };

  return (
    <section className="page">

      {/* ENCABEZADO DEL MODULO */}
      <header className="page__header">
        <h1 className="page-title">Estudiantes de Primaria</h1>

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <label className="form__group" style={{ margin: 0 }}>
            <span style={{ fontSize: "0.9rem", color: "#cbd5e1" }}>Filtrar por grado</span>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              style={{ minWidth: 120 }}
            >
              <option value="">Todos</option>
              {[1, 2, 3, 4, 5, 6].map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>

          <label className="form__group" style={{ margin: 0 }}>
            <span style={{ fontSize: "0.9rem", color: "#cbd5e1" }}>Filtrar por seccion</span>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              style={{ minWidth: 120 }}
            >
              <option value="">Todas</option>
              {["A", "B", "C", "D"].map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </label>

          {isAdmin && (
            <Link to="/students/new" className="btn">
              + Nuevo estudiante
            </Link>
          )}
        </div>
      </header>

      {/* ESTADOS DE CARGA */}
      {loading && <p>Cargando estudiantes...</p>}
      {error && <p className="text-error">{error}</p>}

      {/* TABLA */}
      {!loading && !error && (
        <StudentTable
          students={visibleStudents}
          onDelete={isAdmin ? handleDelete : undefined}
          canEdit={isAdmin}
          canDelete={isAdmin}
        />
      )}

    </section>
  );
}
