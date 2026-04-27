import { NavLink, useLocation } from "react-router-dom"
import friendIcon from "../assets/friend.svg"
import tableIcon from "../assets/table.svg"
import homeIcon from "../assets/home.svg"
import chatIcon from "../assets/chat.svg"
import settingsIcon from "../assets/settings.svg"

const navItems = [
  { to: "/friend", icon: friendIcon, label: "친구" },
  { to: "/timetable", icon: tableIcon, label: "시간표" },
  { to: "/", icon: homeIcon, label: "홈" },
  { to: "/messages", icon: chatIcon, label: "쪽지함" },
  { to: "/settings", icon: settingsIcon, label: "설정" },
]

export default function BottomNavBar() {
  const location = useLocation()
  const activeIndex = navItems.findIndex(({ to }) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to)
  )

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white">
      {/* 슬라이딩 바 */}
      <span
        className="absolute top-0 bg-black"
        style={{
          height: "4px",
          width: "12%",
          left: `${activeIndex * 20 + 4}%`,
          borderRadius: "9999px",
          transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />

      <div className="flex justify-around">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center pt-3 pb-3 px-4 text-xs gap-1 transition-colors duration-200 ${
                isActive ? "text-black font-bold" : "text-gray-400 font-normal"
              }`
            }
          >
            <img src={icon} alt={label} className="w-6 h-6" />
            {label}
          </NavLink>
        ))}
      </div>
    </div>
  )
}
