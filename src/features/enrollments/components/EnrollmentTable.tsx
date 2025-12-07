import type { Enrollment } from "../types/Enrollment";
import type { Schedule } from "../../schedules/types/Schedule";
import type { Student } from "../../students/types/Student";
import type { Teacher } from "../../teachers/types/Teacher";
import type { Course } from "../../courses/types/Course";

interface Props {
  enrollments: Enrollment[];
  schedules: Schedule[];
  students: Student[];
  teachers: Teacher[];
  courses: Course[];
  onDelete: (id: string | number) => void;
}

const SHIFT_LABEL: Record<string, string> = {
  MANANA: "Manana",
  TARDE: "Tarde",
  NOCHE: "Noche",
};

export function EnrollmentTable({ enrollments, schedules, students, teachers, courses, onDelete }: Props) {
  const scheduleData = (scheduleId: string | number) => {
    const sch = schedules.find((s) => String(s.id) === String(scheduleId));
    if (!sch) return { teacher: "-", shift: "", courseNames: "", grade: "", section: "" };
    const teacher = teachers.find((t) => t.dni === sch.teacherDni);
    const courseNames = sch.courses
      .map((cId) => courses.find((c) => c.id === cId)?.name ?? cId)
      .join(", ");
    return {
      teacher: teacher ? `${teacher.name} ${teacher.lastname}` : sch.teacherDni,
      shift: SHIFT_LABEL[sch.shift] ?? sch.shift,
      grade: sch.grade,
      section: sch.section,
      courseNames,
    };
  };

  const studentName = (dni: string) => {
    const st = students.find((s) => s.dni === dni);
    return st ? `${st.name} ${st.lastname}` : dni;
  };

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Alumno</th>
            <th>Horario</th>
            <th>Turno</th>
            <th>Grado</th>
            <th>Seccion</th>
            <th>Cursos</th>
            <th className="table__actions-col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {enrollments.length === 0 && (
            <tr>
              <td colSpan={7} style={{ textAlign: "center", padding: "12px" }}>
                No hay matriculas registradas.
              </td>
            </tr>
          )}

          {enrollments.map((enr) => {
            const schInfo = scheduleData(enr.scheduleId);
            return (
              <tr key={enr.id ?? `${enr.scheduleId}-${enr.studentDni}`}>
                <td>{studentName(enr.studentDni)}</td>
                <td>{schInfo.teacher}</td>
                <td>{schInfo.shift}</td>
                <td>{schInfo.grade}</td>
                <td>{schInfo.section}</td>
                <td>{schInfo.courseNames}</td>
                <td className="table__actions">
                  {enr.id && (
                    <button
                      className="btn btn--small btn--danger"
                      onClick={() => onDelete(enr.id!)}
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
