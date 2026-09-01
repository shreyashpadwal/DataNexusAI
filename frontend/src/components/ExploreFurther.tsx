import { ChevronRight } from 'lucide-react'

function getFollowUps(question: string): string[] {
  const q = question.toLowerCase()
  if (q.includes('revenue'))  return ['Break revenue down by city', 'Show revenue trend over time', 'Compare revenue by vehicle type']
  if (q.includes('vehicle'))  return ['Which vehicle has the highest rating?', 'List all active vehicles', 'Show vehicles by city']
  if (q.includes('user'))     return ['Show user registration trend', 'Count users by city', 'List most active users']
  if (q.includes('ride'))     return ['What is the average ride distance?', 'Show rides by status', 'Count rides per day']
  return ['What is the total revenue?', 'Show top 5 vehicles', 'Show users by city']
}

interface Props {
  question: string
  onSelect: (q: string) => void
}

export default function ExploreFurther({ question, onSelect }: Props) {
  const suggestions = getFollowUps(question)
  
  return (
    <div className="card animate-fade-in space-y-4">
      <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">Explore Further</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map(q => (
          <button 
            key={q} 
            onClick={() => onSelect(q)}
            className="flex items-center gap-1.5 text-xs text-[var(--text-dim)] hover:text-[var(--text-primary)] px-3 py-1.5 rounded-full
                       border border-[var(--border)] hover:border-[var(--border-mid)] hover:bg-[var(--bg-hover)]
                       transition-all duration-150"
          >
            {q}
            <ChevronRight className="w-3 h-3 opacity-50" />
          </button>
        ))}
      </div>
    </div>
  )
}
