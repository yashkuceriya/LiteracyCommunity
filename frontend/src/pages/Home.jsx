import { Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-28">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-emerald-600 mb-4 tracking-wide uppercase">Community Platform</p>
          <h1 className="font-headline text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
            Connect With Literacy Leaders Who Get It
          </h1>
          <p className="text-lg text-gray-500 mt-6 max-w-xl leading-relaxed">
            Find and match with district leaders facing the same challenges. Share strategies, build relationships, and
            transform literacy outcomes — together.
          </p>
          <div className="flex flex-wrap gap-3 mt-10">
            {user ? (
              <>
                <Link to="/dashboard" className="px-8 py-3.5 bg-gray-900 text-white rounded-lg font-semibold text-sm hover:bg-gray-800 transition-all">
                  Go to Dashboard
                </Link>
                <Link to="/matches" className="px-8 py-3.5 border border-gray-300 text-gray-700 rounded-lg font-semibold text-sm hover:border-gray-900 transition-all">
                  Find Matches
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="px-8 py-3.5 bg-gray-900 text-white rounded-lg font-semibold text-sm hover:bg-gray-800 transition-all">
                  Join the Community
                </Link>
                <Link to="/login" className="px-8 py-3.5 border border-gray-300 text-gray-700 rounded-lg font-semibold text-sm hover:border-gray-900 transition-all">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-24 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <p className="text-sm font-semibold text-emerald-600 mb-3 tracking-wide uppercase">How It Works</p>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight mb-16">Three Steps to Your Network</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: 'person_add', title: 'Build Your Profile', desc: 'Select your district and the literacy challenges you are working on from our curated list of problem statements.' },
              { icon: 'hub', title: 'Get Matched', desc: 'Our algorithm matches you with leaders in similar districts facing the same challenges — by demographics, size, FRL, ESL, and more.' },
              { icon: 'forum', title: 'Connect & Collaborate', desc: 'Message your matches directly. Share strategies, learn what works, and build a lasting professional network.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-5">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Matching Criteria */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-24">
        <p className="text-sm font-semibold text-emerald-600 mb-3 tracking-wide uppercase">Matching Criteria</p>
        <h2 className="font-headline text-3xl font-extrabold tracking-tight mb-6">Matched on What Matters</h2>
        <p className="text-gray-500 mb-12 max-w-2xl">We combine publicly available district data with self-selected challenges to find the most relevant connections for you.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'District Type', desc: 'Urban, Suburban, Rural, or Town', icon: 'location_city' },
            { title: 'District Size', desc: 'Enrollment brackets from <1K to 25K+', icon: 'groups' },
            { title: 'Free/Reduced Lunch', desc: 'Socioeconomic similarity metrics', icon: 'restaurant' },
            { title: 'English Language Learners', desc: 'ESL population percentage', icon: 'translate' },
            { title: 'Geographic Proximity', desc: 'Same-state leaders for local context', icon: 'map' },
            { title: 'Problem Statements', desc: '20 curated literacy challenges to choose from', icon: 'checklist' },
          ].map((item) => (
            <div key={item.title} className="p-6 bg-white border border-gray-100 rounded-xl">
              <span className="material-symbols-outlined text-emerald-600 mb-3 block">{item.icon}</span>
              <h3 className="font-headline font-bold mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-headline text-3xl font-extrabold tracking-tight mb-4">Ready to find your match?</h2>
          <p className="text-gray-400 mb-8">Join 500+ literacy leaders already connecting on our platform.</p>
          <Link to="/register" className="inline-block px-8 py-3.5 bg-emerald-600 text-white rounded-lg font-semibold text-sm hover:bg-emerald-500 transition-all">
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}
