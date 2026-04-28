import { createBrowserRouter } from "react-router-dom"
import { lazy, Suspense } from "react"
import App from "../App"
import ProtectedRoute from "../components/ProtectedRoute"

const Home = lazy(() => import("../pages/Home"))
const Friend = lazy(() => import("../pages/Friend"))
const Timetable = lazy(() => import("../pages/Timetable"))
const Messages = lazy(() => import("../pages/Messages"))
const Settings = lazy(() => import("../pages/Settings"))
const Login = lazy(() => import("../pages/Login"))

const Fallback = () => (
  <div className="flex items-center justify-center h-screen bg-[#f0f0f0]" />
)

export const router = createBrowserRouter([
  { path: "/login", element: <Suspense fallback={<Fallback />}><Login /></Suspense> },
  {
    path: "/",
    element: <ProtectedRoute><App /></ProtectedRoute>,
    children: [
      { index: true, element: <Suspense fallback={<Fallback />}><Home /></Suspense> },
      { path: "friend", element: <Suspense fallback={<Fallback />}><Friend /></Suspense> },
      { path: "timetable", element: <Suspense fallback={<Fallback />}><Timetable /></Suspense> },
      { path: "messages", element: <Suspense fallback={<Fallback />}><Messages /></Suspense> },
      { path: "settings", element: <Suspense fallback={<Fallback />}><Settings /></Suspense> },
    ],
  },
])
