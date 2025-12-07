import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Teacher } from "../types/Teacher";
import { teacherService } from "../services/teacherService";
import { validateTeacher } from "../../../shared/utils/validators";

interface Props {
  initialTeacher?: Teacher | null;
}

const GRADES = [1, 2, 3, 4, 5, 6];
const SECTIONS = ["A", "B", "C", "D"];
const SUBJECTS = [
  "Matematica",
  "Comunicacion",
  "Ciencia y Tecnologia",
  "Personal Social",
  "Ingles",
  "Arte",
  "Educacion Fisica"
];

const ROLES = ["DIRECTOR", "DOCENTE"];

export function TeacherForm({ initialTeacher }: Props) {
  const navigate = useNavigate();
  const isEditing = Boolean(initialTeacher);

  const [form, setForm] = useState<Teacher>({
    id: initialTeacher?.id,
    dni: initialTeacher?.dni ?? "",
    name: initialTeacher?.name ?? "",
    lastname: initialTeacher?.lastname ?? "",
    email: initialTeacher?.email ?? "",
    sex: initialTeacher?.sex ?? "M",
    birthdate: initialTeacher?.birthdate ?? "",
    specialty: initialTeacher?.specialty ?? "Comunicacion",
    grade: initialTeacher?.grade ?? 1,
    section: initialTeacher?.section ?? "A",
    role: initialTeacher?.role ?? "DOCENTE",
    status: initialTeacher?.status ?? "ACTIVO",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "grade" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateTeacher(form);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setSubmitting(true);

    try {
      const payload: Omit<Teacher, "id"> = {
        dni: form.dni,
        name: form.name,
        lastname: form.lastname,
        email: form.email,
        sex: form.sex,
        birthdate: form.birthdate,
        specialty: form.specialty,
        grade: form.grade,
        section: form.section,
        role: form.role,
        status: form.status,
      };

      if (isEditing) {
        await teacherService.updateByDni(form.dni, payload);
      } else {
        await teacherService.create(payload);
      }

      navigate("/teachers");
    } finally {
      setSubmitting(false);
    }
  };

  const showError = (field: string) =>
    errors[field] ? <span className="form__error">{errors[field]}</span> : null;

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2 className="card__title">{isEditing ? "Editar Docente" : "Nuevo Docente"}</h2>

      <div className="form__grid">

        {/* DNI */}
        <div className="form__group">
          <label>DNI</label>
          <input name="dni" value={form.dni} disabled={isEditing} maxLength={8} onChange={handleChange} />
          {showError("dni")}
        </div>

        {/* NOMBRE */}
        <div className="form__group">
          <label>Nombre</label>
          <input name="name" value={form.name} onChange={handleChange} />
          {showError("name")}
        </div>

        {/* APELLIDO */}
        <div className="form__group">
          <label>Apellido</label>
          <input name="lastname" value={form.lastname} onChange={handleChange} />
          {showError("lastname")}
        </div>

        {/* EMAIL */}
        <div className="form__group">
          <label>Correo</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} />
          {showError("email")}
        </div>

        {/* SEXO */}
        <div className="form__group">
          <label>Sexo</label>
          <select name="sex" value={form.sex} onChange={handleChange}>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </select>
        </div>

        {/* FECHA NACIMIENTO */}
        <div className="form__group">
          <label>Fecha de nacimiento</label>
          <input type="date" name="birthdate" value={form.birthdate} onChange={handleChange} />
          {showError("birthdate")}
        </div>

        {/* ESPECIALIDAD */}
        <div className="form__group">
          <label>Especialidad</label>
          <select name="specialty" value={form.specialty} onChange={handleChange}>
            {SUBJECTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* GRADO */}
        <div className="form__group">
          <label>Grado asignado</label>
          <select name="grade" value={form.grade} onChange={handleChange}>
            {GRADES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* SECCION */}
        <div className="form__group">
          <label>Seccion</label>
          <select name="section" value={form.section} onChange={handleChange}>
            {SECTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* ROL */}
        <div className="form__group">
          <label>Rol</label>
          <select name="role" value={form.role} onChange={handleChange}>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* ESTADO */}
        <div className="form__group">
          <label>Estado</label>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="ACTIVO">ACTIVO</option>
            <option value="INACTIVO">INACTIVO</option>
          </select>
        </div>

      </div>

      <div className="form__actions">
        <button type="button" className="btn btn--ghost" onClick={() => navigate("/teachers")}>
          Cancelar
        </button>
        <button className="btn" disabled={submitting}>
          {submitting ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
