import { useState } from "react";
import { useSchedules } from "../hooks/useSchedules";
import { ScheduleForm } from "../components/ScheduleForm";
import { ScheduleTable } from "../components/ScheduleTable";
import { scheduleService } from "../services/scheduleService";
import { useTeachers } from "../../teachers/hooks/useTeachers";
import { useCourses } from "../../courses/hooks/useCourses";

export function SchedulesPage() {
  const { schedules, loading, error, reload } = useSchedules();
  const { teachers } = useTeachers();
  const { courses } = useCourses();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedSchedule = schedules.find((s) => s.id === selectedId) ?? null;

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar horario?")) return;
    await scheduleService.remove(id);
    reload();
  };

  const handleSaved = async () => {
    await reload();
    setSelectedId(null);
  };

  return (
    <section className="page">
      <div className="page__header">
        <h1 className="page-title">Asignacion de profesores y cursos</h1>
      </div>

      {error && <p className="text-error">{error}</p>}

      <div className="form__grid">
        <div style={{ minWidth: 0 }}>
          <ScheduleForm
            initialSchedule={selectedSchedule}
            teachers={teachers}
            courses={courses}
            onSaved={handleSaved}
          />
        </div>

        <div style={{ minWidth: 0 }}>
          {loading ? (
            <p>Cargando horarios...</p>
          ) : (
            <div className="card">
              <h2 className="card__title">Horarios registrados</h2>
              <ScheduleTable
                schedules={schedules}
                teachers={teachers}
                courses={courses}
                onDelete={handleDelete}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
