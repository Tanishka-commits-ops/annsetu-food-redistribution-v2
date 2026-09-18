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

const statusSteps = [
  "draft",
  "confirmed",
  "matching",
  "claimed",
  "in_transit",
  "delivered"
];

const statusNames = {
  draft: "Draft",
  confirmed: "Confirmed",
  matching: "Matching",
  claimed: "Claimed",
  in_transit: "In transit",
  delivered: "Delivered"
};

const urgencyStyles = {
  high: "bg-red-50 text-red-700 ring-1 ring-red-200",
  medium: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  low: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
};

function unwrap(response) {
  return response?.data?.data ?? response?.data ?? response;
}

function toList(value) {
  return Array.isArray(value) ? value : value?.items || value?.data || [];
}

function formatDate(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatNumber(value) {
  return typeof value === "number"
    ? new Intl.NumberFormat("en-IN").format(value)
    : "—";
}

function useApi(loader, key) {
  const [state, setState] = useState({
    loading: true,
    error: null,
    data: null,
    offline: false
  });

  async function reload() {
    setState((previous) => ({
      ...previous,
      loading: true,
      error: null
    }));

    try {
      const result = await loader();

      setState({
        loading: false,
        error: null,
        data: unwrap(result),
        offline: Boolean(result?.offline)
      });
    } catch (error) {
      setState({
        loading: false,
        error,
        data: null,
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
      <span className="text-xl">अन्नSetu</span>
    </Link>
  );
}

function Loading({ text = "Loading…" }) {
  return (
    <div className="grid min-h-[42vh] place-items-center">
      <div className="text-center">
        <Loader2 className="mx-auto mb-3 h-7 w-7 animate-spin text-moss" />
        <p className="text-sm font-medium text-slate-500">{text}</p>
      </div>
    </div>
  );
}

function Empty({
  title = "Nothing here yet",
  description,
  icon: Icon = PackageOpen,
  offline = false,
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

function Failure({ error, reload }) {
  return (
    <div className="card-muted grid min-h-56 place-items-center text-center">
      <div>
        <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-600" />
        <h3 className="text-lg font-semibold">We could not load this page</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
          {error?.message || "Please check your connection and try again."}
        </p>

        <button onClick={reload} className="btn-secondary mt-5">
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    </div>
  );
}

function InfoTip({ children }) {
  return (
    <span className="group relative inline-flex cursor-help text-slate-400">
      <Info className="h-4 w-4" />
      <span className="pointer-events-none absolute bottom-6 left-1/2 z-20 hidden w-56 -translate-x-1/2 rounded-lg bg-ink px-3 py-2 text-center text-xs leading-relaxed text-white shadow-lg group-hover:block">
        {children}
      </span>
    </span>
  );
}

function Metric({ label, value, Icon, note }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="eyebrow flex items-center gap-1">
            {label}
            <InfoTip>{note}</InfoTip>
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

const navItems = [
  ["/kitchen/dashboard", "Kitchen", Store],
  ["/kitchen/report-surplus", "Report surplus", ClipboardList],
  ["/recipient/offers", "Offers", HandHeart],
  ["/impact", "Impact", Sparkles],
  ["/compliance", "Compliance", ShieldCheck]
];

function Shell({ title, subtitle, actions, children }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="min-h-screen bg-paper">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-forest p-5 text-white lg:flex">
        <Brand dark />

        <p className="mt-10 px-3 text-[11px] font-bold uppercase tracking-[.14em] text-white/40">
          Workspace
        </p>

        <nav className="mt-3 space-y-1">
          {navItems.map(([path, label, Icon]) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-white/65 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl bg-white/10 p-4">
          <p className="text-sm font-semibold">Trusted handovers</p>
          <p className="mt-1 text-xs leading-5 text-white/60">
            Every completed delivery is recorded for compliance.
          </p>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b bg-paper/90 px-4 py-4 backdrop-blur lg:ml-64 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMenu(true)}
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
            <span className="hidden h-10 w-10 place-items-center rounded-full bg-forest text-sm font-bold text-lime sm:grid">
              AS
            </span>
          </div>
        </div>
      </header>

      {showMenu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            onClick={() => setShowMenu(false)}
            className="absolute inset-0 bg-ink/40"
          />

          <div className="relative flex h-full w-72 flex-col bg-forest p-5 text-white">
            <div className="flex items-center justify-between">
              <Brand dark />
              <button onClick={() => setShowMenu(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-10 space-y-1">
              {navItems.map(([path, label, Icon]) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => setShowMenu(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-white/75"
                >
                  <Icon className="h-4 w-4" />
                  {label}
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

      const responseData = unwrap(response);

      if (responseData?.accessToken) {
        localStorage.setItem("annsetu_access_token", responseData.accessToken);
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
              A trusted food redistribution system for kitchens,
              organisations, and volunteers.
            </p>
          </div>
        </section>

        <section className="flex items-center p-7 sm:p-12">
          <form onSubmit={submit} className="w-full max-w-sm">
            <Brand />

            <p className="eyebrow mt-12">Welcome back</p>
            <h2 className="mt-2 text-3xl font-semibold">
              Sign in to अन्नSetu
            </h2>
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
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
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
                onChange={(event) =>
                  setForm({ ...form, password: event.target.value })
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
    [
      "Kitchen team",
      "Report food surplus and manage matches.",
      UtensilsCrossed,
      "/kitchen/dashboard"
    ],
    [
      "Recipient organisation",
      "Review and accept suitable food offers.",
      Building2,
      "/recipient/offers"
    ],
    [
      "Volunteer",
      "Pick up food and verify delivery.",
      HandHeart,
      "/volunteer/pickup/assigned"
    ]
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
              {roles.map(([title, description, Icon, path]) => (
                <button
                  key={title}
                  onClick={() => navigate(path)}
                  className="flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition hover:border-moss hover:bg-emerald-50"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-lime/50 text-forest">
                    <Icon className="h-5 w-5" />
                  </span>

                  <span className="flex-1">
                    <strong className="block">{title}</strong>
                    <span className="mt-1 block text-sm text-slate-500">
                      {description}
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
  const resource = useApi(api.kitchenDashboard, "dashboard");
  const navigate = useNavigate();

  const dashboard = resource.data || {};
  const listings = toList(dashboard.listings);

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
      {resource.loading ? (
        <Loading />
      ) : resource.error ? (
        <Failure {...resource} />
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
                  "Your explainable AI brief will appear once data is connected."}
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
                  {listings.map((listing) => (
                    <Link
                      key={listing.id}
                      to={`/kitchen/listings/${listing.id}`}
                      className="flex flex-wrap items-center gap-3 py-4"
                    >
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-moss">
                        <UtensilsCrossed className="h-4 w-4" />
                      </span>

                      <span className="flex-1">
                        <strong className="block">
                          {listing.foodItem || listing.title}
                        </strong>
                        <span className="text-xs text-slate-500">
                          {listing.quantity} {listing.unit} · pickup by{" "}
                          {formatDate(listing.pickupBy)}
                        </span>
                      </span>

                      <span
                        className={`pill ${
                          urgencyStyles[listing.urgency?.toLowerCase()] ||
                          urgencyStyles.low
                        }`}
                      >
                        {listing.urgency || "Low"} urgency
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="mt-5">
                  <Empty
                    icon={UtensilsCrossed}
                    title="No listings yet"
                    description="When food surplus is reported, every match and handover will appear here."
                    offline={resource.offline}
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
                अन्नSetu explains predictions in plain language, so teams know
                the reason behind each recommendation.
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

  function update(name, value) {
    setForm({ ...form, [name]: value });
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await api.createListing({
        ...form,
        quantity: Number(form.quantity),
        source: "dashboard"
      });

      if (response.offline) {
        setMessage(
          "The backend is not connected yet. This form will submit to /kitchen/listings when it is ready."
        );
        return;
      }

      navigate(`/kitchen/listings/${unwrap(response).id}`);
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
            These fields match what WhatsApp and call integrations will send,
            so every listing remains consistent.
          </p>
        </div>

        {urgentMode && (
          <div className="mt-5 flex gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-800">
            <Zap className="h-5 w-5 fill-red-500 text-red-500" />
            <span>
              <strong>Urgent matching enabled.</strong> Recipient
              organisations will be alerted after you submit.
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
                placeholder="Example: vegetable pulao"
                value={form.foodItem}
                onChange={(event) => update("foodItem", event.target.value)}
              />
            </label>

            <label className="text-sm font-semibold">
              Quantity *
              <div className="mt-2 flex gap-2">
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  className="input mt-0"
                  placeholder="0"
                  value={form.quantity}
                  onChange={(event) => update("quantity", event.target.value)}
                />

                <select
                  className="input mt-0 w-28"
                  value={form.unit}
                  onChange={(event) => update("unit", event.target.value)}
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
                onChange={(event) => update("cookedAt", event.target.value)}
              />
            </label>

            <label className="text-sm font-semibold">
              Pickup by *
              <input
                required
                type="datetime-local"
                className="input"
                value={form.pickupBy}
                onChange={(event) => update("pickupBy", event.target.value)}
              />
            </label>
          </div>

          <div>
            <p className="text-sm font-semibold">Urgency</p>

            <div className="mt-2 grid grid-cols-3 gap-2">
              {["low", "medium", "high"].map((level) => (
                <button
                  type="button"
                  key={level}
                  onClick={() => update("urgency", level)}
                  className={`rounded-xl px-3 py-3 text-sm font-semibold capitalize ${
                    form.urgency === level
                      ? urgencyStyles[level]
                      : "border bg-white text-slate-500"
                  }`}
                >
                  {level}
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
              onChange={(event) => update("notes", event.target.value)}
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
  const currentStep = Math.max(0, statusSteps.indexOf(current));

  return (
    <ol className="grid gap-4 sm:grid-cols-6 sm:gap-0">
      {statusSteps.map((step, index) => {
        const active = index === currentStep;
        const complete = index < currentStep;
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
                {statusNames[step]}
              </p>

              {event?.at && (
                <p className="mt-1 text-[11px] text-slate-400">
                  {formatDate(event.at)}
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

  const pickupPosition = [pickup.latitude, pickup.longitude];

  const validRecipients = recipients.filter(
    (recipient) =>
      recipient.latitude != null && recipient.longitude != null
  );

  return (
    <MapContainer center={pickupPosition} zoom={13} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={pickupPosition}>
        <Popup>{pickup.name || pickup.address || "Kitchen pickup"}</Popup>
      </Marker>

      {validRecipients.map((recipient) => (
        <Marker
          key={recipient.id}
          position={[recipient.latitude, recipient.longitude]}
        >
          <Popup>{recipient.name || "Recipient organisation"}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

function Detail({ Icon, label, value }) {
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

function ListingDetail() {
  const { id } = useParams();
  const resource = useApi(() => api.getListing(id), `listing-${id}`);
  const listing = resource.data;

  const [message, setMessage] = useState("");
  const [matching, setMatching] = useState(false);

  async function urgentMatch() {
    setMatching(true);

    try {
      const response = await api.urgentMatch(id);

      setMessage(
        response.offline
          ? "Backend is not connected yet. This will trigger urgent matching when the API is available."
          : "Urgent matching has started. Nearby recipient organisations are being notified."
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setMatching(false);
    }
  }

  return (
    <Shell title="Listing status" subtitle="Kitchen team">
      {resource.loading ? (
        <Loading />
      ) : resource.error ? (
        <Failure {...resource} />
      ) : !listing ? (
        <Empty
          icon={ClipboardList}
          title="This listing is waiting to be created"
          description="Once your backend returns this listing, its timeline, match activity, and map will appear here."
          offline={resource.offline}
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
                {formatDate(listing.pickupBy)}
              </p>
            </div>

            <button
              onClick={urgentMatch}
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
                  {statusNames[listing.status] || "Preparing listing"}
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

              <div className="mt-5 space-y-5">
                <Detail
                  Icon={CalendarClock}
                  label="Cooked at"
                  value={formatDate(listing.cookedAt)}
                />
                <Detail
                  Icon={CalendarClock}
                  label="Pickup deadline"
                  value={formatDate(listing.pickupBy)}
                />
                <Detail
                  Icon={MapPin}
                  label="Pickup address"
                  value={listing.pickup?.address || "—"}
                />
                <Detail
                  Icon={Users}
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

function RecipientOffers() {
  const resource = useApi(api.recipientOffers, "offers");
  const offers = toList(resource.data);
  const [message, setMessage] = useState("");

  async function respond(id, decision) {
    try {
      const response = await api.respondToOffer(id, decision);

      setMessage(
        response.offline
          ? "Backend is not connected yet. This action will work when the offers API is ready."
          : `Offer ${decision}d successfully.`
      );

      resource.reload();
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

        {resource.loading ? (
          <Loading text="Checking new offers…" />
        ) : resource.error ? (
          <Failure {...resource} />
        ) : !offers.length ? (
          <div className="mt-6">
            <Empty
              icon={HandHeart}
              title="No offers right now"
              description="New food offers will appear here as soon as a nearby kitchen confirms them."
              offline={resource.offline}
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
                      urgencyStyles[offer.urgency?.toLowerCase()] ||
                      urgencyStyles.medium
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
                  {formatDate(offer.pickupBy)}
                </p>

                <div className="mt-5 rounded-xl bg-slate-50 p-3 text-sm">
                  <strong>{offer.kitchen?.name || "Kitchen"}</strong>
                  <p className="mt-1 flex items-center gap-1 text-slate-500">
                    <MapPin className="h-3.5 w-3.5" />
                    {offer.kitchen?.address ||
                      "Location visible after acceptance"}
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
  const resource = useApi(() => api.getPickup(id), `pickup-${id}`);
  const pickup = resource.data;

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  async function verify(event) {
    event.preventDefault();

    if (otp.length !== 4) {
      setMessage("Enter the four-digit code from the recipient.");
      return;
    }

    try {
      const response = await api.verifyDelivery(id, otp);

      setMessage(
        response.offline
          ? "Backend is not connected yet. This will verify delivery when the API is ready."
          : "Delivery verified successfully. Thank you for completing the handover."
      );
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <Shell title="Your pickup" subtitle="Volunteer">
      {resource.loading ? (
        <Loading text="Loading your assigned pickup…" />
      ) : resource.error ? (
        <Failure {...resource} />
      ) : !pickup ? (
        <div className="max-w-xl">
          <Empty
            icon={Truck}
            title="No pickup assigned yet"
            description="When a coordinator assigns a delivery, pickup and recipient details will appear here."
            offline={resource.offline}
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
                {formatDate(pickup.pickupBy)}
              </p>

              <div className="mt-7 space-y-5">
                <Detail
                  Icon={MapPin}
                  label="Collect from"
                  value={pickup.pickup?.address || "—"}
                />
                <Detail
                  Icon={MapPin}
                  label="Deliver to"
                  value={pickup.recipient?.address || "—"}
                />
                <Detail
                  Icon={Phone}
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
                    onChange={(event) =>
                      setOtp(
                        event.target.value.replace(/\D/g, "").slice(0, 4)
                      )
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
  const resource = useApi(api.impact, "impact");
  const impact = resource.data || {};
  const trend = impact.trend || [];

  return (
    <Shell title="Impact" subtitle="Shared impact">
      <p className="eyebrow">Transparent by design</p>
      <h2 className="page-title mt-1">Every good meal leaves a trace.</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        Every number comes with an explanation of how it was calculated.
      </p>

      {resource.loading ? (
        <Loading text="Calculating impact…" />
      ) : resource.error ? (
        <Failure {...resource} />
      ) : (
        <>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Metric
              label="Meals redistributed"
              value={formatNumber(impact.mealsRedistributed)}
              Icon={UtensilsCrossed}
              note={
                impact.computations?.mealsRedistributed ||
                "Calculated from verified delivered quantities using the configured standard serving size."
              }
            />

            <Metric
              label="Waste prevented"
              value={
                impact.wastePreventedKg != null
                  ? `${formatNumber(impact.wastePreventedKg)} kg`
                  : "—"
              }
              Icon={Leaf}
              note={
                impact.computations?.wastePreventedKg ||
                "Total food weight from deliveries that were completed instead of discarded."
              }
            />

            <Metric
              label="Rupees saved"
              value={
                impact.rupeesSaved != null
                  ? `₹${formatNumber(impact.rupeesSaved)}`
                  : "—"
              }
              Icon={Sparkles}
              note={
                impact.computations?.rupeesSaved ||
                "Estimated replacement cost multiplied by successfully redistributed meals."
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

              <InfoTip>
                Each point represents deliveries that were completed and OTP
                verified.
              </InfoTip>
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
                  offline={resource.offline}
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
  const resource = useApi(api.compliance, "compliance");
  const handovers = toList(resource.data);

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

      {resource.loading ? (
        <Loading text="Opening handover register…" />
      ) : resource.error ? (
        <Failure {...resource} />
      ) : !handovers.length ? (
        <div className="mt-6">
          <Empty
            icon={ShieldCheck}
            title="No completed handovers yet"
            description="OTP-verified deliveries will automatically appear in this FSSAI-ready register."
            offline={resource.offline}
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
                {handovers.map((handover) => (
                  <tr key={handover.id}>
                    <td className="px-5 py-4 font-semibold text-forest">
                      {handover.reference || handover.id}
                    </td>

                    <td className="px-5 py-4">
                      <strong className="block">{handover.foodItem}</strong>
                      <span className="text-xs text-slate-500">
                        {handover.quantity} {handover.unit}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {handover.kitchen?.name || handover.kitchenName}
                    </td>

                    <td className="px-5 py-4">
                      {handover.recipient?.name || handover.recipientName}
                    </td>

                    <td className="px-5 py-4">
                      {formatDate(handover.deliveredAt)}
                    </td>

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
      <Route path="/recipient/offers" element={<RecipientOffers />} />
      <Route path="/volunteer/pickup/:id" element={<VolunteerPickup />} />
      <Route path="/impact" element={<Impact />} />
      <Route path="/compliance" element={<Compliance />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
