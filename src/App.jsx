import { Outlet } from "react-router-dom"
import BottomNavBar from "./components/BottomNavBar"

export default function App() {
  return (
    <div className="mx-4 pb-20" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      {/* 상태표시줄 safe area를 항상 덮는 고정 레이어 */}
      <div
        className="fixed top-0 left-0 right-0 bg-[#f0f0f0] z-50"
        style={{ height: "env(safe-area-inset-top)" }}
      />
      <Outlet />
      <BottomNavBar />
    </div>
  )
}