import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
  useSearchParams
} from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bell,
  Building2,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Download,
  HandHeart,
  Info,
  Leaf,
  Loader2,
  LogIn,
  MapPin,
  Menu,
  PackageOpen,
  Phone,
  RefreshCw,
  Route as RouteIcon,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
  UtensilsCrossed,
  Users,
  X,
  XCircle,
  Zap
} from "lucide-react";
import { api, apiConfigured } from "./lib/api";

const steps = [
  "draft",
  "confirmed",
  "matching",
  "claimed",
  "in_transit",
  "delivered"
];

const labels = {
  draft: "Draft",
  confirmed: "Confirmed",
  matching: "Matching",
  claimed: "Claimed",
  in_transit: "In transit",
  delivered: "Delivered"
};

const urgency = {
  high: "bg-red-50 text-red-700 ring-1 ring-red-200",
  medium: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  low: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
};

function unwrap(value) {
  return value?.data?.data ?? value?.data ?? value;
}

function list(value) {
  return Array.isArray(value) ? value : value?.items || value?.data || [];
}

function date(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function number(value) {
  return typeof value === "number"
    ? new Intl.NumberFormat("en-IN").format(value)
    : "—";
}

function useApi(loader, key) {
  const [state, setState] = useState({
    loading: true,
    data: null,
    error: null,
    offline: false
  });

  async function reload() {
    setState((old) => ({ ...old, loading: true, error: null }));

    try {
      const result = await loader();
      setState({
        loading: false,
        data: unwrap(result),
        error: null,
        offline: Boolean(result?.offline)
      });
    } catch (error) {
      setState({
        loading: false,
        data: null,
        error,
        offline: false
      });
    }
  }

  useEffect(() => {
    reload();
  }, [key]);

  return { ...state, reload };
}

function Brand({ dark = false }) {
  return (
    <Link
      to="/login"
      className={`inline-flex items-center gap-2 font-semibold ${
        dark ? "text-white" : "text-forest"
      }`}
    >
      <span
        className={`grid h-9 w-9 place-items-center rounded-xl ${
          dark ? "bg-lime text-forest" : "bg-forest text-lime"
        }`}
      >
        <Leaf className="h-5 w-5" />
      </span>
      <span className="text-xl">sahaj</span>
    </Link>
  );
}

function Loader({ text = "Loading…" }) {
  return (
    <div className="grid min-h-[42vh] place-items-center">
      <div className="text-center">
        <Loader2 className="mx-auto mb-3 h-7 w-7 animate-spin text-moss" />
        <p className="text-sm font-medium text-slate-500">{text}</p>
      </div>
    </div>
  );
}

function ErrorBox({ error, reload }) {
  return (
    <div className="card-muted grid min-h-56 place-items-center text-center">
      <div>
        <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-600" />
        <h3 className="text-lg font-semibold">We could not load this page</h3>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          {error?.message || "Check your connection and try again."}
        </p>
        <button onClick={reload} className="btn-secondary mt-5">
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    </div>
  );
}

function Empty({
  icon: Icon = PackageOpen,
  title = "Nothing here yet",
  description,
  offline,
  action
}) {
  return (
    <div className="card-muted grid min-h-56 place-items-center text-center">
      <div>
        <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-lime/50 text-forest">
          <Icon className="h-6 w-6" />
        </span>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          {description}
        </p>
        {offline && (
          <p className="mt-3 text-xs font-semibold text-slate-400">
            Connect the backend API to load live information.
          </p>
        )}
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}

function Tip({ children }) {
  return (
    <span className="group relative inline-flex cursor-help text-slate-400">
      <Info className="h-4 w-4" />
      <span className="pointer-events-none absolute bottom-6 left-1/2 z-20 hidden w-56 -translate-x-1/2 rounded-lg bg-ink px-3 py-2 text-center text-xs leading-relaxed text-white shadow-lg group-hover:block">
        {children}
      </span>
    </span>
  );
}

function Metric({ label, value, icon: Icon, note }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="eyebrow flex items-center gap-1.5">
            {label}
            <Tip>{note}</Tip>
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-lime/50 text-forest">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

const nav = [
  ["/kitchen/dashboard", "Kitchen", Store],
  ["/kitchen/report-surplus", "Report surplus", ClipboardList],
  ["/recipient/offers", "Offers", HandHeart],
  ["/impact", "Impact", Sparkles],
  ["/compliance", "Compliance", ShieldCheck]
];

function Shell({ title, subtitle, actions, children }) {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-paper">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-forest p-5 text-white lg:flex">
        <Brand dark />
        <p className="mt-10 px-3 text-[11px] font-bold uppercase tracking-[.14em] text-white/40">
          Workspace
        </p>

        <nav className="mt-3 space-y-1">
          {nav.map(([to, text, Icon]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-white/65 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {text}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl bg-white/10 p-4">
          <p className="text-sm font-semibold">Trusted food handovers</p>
          <p className="mt-1 text-xs leading-5 text-white/60">
            Every completed delivery is captured for your compliance register.
          </p>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b bg-paper/90 px-4 py-4 backdrop-blur lg:ml-64 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenu(true)}
              className="grid h-10 w-10 place-items-center rounded-xl border bg-white lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <p className="hidden text-xs font-semibold text-slate-500 sm:block">
                {subtitle}
              </p>
              <h1 className="text-lg font-semibold sm:text-xl">{title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {actions}
            <button className="relative grid h-10 w-10 place-items-center rounded-xl border bg-white text-slate-500">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-lime" />
            </button>
            <span className="hidden h-10 w-10 place-items-center rounded-full bg-forest text-sm font-bold text-lime sm:grid">
              SK
            </span>
          </div>
        </div>
      </header>

      {mobileMenu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            onClick={() => setMobileMenu(false)}
            className="absolute inset-0 bg-ink/40"
          />
          <div className="relative flex h-full w-72 flex-col bg-forest p-5 text-white">
            <div className="flex items-center justify-between">
              <Brand dark />
              <button onClick={() => setMobileMenu(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-10 space-y-1">
              {nav.map(([to, text, Icon]) => (
                <NavLink
                  key={to}
                  onClick={() => setMobileMenu(false)}
                  to={to}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-white/75"
                >
                  <Icon className="h-4 w-4" />
                  {text}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}

      <main className="px-4 py-7 lg:ml-64 lg:px-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");

    try {
      const response = await api.login(form);

      if (response.offline) {
        navigate("/auth/role-selection");
        return;
      }

      const data = unwrap(response);
      if (data?.accessToken) {
        localStorage.setItem("sahaj_access_token", data.accessToken);
      }

      navigate("/auth/role-selection");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="min-h-screen bg-paper p-4 sm:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-soft sm:grid-cols-2">
        <section className="hidden bg-forest p-10 text-white sm:block">
          <Brand dark />
          <div className="mt-32 max-w-md">
            <p className="eyebrow text-lime">Good food belongs with people</p>
            <h1 className="mt-4 text-5xl font-semibold leading-tight tracking-[-.05em]">
              Make every meal count.
            </h1>
            <p className="mt-5 text-base leading-7 text-white/70">
              One calm workspace for surplus food, trusted handovers, and
              measurable impact.
            </p>
          </div>
        </section>

        <section className="flex items-center p-7 sm:p-12">
          <form onSubmit={submit} className="w-full max-w-sm">
            <Brand />
            <p className="eyebrow mt-12">Welcome back</p>
            <h2 className="mt-2 text-3xl font-semibold">Sign in to sahaj</h2>
            <p className="mt-2 text-sm text-slate-500">
              Use your organisation account to continue.
            </p>

            <label className="mt-7 block text-sm font-semibold">
              Work email
              <input
                required
                type="email"
                className="input"
                placeholder="you@organisation.org"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
            </label>

            <label className="mt-5 block text-sm font-semibold">
              Password
              <input
                required
                type="password"
                className="input"
                placeholder="Enter password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            </label>

            {error && (
              <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <button className="btn-primary mt-6 w-full">
              <LogIn className="h-4 w-4" />
              Continue
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

function RoleSelection() {
  const navigate = useNavigate();

  const roles = [
    ["Kitchen team", "Report food surplus and manage matches.", UtensilsCrossed, "/kitchen/dashboard"],
    ["Recipient organisation", "Accept suitable food offers.", Building2, "/recipient/offers"],
    ["Volunteer", "Pick up food and verify delivery.", HandHeart, "/volunteer/pickup/assigned"]
  ];

  return (
    <main className="min-h-screen bg-paper p-4 sm:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-soft sm:grid-cols-2">
        <section className="hidden bg-forest p-10 text-white sm:block">
          <Brand dark />
          <div className="mt-32">
            <p className="eyebrow text-lime">One network, three roles</p>
            <h1 className="mt-4 text-5xl font-semibold leading-tight tracking-[-.05em]">
              Choose where you make a difference.
            </h1>
          </div>
        </section>

        <section className="flex items-center p-7 sm:p-12">
          <div className="w-full">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>

            <h2 className="mt-6 text-3xl font-semibold">Your workspace</h2>
            <p className="mt-2 text-sm text-slate-500">
              Select your role to open the right tools.
            </p>

            <div className="mt-8 space-y-3">
              {roles.map(([title, text, Icon, to]) => (
                <button
                  key={title}
                  onClick={() => navigate(to)}
                  className="flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition hover:border-moss hover:bg-emerald-50"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-lime/50 text-forest">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="flex-1">
                    <strong className="block">{title}</strong>
                    <span className="mt-1 block text-sm text-slate-500">
                      {text}
                    </span>
                  </span>
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Dashboard() {
  const data = useApi(api.kitchenDashboard, "dashboard");
  const navigate = useNavigate();
  const dashboard = data.data || {};
  const listings = list(dashboard.listings);

  return (
    <Shell
      title="Kitchen dashboard"
      subtitle="Kitchen team"
      actions={
        <button
          onClick={() => navigate("/kitchen/report-surplus?urgent=1")}
          className="btn-primary px-3 py-2.5 text-xs sm:px-4 sm:text-sm"
        >
          <Zap className="h-4 w-4 fill-lime text-lime" />
          Urgent surplus
        </button>
      }
    >
      {data.loading ? (
        <Loader />
      ) : data.error ? (
        <ErrorBox {...data} />
      ) : (
        <>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Today, in one view</p>
              <h2 className="page-title mt-1">Keep good food moving.</h2>
            </div>
            <p className="text-sm text-slate-500">
              {apiConfigured
                ? "Live kitchen information"
                : "Your backend will populate this dashboard"}
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="card">
              <p className="eyebrow">Tomorrow’s forecast</p>
              <p className="mt-2 text-lg font-semibold">
                {dashboard.forecast?.headline || "Awaiting kitchen history"}
              </p>

              {dashboard.forecast?.points?.length ? (
                <div className="mt-4 h-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dashboard.forecast.points}>
                      <Area
                        dataKey="value"
                        stroke="#1D5A41"
                        strokeWidth={2}
                        fill="#D7F267"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="mt-6 h-2 rounded-full bg-slate-100" />
              )}
            </div>

            <div className="card">
              <p className="eyebrow">Surplus risk</p>
              <p className="mt-2 text-lg font-semibold">
                {dashboard.risk?.label || "Not calculated yet"}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {dashboard.risk?.detail ||
                  "Connect production and demand history."}
              </p>
            </div>

            <div className="card bg-lime/35">
              <p className="eyebrow text-forest/70">Today’s AI brief</p>
              <p className="mt-2 text-lg font-semibold leading-snug">
                {dashboard.brief ||
                  "Your explainable AI brief will appear here once data is connected."}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_.6fr]">
            <section className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="eyebrow">Active listings</p>
                  <h3 className="mt-1 text-xl font-semibold">
                    Surplus in motion
                  </h3>
                </div>

                <Link
                  to="/kitchen/report-surplus"
                  className="btn-secondary px-3 py-2 text-xs"
                >
                  Report food
                </Link>
              </div>

              {listings.length ? (
                <div className="mt-5 divide-y">
                  {listings.map((item) => (
                    <Link
                      key={item.id}
                      to={`/kitchen/listings/${item.id}`}
                      className="flex flex-wrap items-center gap-3 py-4"
                    >
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-moss">
                        <UtensilsCrossed className="h-4 w-4" />
                      </span>

                      <span className="flex-1">
                        <strong className="block">
                          {item.foodItem || item.title}
                        </strong>
                        <span className="text-xs text-slate-500">
                          {item.quantity} {item.unit} · pickup by{" "}
                          {date(item.pickupBy)}
                        </span>
                      </span>

                      <span
                        className={`pill ${
                          urgency[item.urgency?.toLowerCase()] || urgency.low
                        }`}
                      >
                        {item.urgency || "Low"} urgency
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="mt-5">
                  <Empty
                    icon={UtensilsCrossed}
                    title="No listings yet"
                    description="When surplus is reported, you will see every match and handover here."
                    offline={data.offline}
                    action={
                      <Link to="/kitchen/report-surplus" className="btn-primary">
                        Report your first surplus
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    }
                  />
                </div>
              )}
            </section>

            <section className="card bg-forest text-white">
              <p className="eyebrow text-lime">Planning ahead</p>
              <h3 className="mt-2 text-2xl font-semibold">
                Less waste begins before the meal is cooked.
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/70">
                Sahaj will explain predictions in clear language, such as:
                “Tuesday demand is usually 12% lower.”
              </p>
            </section>
          </div>
        </>
      )}
    </Shell>
  );
}

function ReportSurplus() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const urgentMode = params.get("urgent") === "1";

  const [form, setForm] = useState({
    foodItem: "",
    quantity: "",
    unit: "kg",
    cookedAt: "",
    pickupBy: "",
    notes: "",
    urgency: urgentMode ? "high" : "medium"
  });

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function update(key, value) {
    setForm({ ...form, [key]: value });
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const result = await api.createListing({
        ...form,
        quantity: Number(form.quantity),
        source: "dashboard"
      });

      if (result.offline) {
        setMessage(
          "Backend is not connected yet. This form will post to /kitchen/listings when it is ready."
        );
        return;
      }

      navigate(`/kitchen/listings/${unwrap(result).id}`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Shell title="Report surplus" subtitle="Kitchen team">
      <div className="max-w-3xl">
        <Link
          to="/kitchen/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>

        <div className="mt-6">
          <p className="eyebrow">A quick, consistent handover</p>
          <h2 className="page-title mt-1">What food is available?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            These fields match what your WhatsApp and call integrations will
            send, so every surplus listing looks the same.
          </p>
        </div>

        {urgentMode && (
          <div className="mt-5 flex gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-800">
            <Zap className="h-5 w-5 fill-red-500 text-red-500" />
            <span>
              <strong>Urgent matching enabled.</strong> Recipient
              organisations will be alerted after you submit this listing.
            </span>
          </div>
        )}

        <form onSubmit={submit} className="card mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Food item *
              <input
                required
                className="input"
                value={form.foodItem}
                onChange={(e) => update("foodItem", e.target.value)}
                placeholder="Example: vegetable pulao"
              />
            </label>

            <label className="text-sm font-semibold">
              Quantity *
              <div className="mt-2 flex gap-2">
                <input
                  required
                  min="0"
                  step="0.01"
                  type="number"
                  className="input mt-0"
                  value={form.quantity}
                  onChange={(e) => update("quantity", e.target.value)}
                  placeholder="0"
                />
                <select
                  className="input mt-0 w-28"
                  value={form.unit}
                  onChange={(e) => update("unit", e.target.value)}
                >
                  <option>kg</option>
                  <option>servings</option>
                  <option>trays</option>
                  <option>litres</option>
                </select>
              </div>
            </label>

            <label className="text-sm font-semibold">
              Cooked at *
              <input
                required
                type="datetime-local"
                className="input"
                value={form.cookedAt}
                onChange={(e) => update("cookedAt", e.target.value)}
              />
            </label>

            <label className="text-sm font-semibold">
              Pickup by *
              <input
                required
                type="datetime-local"
                className="input"
                value={form.pickupBy}
                onChange={(e) => update("pickupBy", e.target.value)}
              />
            </label>
          </div>

          <div>
            <p className="text-sm font-semibold">Urgency</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {["low", "medium", "high"].map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => update("urgency", item)}
                  className={`rounded-xl px-3 py-3 text-sm font-semibold capitalize ${
                    form.urgency === item
                      ? urgency[item]
                      : "border bg-white text-slate-500"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <label className="block text-sm font-semibold">
            Notes for recipient
            <textarea
              className="input min-h-24 resize-y"
              placeholder="Allergens, packing details, gate instructions…"
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
            />
          </label>

          {message && (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {message}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary"
            >
              Cancel
            </button>

            <button disabled={saving} className="btn-primary">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {urgentMode ? "Start urgent matching" : "Confirm surplus"}
            </button>
          </div>
        </form>
      </div>
    </Shell>
  );
}

function Timeline({ current = "draft", events = [] }) {
  const currentIndex = Math.max(0, steps.indexOf(current));

  return (
    <ol className="grid gap-4 sm:grid-cols-6 sm:gap-0">
      {steps.map((step, index) => {
        const active = index === currentIndex;
        const complete = index < currentIndex;
        const event = events.find((item) => item.status === step);

        return (
          <li key={step} className="relative flex gap-3 sm:block">
            <span
              className={`relative z-10 grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${
                active
                  ? "bg-forest text-lime ring-4 ring-lime/50"
                  : complete
                  ? "bg-moss text-white"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {complete ? <Check className="h-4 w-4" /> : index + 1}
            </span>

            <div className="sm:mt-3">
              <p
                className={`text-xs font-bold ${
                  active
                    ? "text-forest"
                    : complete
                    ? "text-moss"
                    : "text-slate-400"
                }`}
              >
                {labels[step]}
              </p>
              {event?.at && (
                <p className="mt-1 text-[11px] text-slate-400">
                  {date(event.at)}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function FoodMap({ pickup, recipients = [] }) {
  if (pickup?.latitude == null || pickup?.longitude == null) {
    return (
      <Empty
        icon={MapPin}
        title="Map appears with a pickup location"
        description="Your backend should provide latitude and longitude for the kitchen and recipient organisation."
      />
    );
  }

  const location = [pickup.latitude, pickup.longitude];
  const validRecipients = recipients.filter(
    (item) => item.latitude != null && item.longitude != null
  );

  return (
    <MapContainer center={location} zoom={13} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={location}>
        <Popup>{pickup.name || pickup.address || "Kitchen pickup"}</Popup>
      </Marker>

      {validRecipients.map((item) => (
        <Marker key={item.id} position={[item.latitude, item.longitude]}>
          <Popup>{item.name || "Recipient organisation"}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

function ListingDetail() {
  const { id } = useParams();
  const data = useApi(() => api.getListing(id), `listing-${id}`);
  const [message, setMessage] = useState("");
  const [matching, setMatching] = useState(false);
  const listing = data.data;

  async function startUrgentMatch() {
    setMatching(true);

    try {
      const result = await api.urgentMatch(id);
      setMessage(
        result.offline
          ? "Backend is not connected. This will trigger urgent matching when /kitchen/listings/:id/urgent-match is available."
          : "Urgent matching started. Nearby recipient organisations are being alerted."
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setMatching(false);
    }
  }

  return (
    <Shell title="Listing status" subtitle="Kitchen team">
      {data.loading ? (
        <Loader />
      ) : data.error ? (
        <ErrorBox {...data} />
      ) : !listing ? (
        <Empty
          icon={ClipboardList}
          title="This listing is waiting to be created"
          description="When your backend returns this listing, its timeline, matching activity, and map will appear here."
          offline={data.offline}
          action={
            <Link to="/kitchen/report-surplus" className="btn-primary">
              Report surplus
            </Link>
          }
        />
      ) : (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
            <div>
              <Link
                to="/kitchen/dashboard"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500"
              >
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Link>

              <h2 className="page-title mt-5">
                {listing.foodItem || listing.title}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {listing.quantity} {listing.unit} · pickup by{" "}
                {date(listing.pickupBy)}
              </p>
            </div>

            <button
              onClick={startUrgentMatch}
              disabled={matching}
              className="btn-primary"
            >
              <Zap className="h-4 w-4 fill-lime text-lime" />
              {matching ? "Matching…" : "Urgent surplus"}
            </button>
          </div>

          {message && (
            <p className="mt-4 rounded-xl bg-lime/40 p-3 text-sm font-medium text-forest">
              {message}
            </p>
          )}

          <section className="card mt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow">Handover progress</p>
                <h3 className="mt-1 text-xl font-semibold">
                  {labels[listing.status] || "Preparing listing"}
                </h3>
              </div>

              <span className="pill bg-forest text-lime">Current state</span>
            </div>

            <div className="mt-8">
              <Timeline
                current={listing.status}
                events={listing.timeline || []}
              />
            </div>
          </section>

          <div className="mt-6 grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
            <section className="card">
              <p className="eyebrow">Pickup details</p>

              <div className="mt-5 space-y-5 text-sm">
                <Detail
                  icon={CalendarClock}
                  label="Cooked at"
                  value={date(listing.cookedAt)}
                />
                <Detail
                  icon={CalendarClock}
                  label="Pickup deadline"
                  value={date(listing.pickupBy)}
                />
                <Detail
                  icon={MapPin}
                  label="Pickup address"
                  value={listing.pickup?.address || "—"}
                />
                <Detail
                  icon={Users}
                  label="Recipient"
                  value={listing.recipient?.name || "Matching in progress"}
                />
              </div>
            </section>

            <section className="card min-h-80 overflow-hidden p-2">
              <FoodMap
                pickup={listing.pickup}
                recipients={
                  listing.candidateRecipients ||
                  (listing.recipient ? [listing.recipient] : [])
                }
              />
            </section>
          </div>
        </>
      )}
    </Shell>
  );
}

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 h-4 w-4 text-moss" />
      <span>
        <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <span className="mt-1 block font-medium">{value}</span>
      </span>
    </div>
  );
}

function Offers() {
  const data = useApi(api.recipientOffers, "offers");
  const offers = list(data.data);
  const [message, setMessage] = useState("");

  async function respond(id, decision) {
    try {
      const result = await api.respondToOffer(id, decision);
      setMessage(
        result.offline
          ? "Backend is not connected yet. This action will work when /recipient/offers is live."
          : `Offer ${decision}d.`
      );
      data.reload();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <Shell title="Incoming offers" subtitle="Recipient organisation">
      <div className="max-w-5xl">
        <p className="eyebrow">Ready when you are</p>
        <h2 className="page-title mt-1">Food offers nearby</h2>
        <p className="mt-2 text-sm text-slate-500">
          Accepting an offer reserves it for your organisation.
        </p>

        {message && (
          <p className="mt-5 rounded-xl bg-lime/40 p-3 text-sm text-forest">
            {message}
          </p>
        )}

        {data.loading ? (
          <Loader text="Checking new offers…" />
        ) : data.error ? (
          <ErrorBox {...data} />
        ) : !offers.length ? (
          <div className="mt-6">
            <Empty
              icon={HandHeart}
              title="No offers right now"
              description="New nearby offers will appear here instantly. You are all set to respond from your phone."
              offline={data.offline}
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {offers.map((offer) => (
              <article key={offer.id} className="card">
                <div className="flex justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-lime/50 text-forest">
                    <UtensilsCrossed className="h-5 w-5" />
                  </span>

                  <span
                    className={`pill ${
                      urgency[offer.urgency?.toLowerCase()] || urgency.medium
                    }`}
                  >
                    {offer.urgency || "Medium"} urgency
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-semibold">
                  {offer.foodItem || offer.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {offer.quantity} {offer.unit} · pickup by{" "}
                  {date(offer.pickupBy)}
                </p>

                <div className="mt-5 rounded-xl bg-slate-50 p-3 text-sm">
                  <strong>{offer.kitchen?.name || "Kitchen"}</strong>
                  <p className="mt-1 flex items-center gap-1 text-slate-500">
                    <MapPin className="h-3.5 w-3.5" />
                    {offer.kitchen?.address ||
                      "Location available after acceptance"}
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => respond(offer.id, "decline")}
                    className="btn-secondary"
                  >
                    <XCircle className="h-4 w-4" />
                    Decline
                  </button>

                  <button
                    onClick={() => respond(offer.id, "accept")}
                    className="btn-primary"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Accept
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}

function VolunteerPickup() {
  const { id } = useParams();
  const data = useApi(() => api.getPickup(id), `pickup-${id}`);
  const pickup = data.data;
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  async function verify(event) {
    event.preventDefault();

    if (otp.length !== 4) {
      setMessage("Enter the four-digit code provided by the recipient.");
      return;
    }

    try {
      const result = await api.verifyDelivery(id, otp);
      setMessage(
        result.offline
          ? "Backend is not connected yet. This will verify delivery when the API is ready."
          : "Delivery verified successfully. Thank you for completing this handover."
      );
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <Shell title="Your pickup" subtitle="Volunteer">
      {data.loading ? (
        <Loader text="Loading your pickup…" />
      ) : data.error ? (
        <ErrorBox {...data} />
      ) : !pickup ? (
        <div className="max-w-xl">
          <Empty
            icon={Truck}
            title="No pickup assigned yet"
            description="When a coordinator assigns a delivery, pickup and recipient details will appear here."
            offline={data.offline}
          />
        </div>
      ) : (
        <div className="max-w-4xl">
          <div className="grid gap-6 lg:grid-cols-[1fr_.85fr]">
            <section className="card">
              <span className="pill bg-lime/50 text-forest">
                <Truck className="h-3.5 w-3.5" />
                Assigned to you
              </span>

              <h2 className="mt-4 text-3xl font-semibold">
                {pickup.foodItem || pickup.title}
              </h2>
              <p className="mt-1 text-slate-500">
                {pickup.quantity} {pickup.unit} · collect by{" "}
                {date(pickup.pickupBy)}
              </p>

              <div className="mt-7 space-y-5">
                <Detail
                  icon={MapPin}
                  label="Collect from"
                  value={pickup.pickup?.address || "—"}
                />
                <Detail
                  icon={MapPin}
                  label="Deliver to"
                  value={pickup.recipient?.address || "—"}
                />
                <Detail
                  icon={Phone}
                  label="Kitchen contact"
                  value={pickup.pickup?.phone || "—"}
                />
              </div>

              <a
                target="_blank"
                rel="noreferrer"
                className="btn-secondary mt-7 w-full"
                href={
                  pickup.pickup?.latitude != null
                    ? `https://www.openstreetmap.org/?mlat=${pickup.pickup.latitude}&mlon=${pickup.pickup.longitude}`
                    : "#"
                }
              >
                <RouteIcon className="h-4 w-4" />
                Open route
              </a>
            </section>

            <section className="card bg-forest text-white">
              <p className="eyebrow text-lime">At handover</p>
              <h3 className="mt-2 text-2xl font-semibold">
                Verify delivery with OTP
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/70">
                Ask the recipient to read their four-digit delivery code. Type
                it only after the food has been handed over.
              </p>

              <form onSubmit={verify} className="mt-7">
                <label className="text-sm font-semibold">
                  4-digit delivery code
                  <input
                    inputMode="numeric"
                    maxLength="4"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    className="mt-3 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-4 text-center text-2xl font-bold tracking-[.7em] text-lime outline-none"
                    placeholder="0000"
                  />
                </label>

                {message && (
                  <p className="mt-3 rounded-xl bg-white/10 p-3 text-sm">
                    {message}
                  </p>
                )}

                <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-lime px-4 py-3 font-semibold text-forest">
                  <ShieldCheck className="h-4 w-4" />
                  Confirm delivery
                </button>
              </form>
            </section>
          </div>

          <section className="card mt-6 h-80 overflow-hidden p-2">
            <FoodMap
              pickup={pickup.pickup}
              recipients={pickup.recipient ? [pickup.recipient] : []}
            />
          </section>
        </div>
      )}
    </Shell>
  );
}

function Impact() {
  const data = useApi(api.impact, "impact");
  const impact = data.data || {};
  const trend = impact.trend || [];

  return (
    <Shell title="Impact" subtitle="Shared impact">
      <p className="eyebrow">Transparent by design</p>
      <h2 className="page-title mt-1">Every good meal leaves a trace.</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        Every number has a clear explanation of how it was calculated.
      </p>

      {data.loading ? (
        <Loader text="Calculating impact…" />
      ) : data.error ? (
        <ErrorBox {...data} />
      ) : (
        <>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Metric
              label="Meals redistributed"
              value={number(impact.mealsRedistributed)}
              icon={UtensilsCrossed}
              note={
                impact.computations?.mealsRedistributed ||
                "Computed from quantities in verified completed deliveries using the organisation’s configured serving size."
              }
            />

            <Metric
              label="Waste prevented"
              value={
                impact.wastePreventedKg != null
                  ? `${number(impact.wastePreventedKg)} kg`
                  : "—"
              }
              icon={Leaf}
              note={
                impact.computations?.wastePreventedKg ||
                "Total weight of food successfully delivered instead of disposed of."
              }
            />

            <Metric
              label="Rupees saved"
              value={
                impact.rupeesSaved != null
                  ? `₹${number(impact.rupeesSaved)}`
                  : "—"
              }
              icon={Sparkles}
              note={
                impact.computations?.rupeesSaved ||
                "Estimated replacement meal cost multiplied by successfully delivered meals."
              }
            />
          </div>

          <section className="card mt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="eyebrow">Redistribution trend</p>
                <h3 className="mt-1 text-xl font-semibold">
                  Meals delivered over time
                </h3>
              </div>

              <Tip>
                Each point represents deliveries that were completed and OTP
                verified.
              </Tip>
            </div>

            {trend.length ? (
              <div className="mt-6 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend}>
                    <CartesianGrid vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="value"
                      name="Meals delivered"
                      stroke="#1D5A41"
                      strokeWidth={3}
                      fill="#D7F267"
                      fillOpacity={0.45}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="mt-6">
                <Empty
                  icon={Sparkles}
                  title="Impact will grow here"
                  description="Verified deliveries will automatically calculate meals, waste avoided, and savings."
                  offline={data.offline}
                />
              </div>
            )}
          </section>
        </>
      )}
    </Shell>
  );
}

function Compliance() {
  const data = useApi(api.compliance, "compliance");
  const rows = list(data.data);

  function download(format) {
    if (apiConfigured) {
      window.open(api.exportRegister(format), "_blank");
    }
  }

  return (
    <Shell title="Compliance register" subtitle="FSSAI surplus-food register">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Completed handovers</p>
          <h2 className="page-title mt-1">
            A clean record for every delivery.
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Export your surplus-food register whenever an audit needs it.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            disabled={!apiConfigured}
            onClick={() => download("csv")}
            className="btn-secondary px-3 py-2.5 text-xs"
          >
            <Download className="h-4 w-4" />
            CSV
          </button>

          <button
            disabled={!apiConfigured}
            onClick={() => download("pdf")}
            className="btn-primary px-3 py-2.5 text-xs"
          >
            <Download className="h-4 w-4" />
            PDF
          </button>
        </div>
      </div>

      {data.loading ? (
        <Loader text="Opening handover register…" />
      ) : data.error ? (
        <ErrorBox {...data} />
      ) : !rows.length ? (
        <div className="mt-6">
          <Empty
            icon={ShieldCheck}
            title="No completed handovers yet"
            description="OTP-verified deliveries will automatically appear in this FSSAI-ready register."
            offline={data.offline}
          />
        </div>
      ) : (
        <div className="card mt-6 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4">Handover ID</th>
                  <th className="px-5 py-4">Food and quantity</th>
                  <th className="px-5 py-4">Kitchen</th>
                  <th className="px-5 py-4">Recipient</th>
                  <th className="px-5 py-4">Delivered at</th>
                  <th className="px-5 py-4">Proof</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-5 py-4 font-semibold text-forest">
                      {row.reference || row.id}
                    </td>
                    <td className="px-5 py-4">
                      <strong className="block">{row.foodItem}</strong>
                      <span className="text-xs text-slate-500">
                        {row.quantity} {row.unit}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {row.kitchen?.name || row.kitchenName}
                    </td>
                    <td className="px-5 py-4">
                      {row.recipient?.name || row.recipientName}
                    </td>
                    <td className="px-5 py-4">{date(row.deliveredAt)}</td>
                    <td className="px-5 py-4">
                      <span className="pill bg-emerald-50 text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Shell>
  );
}

function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-paper p-5 text-center">
      <div>
        <Brand />
        <h1 className="mt-8 text-4xl font-semibold">
          This page wandered off.
        </h1>
        <Link to="/kitchen/dashboard" className="btn-primary mt-6">
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/auth/role-selection" element={<RoleSelection />} />
      <Route path="/kitchen/dashboard" element={<Dashboard />} />
      <Route path="/kitchen/report-surplus" element={<ReportSurplus />} />
      <Route path="/kitchen/listings/:id" element={<ListingDetail />} />
      <Route path="/recipient/offers" element={<Offers />} />
      <Route path="/volunteer/pickup/:id" element={<VolunteerPickup />} />
      <Route path="/impact" element={<Impact />} />
      <Route path="/compliance" element={<Compliance />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
