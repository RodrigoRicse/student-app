import { Link } from "react-router-dom";
import type { Course } from "../types/Course";
import type { Teacher } from "../../teachers/types/Teacher";

interface Props {
  courses: Course[];
  teachers: Teacher[];
  onDelete: (id: string) => void;
}

export function CourseTable({ courses, teachers, onDelete }: Props) {
  const getTeacherName = (dni: string) => {
    const t = teachers.find((x) => x.dni === dni);
    return t ? `${t.name} ${t.lastname}` : "Sin asignar";
  };

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Curso</th>
            <th>Profesor</th>
            <th>Estado</th>
            <th className="table__actions-col">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {courses.length === 0 && (
            <tr>
              <td colSpan={4} style={{ textAlign: "center", padding: "12px" }}>
                No hay cursos registrados.
              </td>
            </tr>
          )}

          {courses.map((course) => (
            <tr key={course.id}>
              <td>{course.name}</td>

              <td>{getTeacherName(course.teacherDni)}</td>

              <td>
                <span
                  className={
                    "badge " +
                    (course.status === "ACTIVO"
                      ? "badge--success"
                      : "badge--danger")
                  }
                >
                  {course.status}
                </span>
              </td>

              <td className="table__actions">
                <Link
                  to={`/courses/${course.id}/edit`}
                  className="btn btn--small"
                >
                  Editar
                </Link>

                <button
                  className="btn btn--small btn--danger"
                  onClick={() => onDelete(course.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
