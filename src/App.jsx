import RouteSearch from './components/RouteSearch';
import { seedData } from './services/seedData'
import { useEffect } from 'react'


function ThemeToggle() {
  return (
    <button
      type="button"
      aria-label="Toggle light or dark mode"
      className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-500 transition-colors hover:border-neutral-300 hover:text-neutral-700"
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
        />
      </svg>
    </button>
  );
}

function App() {
 
   useEffect(() => {
  seedData()
}, [])
  

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900 antialiased">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(120,160,200,0.08),transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[320px] bg-[linear-gradient(to_bottom,rgba(248,250,252,0.9),transparent)]" />

      <header className="relative border-b border-neutral-200/60">
        <nav className="mx-auto flex h-12 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <a
            href="/"
            className="text-[15px] font-semibold tracking-tight text-neutral-900"
          >
            journey
            <span className="bg-gradient-to-r from-neutral-700 to-neutral-500 bg-clip-text text-transparent">
              Safe
            </span>
          </a>

          <div className="hidden items-center gap-6 text-[13px] font-medium text-neutral-500 sm:flex">
            <a href="#features" className="transition-colors hover:text-neutral-800">
              Features
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-neutral-800">
              How it works
            </a>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a
              href="#"
              className="hidden rounded-md bg-neutral-900 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-neutral-800 sm:inline-block"
            >
              Get started
            </a>
          </div>
        </nav>
      </header>

      <main className="relative mx-auto max-w-5xl px-4 pb-20 pt-14 sm:px-6 sm:pt-20">
        <section className="flex flex-col items-center text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-neutral-200/80 bg-white/80 px-3 py-1 text-[12px] font-medium text-neutral-600 shadow-sm backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" />
            Route-aware safety insights
          </p>

          <h1 className="max-w-2xl text-[2rem] font-semibold leading-[1.15] tracking-tight text-neutral-900 sm:text-[2.75rem] sm:leading-[1.1]">
            Travel Smarter on Every Journey
          </h1>

          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-neutral-500 sm:text-base">
            Find clean washrooms, safe rest stops, fuel stations and hygienic
            restaurants along your route.
          </p>

          <div className="mt-8 w-full sm:mt-10">
            <RouteSearch />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
