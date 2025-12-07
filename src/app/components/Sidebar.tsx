import { Link } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";

export function Sidebar({ open }: { open: boolean }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  return (
    <aside className={`sidebar ${open ? "sidebar--open" : ""}`}>
      {/* LOGO */}
      <div className="sidebar__header">
        <h2 className="sidebar__logo">StudentApp</h2>
      </div>

      <div className="sidebar__divider" />

      {/* SECCION */}
      <span className="sidebar__section">Modulos</span>

      <nav className="sidebar__nav">
        <Link to="/" className="sidebar__link">
          <i className="bi bi-speedometer2"></i>
          Dashboard
        </Link>

        {/* Estudiantes */}
        <Link to="/students" className="sidebar__link">
          <i className="bi bi-people-fill"></i>
          Estudiantes
        </Link>

        {/* Notas */}
        <Link to="/grades" className="sidebar__link">
          <i className="bi bi-clipboard2-check-fill"></i>
          Notas
        </Link>

        {/* Promedios */}
        <Link to="/averages" className="sidebar__link">
          <i className="bi bi-bar-chart-line-fill"></i>
          Promedios
        </Link>

        {/* Cursos */}
        {isAdmin && (
          <Link to="/courses" className="sidebar__link">
            <i className="bi bi-journal-bookmark-fill"></i>
            Cursos
          </Link>
        )}

        {/* Docentes */}
        {isAdmin && (
          <Link to="/teachers" className="sidebar__link">
            <i className="bi bi-person-video3"></i>
            Docentes
          </Link>
        )}

        {/* Asignacion docentes/cursos */}
        {isAdmin && (
          <Link to="/schedules" className="sidebar__link">
            <i className="bi bi-card-checklist"></i>
            Asignacion
          </Link>
        )}

        {/* Matriculas */}
        {isAdmin && (
          <Link to="/enrollments" className="sidebar__link">
            <i className="bi bi-clipboard2-plus"></i>
            Matriculas
          </Link>
        )}
      </nav>

      <div className="sidebar__context">
        <p className="sidebar__context-title">Panel Academico</p>
        <p className="sidebar__context-text">
          Gestiona docentes, horarios, matriculas y notas en un solo lugar. Los docentes solo ven sus alumnos y cursos asignados.
        </p>
      </div>
    </aside>
  );
}
