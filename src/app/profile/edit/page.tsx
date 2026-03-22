'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const ROLE_OPTIONS = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'FACULTY', label: 'Faculty' },
  { value: 'STAFF', label: 'Staff' },
  { value: 'ALUMNI', label: 'Alumni' },
  { value: 'OTHER', label: 'Other' },
]

export default function EditProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [role, setRole] = useState('STUDENT')
  const [university, setUniversity] = useState('')
  const [graduationYear, setGraduationYear] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin')
  }, [status, router])

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => {
        setName(data.name || '')
        setBio(data.bio || '')
        setRole(data.role || 'STUDENT')
        setUniversity(data.university || '')
        setGraduationYear(data.graduationYear ? String(data.graduationYear) : '')
        setAvatarUrl(data.avatarUrl || '')
        setAvatarPreview(data.avatarUrl || '')
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      let uploadedAvatarUrl = avatarUrl

      if (avatarFile) {
        const fd = new FormData()
        fd.append('file', avatarFile)
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd })
        const uploadData = await uploadRes.json()
        uploadedAvatarUrl = uploadData.url
      }

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          bio,
          role,
          university,
          avatarUrl: uploadedAvatarUrl,
          graduationYear: graduationYear ? parseInt(graduationYear) : null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')

      setSuccess(true)
      setTimeout(() => {
        router.push(`/profile/${data.id}`)
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    </div>
  )

  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-navy-800 mb-2">Edit Profile</h1>
        <p className="text-gray-500">Update your profile information.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-navy-800 mb-4">Profile Photo</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              {avatarPreview ? (
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <Image src={avatarPreview} alt="Avatar" fill className="object-cover" sizes="96px" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gold-500 flex items-center justify-center border-4 border-white shadow-lg">
                  <span className="text-2xl font-black text-navy-900">{initials}</span>
                </div>
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => document.getElementById('avatar-upload')?.click()}
                className="bg-navy-800 hover:bg-navy-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Upload Photo
              </button>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-bold text-navy-800">Basic Info</h2>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bio</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Tell others a bit about yourself..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{bio.length}/500</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role</label>
            <div className="flex flex-wrap gap-2">
              {ROLE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRole(opt.value)}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                    role === opt.value
                      ? 'border-gold-500 bg-gold-50 text-navy-800'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">University</label>
            <input
              type="text"
              value={university}
              onChange={e => setUniversity(e.target.value)}
              placeholder="e.g. University of Virginia"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Graduation Year</label>
            <input
              type="number"
              value={graduationYear}
              onChange={e => setGraduationYear(e.target.value)}
              placeholder="e.g. 2026"
              min="2000"
              max="2040"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm">
            Profile saved! Redirecting...
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-gold-500 hover:bg-gold-400 disabled:bg-gray-300 text-navy-900 font-bold px-8 py-3 rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  )
}