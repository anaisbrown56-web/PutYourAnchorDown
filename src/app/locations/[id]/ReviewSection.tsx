'use client'

import { useState } from 'react'
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
    name: string
    email: string
  }
}

interface ReviewSectionProps {
  locationId: string
  initialReviews: Review[]
  isEduUser: boolean
}

function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!local || !domain) return email
  const masked =
    local.length > 2
      ? local[0] + '•'.repeat(local.length - 2) + local[local.length - 1]
      : local
  return `${masked}@${domain}`
}

export default function ReviewSection({
  locationId,
  initialReviews,
  isEduUser,
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [refreshing, setRefreshing] = useState(false)

  const handleReviewSubmitted = async () => {
    setRefreshing(true)
    try {
      const res = await fetch(`/api/reviews?locationId=${locationId}`)
      if (res.ok) {
        const data = await res.json()
        setReviews(data)
      }
    } catch {
      // silently fail, old reviews still show
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Review Form */}
      {isEduUser && (
        <ReviewForm
          locationId={locationId}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      {/* Reviews List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-navy-800 font-bold text-xl">
              Reviews
              <span className="text-gray-400 font-normal text-lg ml-2">
                ({reviews.length})
              </span>
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
            <h3 className="text-navy-800 font-bold text-lg mb-1">
              No reviews yet
            </h3>
            <p className="text-gray-500 text-sm">
              {isEduUser
                ? 'Be the first to share your experience!'
                : 'Sign in with your .edu email to be the first to review.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reviews.map((review) => (
              <div key={review.id} className="p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-navy-800 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {review.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-navy-800 text-sm">
                        {review.user.name}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {maskEmail(review.user.email)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <StarRating rating={review.rating} size="sm" />
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                </div>

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
                    <span
                      key={vibe}
                      className="text-xs bg-navy-50 text-navy-700 border border-navy-200 px-2.5 py-1 rounded-full"
                    >
                      {vibe}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
