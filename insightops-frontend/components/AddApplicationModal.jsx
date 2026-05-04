"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function AddApplicationModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    environment: "production",
    owner: "",
    healthUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await onSubmit({
        name: form.name.trim(),
        environment: form.environment.trim() || "production",
        owner: form.owner.trim() || undefined,
        healthUrl: form.healthUrl.trim() || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <section className="w-full max-w-lg rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-neutral-900">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-white/10">
          <div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Add Application</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Register a service for metrics, logs, incidents, and health checks.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Name</span>
            <input
              required
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 dark:border-white/10 dark:bg-neutral-950 dark:text-white"
              placeholder="property-valuation-api"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Environment</span>
            <input
              value={form.environment}
              onChange={(event) => updateField("environment", event.target.value)}
              className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 dark:border-white/10 dark:bg-neutral-950 dark:text-white"
              placeholder="production"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Owner</span>
            <input
              value={form.owner}
              onChange={(event) => updateField("owner", event.target.value)}
              className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 dark:border-white/10 dark:bg-neutral-950 dark:text-white"
              placeholder="platform-team"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Health URL</span>
            <input
              type="url"
              value={form.healthUrl}
              onChange={(event) => updateField("healthUrl", event.target.value)}
              className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 dark:border-white/10 dark:bg-neutral-950 dark:text-white"
              placeholder="https://example.com/health"
            />
          </label>

          <footer className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating" : "Create Application"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
