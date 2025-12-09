import { useMemo, useState } from "react";
import type { Enrollment } from "../types/Enrollment";
import type { Schedule } from "../../schedules/types/Schedule";
import type { Student } from "../../students/types/Student";
import type { Teacher } from "../../teachers/types/Teacher";
import type { Course } from "../../courses/types/Course";
import { enrollmentService } from "../services/enrollmentService";
import { useEffect } from "react";

interface EnrollmentFormProps {
  schedules: Schedule[];
  students: Student[];
  teachers: Teacher[];
  courses: Course[];
  onSaved: () => void;
}

export function EnrollmentForm({ schedules, students, teachers, courses, onSaved }: EnrollmentFormProps) {
  const [form, setForm] = useState<Omit<Enrollment, "id">>({
    scheduleId: "",
    studentDni: "",
  });
  const [saving, setSaving] = useState(false);
  const [gradeFilter, setGradeFilter] = useState<string>("");
  const [sectionFilter, setSectionFilter] = useState<string>("");
  const [shiftFilter, setShiftFilter] = useState<string>("");
  const SHIFT_OPTIONS = [
    { value: "", label: "Todos" },
    { value: "MANANA", label: "Mañana" },
    { value: "TARDE", label: "Tarde" },
  ];
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  const activeTeachers = useMemo(
    () => teachers.filter((t) => t.status === "ACTIVO"),
    [teachers]
  );

  const activeSchedules = useMemo(
    () => schedules.filter((sch) => activeTeachers.some((t) => t.dni === sch.teacherDni)),
    [schedules, activeTeachers]
  );

  const filteredSchedules = useMemo(
    () =>
      activeSchedules
        .filter((sch) => (gradeFilter ? String(sch.grade) === gradeFilter : true))
        .filter((sch) => (sectionFilter ? sch.section === sectionFilter : true))
        .filter((sch) => (shiftFilter ? sch.shift === shiftFilter : true)),
    [activeSchedules, gradeFilter, sectionFilter, shiftFilter]
  );

  const activeCourses = useMemo(
    () => courses.filter((c) => c.status === "ACTIVO"),
    [courses]
  );

  const selectedSchedule = useMemo(
    () => filteredSchedules.find((sch) => String(sch.id) === String(form.scheduleId)),
    [filteredSchedules, form.scheduleId]
  );

  const isFlexibleGrade = selectedSchedule?.grade === "ALL";
  const isFlexibleSection = selectedSchedule?.section === "ROTATIVO";
  const gradeLabelSelected = selectedSchedule ? (selectedSchedule.grade === "ALL" ? "Todos" : selectedSchedule.grade) : "";
  const sectionLabelSelected = selectedSchedule ? (selectedSchedule.section === "ROTATIVO" ? "Rotativo" : selectedSchedule.section) : "";

  const studentsFiltered = useMemo(
    () =>
      students
        .filter((st) => (gradeFilter ? String(st.grade) === gradeFilter : true))
        .filter((st) => (sectionFilter ? st.section === sectionFilter : true))
        .filter((st) => (shiftFilter ? st.shift === shiftFilter : true)),
    [students, gradeFilter, sectionFilter, shiftFilter]
  );

  const selectedCourses = useMemo(() => {
    if (!selectedSchedule) return [];
    return selectedSchedule.courses
      .map((cId) => activeCourses.find((c) => c.id === cId))
      .filter((c): c is Course => Boolean(c));
  }, [selectedSchedule, activeCourses]);

  const teacherNameForSelected = useMemo(() => {
    if (!selectedSchedule) return "";
    const teacher = activeTeachers.find((t) => t.dni === selectedSchedule.teacherDni);
    return teacher ? `${teacher.name} ${teacher.lastname}` : selectedSchedule.teacherDni;
  }, [selectedSchedule, activeTeachers]);

  const enrolledSet = useMemo(() => {
    if (!selectedSchedule) return new Set<string>();
    return new Set(
      enrollments
        .filter((e) => String(e.scheduleId) === String(selectedSchedule.id))
        .map((e) => e.studentDni)
    );
  }, [enrollments, selectedSchedule]);

  const scheduleLabel = (sch: Schedule) => {
    const teacher = activeTeachers.find((t) => t.dni === sch.teacherDni);
    const teacherText = teacher ? `${teacher.name} ${teacher.lastname}` : sch.teacherDni;
    return `${teacherText} - Grado ${sch.grade} - Seccion ${sch.section}`;
  };

  const handleShiftChange = (value: string) => {
    setShiftFilter(value);
    // limpiar horario seleccionado si no aplica al filtro nuevo
    setForm((prev) => ({
      ...prev,
      scheduleId: "",
    }));
  };

  const handleScheduleChange = (value: string) => {
    const sch = filteredSchedules.find((s) => String(s.id) === value);
    if (sch) {
      setGradeFilter(sch.grade === "ALL" ? "" : String(sch.grade));
      setSectionFilter(sch.section === "ROTATIVO" ? "" : sch.section);
      setShiftFilter(sch.shift);
    }
    setForm((prev) => ({ ...prev, scheduleId: value }));
  };

  useEffect(() => {
    // Si el horario ya no está en la lista filtrada, limpiar la selección
    const exists = filteredSchedules.some((s) => String(s.id) === String(form.scheduleId));
    if (!exists && form.scheduleId) {
      setForm((prev) => ({ ...prev, scheduleId: "" }));
    }
    if (filteredSchedules.length === 0 && form.scheduleId) {
      setForm((prev) => ({ ...prev, scheduleId: "" }));
    }
  }, [filteredSchedules, form.scheduleId]);

  const loadEnrollments = async () => {
    const data = await enrollmentService.getAll();
    setEnrollments(data);
  };

  useEffect(() => {
    void loadEnrollments();
  }, []);

  const enrollStudent = async (studentDni: string) => {
    if (!selectedSchedule) return;
    if (enrolledSet.has(studentDni)) {
      alert("El alumno ya esta matriculado en este horario.");
      return;
    }
    const student = students.find((s) => s.dni === studentDni);
    if (student) {
      if (!isFlexibleGrade && student.grade !== selectedSchedule.grade) {
        alert("El alumno no pertenece al grado del horario seleccionado.");
        return;
      }
      if (!isFlexibleSection && student.section !== selectedSchedule.section) {
        alert("El alumno no pertenece a la secci?n del horario seleccionado.");
        return;
      }
    }
    setSaving(true);
    try {
      await enrollmentService.create({ scheduleId: selectedSchedule.id!, studentDni });
      await loadEnrollments();
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  const unenrollStudent = async (studentDni: string) => {
    const existing = enrollments.find(
      (e) => String(e.scheduleId) === String(form.scheduleId) && e.studentDni === studentDni
    );
    if (!existing?.id) return;
    setSaving(true);
    try {
      await enrollmentService.remove(existing.id);
      await loadEnrollments();
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  const handleEnrollAll = async () => {
    if (!selectedSchedule) return;
    const already = new Set(
      enrollments.filter((e) => String(e.scheduleId) === String(selectedSchedule.id)).map((e) => e.studentDni)
    );
    const toEnroll = studentsFiltered
      .filter((st) => !already.has(st.dni))
      .filter((st) => (isFlexibleGrade ? true : st.grade === selectedSchedule.grade))
      .filter((st) => (isFlexibleSection ? true : st.section === selectedSchedule.section));
    if (!toEnroll.length) return;
    setSaving(true);
    try {
      for (const st of toEnroll) {
        await enrollmentService.create({ scheduleId: selectedSchedule.id!, studentDni: st.dni });
      }
      await loadEnrollments();
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="card form">
      <h2 className="card__title">Nueva matricula</h2>
      <div className="form__grid">
        <div className="form__group">
          <label>Turno</label>
          <select value={shiftFilter} onChange={(e) => handleShiftChange(e.target.value)}>
            {SHIFT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form__group">
          <label>Horario</label>
          <select
            name="scheduleId"
            value={form.scheduleId}
            onChange={(e) => handleScheduleChange(e.target.value)}
          >
            <option value="">Seleccione horario</option>
            {filteredSchedules.map((sch) => (
              <option key={sch.id} value={sch.id}>
                {scheduleLabel(sch)}
              </option>
            ))}
          </select>
        </div>

        <div className="form__group">
          <label>Filtrar por grado</label>
          <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)}>
            <option value="">Todos</option>
            {[1, 2, 3, 4, 5, 6].map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div className="form__group">
          <label>Filtrar por sección</label>
          <select value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}>
            <option value="">Todas</option>
            {["A", "B", "C", "D"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="form__group">
          <label>&nbsp;</label>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              setShiftFilter("");
              setGradeFilter("");
              setSectionFilter("");
              setForm((prev) => ({ ...prev, scheduleId: "" }));
            }}
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12, padding: 12 }}>
        {filteredSchedules.length === 0 ? (
          <p>No hay horarios disponibles para este turno/grado/sección.</p>
        ) : (
          <div>
            <p style={{ margin: 0, color: "#cbd5e1" }}>Horarios disponibles:</p>
            <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
              {filteredSchedules.map((sch) => {
                const teacher = activeTeachers.find((t) => t.dni === sch.teacherDni);
                return (
                  <li key={sch.id}>
                    {teacher ? `${teacher.name} ${teacher.lastname}` : sch.teacherDni} · Turno {sch.shift} · Grado {sch.grade} · Seccion {sch.section} · Cursos: {sch.courses.length}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {selectedSchedule && (
        <div className="table-wrapper" style={{ marginTop: 12 }}>
          <table className="table table--compact">
            <thead>
              <tr>
                <th>Curso</th>
                <th>Asignado a</th>
                <th>Turno</th>
                <th>Grado</th>
                <th>Sección</th>
              </tr>
            </thead>
            <tbody>
              {selectedCourses.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 10 }}>
                    Sin cursos activos para este horario.
                  </td>
                </tr>
              )}
              {selectedCourses.map((course) => (
                <tr key={course.id}>
                  <td>{course.name}</td>
                  <td>
                    {teacherNameForSelected}
                  </td>
                  <td>{selectedSchedule?.shift}</td>
                  <td>{selectedSchedule?.grade}</td>
                  <td>{selectedSchedule?.section}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedSchedule && (
        <div className="table-wrapper" style={{ marginTop: 12 }}>
          <div className="page__header" style={{ padding: 0, marginBottom: 8 }}>
            <h3 className="page-title" style={{ fontSize: "1rem" }}>
              Alumnos del salon (grado {gradeLabelSelected} - seccion {sectionLabelSelected})
            </h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn btn--small"
                onClick={handleEnrollAll}
                disabled={
                  saving ||
                  studentsFiltered.length === 0 ||
                  studentsFiltered.every((st) => enrolledSet.has(st.dni))
                }
              >
                Matricular a todos
              </button>
              <button
                className="btn btn--small btn--danger"
                onClick={async () => {
                  setSaving(true);
                  try {
                    for (const e of enrollments.filter((en) => String(en.scheduleId) === String(selectedSchedule.id))) {
                      if (e.id) await enrollmentService.remove(e.id);
                    }
                    await loadEnrollments();
                    onSaved();
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={
                  saving ||
                  enrollments.filter((e) => String(e.scheduleId) === String(selectedSchedule.id)).length === 0
                }
              >
                Quitar todos
              </button>
            </div>
          </div>
          <table className="table table--compact">
            <thead>
              <tr>
                <th>DNI</th>
                <th>Nombre</th>
                <th>Grado</th>
                <th>Sección</th>
                <th>Turno</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {studentsFiltered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 10 }}>
                    No hay alumnos para este filtro.
                  </td>
                </tr>
              )}
              {studentsFiltered.map((st) => {
                const isEnrolled = enrolledSet.has(st.dni);
                return (
                  <tr key={st.dni}>
                    <td>{st.dni}</td>
                    <td>{st.name} {st.lastname}</td>
                    <td>{st.grade}</td>
                    <td>{st.section}</td>
                    <td>{st.shift}</td>
                    <td>
                      {isEnrolled ? (
                        <button
                          className="btn btn--small btn--danger"
                          disabled={saving}
                          onClick={() => void unenrollStudent(st.dni)}
                        >
                          Quitar
                        </button>
                      ) : (
                        <button
                          className="btn btn--small"
                          disabled={saving}
                          onClick={() => void enrollStudent(st.dni)}
                        >
                          Matricular
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </form>
  );
}

