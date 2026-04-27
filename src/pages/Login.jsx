import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../utils/supabase"

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.")
    } else {
      navigate("/")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
      <img
        src="/icons/icon-512x512.png"
        alt="로고"
        className="w-32 h-32 mb-8"
      />
      <p className="text-3xl font-bold mb-2">플 랜 스 쿨</p>
      <p className="text-sm mb-8">P L A N S C H O O L</p>

      <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-3">
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition-colors"
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition-colors"
        />

        {error && <p className="text-red-500 text-xs text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white rounded-xl py-3 text-sm font-bold mt-2 disabled:opacity-50 transition-opacity"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>
    </div>
  )
}
