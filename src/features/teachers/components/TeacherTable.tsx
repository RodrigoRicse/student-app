import { Link } from "react-router-dom";
import type { Teacher } from "../types/Teacher";

interface Props {
  teachers: Teacher[];
  onDelete: (dni: string) => void;
}

export function TeacherTable({ teachers, onDelete }: Props) {
  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>DNI</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Sexo</th>
            <th>Especialidad</th>
            <th>Grado</th>
            <th>Seccion</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {teachers.length === 0 && (
            <tr>
              <td colSpan={10} style={{ textAlign: "center" }}>
                No hay docentes registrados.
              </td>
            </tr>
          )}

          {teachers.map((t) => (
            <tr key={t.dni}>
              <td>{t.dni}</td>
              <td>{t.name} {t.lastname}</td>
              <td>{t.email}</td>
              <td>{t.sex === "M" ? "Masculino" : "Femenino"}</td>
              <td>{t.specialty}</td>
              <td>{t.grade}</td>
              <td>{t.section}</td>
              <td>{t.role}</td>
              <td>
                <span className={"badge " + (t.status === "ACTIVO" ? "badge--success" : "badge--danger")}>
                  {t.status}
                </span>
              </td>

              <td className="table__actions">
                <Link to={`/teachers/${t.dni}/edit`} className="btn btn--small">Editar</Link>

                <button
                  className="btn btn--small btn--danger"
                  onClick={() => onDelete(t.dni)}
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
