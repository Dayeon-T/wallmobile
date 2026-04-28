import { useState, useEffect } from "react"
import { supabase } from "../utils/supabase"

const DAYS = ["월", "화", "수", "목", "금"]
const START_HOUR = 9
const END_HOUR = 18
const HOUR_HEIGHT = 64
const TIME_COL_WIDTH = 24

const DEFAULT_COLORS = [
  "#AED6F1", "#A9DFBF", "#F9E79F", "#F1948A", "#C39BD3",
  "#FAD7A0", "#A3E4D7", "#D2B4DE", "#ABEBC6", "#F8C471",
]

export default function Timetable() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTimetable() {
      const { data, error } = await supabase.from("timetable").select("*")
      if (!error && data) setCourses(data)
      setLoading(false)
    }
    fetchTimetable()
  }, [])

  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)
  const totalHeight = (END_HOUR - START_HOUR) * HOUR_HEIGHT

  function getCourseStyle(course) {
    const top = (course.start_time - START_HOUR) * HOUR_HEIGHT
    const height = (course.end_time - course.start_time) * HOUR_HEIGHT
    return { top, height }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        불러오는 중...
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      {/* 헤더 */}
      <div className="px-4 pt-4 pb-3">
        <p className="text-xs text-gray-400">2024년 1학기</p>
        <h1 className="text-xl font-bold">시간표 1</h1>
      </div>

      {/* 시간표 그리드 */}
      <div className="flex">
        {/* 시간 컬럼 */}
        <div style={{ width: TIME_COL_WIDTH, minWidth: TIME_COL_WIDTH }}>
          {/* 요일 헤더 높이만큼 여백 */}
          <div style={{ height: 28 }} />
          {hours.map(h => (
            <div
              key={h}
              style={{ height: HOUR_HEIGHT }}
              className="flex items-start justify-center pt-0.5"
            >
              <span className="text-[10px] text-gray-400">{h}</span>
            </div>
          ))}
        </div>

        {/* 요일 컬럼들 */}
        {DAYS.map((day, dayIdx) => (
          <div key={day} className="flex-1 min-w-0 border-l border-gray-100">
            {/* 요일 헤더 */}
            <div
              style={{ height: 28 }}
              className="flex items-center justify-center text-xs font-medium text-gray-500"
            >
              {day}
            </div>

            {/* 수업 영역 */}
            <div className="relative" style={{ height: totalHeight }}>
              {/* 시간선 */}
              {hours.map(h => (
                <div
                  key={h}
                  className="absolute left-0 right-0 border-t border-gray-100"
                  style={{ top: (h - START_HOUR) * HOUR_HEIGHT }}
                />
              ))}

              {/* 수업 블록 */}
              {courses
                .filter(c => c.day === dayIdx + 1)
                .map((course, i) => {
                  const { top, height } = getCourseStyle(course)
                  const bg = course.color || DEFAULT_COLORS[course.id % DEFAULT_COLORS.length]
                  return (
                    <div
                      key={course.id}
                      className="absolute rounded-md px-1 py-1 overflow-hidden"
                      style={{ top, height, left: 1, right: 1, backgroundColor: bg }}
                    >
                      <p className="text-[10px] font-bold leading-tight text-gray-800 line-clamp-2">
                        {course.subject_name}
                      </p>
                      {height >= 44 && (
                        <p className="text-[9px] text-gray-600 leading-tight mt-0.5 truncate">
                          {course.professor}
                        </p>
                      )}
                      {height >= 60 && (
                        <p className="text-[9px] text-gray-600 leading-tight truncate">
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
