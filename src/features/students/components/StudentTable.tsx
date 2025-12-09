import { Link } from "react-router-dom";
import type { Student } from "../types/Student";

interface StudentTableProps {
  students: Student[];
  onDelete?: (dni: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function StudentTable({ students, onDelete, canEdit, canDelete }: StudentTableProps) {
  const showActions = Boolean(canEdit || (canDelete && onDelete));
  const baseColumns = 9 + (showActions ? 1 : 0);

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>DNI</th>
            <th>Nombre</th>
            <th>Correo apoderado</th>
            <th>Sexo</th>
            <th>Nivel</th>
            <th>Grado</th>
            <th>Sección</th>
            <th>Turno</th>
            <th>Estado</th>
            {showActions && <th className="table__actions-col">Acciones</th>}
          </tr>
        </thead>

        <tbody>
          {students.length === 0 && (
            <tr>
              <td colSpan={baseColumns} style={{ textAlign: "center", padding: "12px" }}>
                No hay estudiantes registrados.
              </td>
            </tr>
          )}

          {students.map((st: Student) => (
            <tr key={st.dni}>
              <td>{st.dni}</td>
              <td>{st.name} {st.lastname}</td>
              <td>{st.email}</td>
              <td>{st.sex === "M" ? "Masculino" : "Femenino"}</td>
              <td>{st.level}</td>
              <td>{st.grade}</td>
              <td>{st.section}</td>
              <td>{st.shift}</td>
              <td>
                <span
                  className={
                    "badge " +
                    (st.status === "ACTIVO"
                      ? "badge--success"
                      : "badge--danger")
                  }
                >
                  {st.status}
                </span>
              </td>

              {showActions && (
                <td className="table__actions">
                  {canEdit && (
                    <Link
                      to={`/students/${st.dni}/edit`}
                      className="btn btn--small"
                    >
                      Editar
                    </Link>
                  )}

                  {canDelete && onDelete && (
                    <button
                      type="button"
                      className="btn btn--small btn--danger"
                      onClick={() => onDelete(st.dni)}
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
