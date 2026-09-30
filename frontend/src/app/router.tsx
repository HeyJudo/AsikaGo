import { createBrowserRouter } from 'react-router'
import { HomePage } from '@/features/auth/HomePage'
import { AssessmentPage } from '@/features/assessment/AssessmentPage'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  {
    path: '/assessment',
    element: (
      <ProtectedRoute>
        <AssessmentPage />
      </ProtectedRoute>
    ),
  },
  { path: '*', element: <p className="p-8 text-center">Page not found.</p> },
])
