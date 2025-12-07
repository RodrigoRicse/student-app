import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Student } from "../types/Student";
import { studentService } from "../services/studentService";
import { validateStudent } from "../../../shared/utils/validators";

interface StudentFormProps {
  initialStudent?: Student | null;
}

const LEVEL = "Primaria";
const GRADES = [1, 2, 3, 4, 5, 6];
const SECTIONS = ["A", "B", "C", "D"];
const SHIFTS = [
  { value: "MANANA", label: "Manana" },
  { value: "TARDE", label: "Tarde" },
  { value: "NOCHE", label: "Noche" },
];

export function StudentForm({ initialStudent }: StudentFormProps) {
  const navigate = useNavigate();
  const isEditing = Boolean(initialStudent);

  const [form, setForm] = useState<Student>({
    id: initialStudent?.id,
    dni: initialStudent?.dni ?? "",
    name: initialStudent?.name ?? "",
    lastname: initialStudent?.lastname ?? "",
    email: initialStudent?.email ?? "",
    sex: initialStudent?.sex ?? "M",
    birthdate: initialStudent?.birthdate ?? "",
    age: initialStudent?.age ?? 6,
    level: LEVEL,
    grade: initialStudent?.grade ?? 1,
    section: initialStudent?.section ?? "A",
    shift: initialStudent?.shift ?? "MANANA",
    status: initialStudent?.status ?? "ACTIVO",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "age" || name === "grade" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateStudent(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);

    try {
      const payload: Omit<Student, "id"> = {
        dni: form.dni,
        name: form.name,
        lastname: form.lastname,
        email: form.email,
        sex: form.sex,
        birthdate: form.birthdate,
        age: form.age,
        level: LEVEL,
        grade: form.grade,
        section: form.section,
        shift: form.shift,
        status: form.status,
      };

      if (isEditing) {
        await studentService.updateByDni(form.dni, payload);
      } else {
        await studentService.create(payload);
      }

      navigate("/students");
    } finally {
      setSubmitting(false);
    }
  };

  const showError = (field: string) =>
    errors[field] ? <span className="form__error">{errors[field]}</span> : null;

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2 className="card__title">{isEditing ? "Editar estudiante" : "Nuevo estudiante"}</h2>

      <div className="form__grid">
        <div className="form__group">
          <label htmlFor="dni">DNI</label>
          <input id="dni" name="dni" value={form.dni} maxLength={8} disabled={isEditing} onChange={handleChange} />
          {showError("dni")}
        </div>

        <div className="form__group">
          <label htmlFor="name">Nombre</label>
          <input id="name" name="name" value={form.name} onChange={handleChange} />
          {showError("name")}
        </div>

        <div className="form__group">
          <label htmlFor="lastname">Apellido</label>
          <input id="lastname" name="lastname" value={form.lastname} onChange={handleChange} />
          {showError("lastname")}
        </div>

        <div className="form__group">
          <label htmlFor="email">Correo del apoderado</label>
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
          {showError("email")}
        </div>

        <div className="form__group">
          <label htmlFor="sex">Sexo</label>
          <select id="sex" name="sex" value={form.sex} onChange={handleChange}>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </select>
          {showError("sex")}
        </div>

        <div className="form__group">
          <label htmlFor="birthdate">Fecha de nacimiento</label>
          <input id="birthdate" name="birthdate" type="date" value={form.birthdate} onChange={handleChange} />
          {showError("birthdate")}
        </div>

        <div className="form__group">
          <label htmlFor="age">Edad</label>
          <input id="age" name="age" type="number" min={5} max={12} value={form.age} onChange={handleChange} />
          {showError("age")}
        </div>

        <div className="form__group">
          <label htmlFor="grade">Grado</label>
          <select id="grade" name="grade" value={form.grade} onChange={handleChange}>
            {GRADES.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
          {showError("grade")}
        </div>

        <div className="form__group">
          <label htmlFor="shift">Turno</label>
          <select id="shift" name="shift" value={form.shift} onChange={handleChange}>
            {SHIFTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          {showError("shift")}
        </div>

        <div className="form__group">
          <label htmlFor="section">Seccion</label>
          <select id="section" name="section" value={form.section} onChange={handleChange}>
            {SECTIONS.map((section) => (
              <option key={section} value={section}>
                {section}
              </option>
            ))}
          </select>
          {showError("section")}
        </div>

        <div className="form__group">
          <label htmlFor="status">Estado</label>
          <select id="status" name="status" value={form.status} onChange={handleChange}>
            <option value="ACTIVO">ACTIVO</option>
            <option value="INACTIVO">INACTIVO</option>
          </select>
          {showError("status")}
        </div>
      </div>

      <div className="form__actions">
        <button type="button" className="btn btn--ghost" onClick={() => navigate("/students")}>
          Cancelar
        </button>
        <button className="btn" disabled={submitting}>
          {submitting ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
