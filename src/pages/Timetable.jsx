import { useState, useEffect } from "react"
import { supabase } from "../utils/supabase"

const DAYS = ["월", "화", "수", "목", "금"]

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
  const [courses, setCourses] = useState([])
  const [periods, setPeriods] = useState(DEFAULT_PERIODS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)

      const [ttRes, profileRes] = await Promise.all([
        supabase.from("timetable").select("*").eq("user_id", user.id).eq("is_class", false),
        supabase.from("profiles").select("period_schedule").eq("id", user.id).single(),
      ])

      if (ttRes.data) setCourses(ttRes.data)

      const saved = profileRes.data?.period_schedule
      if (Array.isArray(saved) && saved.length > 0) {
        setPeriods(DEFAULT_PERIODS.map((def, i) => ({
          label: saved[i]?.label ?? def.label,
          start: saved[i]?.start ?? def.start,
          enabled: saved[i]?.enabled ?? def.enabled,
        })))
      }

      setLoading(false)
    }
    fetchData()
  }, [])

  // 실제 수업 있는 교시는 disabled여도 표시
  const usedIndices = new Set(courses.flatMap(c => {
    const arr = []
    for (let i = c.start_period; i <= c.end_period; i++) arr.push(i)
    return arr
  }))

  const visiblePeriods = periods
    .map((p, i) => ({ ...p, index: i + 1 }))
    .filter(p => p.enabled || usedIndices.has(p.index))

  // 수업 맵: "day-periodIndex" → course
  const courseMap = {}
  const skipped = new Set()
  for (const c of courses) {
    courseMap[`${c.day}-${c.start_period}`] = c
    for (let i = c.start_period + 1; i <= c.end_period; i++) {
      skipped.add(`${c.day}-${i}`)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">불러오는 중...</div>
  )

  return (
    <div className="bg-white -mx-4">
      <div className="px-4 pt-4 pb-3">
        <p className="text-xs text-gray-400">2024년 1학기</p>
        <h1 className="text-xl font-bold">시간표 1</h1>
      </div>

      <table className="w-full border-collapse table-fixed">
        <colgroup>
          <col style={{ width: "15%" }} />
          {DAYS.map(d => <col key={d} style={{ width: "17%" }} />)}
        </colgroup>

        {/* 요일 헤더 */}
        <thead>
          <tr>
            <th className="border border-gray-200 py-1.5 text-[11px] text-gray-400 font-normal bg-gray-50" />
            {DAYS.map(day => (
              <th key={day} className="border border-gray-200 py-1.5 text-[11px] font-medium text-gray-600 bg-gray-50">
                {day}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {visiblePeriods.map(period => (
            <tr key={period.index}>
              {/* 교시 레이블 */}
              <td className="border border-gray-200 text-center bg-gray-50 py-2 px-0.5">
                <p className="text-[9px] font-medium text-gray-600 leading-tight">{period.label}</p>
                <p className="text-[8px] text-gray-400 leading-tight">{period.start}</p>
              </td>

              {/* 요일별 셀 */}
              {DAYS.map((_, dayIdx) => {
                const day = dayIdx + 1
                const key = `${day}-${period.index}`

                if (skipped.has(key)) return null

                const course = courseMap[key]
                const span = course ? course.end_period - course.start_period + 1 : 1

                return (
                  <td
                    key={day}
                    rowSpan={span}
                    className="border border-gray-200 p-0"
                    style={{ backgroundColor: course?.color || "transparent" }}
                  >
                    {course && (
                      <div className="px-1 py-1">
                        <p className="text-[10px] font-bold leading-tight text-gray-800 line-clamp-2">
                          {course.subject}
                        </p>
                        {course.room && (
                          <p className="text-[9px] text-gray-600 leading-tight mt-0.5 truncate">
                            {course.room}
                          </p>
                        )}
                      </div>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
