import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  onRatingChange?: (rating: number) => void
  readOnly?: boolean
}

export function StarRating({ rating, onRatingChange, readOnly = false }: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => !readOnly && onRatingChange?.(star)}
          className={`transition-colors ${!readOnly && 'cursor-pointer hover:opacity-80'}`}
          disabled={readOnly}
        >
          <Star
            className={`w-5 h-5 ${
              star <= rating
                ? 'fill-amber-400 text-amber-400'
                : 'text-zinc-600'
            }`}
          />
        </button>
      ))}
    </div>
  )
}
