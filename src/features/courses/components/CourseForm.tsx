import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Course } from "../types/Course";
import type { Teacher } from "../../teachers/types/Teacher";

import { courseService } from "../services/courseService";
import { teacherService } from "../../teachers/services/teacherService";

interface CourseFormProps {
  initialCourse?: Course | null;
}

export function CourseForm({ initialCourse }: CourseFormProps) {
  const navigate = useNavigate();
  const isEditing = Boolean(initialCourse);

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  
  const [form, setForm] = useState<Course>({
    id: initialCourse?.id ?? "",
    name: initialCourse?.name ?? "",
    teacherDni: initialCourse?.teacherDni ?? "",
    status: initialCourse?.status ?? "ACTIVO",
  });

  // Cargar lista de docentes
  useEffect(() => {
    const loadTeachers = async () => {
      const data = await teacherService.getAll();
      setTeachers(data);
    };
    loadTeachers();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Generar ID desde el nombre
    const generatedId = form.name.toLowerCase().replace(/\s+/g, "-");

    const payload: Course = {
      id: generatedId,
      name: form.name,
      teacherDni: form.teacherDni,
      status: form.status,
    };

    if (isEditing) {
      await courseService.update(form.id, payload);
    } else {
      await courseService.create(payload);
    }

    navigate("/courses");
  };

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2 className="card__title">
        {isEditing ? "Editar Curso" : "Nuevo Curso"}
      </h2>

      <div className="form__grid">

        <div className="form__group">
          <label>Nombre del curso</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Ej: Matematica"
          />
        </div>

        <div className="form__group">
          <label>Docente</label>
          <select
            name="teacherDni"
            value={form.teacherDni}
            onChange={handleChange}
          >
            <option value="">Seleccione un profesor</option>

            {teachers.map((t) => (
              <option key={t.dni} value={t.dni}>
                {t.name} {t.lastname} - {t.dni}
              </option>
            ))}
          </select>
        </div>

        <div className="form__group">
          <label>Estado</label>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="ACTIVO">ACTIVO</option>
            <option value="INACTIVO">INACTIVO</option>
          </select>
        </div>

      </div>

      <div className="form__actions">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => navigate("/courses")}
        >
          Cancelar
        </button>

        <button className="btn">Guardar</button>
      </div>
    </form>
  );
}
