import { createBrowserRouter } from 'react-router'
import { HomePage } from '@/features/auth/HomePage'

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '*', element: <p className="p-8 text-center">Page not found.</p> },
])
