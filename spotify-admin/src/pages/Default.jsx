import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const url = 'http://localhost:4000'

const quickLinks = [
  { label: "Add Song",    path: "/add-song",    icon: "➕", desc: "Upload a new track to the library" },
  { label: "Add Album",   path: "/add-album",   icon: "🗂️",  desc: "Create and publish a new album" },
  { label: "List Songs",  path: "/list-song",   icon: "🎶", desc: "View and delete existing songs" },
  { label: "List Albums", path: "/list-album",  icon: "📀", desc: "View and manage all albums" },
  { label: "Ad Requests", path: "/ad-requests", icon: "📋", desc: "Review and action client ad briefs" },
]

const Default = () => {
  const navigate = useNavigate()

  const [stats, setStats] = useState({
    songs: "—",
    albums: "—",
    adRequests: "—",
    pending: "—",
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [songsRes, albumsRes, adRes, pendingRes] = await Promise.allSettled([
          axios.get(`${url}/api/song/list`),
          axios.get(`${url}/api/album/list`),
          axios.get(`${url}/api/ad-requests`),
          axios.get(`${url}/api/ad-requests?status=pending`),
        ])

        setStats({
          songs:
            songsRes.status === "fulfilled"
              ? songsRes.value.data?.songs?.length ?? "—"
              : "—",
          albums:
            albumsRes.status === "fulfilled"
              ? albumsRes.value.data?.albums?.length ?? "—"
              : "—",
          adRequests:
            adRes.status === "fulfilled"
              ? adRes.value.data?.requests?.length ?? "—"
              : "—",
          pending:
            pendingRes.status === "fulfilled"
              ? pendingRes.value.data?.requests?.length ?? "—"
              : "—",
        })
      } catch (err) {
        console.error("Stats fetch error:", err)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    { label: "Total Songs",    value: stats.songs,      icon: "🎵", color: "bg-blue-50   border-blue-100   text-blue-700" },
    { label: "Total Albums",   value: stats.albums,     icon: "💿", color: "bg-purple-50 border-purple-100 text-purple-700" },
    { label: "Ad Requests",    value: stats.adRequests, icon: "📋", color: "bg-green-50  border-green-100  text-green-700" },
    { label: "Pending Review", value: stats.pending,    icon: "⏳", color: "bg-yellow-50 border-yellow-100 text-yellow-700" },
  ]

  return (
    <div className="min-h-screen bg-[#F3FFF7] px-6 py-8 sm:px-10 sm:py-10">

      {/* ── Welcome Banner ── */}
      <div className="bg-[#003A10] rounded-2xl px-7 py-8 mb-8 flex items-center justify-between shadow-lg overflow-hidden relative">
        {/* decorative circles */}
        <div className="absolute -top-6 -right-6 w-40 h-40 rounded-full bg-white opacity-5" />
        <div className="absolute top-10 -right-2 w-24 h-24 rounded-full bg-[#00FF5B] opacity-5" />

        <div className="relative z-10">
          <p className="text-[#00FF5B] text-xs font-semibold tracking-[0.2em] uppercase mb-1">
            Admin Panel
          </p>
          <h1 className="text-white text-2xl sm:text-3xl font-bold leading-snug">
            Welcome back 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1.5 max-w-sm">
            Manage your music, albums, and ad requests all from one place.
          </p>
        </div>

        <div className="hidden sm:block text-8xl opacity-10 select-none relative z-10">
          🎧
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div
            key={s.label}
            className={`bg-white rounded-xl px-5 py-4 flex items-center gap-3 shadow-sm border ${s.color.split(" ")[1]}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${s.color.split(" ")[0]}`}>
              {s.icon}
            </div>
            <div>
              <p className={`text-2xl font-bold ${s.color.split(" ")[2]}`}>
                {s.value}
              </p>
              <p className="text-xs text-gray-400 leading-tight">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
        Quick Actions
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {quickLinks.map((link) => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className="bg-white hover:bg-[#003A10] group rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm border border-gray-100 hover:border-[#003A10] transition-all duration-200 text-left w-full"
          >
            <div className="w-11 h-11 rounded-full bg-[#F3FFF7] group-hover:bg-[#00FF5B]/20 flex items-center justify-center text-xl transition-all duration-200 shrink-0">
              {link.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 group-hover:text-white transition-colors duration-200 text-sm">
                {link.label}
              </p>
              <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-200 truncate">
                {link.desc}
              </p>
            </div>
            <span className="text-gray-300 group-hover:text-[#00FF5B] transition-colors duration-200 text-lg shrink-0">
              →
            </span>
          </button>
        ))}
      </div>

      {/* ── Footer ── */}
      <p className="text-center text-xs text-gray-300 mt-12">
        Spotify Admin · Changes reflect live on the app
      </p>

    </div>
  )
}

export default Default