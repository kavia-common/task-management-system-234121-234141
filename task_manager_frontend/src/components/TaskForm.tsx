"use client";

import React, { useMemo, useState } from "react";
import type { Task, TaskPriority, TaskStatus } from "@/lib/types";

function isTaskStatus(x: string): x is TaskStatus {
  return x === "todo" || x === "in_progress" || x === "done";
}

function isTaskPriority(x: string): x is TaskPriority {
  return x === "low" || x === "medium" || x === "high";
}

type FormValue = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string; // yyyy-mm-dd
  tags: string; // comma-separated
};

function isoToDateOnly(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function dateOnlyToIso(dateOnly: string) {
  if (!dateOnly) return null;
  // Interpret as local midnight; backend can interpret as date or datetime as needed.
  const d = new Date(`${dateOnly}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export default function TaskForm({
  initial,
  submitLabel,
  busy,
  error,
  onSubmit,
  onCancel,
}: {
  initial?: Task | null;
  submitLabel: string;
  busy: boolean;
  error: string | null;
  onSubmit: (value: {
    title: string;
    description?: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    due_date?: string | null;
    tags: string[];
  }) => void;
  onCancel: () => void;
}) {
  const init: FormValue = useMemo(
    () => ({
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      status: initial?.status ?? "todo",
      priority: initial?.priority ?? "medium",
      due_date: isoToDateOnly(initial?.due_date ?? null),
      tags: (initial?.tags ?? []).join(", "),
    }),
    [initial],
  );

  const [value, setValue] = useState<FormValue>(init);
  const [touched, setTouched] = useState(false);

  const titleError = touched && value.title.trim().length < 2 ? "Title must be at least 2 characters." : null;

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
        if (value.title.trim().length < 2) return;

        const tags = value.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);

        onSubmit({
          title: value.title.trim(),
          description: value.description.trim() ? value.description.trim() : null,
          status: value.status,
          priority: value.priority,
          due_date: dateOnlyToIso(value.due_date),
          tags,
        });
      }}
    >
      <div>
        <label className="block text-sm font-semibold" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          className="retro-input w-full mt-1"
          value={value.title}
          onChange={(e) => setValue((v) => ({ ...v, title: e.target.value }))}
          placeholder="e.g. Fix the flux capacitor"
        />
        {titleError ? <div className="text-sm text-red-600 mt-1">{titleError}</div> : null}
      </div>

      <div>
        <label className="block text-sm font-semibold" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          className="retro-input w-full mt-1 min-h-[100px]"
          value={value.description}
          onChange={(e) => setValue((v) => ({ ...v, description: e.target.value }))}
          placeholder="Notes, context, acceptance criteria…"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-semibold" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            className="retro-input w-full mt-1"
            value={value.status}
            onChange={(e) => {
              const next = e.target.value;
              setValue((v) => ({ ...v, status: isTaskStatus(next) ? next : v.status }));
            }}
          >
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold" htmlFor="priority">
            Priority
          </label>
          <select
            id="priority"
            className="retro-input w-full mt-1"
            value={value.priority}
            onChange={(e) => {
              const next = e.target.value;
              setValue((v) => ({ ...v, priority: isTaskPriority(next) ? next : v.priority }));
            }}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold" htmlFor="due">
            Due date
          </label>
          <input
            id="due"
            type="date"
            className="retro-input w-full mt-1"
            value={value.due_date}
            onChange={(e) => setValue((v) => ({ ...v, due_date: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold" htmlFor="tags">
          Tags (comma-separated)
        </label>
        <input
          id="tags"
          className="retro-input w-full mt-1"
          value={value.tags}
          onChange={(e) => setValue((v) => ({ ...v, tags: e.target.value }))}
          placeholder="retro, ui, urgent"
        />
      </div>

      {error ? (
        <div className="retro-card-soft p-3 border-red-600">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-2 pt-2">
        <button type="button" className="retro-btn text-sm" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button type="submit" className="retro-btn retro-btn-primary text-sm" disabled={busy}>
          {busy ? "Working…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
