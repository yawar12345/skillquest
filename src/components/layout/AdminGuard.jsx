import { Navigate } from "react-router-dom"
import { isAdminAuthed } from "@/lib/storage"

export default function AdminGuard({ children }) {
  if (!isAdminAuthed()) {
    return <Navigate to="/admin/login" replace />
  }
  return children
}
