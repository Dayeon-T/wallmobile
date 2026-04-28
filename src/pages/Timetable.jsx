import { useState, useEffect } from "react"
import { supabase } from "../utils/supabase"

const DAYS = ["월", "화", "수", "목", "금"]
const TIME_COL_WIDTH = 44
const PX_PER_MIN = 1.1

const DEFAULT_PERIOD_SCHEDULE = [
  null,
  { label: "1교시", start: "08:20", end: "09:10", enabled: true },
  { label: "2교시", start: "09:20", end: "10:10", enabled: true },
  { label: "3교시", start: "10:20", end: "11:10", enabled: true },
  { label: "4교시", start: "11:20", end: "12:10", enabled: true },
  { label: "점심시간", start: "12:10", end: "13:00", enabled: true },
  { label: "5교시", start: "13:00", end: "13:50", enabled: true },
  { label: "6교시", start: "14:00", end: "14:50", enabled: true },
  { label: "7교시", start: "15:00", end: "15:50", enabled: true },
  { label: "방과후 A", start: "16:30", end: "17:20", enabled: false },
  { label: "방과후 B", start: "18:20", end: "20:00", enabled: false },
]

function timeToMin(str) {
  const [h, m] = str.split(":").map(Number)
  return h * 60 + m
}

export default function Timetable() {
  const [courses, setCourses] = useState([])
  const [schedule, setSchedule] = useState(DEFAULT_PERIOD_SCHEDULE)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)

      const [ttRes, profileRes] = await Promise.all([
        supabase
          .from("timetable")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_class", false)
          .order("day")
          .order("start_period"),
        supabase
          .from("profiles")
          .select("period_schedule")
          .eq("id", user.id)
          .single(),
      ])

      if (ttRes.data) setCourses(ttRes.data)

      const saved = profileRes.data?.period_schedule
      if (Array.isArray(saved) && saved.length > 0) {
        const merged = DEFAULT_PERIOD_SCHEDULE.slice(1).map((def, i) => ({
          label: saved[i]?.label ?? def.label,
          start: saved[i]?.start ?? def.start,
          end: saved[i]?.end ?? def.end,
          enabled: saved[i]?.enabled ?? def.enabled,
        }))
        setSchedule([null, ...merged])
      }

      setLoading(false)
    }
    fetchData()
  }, [])

  // 실제 수업이 있는 교시 인덱스 수집
  const usedPeriodIndices = new Set(
    courses.flatMap(c => {
      const indices = []
      for (let i = c.start_period; i <= c.end_period; i++) indices.push(i)
      return indices
    })
  )

  // 표시할 교시: enabled이거나 수업이 있는 것
  const visiblePeriods = schedule.slice(1).map((p, i) => ({ ...p, index: i + 1 }))
    .filter(p => p.enabled || usedPeriodIndices.has(p.index))

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
      불러오는 중...
    </div>
  )

  if (visiblePeriods.length === 0) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
      시간표가 없습니다.
    </div>
  )

  const dayStartMin = timeToMin(visiblePeriods[0].start)
  const dayEndMin = timeToMin(visiblePeriods[visiblePeriods.length - 1].end)
  const totalHeight = (dayEndMin - dayStartMin) * PX_PER_MIN

  function getBlockStyle(course) {
    const sp = schedule[course.start_period]
    const ep = schedule[course.end_period]
    if (!sp || !ep) return null
    const top = (timeToMin(sp.start) - dayStartMin) * PX_PER_MIN
    const height = (timeToMin(ep.end) - timeToMin(sp.start)) * PX_PER_MIN
    return { top, height }
  }

  return (
    <div className="bg-white overflow-hidden -mx-4">
      {/* 헤더 */}
      <div className="px-4 pt-4 pb-3">
        <p className="text-xs text-gray-400">2024년 1학기</p>
        <h1 className="text-xl font-bold">시간표 1</h1>
      </div>

      <div className="flex">
        {/* 교시 레이블 컬럼 */}
        <div style={{ width: TIME_COL_WIDTH, minWidth: TIME_COL_WIDTH }}>
          <div style={{ height: 28 }} />
          <div className="relative" style={{ height: totalHeight }}>
            {visiblePeriods.map(period => {
              const top = (timeToMin(period.start) - dayStartMin) * PX_PER_MIN
              const height = (timeToMin(period.end) - timeToMin(period.start)) * PX_PER_MIN
              return (
                <div
                  key={period.index}
                  className="absolute left-0 right-0 flex flex-col items-center justify-start pt-0.5 border-t border-gray-200"
                  style={{ top, height }}
                >
                  <span className="text-[9px] text-gray-500 leading-tight text-center px-0.5 font-medium">
                    {period.label}
                  </span>
                  <span className="text-[8px] text-gray-300 leading-tight">{period.start}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* 요일 컬럼들 */}
        {DAYS.map((day, dayIdx) => (
          <div key={day} className="flex-1 min-w-0 border-l border-gray-200">
            <div style={{ height: 28 }} className="flex items-center justify-center text-xs font-medium text-gray-500">
              {day}
            </div>
            <div className="relative" style={{ height: totalHeight }}>
              {/* 교시 구분선 */}
              {visiblePeriods.map(period => (
                <div
                  key={period.index}
                  className="absolute left-0 right-0 border-t border-gray-100"
                  style={{ top: (timeToMin(period.start) - dayStartMin) * PX_PER_MIN }}
                />
              ))}

              {/* 수업 블록 */}
              {courses
                .filter(c => c.day === dayIdx + 1)
                .map(course => {
                  const style = getBlockStyle(course)
                  if (!style) return null
                  return (
                    <div
                      key={course.id}
                      className="absolute px-1 py-1 overflow-hidden"
                      style={{
                        top: style.top,
                        height: style.height,
                        left: 0,
                        right: 0,
                        backgroundColor: course.color || "#AED6F1",
                      }}
                    >
                      <p className="text-[10px] font-bold leading-tight text-gray-800 line-clamp-2">
                        {course.subject}
                      </p>
                      {style.height >= 40 && course.room && (
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
