import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";

export function Navbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="navbar">
      <button className="navbar__toggle" onClick={onToggleSidebar}>
        <i className="bi bi-list"></i>
      </button>

      <div className="navbar__brand">
        <div>StudentApp | Gestión Académica</div>
        <small className="navbar__subtitle">Control de docentes, cursos y matrículas</small>
      </div>

      <div className="navbar__user">
        <span className="navbar__username">
          {user?.name}
          {user?.role && (
            <span className="badge badge--info" style={{ marginLeft: 8 }}>
              {user.role}
            </span>
          )}
        </span>
        <img src="https://i.pravatar.cc/40" className="navbar__avatar" alt="avatar" />
        <button className="btn btn--ghost btn--small" onClick={handleLogout}>
          Salir
        </button>
      </div>
    </header>
  );
}
