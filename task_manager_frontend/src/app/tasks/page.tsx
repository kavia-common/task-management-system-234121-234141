"use client";

import React, { useEffect, useMemo, useState } from "react";
import Modal from "@/components/Modal";
import TaskForm from "@/components/TaskForm";
import { useAuth } from "@/components/AppProviders";
import {
  apiCreateTask,
  apiDeleteTask,
  apiGetTask,
  apiListTasks,
  apiUpdateTask,
  type TaskListQuery,
} from "@/lib/backend";
import { ApiError } from "@/lib/apiClient";
import type { Task, TaskPriority, TaskStatus } from "@/lib/types";

function isTaskStatus(x: string): x is TaskStatus {
  return x === "todo" || x === "in_progress" || x === "done";
}

function isTaskPriority(x: string): x is TaskPriority {
  return x === "low" || x === "medium" || x === "high";
}

function isSortValue(
  x: string,
): x is NonNullable<TaskListQuery["sort"]> {
  return (
    x === "updated_desc" ||
    x === "updated_asc" ||
    x === "due_asc" ||
    x === "due_desc" ||
    x === "priority_desc"
  );
}

function formatDue(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

function statusLabel(s: TaskStatus) {
  if (s === "todo") return "To do";
  if (s === "in_progress") return "In progress";
  return "Done";
}

function priorityLabel(p: TaskPriority) {
  if (p === "low") return "Low";
  if (p === "medium") return "Medium";
  return "High";
}

export default function TasksPage() {
  const { hydrated, token } = useAuth();

  const [query, setQuery] = useState<TaskListQuery>({
    q: "",
    status: "all",
    priority: "all",
    tag: "",
    sort: "updated_desc",
  });

  const [listBusy, setListBusy] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailBusy, setDetailBusy] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [mutBusy, setMutBusy] = useState(false);
  const [mutError, setMutError] = useState<string | null>(null);

  const canCallApi = hydrated && !!token;

  async function refreshList() {
    if (!token) return;
    setListBusy(true);
    setListError(null);
    try {
      const data = await apiListTasks(token, query);
      setTasks(data);
      // Keep selection if present; otherwise choose first.
      setSelectedId((prev) => prev ?? (data[0]?.id ?? null));
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to load tasks.";
      setListError(msg);
    } finally {
      setListBusy(false);
    }
  }

  async function refreshDetail(taskId: string) {
    if (!token) return;
    setDetailBusy(true);
    setDetailError(null);
    try {
      const t = await apiGetTask(token, taskId);
      setSelectedTask(t);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to load task detail.";
      setDetailError(msg);
      setSelectedTask(null);
    } finally {
      setDetailBusy(false);
    }
  }

  useEffect(() => {
    if (!canCallApi) return;
    void refreshList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canCallApi, query.q, query.status, query.priority, query.tag, query.sort]);

  useEffect(() => {
    if (!canCallApi) return;
    if (!selectedId) {
      setSelectedTask(null);
      return;
    }
    void refreshDetail(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canCallApi, selectedId]);

  const selectedFromList = useMemo(
    () => (selectedId ? tasks.find((t) => t.id === selectedId) ?? null : null),
    [tasks, selectedId],
  );

  return (
    <section className="space-y-4">
      <div className="retro-card p-4 bg-white retro-scanlines">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Tasks</h1>
            <p className="text-sm text-gray-600 mt-1">
              Search, filter, sort. Create and edit via modals.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="retro-btn retro-btn-primary text-sm"
              onClick={() => setCreateOpen(true)}
              disabled={!canCallApi}
              title={!canCallApi ? "Sign in to create tasks" : undefined}
            >
              + New task
            </button>
            <button
              className="retro-btn text-sm"
              onClick={() => void refreshList()}
              disabled={!canCallApi || listBusy}
            >
              Refresh
            </button>
          </div>
        </div>

        {!canCallApi ? (
          <div className="mt-3 retro-card-soft p-3">
            <div className="text-sm">
              You’re not signed in. Go to <a className="underline" href="/auth/sign-in">Sign in</a>{" "}
              to load and manage tasks.
            </div>
          </div>
        ) : null}
      </div>

      {/* Search / filter / sort */}
      <div className="retro-card p-4 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold" htmlFor="q">
              Search
            </label>
            <input
              id="q"
              className="retro-input w-full mt-1"
              value={query.q ?? ""}
              onChange={(e) => setQuery((q) => ({ ...q, q: e.target.value }))}
              placeholder="title, description, tags…"
              disabled={!canCallApi}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              className="retro-input w-full mt-1"
              value={query.status ?? "all"}
              onChange={(e) => {
                const v = e.target.value;
                setQuery((q) => ({
                  ...q,
                  status: v === "all" ? "all" : isTaskStatus(v) ? v : "all",
                }));
              }}
              disabled={!canCallApi}
            >
              <option value="all">All</option>
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
              value={query.priority ?? "all"}
              onChange={(e) => {
                const v = e.target.value;
                setQuery((q) => ({
                  ...q,
                  priority: v === "all" ? "all" : isTaskPriority(v) ? v : "all",
                }));
              }}
              disabled={!canCallApi}
            >
              <option value="all">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold" htmlFor="sort">
              Sort
            </label>
            <select
              id="sort"
              className="retro-input w-full mt-1"
              value={query.sort ?? "updated_desc"}
              onChange={(e) => {
                const v = e.target.value;
                setQuery((q) => ({ ...q, sort: isSortValue(v) ? v : "updated_desc" }));
              }}
              disabled={!canCallApi}
            >
              <option value="updated_desc">Updated ↓</option>
              <option value="updated_asc">Updated ↑</option>
              <option value="due_asc">Due date ↑</option>
              <option value="due_desc">Due date ↓</option>
              <option value="priority_desc">Priority (high→low)</option>
            </select>
          </div>
        </div>

        <div className="mt-3">
          <label className="block text-sm font-semibold" htmlFor="tag">
            Tag filter (exact)
          </label>
          <input
            id="tag"
            className="retro-input w-full mt-1"
            value={query.tag ?? ""}
            onChange={(e) => setQuery((q) => ({ ...q, tag: e.target.value }))}
            placeholder="e.g. urgent"
            disabled={!canCallApi}
          />
        </div>
      </div>

      {/* List + detail */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-4">
        {/* List */}
        <div className="retro-card p-4 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">List</h2>
            <span className="retro-badge">{tasks.length} items</span>
          </div>

          {listError ? (
            <div className="mt-3 retro-card-soft p-3 border-red-600">
              <div className="text-sm text-red-700">{listError}</div>
            </div>
          ) : null}

          {listBusy ? <div className="mt-3 text-sm text-gray-600">Loading…</div> : null}

          <ul className="mt-3 space-y-2">
            {tasks.map((t) => {
              const active = t.id === selectedId;
              return (
                <li key={t.id}>
                  <button
                    className={[
                      "w-full text-left p-3 rounded-md border-2",
                      active ? "bg-white" : "bg-gray-50 hover:bg-white",
                      "border-black shadow-[2px_2px_0px_rgba(17,24,39,0.7)]",
                    ].join(" ")}
                    onClick={() => setSelectedId(t.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold">{t.title}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {statusLabel(t.status)} · {priorityLabel(t.priority)} · Due:{" "}
                          {formatDue(t.due_date)}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {(t.tags ?? []).slice(0, 3).map((tag) => (
                          <span key={tag} className="retro-badge">
                            {tag}
                          </span>
                        ))}
                        {(t.tags ?? []).length > 3 ? (
                          <span className="retro-badge">+{(t.tags ?? []).length - 3}</span>
                        ) : null}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
            {!listBusy && tasks.length === 0 ? (
              <li className="text-sm text-gray-600 mt-2">No tasks match this query.</li>
            ) : null}
          </ul>
        </div>

        {/* Detail */}
        <div className="retro-card p-4 bg-white">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Detail</h2>
            <div className="flex items-center gap-2">
              <button
                className="retro-btn text-sm"
                onClick={() => setEditOpen(true)}
                disabled={!canCallApi || !selectedId}
              >
                Edit
              </button>
              <button
                className="retro-btn text-sm"
                onClick={async () => {
                  if (!token || !selectedId) return;
                  setMutBusy(true);
                  setMutError(null);
                  try {
                    await apiDeleteTask(token, selectedId);
                    setSelectedId(null);
                    setSelectedTask(null);
                    await refreshList();
                  } catch (err) {
                    const msg = err instanceof ApiError ? err.message : "Failed to delete task.";
                    setMutError(msg);
                  } finally {
                    setMutBusy(false);
                  }
                }}
                disabled={!canCallApi || !selectedId || mutBusy}
              >
                {mutBusy ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>

          {detailError ? (
            <div className="mt-3 retro-card-soft p-3 border-red-600">
              <div className="text-sm text-red-700">{detailError}</div>
            </div>
          ) : null}

          {mutError ? (
            <div className="mt-3 retro-card-soft p-3 border-red-600">
              <div className="text-sm text-red-700">{mutError}</div>
            </div>
          ) : null}

          {!selectedId ? (
            <div className="mt-3 text-sm text-gray-600">Select a task from the list.</div>
          ) : detailBusy ? (
            <div className="mt-3 text-sm text-gray-600">Loading detail…</div>
          ) : (
            <div className="mt-3 space-y-3">
              <div className="retro-card-soft p-3">
                <div className="text-xs text-gray-600">TITLE</div>
                <div className="text-lg font-semibold">{selectedTask?.title ?? selectedFromList?.title}</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="retro-card-soft p-3">
                  <div className="text-xs text-gray-600">STATUS</div>
                  <div className="font-semibold">{selectedTask ? statusLabel(selectedTask.status) : "—"}</div>
                </div>
                <div className="retro-card-soft p-3">
                  <div className="text-xs text-gray-600">PRIORITY</div>
                  <div className="font-semibold">{selectedTask ? priorityLabel(selectedTask.priority) : "—"}</div>
                </div>
                <div className="retro-card-soft p-3">
                  <div className="text-xs text-gray-600">DUE</div>
                  <div className="font-semibold">{formatDue(selectedTask?.due_date ?? null)}</div>
                </div>
              </div>

              <div className="retro-card-soft p-3">
                <div className="text-xs text-gray-600">DESCRIPTION</div>
                <div className="text-sm mt-1 whitespace-pre-wrap">
                  {selectedTask?.description?.trim() ? selectedTask.description : "—"}
                </div>
              </div>

              <div className="retro-card-soft p-3">
                <div className="text-xs text-gray-600">TAGS</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {(selectedTask?.tags ?? []).length ? (
                    (selectedTask?.tags ?? []).map((tag) => (
                      <span key={tag} className="retro-badge">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-600">—</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create modal */}
      <Modal
        open={createOpen}
        title="Create task"
        description="Add a new task with status, priority, due date, and tags."
        onClose={() => {
          if (mutBusy) return;
          setMutError(null);
          setCreateOpen(false);
        }}
      >
        <TaskForm
          submitLabel="Create"
          busy={mutBusy}
          error={mutError}
          onCancel={() => {
            setMutError(null);
            setCreateOpen(false);
          }}
          onSubmit={async (value) => {
            if (!token) return;
            setMutBusy(true);
            setMutError(null);
            try {
              const created = await apiCreateTask(token, value);
              setCreateOpen(false);
              await refreshList();
              setSelectedId(created.id);
            } catch (err) {
              const msg = err instanceof ApiError ? err.message : "Failed to create task.";
              setMutError(msg);
            } finally {
              setMutBusy(false);
            }
          }}
        />
      </Modal>

      {/* Edit modal */}
      <Modal
        open={editOpen}
        title="Edit task"
        description="Update task fields and save."
        onClose={() => {
          if (mutBusy) return;
          setMutError(null);
          setEditOpen(false);
        }}
      >
        <TaskForm
          initial={selectedTask}
          submitLabel="Save changes"
          busy={mutBusy}
          error={mutError}
          onCancel={() => {
            setMutError(null);
            setEditOpen(false);
          }}
          onSubmit={async (value) => {
            if (!token || !selectedId) return;
            setMutBusy(true);
            setMutError(null);
            try {
              await apiUpdateTask(token, selectedId, value);
              setEditOpen(false);
              await refreshDetail(selectedId);
              await refreshList();
            } catch (err) {
              const msg = err instanceof ApiError ? err.message : "Failed to update task.";
              setMutError(msg);
            } finally {
              setMutBusy(false);
            }
          }}
        />
      </Modal>
    </section>
  );
}
