import { Navigate, Route, Routes } from "react-router-dom"
import AssessmentPage from "@/pages/candidate/AssessmentPage"
import AdminLoginPage from "@/pages/admin/AdminLoginPage"
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage"
import AdminCandidateDetailPage from "@/pages/admin/AdminCandidateDetailPage"
import AdminGuard from "@/components/layout/AdminGuard"
import NotFoundPage from "@/pages/NotFoundPage"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/assessment/:sessionId" element={<AssessmentPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <AdminGuard>
            <AdminDashboardPage />
          </AdminGuard>
        }
      />
      <Route
        path="/admin/sessions/:sessionId"
        element={
          <AdminGuard>
            <AdminCandidateDetailPage />
          </AdminGuard>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
