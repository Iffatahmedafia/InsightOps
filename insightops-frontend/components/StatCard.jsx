const toneClasses = {
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  red: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
};

export function StatCard({ icon: Icon, label, value, tone = "blue" }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-neutral-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <strong className="mt-2 block text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">
            {value}
          </strong>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
          <Icon size={19} />
        </div>
      </div>
    </article>
  );
}
