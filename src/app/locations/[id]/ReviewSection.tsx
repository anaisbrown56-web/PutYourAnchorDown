'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import ReviewForm from '@/components/ReviewForm'
import StarRating from '@/components/StarRating'

interface Review {
  id: string
  rating: number
  body: string
  waitMinutes: number
  vibes: string[]
  createdAt: string | Date
  user: {
    id: string
    name: string
    email: string
  }
}

interface ReviewSectionProps {
  locationId: string
  initialReviews: Review[]
  isEduUser: boolean
  isSignedIn: boolean
}

const VIBES = ['Chill','Lively','Study-Friendly','Social','Romantic','Adventurous','Outdoorsy']

function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!local || !domain) return email
  const masked = local.length > 2 ? local[0] + '•'.repeat(local.length - 2) + local[local.length - 1] : local
  return `${masked}@${domain}`
}

export default function ReviewSection({ locationId, initialReviews, isEduUser, isSignedIn }: ReviewSectionProps) {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [refreshing, setRefreshing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editBody, setEditBody] = useState('')
  const [editRating, setEditRating] = useState(0)
  const [editWait, setEditWait] = useState(0)
  const [editVibes, setEditVibes] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const refreshReviews = async () => {
    setRefreshing(true)
    try {
      const res = await fetch(`/api/reviews?locationId=${locationId}`)
      if (res.ok) setReviews(await res.json())
    } catch {}
    finally { setRefreshing(false) }
  }

  const handleReviewSubmitted = async () => await refreshReviews()

  const startEdit = (review: Review) => {
    setEditingId(review.id)
    setEditBody(review.body)
    setEditRating(review.rating)
    setEditWait(review.waitMinutes)
    setEditVibes(review.vibes)
  }

  const cancelEdit = () => setEditingId(null)

  const saveEdit = async (reviewId: string) => {
    setSaving(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, rating: editRating, reviewBody: editBody, waitMinutes: editWait, vibes: editVibes }),
      })
      if (res.ok) {
        setEditingId(null)
        await refreshReviews()
      }
    } catch {}
    finally { setSaving(false) }
  }

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    setDeletingId(reviewId)
    try {
      const res = await fetch(`/api/reviews?reviewId=${reviewId}`, { method: 'DELETE' })
      if (res.ok) await refreshReviews()
    } catch {}
    finally { setDeletingId(null) }
  }

  return (
    <div className="space-y-6">
      {isEduUser && (
        <ReviewForm locationId={locationId} onReviewSubmitted={handleReviewSubmitted} />
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-navy-800 font-bold text-xl">
              Reviews
              <span className="text-gray-400 font-normal text-lg ml-2">({reviews.length})</span>
            </h2>
            {refreshing && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Refreshing...
              </div>
            )}
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-5xl mb-3">💬</div>
            <h3 className="text-navy-800 font-bold text-lg mb-1">No reviews yet</h3>
            <p className="text-gray-500 text-sm">
              {isEduUser ? 'Be the first to share your experience!' : 'Sign in with your .edu email to be the first to review.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reviews.map((review) => {
              const isOwner = session?.user?.email === review.user.email
              const isEditing = editingId === review.id

              return (
                <div key={review.id} className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <Link href={`/profile/${review.user.id}`} className="w-9 h-9 bg-navy-800 rounded-full flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity">
                        <span className="text-white font-bold text-sm">{review.user.name.charAt(0).toUpperCase()}</span>
                      </Link>
                      <div>
                        <Link href={`/profile/${review.user.id}`} className="font-semibold text-navy-800 text-sm hover:text-gold-600 transition-colors">
                          {review.user.name}
                        </Link>
                        <p className="text-gray-400 text-xs">{maskEmail(review.user.email)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                        <StarRating rating={review.rating} size="sm" />
                        <p className="text-xs text-gray-400 mt-1">{formatDate(review.createdAt)}</p>
                      </div>
                      {isOwner && !isEditing && (
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={() => startEdit(review)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gold-500 hover:bg-gold-50 transition-colors"
                            title="Edit review"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteReview(review.id)}
                            disabled={deletingId === review.id}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete review"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-3 mt-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Rating</label>
                        <StarRating rating={editRating} size="md" interactive onRate={setEditRating} />
                      </div>
                      <textarea
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 resize-none"
                      />
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Vibes</label>
                        <div className="flex flex-wrap gap-1.5">
                          {VIBES.map((vibe) => (
                            <button
                              key={vibe}
                              type="button"
                              onClick={() => setEditVibes((prev) => prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe])}
                              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${editVibes.includes(vibe) ? 'bg-navy-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                              {vibe}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button onClick={cancelEdit} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">Cancel</button>
                        <button
                          onClick={() => saveEdit(review.id)}
                          disabled={saving}
                          className="px-4 py-1.5 bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold text-sm rounded-lg transition-colors disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-700 leading-relaxed mb-3">{review.body}</p>
                      <div className="flex flex-wrap items-center gap-3">
                        {review.waitMinutes > 0 && (
                          <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {review.waitMinutes} min wait
                          </span>
                        )}
                        {review.vibes.map((vibe) => (
                          <span key={vibe} className="text-xs bg-navy-50 text-navy-700 border border-navy-200 px-2.5 py-1 rounded-full">{vibe}</span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
