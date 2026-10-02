import { createBrowserRouter } from 'react-router'
import { AppLayout } from '@/app/AppLayout'
import { HomePage } from '@/features/auth/HomePage'
import { AssessmentPage } from '@/features/assessment/AssessmentPage'
import { MyBusinessPage } from '@/features/assessment/MyBusinessPage'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { FullPageError, NotFoundPage } from '@/components/PageStates'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <FullPageError onRetry={() => window.location.reload()} />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'assessment',
        element: (
          <ProtectedRoute>
            <AssessmentPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'my-business',
        element: (
          <ProtectedRoute>
            <MyBusinessPage />
          </ProtectedRoute>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
