import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

type RoleType = "ADMIN" | "DOCENTE" | null;

const roleDefaults: Record<Exclude<RoleType, null>, { email: string; password: string }> = {
  ADMIN: { email: "admin@colegio.com", password: "123456" },
  DOCENTE: { email: "maria.torres@ieprimaria.com", password: "30112233" },
};

interface LocationState {
  from?: Location;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [activeRole, setActiveRole] = useState<RoleType>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const openModal = (role: Exclude<RoleType, null>) => {
    setActiveRole(role);
    const defaults = roleDefaults[role];
    setEmail(defaults.email);
    setPassword(defaults.password);
    setError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    if (loading) return;
    setShowModal(false);
    setActiveRole(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      const state = location.state as LocationState | undefined;
      const redirectTo = state?.from?.pathname ?? "/";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error(err);
      setError("Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-hero">
        <p className="eyebrow">Plataforma academica</p>
        <h1 className="login-hero__title">
          Bienvenid@ a la plataforma de la Institucion educativa xxxxxxxx xxxxx xxxxxx
        </h1>
        <p className="login-hero__subtitle">
          Controla docentes, horarios, matriculas y notas en un solo panel. Accede con tu rol para ver las opciones
          disponibles.
        </p>

        <div className="cta-buttons">
          <button className="btn btn--ghost role-btn" type="button" onClick={() => openModal("DOCENTE")}>
            Iniciar sesion como Docente
          </button>
          <button className="btn role-btn" type="button" onClick={() => openModal("ADMIN")}>
            Iniciar sesion como Administrador
          </button>
        </div>

        <div className="login-hero__badge">Seguridad con roles y JWT</div>
      </div>

      <div className="login-panel">
        <div className="card login-panel__card">
          <p className="eyebrow">Accesos rapidos</p>
          <h3>Elige tu rol para continuar</h3>
          <p className="login-panel__text">
            La plataforma muestra automaticamente los modulos segun tu rol (ADMIN o DOCENTE).
          </p>
          <ul className="login-panel__list">
            <li>ADMIN: crea cursos, docentes, horarios y matriculas.</li>
            <li>DOCENTE: registra notas y consulta alumnos asignados.</li>
          </ul>
        </div>
      </div>

      {showModal && activeRole && (
        <div className="modal" onClick={closeModal}>
          <div className="modal__content" onClick={(e) => e.stopPropagation()}>
            <p className="eyebrow">{activeRole === "ADMIN" ? "Acceso administrador" : "Acceso docente"}</p>
            <h2 className="modal__title">Iniciar sesion</h2>
            <p className="modal__hint">
              Credenciales demo: {roleDefaults[activeRole].email} / {roleDefaults[activeRole].password}
            </p>
            <form className="modal__form" onSubmit={handleSubmit}>
              <div className="form__group">
                <label htmlFor="email">Correo</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                />
              </div>

              <div className="form__group">
                <label htmlFor="password">Contrasena</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="******"
                  required
                />
              </div>

              {error && <p className="text-error">{error}</p>}

              <div className="modal__actions">
                <button type="button" className="btn btn--ghost" onClick={closeModal} disabled={loading}>
                  Cancelar
                </button>
                <button className="btn" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
