import { Outlet } from "react-router-dom"
import BottomNavBar from "./components/BottomNavBar"

export default function App() {
  return (
    <div className="mx-4 pb-20" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <Outlet />
      <BottomNavBar />
    </div>
  )
}