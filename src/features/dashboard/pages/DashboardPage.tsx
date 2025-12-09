import { useMemo, type ReactNode } from "react";
import { useStudents } from "../../students/hooks/useStudents";
import { useTeachers } from "../../teachers/hooks/useTeachers";
import { useCourses } from "../../courses/hooks/useCourses";
import { useEnrollments } from "../../enrollments/hooks/useEnrollments";
import { useSchedules } from "../../schedules/hooks/useSchedules";
import { useAuth } from "../../auth/hooks/useAuth";

function StatCard({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="card stat-card">
      <p className="stat-card__label">{label}</p>
      <p className="stat-card__value">{value}</p>
      {helper && <p className="stat-card__helper">{helper}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="section">
      <header className="section__header">
        <h2 className="section__title">{title}</h2>
      </header>
      {children}
    </section>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const isDocente = user?.role === "DOCENTE";
  const teacherDni = user?.teacherDni;
  const { students } = useStudents();
  const { teachers } = useTeachers();
  const { courses } = useCourses();
  const { enrollments } = useEnrollments();
  const { schedules } = useSchedules();

  const allowedStudents = useMemo(() => {
    if (!teacherDni) return null;
    const teacherSchedules = schedules.filter((s) => s.teacherDni === teacherDni);
    const scheduleIds = new Set(teacherSchedules.map((s) => String(s.id)));
    const dnis = new Set(
      enrollments.filter((e) => scheduleIds.has(String(e.scheduleId))).map((e) => e.studentDni)
    );
    return dnis;
  }, [teacherDni, schedules, enrollments]);

  const stats = useMemo(() => {
    const activeStudents = students.filter((s) => s.status === "ACTIVO");
    const studentCount = isDocente && allowedStudents ? activeStudents.filter((s) => allowedStudents.has(s.dni)).length : activeStudents.length;
    const activeTeachers = teachers.filter((t) => t.status === "ACTIVO").length;
    const activeCourses = courses.filter((c) => c.status === "ACTIVO").length;
    const totalEnrollments = enrollments.length;

    const teacherLoad = teachers.map((teacher) => ({
      teacher,
      groups: schedules.filter((s) => s.teacherDni === teacher.dni).length,
    }));

    const busiest = teacherLoad
      .filter((t) => t.groups > 0)
      .sort((a, b) => b.groups - a.groups)[0];

    const helper = busiest
      ? `${busiest.teacher.name} ${busiest.teacher.lastname} lidera ${busiest.groups} horario(s)`
      : undefined;

    return {
      activeStudents: studentCount,
      activeTeachers,
      activeCourses,
      totalEnrollments,
      helper,
    };
  }, [courses, enrollments, schedules, students, teachers, isDocente, allowedStudents]);

  const insights = useMemo(() => {
    const courseUsage = courses.map((course) => {
      const assigned = schedules.some((s) => s.courses.includes(course.id));
      return { course, assigned };
    });

    const unassignedCourses = courseUsage.filter((c) => !c.assigned).map((c) => c.course.name);
    const summary: string[] = [];

    if (unassignedCourses.length) {
      summary.push(`Cursos por asignar: ${unassignedCourses.slice(0, 3).join(", ")}`);
    }

    const gradesByShift = schedules.reduce<Record<string, number>>((acc, sch) => {
      acc[sch.shift] = (acc[sch.shift] ?? 0) + 1;
      return acc;
    }, {});

    const shiftInfo = Object.entries(gradesByShift)
      .map(([shift, count]) => `${shift.toLowerCase()}: ${count}`)
      .join(" | ");

    if (shiftInfo) {
      summary.push(`Horarios por turno: ${shiftInfo}`);
    }

    return summary;
  }, [courses, schedules]);

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <p className="eyebrow">Panel de control</p>
          <h1 className="page-title">Bienvenido a StudentApp</h1>
          <p className="page-subtitle">
            Visibilidad rápida de matrículas, cursos y docentes. Los accesos respetan tu rol.
          </p>
        </div>
      </header>

      <div className="stat-grid">
        <StatCard label="Alumnos activos" value={stats.activeStudents.toString()} />
        <StatCard label="Docentes activos" value={stats.activeTeachers.toString()} />
        <StatCard label="Cursos activos" value={stats.activeCourses.toString()} />
        <StatCard
          label="Matrículas registradas"
          value={stats.totalEnrollments.toString()}
          helper={stats.helper}
        />
      </div>

      <Section title="Insights rápidos">
        {insights.length ? (
          <ul className="list">
            {insights.map((item) => (
              <li key={item} className="list__item">
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay alertas pendientes.</p>
        )}
      </Section>

      <Section title="Ayuda rápida">
        <div className="card">
          <p className="eyebrow">Roles de prueba</p>
          <p>Admin: admin@colegio.com / 123456</p>
          <p>Docente: maria.torres@ieprimaria.com / docente123</p>
          <p style={{ marginTop: 8 }}>
            Flujo recomendado: crea cursos y docentes, asigna horarios, matricula alumnos, registra
            notas y consulta promedios.
          </p>
        </div>
      </Section>
    </div>
  );
}
