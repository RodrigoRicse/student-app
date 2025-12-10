import { useEffect, useMemo, useRef, useState } from "react";
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
];

const SECTIONS_BY_SHIFT: Record<Shift, Array<Exclude<Schedule["section"], "ROTATIVO">>> = {
  MANANA: ["A", "B"],
  TARDE: ["C", "D"],
};

const SHIFT_BY_SECTION: Partial<Record<Schedule["section"], Shift>> = {
  A: "MANANA",
  B: "MANANA",
  C: "TARDE",
  D: "TARDE",
};

const COURSES_BY_SPECIALTY: Record<Teacher["specialty"], string[]> = {
  "Primaria General": [
    "matematica",
    "razonamiento-matematico",
    "comunicacion",
    "razonamiento-verbal",
    "plan-lector",
    "personal-social",
    "ciencia-tecnologia",
    "educacion-religiosa",
    "tutoria",
  ],
  Idiomas: ["ingles"],
  Deportes: ["educacion-fisica", "psicomotricidad"],
  Artes: ["arte-cultura"],
  Computo: ["computacion", "robotica"],
};

export function ScheduleForm({ initialSchedule, teachers, courses, onSaved }: ScheduleFormProps) {
  const isEditing = Boolean(initialSchedule);
  const [saving, setSaving] = useState(false);
  const prevTeacherForCourses = useRef<string | null>(null);

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

  // fuerza compatibilidad entre turno y seccion, salvo docentes rotativos
  useEffect(() => {
    setForm((prev) => {
      if (prev.section === "ROTATIVO") return prev;
      const allowed = SECTIONS_BY_SHIFT[prev.shift];
      if (!allowed.includes(prev.section)) {
        return { ...prev, section: allowed[0] };
      }
      return prev;
    });
  }, [form.shift]);

  const activeCourses = useMemo(
    () => courses.filter((c) => c.status === "ACTIVO"),
    [courses]
  );

  // auto-selecciona cursos segun la especialidad del docente
  useEffect(() => {
    const teacher = teachers.find((t) => t.dni === form.teacherDni);
    if (!teacher) {
      setForm((prev) => ({ ...prev, courses: [] }));
      prevTeacherForCourses.current = null;
      return;
    }

    const teacherChanged = prevTeacherForCourses.current !== teacher.dni;
    const mappedCourses = COURSES_BY_SPECIALTY[teacher.specialty] ?? [];
    const activeIds = activeCourses.map((c) => c.id);
    const filtered = mappedCourses.filter((id) => activeIds.includes(id));

    const isInitialEditSameTeacher =
      isEditing && initialSchedule?.teacherDni === teacher.dni && prevTeacherForCourses.current === null;

    if (!isInitialEditSameTeacher && (teacherChanged || form.courses.length === 0)) {
      setForm((prev) => ({ ...prev, courses: filtered }));
    }

    prevTeacherForCourses.current = teacher.dni;
  }, [form.teacherDni, form.courses.length, teachers, activeCourses, isEditing, initialSchedule?.teacherDni]);

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

  // cuando cambia el docente, sincronizar grado y seccion; turno se deriva salvo casos rotativos
  useEffect(() => {
    const teacher = teachers.find((t) => t.dni === form.teacherDni);
    if (!form.teacherDni || !teacher) {
      setForm((prev) => ({ ...prev, grade: 1, section: "A", shift: "MANANA" }));
      return;
    }
    setForm((prev) => {
      const derivedShift =
        teacher.section === "ROTATIVO"
          ? prev.shift
          : SHIFT_BY_SECTION[teacher.section] ?? "MANANA";
      return {
        ...prev,
        grade: teacher.grade,
        section: teacher.section,
        shift: derivedShift,
      };
    });
  }, [form.teacherDni, teachers]);

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

  const isRotatingTeacher = form.grade === "ALL" && form.section === "ROTATIVO";
  const allowedSections: Schedule["section"][] =
    form.section === "ROTATIVO" ? ["ROTATIVO"] : SECTIONS_BY_SHIFT[form.shift];

  const gradeLabel = form.grade === "ALL" ? "Todos" : form.grade;
  const sectionLabel = form.section === "ROTATIVO" ? "Rotativo" : form.section;

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
            disabled={!isRotatingTeacher}
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
            disabled
          >
            {form.grade === "ALL" ? (
              <option value="ALL">Todos</option>
            ) : (
              [1, 2, 3, 4, 5, 6].map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="form__group">
          <label>Seccion</label>
          <select
            name="section"
            value={form.section}
            disabled
          >
            {allowedSections.map((s) => (
              <option key={s} value={s}>
                {s === "ROTATIVO" ? "Rotativo" : s}
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
          <div>Grado: {gradeLabel} - Seccion {sectionLabel}</div>
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
