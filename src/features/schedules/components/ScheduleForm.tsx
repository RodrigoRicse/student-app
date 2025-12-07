import { useEffect, useMemo, useState } from "react";
import type { Schedule, Shift } from "../types/Schedule";
import type { Teacher } from "../../teachers/types/Teacher";
import type { Course } from "../../courses/types/Course";
import { scheduleService } from "../services/scheduleService";

interface ScheduleFormProps {
  initialSchedule?: Schedule | null;
  teachers: Teacher[];
  courses: Course[];
  onSaved: () => void;
}

const SHIFTS: Array<{ value: Shift; label: string }> = [
  { value: "MANANA", label: "Manana" },
  { value: "TARDE", label: "Tarde" },
  { value: "NOCHE", label: "Noche" },
];

export function ScheduleForm({ initialSchedule, teachers, courses, onSaved }: ScheduleFormProps) {
  const isEditing = Boolean(initialSchedule);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<Omit<Schedule, "id">>({
    teacherDni: initialSchedule?.teacherDni ?? "",
    shift: initialSchedule?.shift ?? "MANANA",
    grade: initialSchedule?.grade ?? 1,
    section: initialSchedule?.section ?? "A",
    courses: initialSchedule?.courses ?? [],
  });

  useEffect(() => {
    if (initialSchedule) {
      setForm({
        teacherDni: initialSchedule.teacherDni,
        shift: initialSchedule.shift,
        grade: initialSchedule.grade,
        section: initialSchedule.section,
        courses: initialSchedule.courses,
      });
    }
  }, [initialSchedule]);

  const activeCourses = useMemo(
    () => courses.filter((c) => c.status === "ACTIVO"),
    [courses]
  );

  // Limpia selecciones que ya no sean cursos activos
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      courses: prev.courses.filter((id) =>
        activeCourses.some((c) => c.id === id)
      ),
    }));
  }, [activeCourses]);

  const selectedTeacher = useMemo(
    () => teachers.find((t) => t.dni === form.teacherDni),
    [teachers, form.teacherDni]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.teacherDni || form.courses.length === 0) return;
    setSaving(true);
    try {
      if (initialSchedule?.id) {
        await scheduleService.update(initialSchedule.id, form);
      } else {
        await scheduleService.create(form);
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  const toggleCourse = (courseId: string) => {
    setForm((prev) => {
      const exists = prev.courses.includes(courseId);
      return {
        ...prev,
        courses: exists
          ? prev.courses.filter((c) => c !== courseId)
          : [...prev.courses, courseId],
      };
    });
  };

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2 className="card__title">{isEditing ? "Editar horario" : "Nuevo horario"}</h2>

      <div className="form__grid">
        <div className="form__group">
          <label>Docente</label>
          <select
            name="teacherDni"
            value={form.teacherDni}
            onChange={(e) => setForm((prev) => ({ ...prev, teacherDni: e.target.value }))}
          >
            <option value="">Seleccione docente</option>
            {teachers.map((t) => (
              <option key={t.dni} value={t.dni}>
                {t.name} {t.lastname} - {t.dni}
              </option>
            ))}
          </select>
        </div>

        <div className="form__group">
          <label>Turno</label>
          <select
            name="shift"
            value={form.shift}
            onChange={(e) => setForm((prev) => ({ ...prev, shift: e.target.value as Shift }))}
          >
            {SHIFTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form__group">
          <label>Grado</label>
          <select
            name="grade"
            value={form.grade}
            onChange={(e) => setForm((prev) => ({ ...prev, grade: Number(e.target.value) }))}
          >
            {[1, 2, 3, 4, 5, 6].map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div className="form__group">
          <label>Seccion</label>
          <select
            name="section"
            value={form.section}
            onChange={(e) => setForm((prev) => ({ ...prev, section: e.target.value }))}
          >
            {["A", "B", "C", "D"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form__group">
        <label>Cursos (seleccion multiple)</label>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th></th>
                <th>Curso</th>
              </tr>
            </thead>
            <tbody>
              {activeCourses.map((c) => {
                const checked = form.courses.includes(c.id);
                return (
                  <tr key={c.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCourse(c.id)}
                      />
                    </td>
                    <td>{c.name}</td>
                  </tr>
                );
              })}
              {activeCourses.length === 0 && (
                <tr>
                  <td colSpan={2} style={{ textAlign: "center", padding: "10px" }}>
                    No hay cursos activos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="form__group">
        <label>Resumen</label>
        <div className="card" style={{ padding: "12px" }}>
          <div>Docente: {selectedTeacher ? `${selectedTeacher.name} ${selectedTeacher.lastname}` : "-"}</div>
          <div>Turno: {SHIFTS.find((s) => s.value === form.shift)?.label}</div>
          <div>Grado: {form.grade} - Seccion {form.section}</div>
          <div>Cursos: {form.courses.length}</div>
        </div>
      </div>

      <div className="form__actions">
        <button className="btn" disabled={saving || !form.teacherDni || form.courses.length === 0}>
          {saving ? "Guardando..." : isEditing ? "Actualizar" : "Guardar"}
        </button>
      </div>
    </form>
  );
}
