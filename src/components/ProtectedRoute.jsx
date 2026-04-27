import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { supabase } from "../utils/supabase"

export default function ProtectedRoute({ children }) {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return null // 로딩 중

  return session ? children : <Navigate to="/login" replace />
}
