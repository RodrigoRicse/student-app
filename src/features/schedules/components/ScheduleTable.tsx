import type { Schedule } from "../types/Schedule";
import type { Teacher } from "../../teachers/types/Teacher";
import type { Course } from "../../courses/types/Course";

interface Props {
  schedules: Schedule[];
  teachers: Teacher[];
  courses: Course[];
  onDelete: (id: string) => void;
}

const SHIFT_LABEL: Record<string, string> = {
  MANANA: "Manana",
  TARDE: "Tarde",
};

export function ScheduleTable({ schedules, teachers, courses, onDelete }: Props) {
  const teacherName = (dni: string) => {
    const t = teachers.find((x) => x.dni === dni);
    return t ? `${t.name} ${t.lastname}` : dni;
  };

  const courseNames = (ids: string[]) =>
    ids
      .map((id) => courses.find((c) => c.id === id)?.name ?? id)
      .join(", ");

  const gradeLabel = (grade: Schedule["grade"]) => (grade === "ALL" ? "Todos" : grade);
  const sectionLabel = (section: Schedule["section"]) => (section === "ROTATIVO" ? "Rotativo" : section);

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Docente</th>
            <th>Turno</th>
            <th>Grado</th>
            <th>Seccion</th>
            <th>Cursos</th>
            <th className="table__actions-col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {schedules.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", padding: "12px" }}>
                No hay horarios registrados.
              </td>
            </tr>
          )}

          {schedules.map((sch) => (
            <tr key={sch.id}>
              <td>{teacherName(sch.teacherDni)}</td>
              <td>{SHIFT_LABEL[sch.shift]}</td>
              <td>{gradeLabel(sch.grade)}</td>
              <td>{sectionLabel(sch.section)}</td>
              <td>{courseNames(sch.courses)}</td>
              <td className="table__actions">
                {sch.id && (
                  <button
                    className="btn btn--small btn--danger"
                    onClick={() => onDelete(sch.id!)}
                  >
                    Eliminar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
