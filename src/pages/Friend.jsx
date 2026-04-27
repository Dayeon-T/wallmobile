import { useEffect, useState } from "react"
import heroImg from "../assets/hero.png"
import { supabase } from "../utils/supabase"

function getProfileFromRelation(profile) {
  return Array.isArray(profile) ? profile[0] : profile
}

function ProfileRow({ profile }) {
  const name = profile?.name || "이름 없음"

  return (
    <div className="flex items-center gap-3 py-3">
      <img
        src={profile?.avatar_url || heroImg}
        alt={`${name} 프로필 사진`}
        className="w-11 h-11 rounded-full object-cover bg-gray-100"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{name}</p>
        <p className="truncate text-xs text-gray-400">상태메시지는 준비 중</p>
      </div>
    </div>
  )
}

export default function Friend() {
  const [profile, setProfile] = useState(null)
  const [friends, setFriends] = useState([])
  const [schoolMembers, setSchoolMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadFriendPage() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        if (isMounted) setLoading(false)
        return
      }

      const [{ data: myProfile }, { data: friendRows }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, name, avatar_url, school_code, atpt_code")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("friends")
          .select("id, friend:profiles!friends_friend_id_fkey(id, name, avatar_url)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ])

      let members = []

      if (myProfile?.school_code && myProfile?.atpt_code) {
        const { data } = await supabase
          .from("profiles")
          .select("id, name, avatar_url, school_name")
          .eq("school_code", myProfile.school_code)
          .eq("atpt_code", myProfile.atpt_code)
          .neq("id", user.id)
          .order("name", { ascending: true })

        members = data ?? []
      }

      const friendProfiles =
        friendRows
          ?.map(({ id, friend }) => ({
            relationId: id,
            ...getProfileFromRelation(friend),
          }))
          .filter(({ id }) => id) ?? []

      if (isMounted) {
        setProfile(myProfile)
        setFriends(friendProfiles)
        setSchoolMembers(members)
        setLoading(false)
      }
    }

    loadFriendPage()

    return () => {
      isMounted = false
    }
  }, [])

  const avatarUrl = profile?.avatar_url || heroImg
  const displayName = profile?.name || "내 이름"

  return (
    <div className="-mx-4 bg-white">
      <div className="flex items-center gap-4 px-4 py-5">
        <img
          src={avatarUrl}
          alt={`${displayName} 프로필 사진`}
          className="w-14 h-14 rounded-full object-cover bg-gray-100"
        />
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-base">
            {loading ? "불러오는 중..." : displayName}
          </span>
          <span className="text-sm text-gray-400">상태메시지는 준비 중</span>
        </div>
      </div>

      <div className="h-2 bg-gray-100" />

      <section className="bg-white">
        <p className="px-4 pt-4 pb-2 text-xs text-gray-400">친구 {friends.length}명</p>
        <div className="flex flex-col px-4">
          {friends.map((friend) => (
            <ProfileRow key={friend.relationId} profile={friend} />
          ))}

          {!loading && friends.length === 0 && (
            <div className="py-6 text-center text-sm text-gray-400">
              아직 친구가 없어요
            </div>
          )}
        </div>
      </section>

      <div className="h-2 bg-gray-100" />

      <section className="bg-white">
        <p className="px-4 pt-4 pb-2 text-xs text-gray-400">
          같은 학교 {schoolMembers.length}명
        </p>
        <div className="flex flex-col px-4">
          {schoolMembers.map((member) => (
            <ProfileRow key={member.id} profile={member} />
          ))}

          {!loading && schoolMembers.length === 0 && (
            <div className="py-6 text-center text-sm text-gray-400">
              같은 학교 프로필이 아직 없어요
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
