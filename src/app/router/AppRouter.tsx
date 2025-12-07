import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "../layout/MainLayout";

import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "../../features/auth/pages/LoginPage";
import { StudentsListPage } from "../../features/students/pages/StudentsListPage";
import { StudentCreatePage } from "../../features/students/pages/StudentCreatePage";
import { StudentEditPage } from "../../features/students/pages/StudentEditPage";
import { TeacherListPage } from "../../features/teachers/pages/TeacherListPage";
import { TeacherCreatePage } from "../../features/teachers/pages/TeacherCreatePage";
import { TeacherEditPage } from "../../features/teachers/pages/TeacherEditPage";
import { CoursesListPage } from "../../features/courses/pages/CoursesListPage";
import { CourseCreatePage } from "../../features/courses/pages/CourseCreatePage";
import { CourseEditPage } from "../../features/courses/pages/CourseEditPage";
import { GradesPage } from "../../features/grades/pages/GradesPage";
import { SchedulesPage } from "../../features/schedules/pages/SchedulesPage";
import { EnrollmentsPage } from "../../features/enrollments/pages/EnrollmentsPage";
import { AveragesPage } from "../../features/grades/pages/AveragesPage";
import { DashboardPage } from "../../features/dashboard/pages/DashboardPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* RUTAS PROTEGIDAS */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN", "DOCENTE"]} />}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="students" element={<StudentsListPage />} />
          <Route path="grades" element={<GradesPage />} />
          <Route path="averages" element={<AveragesPage />} />

          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="students/new" element={<StudentCreatePage />} />
            <Route path="students/:dni/edit" element={<StudentEditPage />} />
            <Route path="teachers" element={<TeacherListPage />} />
            <Route path="teachers/new" element={<TeacherCreatePage />} />
            <Route path="teachers/:dni/edit" element={<TeacherEditPage />} />
            <Route path="courses" element={<CoursesListPage />} />
            <Route path="courses/new" element={<CourseCreatePage />} />
            <Route path="courses/:id/edit" element={<CourseEditPage />} />
            <Route path="schedules" element={<SchedulesPage />} />
            <Route path="enrollments" element={<EnrollmentsPage />} />
          </Route>
        </Route>
      </Route>

      {/* RUTA FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
