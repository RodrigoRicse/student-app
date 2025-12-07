import { useMemo } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import { useEnrollments } from "../../enrollments/hooks/useEnrollments";
import { useSchedules } from "../../schedules/hooks/useSchedules";
import { useCourses } from "../../courses/hooks/useCourses";
import { useStudents } from "../../students/hooks/useStudents";
import { useEffect, useState } from "react";
import type { Grade } from "../types/Grade";
import { gradeService } from "../services/gradeService";

interface Row {
  studentDni: string;
  studentName: string;
  term1: number | null;
  term2: number | null;
  term3: number | null;
  finalAvg: number | null;
  status: "APROBADO" | "DESAPROBADO" | "SIN_NOTA";
}

const PASS_THRESHOLD = 11.6; // redondea a aprobado solo desde 11.6
const TERMS: Array<1 | 2 | 3> = [1, 2, 3];

export function AveragesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const { enrollments } = useEnrollments();
  const { schedules } = useSchedules();
  const { courses } = useCourses();
  const { students } = useStudents();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterGrade, setFilterGrade] = useState<string>("");
  const [filterSection, setFilterSection] = useState<string>("");

  const teacherDni = user?.teacherDni;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await gradeService.getAll();
        setGrades(data);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const allowedData = useMemo(() => {
    if (!teacherDni) return null;
    const teacherSchedules = schedules.filter((s) => s.teacherDni === teacherDni);
    const scheduleIds = teacherSchedules.map((s) => String(s.id));
    const allowedCourses = new Set(teacherSchedules.flatMap((s) => s.courses));
    const allowedStudents = new Set(
      enrollments
        .filter((e) => scheduleIds.includes(String(e.scheduleId)))
        .map((e) => e.studentDni)
    );
    return { allowedStudents, allowedCourses };
  }, [teacherDni, schedules, enrollments]);

  const activeStudents = useMemo(
    () => students.filter((s) => s.status === "ACTIVO"),
    [students]
  );

  const visibleStudents = useMemo(() => {
    if (!allowedData) return activeStudents;
    return activeStudents.filter((s) => allowedData.allowedStudents.has(s.dni));
  }, [activeStudents, allowedData]);

  const filteredStudents = useMemo(
    () =>
      visibleStudents.filter(
        (s) =>
          (filterGrade ? String(s.grade) === filterGrade : true) &&
          (filterSection ? s.section === filterSection : true)
      ),
    [visibleStudents, filterGrade, filterSection]
  );

  const gradeOptions = useMemo(() => {
    const set = new Set(visibleStudents.map((s) => s.grade));
    return Array.from(set).sort((a, b) => a - b);
  }, [visibleStudents]);

  const sectionOptions = useMemo(() => {
    const set = new Set(visibleStudents.map((s) => s.section));
    return Array.from(set).sort();
  }, [visibleStudents]);

  const gradesByStudent = useMemo(() => {
    const map = new Map<string, Grade[]>();
    grades.forEach((g) => {
      if (user?.role === "DOCENTE" && allowedData && !allowedData.allowedCourses.has(g.courseId)) {
        return;
      }
      const list = map.get(g.studentDni) ?? [];
      list.push(g);
      map.set(g.studentDni, list);
    });
    return map;
  }, [grades, user?.role, allowedData]);

  const hasNotes = (dni: string) => (gradesByStudent.get(dni)?.length ?? 0) > 0;

  const courseMap = useMemo(() => new Map(courses.map((c) => [c.id, c.name])), [courses]);

  const studentHasAllCourseGrades = (studentDni: string) => {
    const enrollmentMatches = teacherDni
      ? enrollments.filter((e) => schedules.some((s) => String(s.id) === String(e.scheduleId) && s.teacherDni === teacherDni))
      : enrollments;

    const studentEnrollments = enrollmentMatches.filter((e) => e.studentDni === studentDni);
    if (!studentEnrollments.length) return false;

    const courseSet = new Set<string>();
    studentEnrollments.forEach((e) => {
      const sch = schedules.find((s) => String(s.id) === String(e.scheduleId));
      if (!sch) return;
      sch.courses.forEach((cid) => {
        if (allowedData && user?.role === "DOCENTE" && !allowedData.allowedCourses.has(cid)) return;
        courseSet.add(cid);
      });
    });
    if (courseSet.size === 0) return false;

    const studentGrades = gradesByStudent.get(studentDni) ?? [];
    return Array.from(courseSet).every((cid) => studentGrades.some((g) => g.courseId === cid));
  };

  const canSendAll = filteredStudents.length > 0 && filteredStudents.every((st) => studentHasAllCourseGrades(st.dni));

  const handlePrint = (studentDni: string) => {
    const student = students.find((s) => s.dni === studentDni);
    if (!student) return;

    const studentGrades = gradesByStudent.get(studentDni) ?? [];
    const filteredGrades = studentGrades;

    if (!filteredGrades.length) {
      alert("El alumno no tiene notas registradas.");
      return;
    }

    const terms = TERMS;
    const grouped: Record<string, Record<number, Grade[]>> = {};
    filteredGrades.forEach((g) => {
      if (!grouped[g.courseId]) grouped[g.courseId] = {};
      if (!grouped[g.courseId][g.term]) grouped[g.courseId][g.term] = [];
      grouped[g.courseId][g.term]?.push(g);
    });

    const rowsHtml = Object.entries(grouped)
      .map(([courseId, termData]) => {
        const courseName = courseMap.get(courseId) ?? courseId;
        const termCells = terms
          .map((term) => {
            const items = termData[term] ?? [];
            const byEval = new Map(items.map((g) => [g.evaluation, g.score]));
            const fmt = (v: number | undefined) =>
              v === undefined || Number.isNaN(v) ? "" : v.toFixed(2);
            const p1 = fmt(byEval.get(1));
            const p2 = fmt(byEval.get(2));
            const p3 = fmt(byEval.get(3));
            const p4 = fmt(byEval.get(4));
            const avg =
              items.length > 0
                ? (items.reduce((acc, g) => acc + g.score, 0) / items.length).toFixed(2)
                : "";
            const res = avg ? (Number(avg) >= PASS_THRESHOLD ? "A" : "R") : "";

            return `<td>${p1}</td><td>${p2}</td><td>${p3}</td><td>${p4}</td><td>${avg}</td><td>${res}</td>`;
          })
          .join("");

        return `<tr><td>${courseName}</td>${termCells}</tr>`;
      })
      .join("");

    const avgPerTerm = terms.map((term) => {
      const perTerm = filteredGrades.filter((g) => g.term === term);
      if (!perTerm.length) return "-";
      const avg = perTerm.reduce((a, b) => a + b.score, 0) / perTerm.length;
      return avg.toFixed(2);
    });
    const existing = avgPerTerm.filter((v) => v !== "-").map(Number);
    const finalAvg = existing.length ? (existing.reduce((a, b) => a + b, 0) / existing.length).toFixed(2) : "-";

    const html = `
      <html>
        <head>
          <title>Libreta - ${student.name} ${student.lastname}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #0f172a; background: #f7f9fc; }
            .sheet { max-width: 1100px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 24px 24px 16px; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08); }
            h1 { margin-bottom: 6px; }
            h3 { margin: 4px 0 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 6px; text-align: center; font-size: 12px; }
            th { background: #e6eefc; color: #0f172a; font-weight: 700; }
            thead tr:first-child th { background: #d7e5ff; font-size: 13px; }
            td:first-child, th:first-child { text-align: left; width: 180px; }
            tfoot td { background: #e6f3ff; font-weight: 700; text-align: left; letter-spacing: 0.15px; }
          </style>
        </head>
        <body>
          <div class="sheet">
            <h1>Libreta de Notas</h1>
            <h3>${student.name} ${student.lastname} | DNI: ${student.dni}</h3>
            <p style="margin-bottom: 12px;">Grado ${student.grade} - Seccion ${student.section}</p>
            <table>
              <thead>
                <tr>
                  <th rowspan="2">Curso</th>
                  <th colspan="6">1er Bimestre</th>
                  <th colspan="6">2do Bimestre</th>
                  <th colspan="6">3er Bimestre</th>
                </tr>
                <tr>
                  <th>P1</th><th>P2</th><th>P3</th><th>P4</th><th>PROM</th><th>R/A</th>
                  <th>P1</th><th>P2</th><th>P3</th><th>P4</th><th>PROM</th><th>R/A</th>
                  <th>P1</th><th>P2</th><th>P3</th><th>P4</th><th>PROM</th><th>R/A</th>
                </tr>
              </thead>
              <tbody>${rowsHtml}</tbody>
              <tfoot>
                <tr>
                  <td colspan="19">
                    Resumen: Bim1 ${avgPerTerm[0]} | Bim2 ${avgPerTerm[1]} | Bim3 ${avgPerTerm[2]} | Promedio final ${finalAvg}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;

    const popup = window.open("", "_blank");
    if (popup) {
      popup.document.write(html);
      popup.document.close();
    } else {
      alert("No se pudo abrir la ventana de impresion (popup bloqueado).");
    }
  };

  const handlePrintSalon = () => {
    const studentsList = visibleStudents.filter((s) => hasNotes(s.dni));
    if (!studentsList.length) {
      alert("No hay alumnos con notas en este salon.");
      return;
    }

    const sections = studentsList
      .map((student) => {
        const filteredGrades = (gradesByStudent.get(student.dni) ?? []).filter((g) =>
          user?.role === "DOCENTE" && allowedData ? allowedData.allowedCourses.has(g.courseId) : true
        );

        const grouped: Record<string, Record<number, Grade[]>> = {};
        filteredGrades.forEach((g) => {
          if (!grouped[g.courseId]) grouped[g.courseId] = {};
          if (!grouped[g.courseId][g.term]) grouped[g.courseId][g.term] = [];
          grouped[g.courseId][g.term]?.push(g);
        });

        const rowsHtml = Object.entries(grouped)
          .map(([courseId, termData]) => {
            const courseName = courseMap.get(courseId) ?? courseId;
            const termCells = TERMS.map((term) => {
              const items = termData[term] ?? [];
              const byEval = new Map(items.map((g) => [g.evaluation, g.score]));
              const fmt = (v: number | undefined) => (v === undefined || Number.isNaN(v) ? "" : v.toFixed(2));
              const p1 = fmt(byEval.get(1));
              const p2 = fmt(byEval.get(2));
              const p3 = fmt(byEval.get(3));
              const p4 = fmt(byEval.get(4));
              const avg = items.length > 0 ? (items.reduce((acc, g) => acc + g.score, 0) / items.length).toFixed(2) : "";
              const res = avg ? (Number(avg) >= PASS_THRESHOLD ? "A" : "R") : "";
              return `<td>${p1}</td><td>${p2}</td><td>${p3}</td><td>${p4}</td><td>${avg}</td><td>${res}</td>`;
            }).join("");

            return `<tr><td>${courseName}</td>${termCells}</tr>`;
          })
          .join("");

        const avgPerTerm = TERMS.map((term) => {
          const perTerm = filteredGrades.filter((g) => g.term === term);
          if (!perTerm.length) return "-";
          const avg = perTerm.reduce((a, b) => a + b.score, 0) / perTerm.length;
          return avg.toFixed(2);
        });
        const existing = avgPerTerm.filter((v) => v !== "-").map(Number);
        const finalAvg = existing.length ? (existing.reduce((a, b) => a + b, 0) / existing.length).toFixed(2) : "-";

        return `
          <div class="sheet" style="page-break-after: always;">
            <h2>${student.name} ${student.lastname} | DNI: ${student.dni}</h2>
            <p>Grado ${student.grade} - Seccion ${student.section}</p>
            <table>
              <thead>
                <tr>
                  <th rowspan="2">Curso</th>
                  <th colspan="6">1er Bimestre</th>
                  <th colspan="6">2do Bimestre</th>
                  <th colspan="6">3er Bimestre</th>
                </tr>
                <tr>
                  <th>P1</th><th>P2</th><th>P3</th><th>P4</th><th>PROM</th><th>R/A</th>
                  <th>P1</th><th>P2</th><th>P3</th><th>P4</th><th>PROM</th><th>R/A</th>
                  <th>P1</th><th>P2</th><th>P3</th><th>P4</th><th>PROM</th><th>R/A</th>
                </tr>
              </thead>
            <tbody>${rowsHtml}</tbody>
            <tfoot>
              <tr>
                <td colspan="19">
                  Resumen — Bim1: ${avgPerTerm[0]} | Bim2: ${avgPerTerm[1]} | Bim3: ${avgPerTerm[2]} | Promedio final: ${finalAvg}
                </td>
              </tr>
            </tfoot>
          </table>
          </div>
        `;
      })
      .join("");

    const html = `
      <html>
        <head>
          <title>Libretas del salon</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #0f172a; background: #f7f9fc; }
            .sheet { max-width: 1100px; margin: 0 auto 24px; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08); page-break-inside: avoid; }
            h1 { margin-bottom: 14px; }
            h2 { margin: 6px 0 2px; }
            p { margin: 0 0 6px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 6px; text-align: center; font-size: 12px; }
            th { background: #e6eefc; }
            thead tr:first-child th { background: #d7e5ff; font-size: 13px; }
            td:first-child, th:first-child { text-align: left; width: 180px; }
            tfoot td { background: #e6f3ff; font-weight: 700; text-align: left; letter-spacing: 0.15px; }
          </style>
        </head>
        <body>
          <h1>Libretas del salon</h1>
          ${sections}
          <script>window.print();</script>
        </body>
      </html>
    `;

    const popup = window.open("", "_blank");
    if (popup) {
      popup.document.write(html);
      popup.document.close();
    } else {
      alert("No se pudo abrir la ventana de impresion (popup bloqueado).");
    }
  };
  const rows: Row[] = useMemo(() => {
    const targetEnrollments = teacherDni
      ? enrollments.filter((e) =>
          schedules
            .filter((s) => s.teacherDni === teacherDni)
            .map((s) => String(s.id))
            .includes(String(e.scheduleId))
        )
      : enrollments;

    const allowedDnis = new Set(targetEnrollments.map((e) => e.studentDni));
    const studentMap = new Map(visibleStudents.map((s) => [s.dni, s]));

    return Array.from(allowedDnis)
      .map((dni) => {
        const student = studentMap.get(dni);
        if (!student) {
          return null;
        }

        if (filterGrade && String(student.grade) !== filterGrade) return null;
        if (filterSection && student.section !== filterSection) return null;

        const name = `${student.name} ${student.lastname}`;

        const studentGrades = grades.filter((g) => g.studentDni === dni);
        const filteredGrades =
          teacherDni && allowedData
            ? studentGrades.filter((g) => allowedData.allowedCourses.has(g.courseId))
            : studentGrades;

        const termValues = TERMS.map((term) => {
          const perTerm = filteredGrades.filter((g) => g.term === term);
          if (!perTerm.length) return null;
          const avg = perTerm.reduce((acc, g) => acc + g.score, 0) / perTerm.length;
          return Number(avg.toFixed(2));
        });

        const existingTerms = termValues.filter((v) => v !== null) as number[];
        const finalAvg = existingTerms.length
          ? Number((existingTerms.reduce((a, b) => a + b, 0) / existingTerms.length).toFixed(2))
          : null;

        return {
          studentDni: dni,
          studentName: name,
          term1: termValues[0],
          term2: termValues[1],
          term3: termValues[2],
          finalAvg,
          status: finalAvg === null ? "SIN_NOTA" : finalAvg >= PASS_THRESHOLD ? "APROBADO" : "DESAPROBADO",
        };
      })
      .filter((r): r is Row => Boolean(r));
  }, [teacherDni, enrollments, schedules, grades, allowedData, filterGrade, filterSection, visibleStudents]);

  return (
    <section className="page">
      <div className="page__header">
        <h1 className="page-title">Promedios</h1>
      </div>

      <div className="card page__filters">
        <div className="form__grid">
          <div className="form__group">
            <label>Grado</label>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
            >
              <option value="">Todos</option>
              {gradeOptions.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div className="form__group">
            <label>Seccion</label>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
            >
              <option value="">Todas</option>
              {sectionOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        {isAdmin && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
            <button className="btn" onClick={handlePrintSalon}>
              Imprimir salon
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <p>Cargando promedios...</p>
      ) : (
        <>
          <div className="card">
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>DNI</th>
                    <th>Estudiante</th>
                    <th>Bim 1</th>
                    <th>Bim 2</th>
                    <th>Bim 3</th>
                    <th>Prom. Final</th>
                    <th>Estado</th>
                    {isAdmin && <th>Libreta</th>}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={isAdmin ? 8 : 7} style={{ textAlign: "center", padding: "12px" }}>
                        No hay matriculas registradas.
                      </td>
                    </tr>
                  )}
                  {rows.map((r) => (
                    <tr key={r.studentDni}>
                      <td>{r.studentDni}</td>
                      <td>{r.studentName}</td>
                      <td>{r.term1 !== null ? r.term1 : "-"}</td>
                      <td>{r.term2 !== null ? r.term2 : "-"}</td>
                      <td>{r.term3 !== null ? r.term3 : "-"}</td>
                      <td>{r.finalAvg !== null ? r.finalAvg : "-"}</td>
                      <td>
                        <span
                          className={
                            "badge " +
                            (r.status === "APROBADO"
                              ? "badge--success"
                              : r.status === "DESAPROBADO"
                                ? "badge--danger"
                                : "badge--info")
                          }
                        >
                          {r.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td>
                          <button
                            className="btn btn--small"
                            onClick={() => handlePrint(r.studentDni)}
                            disabled={!hasNotes(r.studentDni)}
                          >
                            Imprimir
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {isAdmin && (
            <div className="card" style={{ marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <h2 className="card__title" style={{ margin: 0 }}>Correos de apoderados del salon</h2>
                <button
                  className="btn btn--small"
                  onClick={() => alert("Simular envio masivo a todos los apoderados filtrados")}
                  disabled={!canSendAll}
                  title={canSendAll ? "" : "Solo disponible si todos los alumnos filtrados tienen notas en todos sus cursos"}
                >
                  Enviar a todos
                </button>
              </div>
              <div className="table-wrapper">
                <table className="table table--compact">
                  <thead>
                    <tr>
                      <th>DNI</th>
                      <th>Estudiante</th>
                      <th>Correo apoderado</th>
                      <th>Notas</th>
                      <th>Accion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: "center", padding: 12 }}>
                          No hay alumnos en este salon.
                        </td>
                      </tr>
                    )}
                    {filteredStudents.map((st) => {
                      const notas = gradesByStudent.get(st.dni)?.length ?? 0;
                      return (
                        <tr key={st.dni}>
                          <td>{st.dni}</td>
                          <td>{st.name} {st.lastname}</td>
                          <td>{st.email}</td>
                          <td>{notas > 0 ? notas : "Sin notas"}</td>
                          <td>
                            <button
                              className="btn btn--small"
                              disabled={notas === 0}
                              onClick={() => alert(`Simular envio a ${st.email}`)}
                            >
                              Enviar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
