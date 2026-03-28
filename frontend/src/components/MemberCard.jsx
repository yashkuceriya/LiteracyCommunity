import { Link } from 'react-router-dom';

export default function MemberCard({ profile, score, breakdown, onMessage }) {
  const user = profile.user;
  const district = profile.district;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-lg font-bold shrink-0">
          {(user.first_name?.[0] || '?').toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-headline font-bold text-base truncate">
            {user.first_name} {user.last_name}
          </h3>
          {profile.title && <p className="text-sm text-gray-500 truncate">{profile.title}</p>}
          {district && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              {district.name}, {district.state} &middot; {district.display_type} &middot; {district.display_size}
            </p>
          )}
        </div>
        {score !== undefined && (
          <div className="shrink-0 text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${
              score >= 60 ? 'bg-emerald-100 text-emerald-700' :
              score >= 30 ? 'bg-amber-100 text-amber-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {score}%
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Match</p>
          </div>
        )}
      </div>

      {district && (
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[11px] font-medium rounded-full">
            FRL: {parseFloat(district.free_reduced_lunch_pct).toFixed(0)}%
          </span>
          <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[11px] font-medium rounded-full">
            ESL: {parseFloat(district.esl_pct).toFixed(0)}%
          </span>
          <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[11px] font-medium rounded-full">
            {district.enrollment?.toLocaleString()} students
          </span>
        </div>
      )}

      {profile.problem_statements?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {profile.problem_statements.slice(0, 3).map((ps) => (
            <span key={ps.id} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-medium rounded-full truncate max-w-[200px]">
              {ps.title}
            </span>
          ))}
          {profile.problem_statements.length > 3 && (
            <span className="px-2.5 py-1 bg-gray-50 text-gray-500 text-[11px] font-medium rounded-full">
              +{profile.problem_statements.length - 3} more
            </span>
          )}
        </div>
      )}

      {breakdown && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-[11px] font-medium text-gray-400 mb-2 uppercase tracking-wider">Match Breakdown</p>
          <div className="space-y-2">
            {[
              { label: 'Challenges', score: breakdown.shared_problems?.score || 0, max: 45, detail: breakdown.shared_problems?.count ? `${breakdown.shared_problems.count} shared` : null },
              { label: 'District Type', score: breakdown.district_type?.score || 0, max: 15, detail: breakdown.district_type?.match ? 'Match' : 'Different' },
              { label: 'Size', score: breakdown.district_size?.score || 0, max: 15 },
              { label: 'FRL %', score: breakdown.free_reduced_lunch?.score || 0, max: 10 },
              { label: 'ESL %', score: breakdown.esl?.score || 0, max: 10 },
              { label: 'State', score: breakdown.same_state?.score || 0, max: 5, detail: breakdown.same_state?.match ? 'Same' : 'Diff' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-xs">
                <span className="text-gray-400 w-16 text-right truncate">{item.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-full rounded-full ${item.score > 0 ? 'bg-emerald-500' : 'bg-gray-200'}`}
                    style={{ width: `${item.max > 0 ? (item.score / item.max) * 100 : 0}%` }} />
                </div>
                <span className="text-gray-500 w-14 text-right">{item.detail || `${item.score}/${item.max}`}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-4">
        {onMessage && (
          <button
            onClick={() => onMessage(user.id)}
            className="flex-1 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">chat</span>
            Message
          </button>
        )}
        <Link
          to={`/members/${profile.id}`}
          className="px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:border-gray-400 transition-colors"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
