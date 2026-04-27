import { Outlet } from "react-router-dom"
import BottomNavBar from "./components/BottomNavBar"

export default function App() {
  return (
    <div className="mx-4 pb-20">
      <Outlet />
      <BottomNavBar />
    </div>
  )
}