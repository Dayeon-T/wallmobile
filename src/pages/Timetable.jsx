import { useState, useEffect } from "react"
import { supabase } from "../utils/supabase"

const DAYS = ["월", "화", "수", "목", "금"]
const PERIOD_HEIGHT = 64
const TIME_COL_WIDTH = 36

const DEFAULT_PERIODS = [
  { label: "1교시", start: "08:20", enabled: true },
  { label: "2교시", start: "09:20", enabled: true },
  { label: "3교시", start: "10:20", enabled: true },
  { label: "4교시", start: "11:20", enabled: true },
  { label: "점심시간", start: "12:10", enabled: true },
  { label: "5교시", start: "13:00", enabled: true },
  { label: "6교시", start: "14:00", enabled: true },
  { label: "7교시", start: "15:00", enabled: true },
  { label: "방과후 A", start: "16:30", enabled: false },
  { label: "방과후 B", start: "18:20", enabled: false },
]

export default function Timetable() {
  const [tab, setTab] = useState("personal")
  const [courses, setCourses] = useState([])
  const [periods, setPeriods] = useState(DEFAULT_PERIODS)
  const [homeroomClass, setHomeroomClass] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)

      const [ttRes, profileRes] = await Promise.all([
        supabase.from("timetable").select("*").eq("user_id", user.id).eq("is_class", tab === "class"),
        supabase.from("profiles").select("period_schedule, homeroom_class").eq("id", user.id).single(),
      ])

      if (ttRes.data) setCourses(ttRes.data)

      if (profileRes.data) {
        setHomeroomClass(profileRes.data.homeroom_class || null)
        const saved = profileRes.data.period_schedule
        if (Array.isArray(saved) && saved.length > 0) {
          setPeriods(DEFAULT_PERIODS.map((def, i) => ({
            label: saved[i]?.label ?? def.label,
            start: saved[i]?.start ?? def.start,
            enabled: saved[i]?.enabled ?? def.enabled,
          })))
        }
      }

      setLoading(false)
    }
    fetchData()
  }, [tab])

  const usedIndices = new Set(courses.flatMap(c => {
    const arr = []
    for (let i = c.start_period; i <= c.end_period; i++) arr.push(i)
    return arr
  }))

  // 표시할 교시 (enabled이거나 수업 있는 것), 원래 인덱스(1-based) 유지
  const visiblePeriods = periods
    .map((p, i) => ({ ...p, index: i + 1 }))
    .filter(p => p.enabled || usedIndices.has(p.index))

  const totalHeight = visiblePeriods.length * PERIOD_HEIGHT

  // visiblePeriods에서 해당 교시의 row 위치 찾기
  function getRowPos(periodIndex) {
    return visiblePeriods.findIndex(p => p.index === periodIndex)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">불러오는 중...</div>
  )

  return (
    <div className="bg-white -mx-4">
      <div className="px-4 pt-4 pb-3 flex items-end justify-between">
        <div>
          <p className="text-xs text-gray-400">2024년 1학기</p>
          <h1 className="text-xl font-bold">시간표</h1>
        </div>
        {homeroomClass && (
          <div className="flex gap-2 pb-0.5">
            <button
              onClick={() => setTab("personal")}
              className={`text-sm font-semibold transition-colors ${tab === "personal" ? "text-black" : "text-gray-300"}`}
            >
              내 시간표
            </button>
            <button
              onClick={() => setTab("class")}
              className={`text-sm font-semibold transition-colors ${tab === "class" ? "text-black" : "text-gray-300"}`}
            >
              학급 시간표
              <span className="ml-1 text-xs font-medium opacity-60">{homeroomClass}</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex">
        {/* 교시 레이블 */}
        <div style={{ width: TIME_COL_WIDTH, minWidth: TIME_COL_WIDTH }}>
          <div style={{ height: 28 }} />
          <div className="relative" style={{ height: totalHeight }}>
            {visiblePeriods.map((period, row) => (
              <div
                key={period.index}
                className="absolute left-0 right-0 border-t border-gray-200 flex flex-col items-center justify-start pt-0.5"
                style={{ top: row * PERIOD_HEIGHT, height: PERIOD_HEIGHT }}
              >
                <span className="text-[9px] font-medium text-gray-500 leading-tight text-center">{period.label}</span>
                <span className="text-[8px] text-gray-400 leading-tight">{period.start}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 요일 컬럼 */}
        {DAYS.map((day, dayIdx) => (
          <div key={day} className="flex-1 min-w-0 border-l border-gray-200">
            <div
              style={{ height: 28 }}
              className="flex items-center justify-center text-xs font-medium text-gray-600"
            >
              {day}
            </div>
            <div className="relative" style={{ height: totalHeight }}>
              {/* 교시 구분선 */}
              {visiblePeriods.map((_, row) => (
                <div
                  key={row}
                  className="absolute left-0 right-0 border-t border-gray-100"
                  style={{ top: row * PERIOD_HEIGHT }}
                />
              ))}

              {/* 수업 블록 */}
              {courses
                .filter(c => c.day === dayIdx + 1)
                .map(course => {
                  const startRow = getRowPos(course.start_period)
                  const endRow = getRowPos(course.end_period)
                  if (startRow === -1) return null
                  const span = endRow === -1 ? 1 : endRow - startRow + 1
                  return (
                    <div
                      key={course.id}
                      className="absolute overflow-hidden px-1 py-1"
                      style={{
                        top: startRow * PERIOD_HEIGHT,
                        height: span * PERIOD_HEIGHT,
                        left: 0,
                        right: 0,
                        backgroundColor: course.color || "#AED6F1",
                      }}
                    >
                      <p className="text-[10px] font-bold leading-tight text-gray-800 line-clamp-2">
                        {course.subject}
                      </p>
                      {course.room && (
                        <p className="text-[9px] text-gray-600 leading-tight mt-0.5 truncate">
                          {course.room}
                        </p>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
