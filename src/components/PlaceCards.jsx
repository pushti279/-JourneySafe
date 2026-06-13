const PLACE_CARDS = [
  {
    title: 'Clean Washrooms',
    description: 'Rated facilities with hygiene scores along your route.',
    accent: 'from-sky-50 to-white',
    dot: 'bg-sky-400',
  },
  {
    title: 'Fuel Stations',
    description: 'Trusted pumps with amenities and safety notes.',
    accent: 'from-amber-50/80 to-white',
    dot: 'bg-amber-400',
  },
  {
    title: 'Safe Rest Stops',
    description: 'Well-lit stops with parking and traveler reviews.',
    accent: 'from-emerald-50/80 to-white',
    dot: 'bg-emerald-400',
  },
  {
    title: 'Restaurants',
    description: 'Hygienic dining options vetted for road travelers.',
    accent: 'from-violet-50/80 to-white',
    dot: 'bg-violet-400',
  },
];

export default function PlaceCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {PLACE_CARDS.map((card) => (
        <article
          key={card.title}
          className={`rounded-xl border border-neutral-200/80 bg-gradient-to-br ${card.accent} p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-md`}
        >
          <div className="flex items-start gap-3">
            <span
              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${card.dot}`}
              aria-hidden
            />
            <div>
              <h3 className="text-[15px] font-semibold text-neutral-900">
                {card.title}
              </h3>
              <p className="mt-1 text-[13px] leading-relaxed text-neutral-500">
                {card.description}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
