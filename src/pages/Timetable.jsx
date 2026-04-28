import { useState, useEffect } from "react"
import { supabase } from "../utils/supabase"

const DAYS = ["월", "화", "수", "목", "금"]
const START_PERIOD = 1
const END_PERIOD = 9
const HOUR_HEIGHT = 64
const TIME_COL_WIDTH = 24

// 교시 → 시간 표시 (1교시=9시)
const periodToHour = (p) => p + 8

export default function Timetable() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTimetable() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)

      const { data, error } = await supabase
        .from("timetable")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_class", false)
        .order("day")
        .order("start_period")

      if (!error && data) setCourses(data)
      setLoading(false)
    }
    fetchTimetable()
  }, [])

  const periods = Array.from({ length: END_PERIOD - START_PERIOD + 1 }, (_, i) => START_PERIOD + i)
  const totalHeight = periods.length * HOUR_HEIGHT

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        불러오는 중...
      </div>
    )
  }

  return (
    <div className="bg-white overflow-hidden -mx-4">
      {/* 헤더 */}
      <div className="px-4 pt-4 pb-3">
        <p className="text-xs text-gray-400">2024년 1학기</p>
        <h1 className="text-xl font-bold">시간표 1</h1>
      </div>

      {/* 그리드 */}
      <div className="flex">
        {/* 교시/시간 컬럼 */}
        <div style={{ width: TIME_COL_WIDTH, minWidth: TIME_COL_WIDTH }}>
          <div style={{ height: 28 }} />
          {periods.map(p => (
            <div
              key={p}
              style={{ height: HOUR_HEIGHT }}
              className="flex items-start justify-center pt-0.5"
            >
              <span className="text-[10px] text-gray-400">{periodToHour(p)}</span>
            </div>
          ))}
        </div>

        {/* 요일 컬럼 */}
        {DAYS.map((day, dayIdx) => (
          <div key={day} className="flex-1 min-w-0 border-l border-gray-100">
            <div style={{ height: 28 }} className="flex items-center justify-center text-xs font-medium text-gray-500">
              {day}
            </div>

            <div className="relative" style={{ height: totalHeight }}>
              {/* 시간 구분선 */}
              {periods.map(p => (
                <div
                  key={p}
                  className="absolute left-0 right-0 border-t border-gray-100"
                  style={{ top: (p - START_PERIOD) * HOUR_HEIGHT }}
                />
              ))}

              {/* 수업 블록 */}
              {courses
                .filter(c => c.day === dayIdx + 1)
                .map(course => {
                  const top = (course.start_period - START_PERIOD) * HOUR_HEIGHT
                  const height = (course.end_period - course.start_period + 1) * HOUR_HEIGHT
                  return (
                    <div
                      key={course.id}
                      className="absolute rounded-md px-1 py-1 overflow-hidden"
                      style={{ top, height, left: 1, right: 1, backgroundColor: course.color || "#AED6F1" }}
                    >
                      <p className="text-[10px] font-bold leading-tight text-gray-800 line-clamp-2">
                        {course.subject}
                      </p>
                      {height >= 60 && course.room && (
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
