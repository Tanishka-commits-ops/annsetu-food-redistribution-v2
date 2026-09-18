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
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  AlertCircle,
  ArrowLeft,
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
  XCircle,
  Zap
} from "lucide-react";
import { api, apiConfigured } from "./lib/api";

const flow = [
  "draft",
  "confirmed",
  "matching",
  "claimed",
  "in_transit",
  "delivered"
];

const statusText = {
  draft: "Draft",
  confirmed: "Confirmed",
  matching: "Matching",
  claimed: "Claimed",
  in_transit: "In transit",
  delivered: "Delivered"
};

const urgencyColor = {
  high: "bg-red-50 text-red-700 ring-1 ring-red-200",
  medium: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  low: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
};

const unwrap = (result) => result?.data?.data ?? result?.data ?? result;
const array = (value) =>
  Array.isArray(value) ? value : value?.items || value?.data || [];

function when(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function num(value) {
  return typeof value === "number"
    ? new Intl.NumberFormat("en-IN").format(value)
    : "—";
}

function useApi(loader, key) {
  const [result, setResult] = useState({
    loading: true,
    data: null,
    error: null,
    offline: false
  });

  async function reload() {
    setResult((old) => ({ ...old, loading: true, error: null }));

    try {
      const response = await loader();

      setResult({
        loading: false,
        data: unwrap(response),
        error: null,
        offline: Boolean(response?.offline)
      });
    } catch (error) {
      setResult({
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

  return { ...result, reload };
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
            Connect the backend API to show live information.
          </p>
        )}

        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}

function ErrorState({ error, reload }) {
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
      <span className="pointer-events-none absolute bottom-6 left-1/2 z-30 hidden w-56 -translate-x-1/2 rounded-lg bg-ink px-3 py-2 text-center text-xs leading-relaxed text-white shadow-lg group-hover:block">
        {children}
      </span>
    </span>
  );
}

function Shell({ title, subtitle, children, action }) {
  const links = [
    ["/kitchen/dashboard", "Kitchen", Store],
    ["/kitchen/report-surplus", "Report", ClipboardList],
    ["/recipient/offers", "Offers", HandHeart],
    ["/impact", "Impact", Sparkles],
    ["/compliance", "Register", ShieldCheck]
  ];

  return (
    <div className="min-h-screen bg-paper">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-forest p-5 text-white lg:flex">
        <Brand dark />

        <p className="mt-10 px-3 text-[11px] font-bold uppercase tracking-[.15em] text-white/40">
          Workspace
        </p>

        <nav className="mt-3 space-y-1">
          {links.map(([path, name, Icon]) => (
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
              {name}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl bg-white/10 p-4 text-xs leading-5 text-white/65">
          Trusted surplus-food redistribution with verified delivery records.
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b bg-paper/90 px-4 py-4 backdrop-blur lg:ml-64 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-500">{subtitle}</p>
            <h1 className="text-lg font-semibold sm:text-xl">{title}</h1>
          </div>

          <div className="flex items-center gap-2">{action}</div>
        </div>
      </header>

      <main className="px-4 pb-24 pt-7 lg:ml-64 lg:px-8 lg:pb-7">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 flex justify-around border-t bg-white px-1 py-2 lg:hidden">
        {links.map(([path, name, Icon]) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex min-w-14 flex-col items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold ${
                isActive ? "text-forest" : "text-slate-400"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

const loginRoles = {
  kitchen: {
    title: "Kitchen sign in",
    description: "Report food surplus, track matching, and reduce waste.",
    icon: UtensilsCrossed,
    next: "/kitchen/dashboard"
  },
  recipient: {
    title: "Recipient organisation sign in",
    description: "Review and accept available food offers nearby.",
    icon: HandHeart,
    next: "/recipient/offers"
  },
  volunteer: {
    title: "Volunteer sign in",
    description: "View assigned pickups and verify delivery using OTP.",
    icon: Truck,
    next: "/volunteer/pickup/assigned"
  }
};

function LoginPicker() {
  return (
    <main className="min-h-screen bg-paper p-4 sm:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-soft sm:grid-cols-2">
        <section className="hidden bg-forest p-10 text-white sm:block">
          <Brand dark />

          <div className="mt-32">
            <p className="eyebrow text-lime">Food belongs with people</p>
            <h1 className="mt-4 text-5xl font-semibold leading-tight tracking-[-.05em]">
              Move surplus food where it matters.
            </h1>
          </div>
        </section>

        <section className="flex items-center p-7 sm:p-12">
          <div className="w-full">
            <Brand />

            <p className="eyebrow mt-12">Welcome to अन्नSetu</p>
            <h2 className="mt-2 text-3xl font-semibold">
              Choose your login
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Each team gets a focused workspace.
            </p>

            <div className="mt-8 space-y-3">
              {Object.entries(loginRoles).map(([key, role]) => {
                const Icon = role.icon;

                return (
                  <Link
                    key={key}
                    to={`/login/${key}`}
                    className="flex items-center gap-4 rounded-2xl border p-4 transition hover:border-moss hover:bg-emerald-50"
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-lime/50 text-forest">
                      <Icon className="h-5 w-5" />
                    </span>

                    <span className="flex-1">
                      <strong className="block">{role.title}</strong>
                      <span className="mt-1 block text-sm text-slate-500">
                        {role.description}
                      </span>
                    </span>

                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function LoginScreen() {
  const { role } = useParams();
  const navigate = useNavigate();
  const selected = loginRoles[role] || loginRoles.kitchen;
  const Icon = selected.icon;

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");

    try {
      const response = await api.login({ ...form, role });

      if (response.offline) {
        navigate(selected.next);
        return;
      }

      const data = unwrap(response);

      if (data?.accessToken) {
        localStorage.setItem("annsetu_access_token", data.accessToken);
      }

      navigate(selected.next);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="min-h-screen bg-paper p-4 sm:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-soft sm:grid-cols-2">
        <section className="hidden bg-forest p-10 text-white sm:block">
          <Brand dark />

          <div className="mt-32 max-w-md">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-lime text-forest">
              <Icon className="h-7 w-7" />
            </span>

            <h1 className="mt-6 text-5xl font-semibold leading-tight">
              {selected.title}
            </h1>

            <p className="mt-5 text-white/70">{selected.description}</p>
          </div>
        </section>

        <section className="flex items-center p-7 sm:p-12">
          <form onSubmit={submit} className="w-full max-w-sm">
            <Brand />

            <Link
              to="/login"
              className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-slate-500"
            >
              <ArrowLeft className="h-4 w-4" />
              Change login type
            </Link>

            <p className="eyebrow mt-8">{role} account</p>
            <h2 className="mt-2 text-3xl font-semibold">{selected.title}</h2>

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

function Dashboard() {
  const resource = useApi(api.kitchenDashboard, "dashboard");
  const navigate = useNavigate();
  const dashboard = resource.data || {};
  const listings = array(dashboard.listings);

  return (
    <Shell
      title="Kitchen dashboard"
      subtitle="Kitchen team"
      action={
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
        <ErrorState {...resource} />
      ) : (
        <>
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Today, in one view</p>
              <h2 className="page-title mt-1">Keep good food moving.</h2>
            </div>

            <p className="text-sm text-slate-500">
              {apiConfigured
                ? "Live kitchen information"
                : "Your backend will populate this workspace"}
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
                  "Connect order and production history."}
              </p>
            </div>

            <div className="card bg-lime/35">
              <p className="eyebrow text-forest/70">Today’s AI brief</p>
              <p className="mt-2 text-lg font-semibold leading-snug">
                {dashboard.brief ||
                  "Your clear AI explanation will appear after kitchen data is connected."}
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
                          {when(item.pickupBy)}
                        </span>
                      </span>

                      <span
                        className={`pill ${
                          urgencyColor[item.urgency?.toLowerCase()] ||
                          urgencyColor.low
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
                    description="Report your first available surplus and we will track it from kitchen to recipient."
                    offline={resource.offline}
                    action={
                      <Link to="/kitchen/report-surplus" className="btn-primary">
                        Report surplus
                      </Link>
                    }
                  />
                </div>
              )}
            </section>

            <section className="card bg-forest text-white">
              <p className="eyebrow text-lime">Why this matters</p>
              <h3 className="mt-2 text-2xl font-semibold">
                Make decisions with context.
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/70">
                Your backend can send plain-language reasons, for example:
                “Tuesday demand usually runs 12% lower.”
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
  const urgent = params.get("urgent") === "1";

  const [form, setForm] = useState({
    foodItem: "",
    quantity: "",
    unit: "kg",
    cookedAt: "",
    pickupBy: "",
    notes: "",
    urgency: urgent ? "high" : "medium"
  });

  const [message, setMessage] = useState("");

  const update = (name, value) =>
    setForm((old) => ({ ...old, [name]: value }));

  async function submit(event) {
    event.preventDefault();
    setMessage("");

    try {
      const response = await api.createListing({
        ...form,
        quantity: Number(form.quantity),
        source: "dashboard"
      });

      if (response.offline) {
        setMessage(
          "Backend is not connected yet. This form is ready to submit once the API is available."
        );
        return;
      }

      navigate(`/kitchen/listings/${unwrap(response).id}`);
    } catch (error) {
      setMessage(error.message);
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
          <p className="eyebrow">A consistent listing format</p>
          <h2 className="page-title mt-1">What food is available?</h2>
          <p className="mt-2 text-sm text-slate-500">
            These are the same fields used by your WhatsApp and call
            integrations.
          </p>
        </div>

        {urgent && (
          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-800">
            <strong>Urgent matching enabled.</strong> Recipient organisations
            will be alerted once you submit.
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
                onChange={(event) => update("foodItem", event.target.value)}
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
                  key={level}
                  type="button"
                  onClick={() => update("urgency", level)}
                  className={`rounded-xl px-3 py-3 text-sm font-semibold capitalize ${
                    form.urgency === level
                      ? urgencyColor[level]
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
              placeholder="Allergens, packing, gate instructions…"
              value={form.notes}
              onChange={(event) => update("notes", event.target.value)}
            />
          </label>

          {message && (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {message}
            </p>
          )}

          <div className="flex justify-end border-t pt-5">
            <button className="btn-primary">
              <Check className="h-4 w-4" />
              {urgent ? "Start urgent matching" : "Confirm surplus"}
            </button>
          </div>
        </form>
      </div>
    </Shell>
  );
}

function Timeline({ current = "draft", events = [] }) {
  const active = Math.max(0, flow.indexOf(current));

  return (
    <div className="grid gap-4 sm:grid-cols-6 sm:gap-0">
      {flow.map((step, index) => {
        const complete = index < active;
        const isActive = index === active;
        const event = events.find((item) => item.status === step);

        return (
          <div key={step} className="relative flex gap-3 sm:block">
            <span
              className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${
                isActive
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
                  isActive
                    ? "text-forest"
                    : complete
                    ? "text-moss"
                    : "text-slate-400"
                }`}
              >
                {statusText[step]}
              </p>

              {event?.at && (
                <p className="mt-1 text-[11px] text-slate-400">
                  {when(event.at)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PickupMap({ pickup, recipients = [] }) {
  if (pickup?.latitude == null || pickup?.longitude == null) {
    return (
      <Empty
        icon={MapPin}
        title="Map will appear with pickup location"
        description="The backend can provide latitude and longitude for kitchens and recipient organisations."
      />
    );
  }

  const position = [pickup.latitude, pickup.longitude];
  const validRecipients = recipients.filter(
    (item) => item.latitude != null && item.longitude != null
  );

  return (
    <MapContainer center={position} zoom={13} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={position}>
        <Popup>{pickup.address || "Kitchen pickup"}</Popup>
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

function Listing() {
  const { id } = useParams();
  const resource = useApi(() => api.getListing(id), `listing-${id}`);
  const item = resource.data;
  const [message, setMessage] = useState("");

  async function urgentMatch() {
    try {
      const response = await api.urgentMatch(id);

      setMessage(
        response.offline
          ? "Backend is not connected yet. This button will trigger live matching once it is."
          : "Live urgent matching has started."
      );
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <Shell title="Listing status" subtitle="Kitchen team">
      {resource.loading ? (
        <Loading />
      ) : resource.error ? (
        <ErrorState {...resource} />
      ) : !item ? (
        <Empty
          title="This listing is waiting to be created"
          description="Once a listing is available, its full handover timeline will show here."
          offline={resource.offline}
        />
      ) : (
        <>
          <div className="flex flex-col justify-between gap-4 sm:flex-row">
            <div>
              <Link
                to="/kitchen/dashboard"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500"
              >
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Link>

              <h2 className="page-title mt-5">
                {item.foodItem || item.title}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {item.quantity} {item.unit} · pickup by {when(item.pickupBy)}
              </p>
            </div>

            <button onClick={urgentMatch} className="btn-primary">
              <Zap className="h-4 w-4 fill-lime text-lime" />
              Urgent surplus
            </button>
          </div>

          {message && (
            <p className="mt-4 rounded-xl bg-lime/40 p-3 text-sm text-forest">
              {message}
            </p>
          )}

          <section className="card mt-6">
            <p className="eyebrow">Handover progress</p>
            <h3 className="mt-1 text-xl font-semibold">
              {statusText[item.status] || "Preparing listing"}
            </h3>

            <div className="mt-8">
              <Timeline current={item.status} events={item.timeline || []} />
            </div>
          </section>

          <div className="mt-6 grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
            <section className="card">
              <p className="eyebrow">Pickup details</p>

              <div className="mt-5 space-y-4 text-sm">
                <p>
                  <strong>Cooked at:</strong> {when(item.cookedAt)}
                </p>
                <p>
                  <strong>Pickup by:</strong> {when(item.pickupBy)}
                </p>
                <p>
                  <strong>Pickup:</strong> {item.pickup?.address || "—"}
                </p>
                <p>
                  <strong>Recipient:</strong>{" "}
                  {item.recipient?.name || "Matching in progress"}
                </p>
              </div>
            </section>

            <section className="card h-80 overflow-hidden p-2">
              <PickupMap
                pickup={item.pickup}
                recipients={
                  item.candidateRecipients ||
                  (item.recipient ? [item.recipient] : [])
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
  const offers = array(resource.data);
  const [message, setMessage] = useState("");

  async function answer(id, decision) {
    try {
      const response = await api.respondToOffer(id, decision);

      setMessage(
        response.offline
          ? "Backend is not connected yet. This action will work when offers are live."
          : `Offer ${decision}d successfully.`
      );

      resource.reload();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <Shell title="Incoming offers" subtitle="Recipient organisation">
      <p className="eyebrow">Ready when you are</p>
      <h2 className="page-title mt-1">Food offers nearby</h2>

      {message && (
        <p className="mt-5 rounded-xl bg-lime/40 p-3 text-sm text-forest">
          {message}
        </p>
      )}

      {resource.loading ? (
        <Loading text="Checking new offers…" />
      ) : resource.error ? (
        <ErrorState {...resource} />
      ) : !offers.length ? (
        <div className="mt-6">
          <Empty
            icon={HandHeart}
            title="No offers right now"
            description="New offers will arrive here as soon as nearby kitchens confirm them."
            offline={resource.offline}
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {offers.map((offer) => (
            <article key={offer.id} className="card">
              <div className="flex justify-between">
                <UtensilsCrossed className="h-6 w-6 text-moss" />

                <span
                  className={`pill ${
                    urgencyColor[offer.urgency?.toLowerCase()] ||
                    urgencyColor.medium
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
                {when(offer.pickupBy)}
              </p>

              <div className="mt-5 rounded-xl bg-slate-50 p-3 text-sm">
                <strong>{offer.kitchen?.name || "Kitchen"}</strong>
                <p className="mt-1 text-slate-500">
                  {offer.kitchen?.address ||
                    "Location visible after acceptance"}
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  onClick={() => answer(offer.id, "decline")}
                  className="btn-secondary"
                >
                  <XCircle className="h-4 w-4" />
                  Decline
                </button>

                <button
                  onClick={() => answer(offer.id, "accept")}
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
      setMessage("Enter the 4-digit delivery code from the recipient.");
      return;
    }

    try {
      const response = await api.verifyDelivery(id, otp);

      setMessage(
        response.offline
          ? "Backend is not connected yet. OTP verification will work once the API is live."
          : "Delivery verified. Thank you for completing this handover."
      );
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <Shell title="Your pickup" subtitle="Volunteer">
      {resource.loading ? (
        <Loading text="Loading assigned pickup…" />
      ) : resource.error ? (
        <ErrorState {...resource} />
      ) : !pickup ? (
        <Empty
          icon={Truck}
          title="No pickup assigned yet"
          description="Your next collection and delivery details will appear here."
          offline={resource.offline}
        />
      ) : (
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
              {when(pickup.pickupBy)}
            </p>

            <div className="mt-7 space-y-4 text-sm">
              <p>
                <strong>Collect from:</strong> {pickup.pickup?.address || "—"}
              </p>
              <p>
                <strong>Deliver to:</strong>{" "}
                {pickup.recipient?.address || "—"}
              </p>
              <p>
                <strong>Kitchen contact:</strong>{" "}
                {pickup.pickup?.phone || "—"}
              </p>
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
              Ask the recipient to read their 4-digit code after food has been
              handed over.
            </p>

            <form onSubmit={verify} className="mt-7">
              <input
                inputMode="numeric"
                maxLength="4"
                value={otp}
                onChange={(event) =>
                  setOtp(
                    event.target.value.replace(/\D/g, "").slice(0, 4)
                  )
                }
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-4 text-center text-2xl font-bold tracking-[.7em] text-lime outline-none"
                placeholder="0000"
              />

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

          <section className="card h-80 overflow-hidden p-2 lg:col-span-2">
            <PickupMap
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
  const data = resource.data || {};
  const trend = data.trend || [];

  function metric(label, value, Icon, note) {
    return (
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <p className="eyebrow flex items-center gap-1">
              {label}
              <InfoTip>{note}</InfoTip>
            </p>
            <p className="mt-3 text-3xl font-semibold">{value}</p>
          </div>

          <Icon className="h-5 w-5 text-moss" />
        </div>
      </div>
    );
  }

  return (
    <Shell title="Impact" subtitle="Shared impact">
      <p className="eyebrow">Transparent by design</p>
      <h2 className="page-title mt-1">Every good meal leaves a trace.</h2>

      {resource.loading ? (
        <Loading text="Calculating impact…" />
      ) : resource.error ? (
        <ErrorState {...resource} />
      ) : (
        <>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {metric(
              "Meals redistributed",
              num(data.mealsRedistributed),
              UtensilsCrossed,
              data.computations?.mealsRedistributed ||
                "Calculated from verified delivered quantities using the configured serving size."
            )}

            {metric(
              "Waste prevented",
              data.wastePreventedKg != null
                ? `${num(data.wastePreventedKg)} kg`
                : "—",
              Leaf,
              data.computations?.wastePreventedKg ||
                "Total weight of food successfully delivered rather than disposed."
            )}

            {metric(
              "Rupees saved",
              data.rupeesSaved != null ? `₹${num(data.rupeesSaved)}` : "—",
              Sparkles,
              data.computations?.rupeesSaved ||
                "Estimated replacement cost multiplied by verified delivered meals."
            )}
          </div>

          <section className="card mt-6">
            <p className="eyebrow">Redistribution trend</p>
            <h3 className="mt-1 text-xl font-semibold">
              Meals delivered over time
            </h3>

            {trend.length ? (
              <div className="mt-6 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend}>
                    <XAxis dataKey="label" />
                    <YAxis />
                    <ChartTooltip />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#1D5A41"
                      fill="#D7F267"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="mt-6">
                <Empty
                  icon={Sparkles}
                  title="Impact will grow here"
                  description="Verified deliveries will calculate meals, waste avoided, and savings."
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
  const rows = array(resource.data);

  function download(format) {
    if (apiConfigured) {
      window.open(api.exportRegister(format), "_blank");
    }
  }

  return (
    <Shell title="Compliance register" subtitle="FSSAI surplus-food register">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Completed handovers</p>
          <h2 className="page-title mt-1">
            A clean record for every delivery.
          </h2>
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
        <ErrorState {...resource} />
      ) : !rows.length ? (
        <div className="mt-6">
          <Empty
            icon={ShieldCheck}
            title="No completed handovers yet"
            description="OTP-verified deliveries will automatically appear in this FSSAI-ready register."
            offline={resource.offline}
          />
        </div>
      ) : (
        <div className="card mt-6 overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4">Handover ID</th>
                <th className="px-5 py-4">Food</th>
                <th className="px-5 py-4">Kitchen</th>
                <th className="px-5 py-4">Recipient</th>
                <th className="px-5 py-4">Delivered</th>
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
                    {row.foodItem} · {row.quantity} {row.unit}
                  </td>
                  <td className="px-5 py-4">
                    {row.kitchen?.name || row.kitchenName}
                  </td>
                  <td className="px-5 py-4">
                    {row.recipient?.name || row.recipientName}
                  </td>
                  <td className="px-5 py-4">{when(row.deliveredAt)}</td>
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
      )}
    </Shell>
  );
}

function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-paper p-5 text-center">
      <div>
        <Brand />
        <h1 className="mt-8 text-4xl font-semibold">Page not found</h1>
        <Link to="/login" className="btn-primary mt-6">
          Go to login
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPicker />} />
      <Route path="/login/:role" element={<LoginScreen />} />

      <Route path="/kitchen/dashboard" element={<Dashboard />} />
      <Route path="/kitchen/report-surplus" element={<ReportSurplus />} />
      <Route path="/kitchen/listings/:id" element={<Listing />} />

      <Route path="/recipient/offers" element={<RecipientOffers />} />

      <Route path="/volunteer/pickup/:id" element={<VolunteerPickup />} />

      <Route path="/impact" element={<Impact />} />
      <Route path="/compliance" element={<Compliance />} />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
