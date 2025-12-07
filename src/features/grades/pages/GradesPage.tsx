import { useEffect, useMemo, useState } from "react";
import type { Student } from "../../students/types/Student";
import type { Grade } from "../types/Grade";
import { studentService } from "../../students/services/studentService";
import { gradeService } from "../services/gradeService";
import { useAuth } from "../../auth/hooks/useAuth";
import { useEnrollments } from "../../enrollments/hooks/useEnrollments";
import { useSchedules } from "../../schedules/hooks/useSchedules";
import { useCourses } from "../../courses/hooks/useCourses";
import { formatStudentLabel } from "../utils/formatStudent";

type EvalNumber = 1 | 2 | 3 | 4;
type TermNumber = 1 | 2 | 3;

interface EvalState {
  id?: string;
  score: string;
  comment: string;
}

type CourseEvalState = Record<EvalNumber, EvalState>;

export function GradesPage() {
  const { user } = useAuth();
  const isDocente = user?.role === "DOCENTE";
  const { enrollments } = useEnrollments();
  const { schedules } = useSchedules();
  const { courses } = useCourses();

  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedTerm, setSelectedTerm] = useState<TermNumber>(1);
  const [gradeFilter, setGradeFilter] = useState<string>("");
  const [sectionFilter, setSectionFilter] = useState<string>("");
  const [evalsByCourse, setEvalsByCourse] = useState<Record<string, CourseEvalState>>({});

  const evalNumbers: EvalNumber[] = [1, 2, 3, 4];

  const teacherDni = user?.teacherDni;

  const allowedData = useMemo(() => {
    if (!teacherDni) return null;

    const teacherSchedules = schedules.filter((s) => s.teacherDni === teacherDni);
    const scheduleIds = teacherSchedules.map((s) => String(s.id));
    const allowedCourses = new Set(teacherSchedules.flatMap((s) => s.courses));
    const enrForTeacher = enrollments.filter((e) => scheduleIds.includes(String(e.scheduleId)));
    const allowedStudents = new Set(enrForTeacher.map((e) => e.studentDni));

    return { allowedStudents, allowedCourses };
  }, [teacherDni, schedules, enrollments]);

  const visibleStudents = useMemo(() => {
    const filtered = !allowedData ? students : students.filter((s) => allowedData.allowedStudents.has(s.dni));
    const byGrade = gradeFilter ? filtered.filter((s) => String(s.grade) === gradeFilter) : filtered;
    const bySection = sectionFilter ? byGrade.filter((s) => s.section === sectionFilter) : byGrade;
    return bySection;
  }, [students, allowedData, gradeFilter, sectionFilter]);

  const gradeOptions = useMemo(() => {
    const set = new Set(visibleStudents.map((s) => s.grade));
    return Array.from(set).sort((a, b) => a - b);
  }, [visibleStudents]);

  const sectionOptions = useMemo(() => {
    const set = new Set(visibleStudents.map((s) => s.section));
    return Array.from(set).sort();
  }, [visibleStudents]);

  const studentCourses = useMemo(() => {
    if (!selectedStudent) return [] as string[];
    const enrollmentForStudent = enrollments.filter((e) => e.studentDni === selectedStudent);
    const scheduleIds = new Set(enrollmentForStudent.map((e) => String(e.scheduleId)));
    const courseIds = new Set<string>();

    schedules.forEach((sch) => {
      if (scheduleIds.has(String(sch.id))) {
        sch.courses.forEach((cid) => {
          if (!allowedData || allowedData.allowedCourses.has(cid)) {
            courseIds.add(cid);
          }
        });
      }
    });

    return Array.from(courseIds);
  }, [enrollments, schedules, selectedStudent, allowedData]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [studentsData, gradesData] = await Promise.all([studentService.getAll(), gradeService.getAll()]);
        setStudents(studentsData);
        setGrades(gradesData);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  useEffect(() => {
    if (!selectedStudent) {
      setEvalsByCourse({});
      return;
    }

    const relevantGrades = grades.filter(
      (g) => g.studentDni === selectedStudent && g.term === selectedTerm && (!allowedData || allowedData.allowedCourses.has(g.courseId))
    );

    const next: Record<string, CourseEvalState> = {};
    const evalNumbers: EvalNumber[] = [1, 2, 3, 4];

    studentCourses.forEach((courseId) => {
      next[courseId] = evalNumbers.reduce<CourseEvalState>((acc, ev) => {
        const found = relevantGrades.find((g) => g.courseId === courseId && g.evaluation === ev);
        acc[ev] = {
          id: found?.id,
          score: found ? String(found.score) : "",
          comment: found?.comment ?? "",
        };
        return acc;
      }, {} as CourseEvalState);
    });

    setEvalsByCourse(next);
  }, [selectedStudent, selectedTerm, grades, studentCourses, allowedData]);

  useEffect(() => {
    // Si los filtros excluyen al alumno actual, limpiar seleccion
    if (selectedStudent) {
      const stillVisible = visibleStudents.some((s) => s.dni === selectedStudent);
      if (!stillVisible) {
        setSelectedStudent("");
        setEvalsByCourse({});
      }
    }
  }, [visibleStudents, selectedStudent]);

  useEffect(() => {
    // Si no hay alumno seleccionado y hay alumnos visibles, preseleccionar el primero
    if (!selectedStudent && visibleStudents.length > 0) {
      setSelectedStudent(visibleStudents[0].dni);
    }
  }, [visibleStudents, selectedStudent]);

  const globalAverage = useMemo(() => {
    const allScores: number[] = [];
    studentCourses.forEach((courseId) => {
      const evals = evalsByCourse[courseId];
      if (!evals) return;
      evalNumbers.forEach((ev) => {
        const score = Number(evals[ev]?.score);
        if (!Number.isNaN(score)) allScores.push(score);
      });
    });
    if (!allScores.length) return "-";
    const avg = allScores.reduce((a, b) => a + b, 0) / allScores.length;
    return avg.toFixed(1);
  }, [studentCourses, evalsByCourse, evalNumbers]);

  const handleScoreChange = (courseId: string, evaluation: EvalNumber, value: string) => {
    const safeValue = value === "" ? "" : Math.max(0, Math.min(20, Number(value) || 0)).toString();
    setEvalsByCourse((prev) => ({
      ...prev,
      [courseId]: {
        ...(prev[courseId] ?? ({} as CourseEvalState)),
        [evaluation]: {
          ...(prev[courseId]?.[evaluation] ?? { score: "", comment: "" }),
          score: safeValue,
        },
      },
    }));
  };

  const handleCommentChange = (courseId: string, evaluation: EvalNumber, value: string) => {
    setEvalsByCourse((prev) => ({
      ...prev,
      [courseId]: {
        ...(prev[courseId] ?? ({} as CourseEvalState)),
        [evaluation]: {
          ...(prev[courseId]?.[evaluation] ?? { score: "", comment: "" }),
          comment: value,
        },
      },
    }));
  };

  const handleSave = async () => {
    if (!selectedStudent) return;
    setSaving(true);

    try {
      const evalNumbers: EvalNumber[] = [1, 2, 3, 4];
      const ops: Array<Promise<Grade>> = [];

      studentCourses.forEach((courseId) => {
        const evals = evalsByCourse[courseId];
        if (!evals) return;

        evalNumbers.forEach((ev) => {
          const entry = evals[ev];
          if (!entry || entry.score === "") return;

          const scoreNumber = Number(entry.score);
          if (Number.isNaN(scoreNumber)) return;

          const payload: Omit<Grade, "id"> = {
            studentDni: selectedStudent,
            courseId,
            term: selectedTerm,
            evaluation: ev,
            score: scoreNumber,
            comment: entry.comment,
          };

          if (entry.id) {
            ops.push(gradeService.update(entry.id, payload));
          } else {
            ops.push(gradeService.create(payload));
          }
        });
      });

      if (ops.length) {
        const results = await Promise.all(ops);
        const refreshed = await gradeService.getAll();
        setGrades(refreshed);

        // sincronizar IDs de nuevas notas
        setEvalsByCourse((prev) => {
          const next = { ...prev };
          results.forEach((g) => {
            const courseEvals = next[g.courseId];
            if (courseEvals && courseEvals[g.evaluation]) {
              courseEvals[g.evaluation].id = g.id;
            }
          });
          return next;
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const selectedStudentData = students.find((s) => s.dni === selectedStudent);

  return (
    <section className="page">
      <div className="page__header">
        <div>
          <h1 className="page-title">Notas por bimestre</h1>
          <p className="page-subtitle">Completa hasta 4 evaluaciones por bimestre para cada curso del alumno.</p>
        </div>
      </div>

      {loading ? (
        <p>Cargando estudiantes...</p>
      ) : (
        <>
          <div className="card form">
            <div className="form__grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
              <div className="form__group">
                <label>Estudiante</label>
                <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
                  <option value="">Seleccione un estudiante</option>
                  {visibleStudents.map((st) => (
                    <option key={st.dni} value={st.dni}>
                      {formatStudentLabel(st)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form__group">
                <label>Bimestre</label>
                <select value={selectedTerm} onChange={(e) => setSelectedTerm(Number(e.target.value) as TermNumber)}>
                  {[1, 2, 3].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form__group">
                <label>Grado</label>
                <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)}>
                  <option value="">Todos</option>
                  {gradeOptions.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form__group">
                <label>Seccion</label>
                <select value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}>
                  <option value="">Todas</option>
                  {sectionOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedStudent && (
              <div style={{ marginTop: 16 }}>
                <h3>
                  Alumno: {selectedStudentData ? `${selectedStudentData.name} ${selectedStudentData.lastname}` : ""}{" "}
                  {selectedStudentData ? `(Grado ${selectedStudentData.grade} - Seccion ${selectedStudentData.section})` : ""}{" "}
                  (Bimestre {selectedTerm})
                </h3>
                {!isDocente && (
                  <p className="text-error" style={{ marginTop: 4 }}>
                    Solo los docentes pueden modificar las notas (modo lectura).
                  </p>
                )}
                <div className="table-wrapper grade-matrix">
                  <table className="table table--compact">
                    <thead>
                      <tr>
                        <th>Curso</th>
                        {evalNumbers.map((ev) => (
                          <th key={ev}>Practica {ev}</th>
                        ))}
                        {evalNumbers.map((ev) => (
                          <th key={`c-${ev}`}>Obs {ev}</th>
                        ))}
                        <th>Promedio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentCourses.length === 0 && (
                        <tr>
                          <td colSpan={evalNumbers.length * 2 + 2} style={{ textAlign: "center", padding: 12 }}>
                            No hay cursos asignados para este estudiante en este bimestre.
                          </td>
                        </tr>
                      )}

                      {studentCourses.map((courseId) => {
                        const course = courses.find((c) => c.id === courseId);
                        const evals = evalsByCourse[courseId] ?? {};
                        const scores = evalNumbers
                          .map((ev) => Number(evals[ev]?.score))
                          .filter((s) => !Number.isNaN(s));
                        const promedio = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : "-";

                        return (
                          <tr key={courseId}>
                            <td>{course ? course.name : courseId}</td>
                            {evalNumbers.map((ev) => (
                              <td key={`${courseId}-score-${ev}`}>
                                <input
                                  type="number"
                                  min={0}
                                  max={20}
                                  value={evals[ev]?.score ?? ""}
                                  onChange={(e) => handleScoreChange(courseId, ev, e.target.value)}
                                  style={{ width: "100%", maxWidth: 90 }}
                                  disabled={!isDocente}
                                  aria-label={`Curso ${course ? course.name : courseId}, Practica ${ev}`}
                                />
                              </td>
                            ))}
                            {evalNumbers.map((ev) => (
                              <td key={`${courseId}-comment-${ev}`}>
                                <input
                                  type="text"
                                  value={evals[ev]?.comment ?? ""}
                                  onChange={(e) => handleCommentChange(courseId, ev, e.target.value)}
                                  placeholder="Obs."
                                  style={{ width: "100%", maxWidth: 140 }}
                                  disabled={!isDocente}
                                  aria-label={`Comentario curso ${course ? course.name : courseId}, Practica ${ev}`}
                                />
                              </td>
                            ))}
                            <td>{promedio}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="form__actions" style={{ justifyContent: "flex-end", marginTop: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ color: "#cbd5e1", fontWeight: 600 }}>
                      Promedio general: {globalAverage}
                    </span>
                    <button className="btn" disabled={saving || !selectedStudent || !isDocente} onClick={handleSave}>
                      {saving ? "Guardando..." : "Guardar bimestre"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
