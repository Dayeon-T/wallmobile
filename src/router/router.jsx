import { createBrowserRouter } from "react-router-dom"
import App from "../App"
import Home from "../pages/Home"
import Friend from "../pages/Friend"
import Timetable from "../pages/Timetable"
import Messages from "../pages/Messages"
import Settings from "../pages/Settings"
import Login from "../pages/Login"
import ProtectedRoute from "../components/ProtectedRoute"

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: <ProtectedRoute><App /></ProtectedRoute>,
    children: [
      { index: true, element: <Home /> },
      { path: "friend", element: <Friend /> },
      { path: "timetable", element: <Timetable /> },
      { path: "messages", element: <Messages /> },
      { path: "settings", element: <Settings /> },
    ],
  },
])
