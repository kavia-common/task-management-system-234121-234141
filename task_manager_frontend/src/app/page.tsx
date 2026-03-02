import Link from "next/link";

export default function Home() {
  return (
    <main className="max-w-5xl mx-auto">
      <section className="retro-card p-6 bg-white retro-scanlines">
        <h1 className="text-3xl font-semibold">Retro Tasks</h1>
        <p className="text-sm text-gray-600 mt-2 max-w-2xl">
          A retro-themed task manager UI: auth screens, searchable task list + detail view,
          and create/edit modals.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link className="retro-btn retro-btn-primary text-sm" href="/auth/sign-in">
            Sign in
          </Link>
          <Link className="retro-btn text-sm" href="/auth/sign-up">
            Sign up
          </Link>
          <Link className="retro-btn text-sm" href="/tasks">
            Go to Tasks
          </Link>
        </div>

        <div className="mt-5 retro-card-soft p-4">
          <div className="text-xs text-gray-600">CONFIG</div>
          <p className="text-sm mt-1">
            Set <code>NEXT_PUBLIC_API_BASE_URL</code> to your FastAPI backend (port 3001).
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Note: backend OpenAPI currently exposes only <code>GET /</code> health check; auth/task
            routes must exist for full functionality.
          </p>
        </div>
      </section>
    </main>
  );
}
