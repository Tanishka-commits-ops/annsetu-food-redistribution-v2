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
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Download,
  HandHeart,
  Info,
  Leaf,
  Loader2,
  LogIn,
  MapPin,
  PackageOpen,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
  UtensilsCrossed,
  XCircle,
  Zap
} from "lucide-react";
import { api, apiConfigured } from "./lib/api";

const backgroundImage = {
  backgroundImage:
    "linear-gradient(rgba(245,245,239,0.78), rgba(245,245,239,0.92)), url('/annsetu-intro.jpg')",
  backgroundPosition: "center",
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat"
};

const roles = {
  kitchen: {
    title: "Kitchen",
    loginTitle: "Sign in as kitchen",
    description: "Report surplus, view forecasts, and manage food handovers.",
    icon: Store,
    home: "/kitchen/dashboard"
  },
  restaurant: {
    title: "Restaurant",
    loginTitle: "Sign in as restaurant",
    description: "Review nearby food offers and accept food for your organisation.",
    icon: HandHeart,
    home: "/restaurant/offers"
  },
  volunteer: {
    title: "Volunteer",
    loginTitle: "Sign in as volunteer",
    description: "Pick up assigned food and verify delivery with OTP.",
    icon: Truck,
    home: "/volunteer/pickup/assigned"
  }
};

const steps = [
  "draft",
  "confirmed",
  "matching",
  "claimed",
  "in_transit",
  "delivered"
];

const stepNames = {
  draft: "Draft",
  confirmed: "Confirmed",
  matching: "Matching",
  claimed: "Claimed",
  in_transit: "In transit",
  delivered: "Delivered"
};

const urgencyColors = {
  high: "bg-red-50 text-red-700",
  medium: "bg-amber-50 text-amber-700",
  low: "bg-emerald-50 text-emerald-700"
};

function unwrap(response) {
  return response?.data?.data ?? response?.data ?? response;
}

function asList(value) {
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
    data: null,
    error: null,
    offline: false
  });

  async function reload() {
    setState((old) => ({ ...old, loading: true, error: null }));

    try {
      const response = await loader();

      setState({
        loading: false,
        data: unwrap(response),
        error: null,
        offline: Boolean(response?.offline)
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

function Brand() {
  return (
    <Link to="/login" className="inline-flex items-center gap-2 text-[#173f2e]">
      <span className="grid h-9 w-9 place-items-center rounded-md bg-[#173f2e] text-white">
        <Leaf className="h-5 w-5" />
      </span>
      <span className="font-serif text-2xl font-semibold">अन्नSetu</span>
    </Link>
  );
}

function Loading({ text = "Loading…" }) {
  return (
    <div className="grid min-h-[40vh] place-items-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#173f2e]" />
        <p className="mt-3 text-sm text-[#667268]">{text}</p>
      </div>
    </div>
  );
}

function EmptyState({
  title = "Nothing here yet",
  text,
  Icon = PackageOpen,
  offline,
  action
}) {
  return (
    <div className="card grid min-h-52 place-items-center text-center">
      <div>
        <Icon className="mx-auto mb-3 h-7 w-7 text-[#173f2e]" />
        <h3 className="text-xl">{title}</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#667268]">
          {text}
        </p>

        {offline && (
          <p className="mt-3 text-xs text-[#7a857d]">
            Connect your backend API to load real data.
          </p>
        )}

        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}

function ErrorState({ error, reload }) {
  return (
    <div className="card text-center">
      <h3 className="text-xl">Could not load this page</h3>
      <p className="mt-2 text-sm text-red-700">
        {error?.message || "Please try again."}
      </p>
      <button onClick={reload} className="btn-secondary mt-4">
        <RefreshCw className="h-4 w-4" />
        Try again
      </button>
    </div>
  );
}

function InfoTip({ children }) {
  return (
    <span className="group relative inline-flex cursor-help">
      <Info className="h-3.5 w-3.5 text-[#7a857d]" />
      <span className="pointer-events-none absolute bottom-5 left-1/2 z-30 hidden w-52 -translate-x-1/2 rounded bg-[#173f2e] p-2 text-center text-xs text-white group-hover:block">
        {children}
      </span>
    </span>
  );
}

function RoleDropdown({ role }) {
  const navigate = useNavigate();

  return (
    <div className="relative">
      <select
        value={role}
        onChange={(event) => navigate(`/login/${event.target.value}`)}
        className="appearance-none rounded-md border border-[#d6d6c9] bg-white py-2 pl-3 pr-8 text-xs font-semibold text-[#173f2e] outline-none"
      >
        <option value="kitchen">Kitchen login</option>
        <option value="restaurant">Restaurant login</option>
        <option value="volunteer">Volunteer login</option>
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-2 h-4 w-4 text-[#173f2e]" />
    </div>
  );
}

function RolePicker() {
  return (
    <main
      className="grid min-h-screen place-items-center bg-[#f5f5ef] p-4"
      style={backgroundImage}
    >
      <div className="w-full max-w-[430px]">
        <div className="mb-7 text-center">
          <Brand />
        </div>

        <section className="card p-7">
          <h1 className="text-2xl">Who’s signing in?</h1>
          <p className="mt-1 text-sm text-[#667268]">
            Choose the workspace for this device.
          </p>

          <div className="mt-5 space-y-2">
            {Object.entries(roles).map(([key, role]) => {
              const Icon = role.icon;

              return (
                <Link
                  key={key}
                  to={`/login/${key}`}
                  className="flex items-center gap-3 rounded-lg border p-3 transition hover:border-[#173f2e] hover:bg-[#eef3ec]"
                >
                  <span className="grid h-10 w-10 place-items-center rounded bg-[#e8eee5] text-[#173f2e]">
                    <Icon className="h-4 w-4" />
                  </span>

                  <span className="flex-1">
                    <strong className="block text-sm">{role.title}</strong>
                    <span className="block text-xs leading-5 text-[#667268]">
                      {role.description}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <p className="mt-4 text-center text-xs text-[#667268]">
          FSSAI-aligned food redistribution · verified handovers
        </p>
      </div>
    </main>
  );
}

function LoginPage() {
  const { role } = useParams();
  const navigate = useNavigate();
  const selectedRole = roles[role] || roles.kitchen;
  const Icon = selectedRole.icon;

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");

  async function signIn(event) {
    event.preventDefault();
    setError("");

    try {
      const response = await api.login({ ...form, role });

      if (response.offline) {
        navigate(selectedRole.home);
        return;
      }

      const data = unwrap(response);

      if (data?.accessToken) {
        localStorage.setItem("annsetu_access_token", data.accessToken);
      }

      navigate(selectedRole.home);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main
      className="grid min-h-screen place-items-center bg-[#f5f5ef] p-4"
      style={backgroundImage}
    >
      <div className="w-full max-w-[430px]">
        <div className="mb-7 flex items-center justify-between">
          <Brand />
          <RoleDropdown role={role || "kitchen"} />
        </div>

        <form onSubmit={signIn} className="card p-7">
          <Link to="/login" className="text-xs text-[#667268]">
            ← Change role
          </Link>

          <div className="mt-5 flex items-center gap-2">
            <Icon className="h-5 w-5 text-[#173f2e]" />
            <h1 className="text-2xl">{selectedRole.loginTitle}</h1>
          </div>

          <p className="mt-2 text-sm text-[#667268]">
            {selectedRole.description}
          </p>

          <label className="mt-6 block text-xs font-semibold">
            Phone number or email
            <input
              required
              className="input"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
            />
          </label>

          <label className="mt-4 block text-xs font-semibold">
            Password
            <input
              required
              type="password"
              className="input"
              value={form.password}
              onChange={(event) =>
                setForm({ ...form, password: event.target.value })
              }
            />
          </label>

          {error && (
            <p className="mt-3 text-xs text-red-700">{error}</p>
          )}

          <button className="btn-primary mt-5 w-full">
            <LogIn className="h-4 w-4" />
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}

function SignOutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("annsetu_access_token");
  }, []);

  return (
    <main
      className="grid min-h-screen place-items-center bg-[#f5f5ef] p-4"
      style={backgroundImage}
    >
      <section className="card w-full max-w-[430px] p-7 text-center">
        <ShieldCheck className="mx-auto h-9 w-9 text-[#173f2e]" />
        <h1 className="mt-4 text-2xl">You are signed out</h1>
        <p className="mt-2 text-sm text-[#667268]">
          Your local session has been cleared from this device.
        </p>
        <button onClick={() => navigate("/login")} className="btn-primary mt-6">
          Choose a login
        </button>
      </section>
    </main>
  );
}

function Shell({ title, subtitle, role, children, action }) {
  const links =
    role === "kitchen"
      ? [
          ["/kitchen/dashboard", "Dashboard", Store],
          ["/kitchen/report-surplus", "Report", ClipboardList],
          ["/impact", "Impact", Sparkles],
          ["/compliance", "Compliance", ShieldCheck]
        ]
      : role === "restaurant"
      ? [
          ["/restaurant/offers", "Offers", HandHeart],
          ["/signout", "Sign out", LogIn]
        ]
      : [
          ["/volunteer/pickup/assigned", "My pickup", Truck],
          ["/signout", "Sign out", LogIn]
        ];

  return (
    <div className="min-h-screen bg-[#f5f5ef]">
      <header className="border-b bg-[#f5f5ef]">
        <div className="mx-auto flex max-w-[700px] items-center justify-between gap-3 px-4 py-4">
          <div>
            <h1 className="text-[25px]">{title}</h1>
            <p className="text-xs text-[#667268]">{subtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            {action}
            <Link to="/signout" className="btn-secondary px-3 py-2 text-xs">
              Sign out
            </Link>
          </div>
        </div>
      </header>

      <main className="page">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 flex justify-around border-t bg-white py-2">
        {links.map(([path, label, Icon]) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex min-w-16 flex-col items-center gap-1 text-[10px] ${
                isActive ? "text-[#173f2e]" : "text-[#7e887f]"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

function KitchenDashboard() {
  const resource = useApi(api.kitchenDashboard, "kitchen-dashboard");
  const navigate = useNavigate();
  const dashboard = resource.data || {};
  const listings = asList(dashboard.listings);

  return (
    <Shell
      title={dashboard.kitchenName || "Kitchen dashboard"}
      subtitle="Kitchen workspace"
      role="kitchen"
      action={
        <button
          onClick={() => navigate("/kitchen/report-surplus?urgent=1")}
          className="btn-primary bg-[#c9981e] text-[#173f2e] hover:bg-[#b88a18]"
        >
          <Zap className="h-4 w-4" />
          Urgent
        </button>
      }
    >
      {resource.loading ? (
        <Loading />
      ) : resource.error ? (
        <ErrorState {...resource} />
      ) : (
        <>
          <section className="space-y-3">
            <div className="card border-l-2 border-l-[#173f2e]">
              <h3>Tomorrow’s forecast</h3>
              <p className="eyebrow">Predicted surplus load</p>
              <p className="mt-2 font-serif text-3xl">
                {dashboard.forecast?.headline || "Awaiting kitchen history"}
              </p>
            </div>

            <div className="card border-l-2 border-l-[#c9981e]">
              <h3>Surplus risk</h3>
              <p className="mt-2 text-sm">
                {dashboard.risk?.label || "Not calculated yet"}
              </p>
            </div>

            <div className="card border-l-2 border-l-[#173f2e]">
              <h3>Today’s AI brief</h3>
              <p className="mt-2 text-sm">
                {dashboard.brief ||
                  "A real-time AI brief will appear when kitchen data is connected."}
              </p>
            </div>
          </section>

          <section className="card mt-4">
            <h3>7-day demand forecast</h3>

            {dashboard.forecast?.points?.length ? (
              <div className="mt-4 h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboard.forecast.points}>
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      dataKey="value"
                      stroke="#173f2e"
                      fill="#dce8d8"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="mt-4 text-sm text-[#667268]">
                The chart will show only real forecast data from your backend.
              </p>
            )}
          </section>

          <section className="card mt-4">
            <h3>Why this forecast</h3>
            <p className="eyebrow">Plain-language reasoning</p>

            {dashboard.forecast?.reasons?.length ? (
              <ul className="mt-3 space-y-2 text-sm">
                {dashboard.forecast.reasons.map((reason) => (
                  <li key={reason}>— {reason}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-[#667268]">
                Reasons will appear alongside your real forecast.
              </p>
            )}
          </section>

          <section className="card mt-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3>Active listings</h3>
                <p className="eyebrow">
                  Everything reported today, across every channel
                </p>
              </div>

              <Link
                to="/kitchen/report-surplus"
                className="btn-secondary px-3 py-2 text-xs"
              >
                + New
              </Link>
            </div>

            {listings.length ? (
              listings.map((listing) => (
                <Link
                  key={listing.id}
                  to={`/kitchen/listings/${listing.id}`}
                  className="flex items-center justify-between border-b py-4 last:border-0"
                >
                  <span>
                    <strong className="text-sm">
                      {listing.foodItem || listing.title}
                    </strong>

                    <span
                      className={`pill ml-2 ${
                        urgencyColors[listing.urgency?.toLowerCase()] ||
                        urgencyColors.low
                      }`}
                    >
                      {listing.urgency || "Low"} urgency
                    </span>

                    <small className="mt-1 block text-xs text-[#667268]">
                      {listing.quantity} {listing.unit} · pickup by{" "}
                      {formatDate(listing.pickupBy)}
                    </small>
                  </span>

                  <span className="text-xs">
                    {stepNames[listing.status] || "Matching"} ›
                  </span>
                </Link>
              ))
            ) : (
              <div className="mt-4">
                <EmptyState
                  title="No listings yet"
                  text="Report available surplus and start matching it with nearby organisations."
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

function ReportSurplus() {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const urgent = search.get("urgent") === "1";

  const [form, setForm] = useState({
    foodItem: "",
    quantity: "",
    unit: "kg",
    cookedAt: "",
    pickupBy: "",
    notes: ""
  });

  const [message, setMessage] = useState("");

  function update(name, value) {
    setForm({ ...form, [name]: value });
  }

  async function submit(event) {
    event.preventDefault();

    try {
      const result = await api.createListing({
        ...form,
        quantity: Number(form.quantity),
        urgency: urgent ? "high" : "medium"
      });

      if (result.offline) {
        setMessage("This form is ready for the real backend API.");
        return;
      }

      navigate(`/kitchen/listings/${unwrap(result).id}`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <Shell
      title="Report surplus"
      subtitle="Same fields used by WhatsApp and call extraction"
      role="kitchen"
    >
      <form onSubmit={submit} className="card mt-4 max-w-[480px] space-y-4">
        <label className="block text-xs font-semibold">
          Food item
          <input
            required
            className="input"
            placeholder="e.g. Vegetable pulao"
            value={form.foodItem}
            onChange={(event) => update("foodItem", event.target.value)}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs font-semibold">
            Quantity
            <input
              required
              type="number"
              min="0"
              className="input"
              value={form.quantity}
              onChange={(event) => update("quantity", event.target.value)}
            />
          </label>

          <label className="text-xs font-semibold">
            Unit
            <select
              className="input"
              value={form.unit}
              onChange={(event) => update("unit", event.target.value)}
            >
              <option>kg</option>
              <option>servings</option>
              <option>packets</option>
              <option>trays</option>
            </select>
          </label>

          <label className="text-xs font-semibold">
            Cooked at
            <input
              required
              type="datetime-local"
              className="input"
              value={form.cookedAt}
              onChange={(event) => update("cookedAt", event.target.value)}
            />
          </label>

          <label className="text-xs font-semibold">
            Pickup by
            <input
              required
              type="datetime-local"
              className="input"
              value={form.pickupBy}
              onChange={(event) => update("pickupBy", event.target.value)}
            />
          </label>
        </div>

        <label className="block text-xs font-semibold">
          Notes
          <textarea
            className="input min-h-20"
            placeholder="Allergens, packing, gate instructions…"
            value={form.notes}
            onChange={(event) => update("notes", event.target.value)}
          />
        </label>

        <p className="rounded bg-[#eaf1e8] p-3 text-xs">
          This listing will look identical to one created by an AI phone call
          or WhatsApp message.
        </p>

        {message && <p className="text-xs text-red-700">{message}</p>}

        <button className="btn-primary w-full">
          {urgent ? "Start urgent matching" : "Publish listing"}
        </button>
      </form>
    </Shell>
  );
}

function Timeline({ current = "draft" }) {
  const activeStep = Math.max(0, steps.indexOf(current));

  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-6">
      {steps.map((step, index) => {
        const done = index < activeStep;
        const active = index === activeStep;

        return (
          <div key={step} className="flex gap-2 sm:block">
            <span
              className={`grid h-7 w-7 place-items-center rounded-full text-xs ${
                active
                  ? "bg-[#173f2e] text-white ring-4 ring-[#dce8d8]"
                  : done
                  ? "bg-[#dce8d8] text-[#173f2e]"
                  : "bg-[#ecece6] text-[#7a857d]"
              }`}
            >
              {done ? <Check className="h-4 w-4" /> : index + 1}
            </span>

            <span
              className={`text-xs ${
                active ? "font-bold text-[#173f2e]" : "text-[#667268]"
              }`}
            >
              {stepNames[step]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function FoodMap({ pickup, recipient }) {
  if (pickup?.latitude == null || pickup?.longitude == null) {
    return (
      <EmptyState
        Icon={MapPin}
        title="Map awaits real locations"
        text="Pickup and recipient pins will appear when the backend sends latitude and longitude."
      />
    );
  }

  const pickupPosition = [pickup.latitude, pickup.longitude];

  return (
    <MapContainer center={pickupPosition} zoom={13} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={pickupPosition}>
        <Popup>{pickup.address || "Kitchen pickup"}</Popup>
      </Marker>

      {recipient?.latitude != null && (
        <Marker position={[recipient.latitude, recipient.longitude]}>
          <Popup>{recipient.address || "Restaurant location"}</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

function ListingPage() {
  const { id } = useParams();
  const resource = useApi(() => api.getListing(id), `listing-${id}`);
  const listing = resource.data;
  const [message, setMessage] = useState("");

  async function urgentMatch() {
    try {
      const response = await api.urgentMatch(id);

      setMessage(
        response.offline
          ? "Urgent matching will start when the backend API is connected."
          : "Live urgent matching has started."
      );
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <Shell title="Listing status" subtitle="Track every handover" role="kitchen">
      {resource.loading ? (
        <Loading />
      ) : resource.error ? (
        <ErrorState {...resource} />
      ) : !listing ? (
        <EmptyState
          title="Listing unavailable"
          text="Create a surplus listing first."
          offline={resource.offline}
        />
      ) : (
        <>
          <div className="flex items-start justify-between gap-4">
            <div>
              <Link
                to="/kitchen/dashboard"
                className="inline-flex items-center gap-1 text-xs text-[#667268]"
              >
                <ArrowLeft className="h-3 w-3" />
                Dashboard
              </Link>

              <h2 className="page-title mt-3">
                {listing.foodItem || listing.title}
              </h2>

              <p className="mt-1 text-sm text-[#667268]">
                {listing.quantity} {listing.unit} · pickup by{" "}
                {formatDate(listing.pickupBy)}
              </p>
            </div>

            <button onClick={urgentMatch} className="btn-primary">
              <Zap className="h-4 w-4" />
              Urgent
            </button>
          </div>

          {message && (
            <p className="mt-3 rounded bg-[#eaf1e8] p-3 text-sm text-[#173f2e]">
              {message}
            </p>
          )}

          <section className="card mt-4">
            <h3>Handover progress</h3>
            <Timeline current={listing.status} />
          </section>

          <section className="card mt-4 h-72 p-2">
            <FoodMap pickup={listing.pickup} recipient={listing.recipient} />
          </section>
        </>
      )}
    </Shell>
  );
}

function RestaurantOffers() {
  const resource = useApi(api.recipientOffers, "restaurant-offers");
  const offers = asList(resource.data);
  const [message, setMessage] = useState("");

  async function decide(id, decision) {
    try {
      const response = await api.respondToOffer(id, decision);

      setMessage(
        response.offline
          ? "This action is ready for the backend."
          : `Offer ${decision}d successfully.`
      );

      resource.reload();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <Shell
      title="Incoming offers"
      subtitle="Surplus food near you, matched in real time"
      role="restaurant"
    >
      {resource.loading ? (
        <Loading text="Checking offers…" />
      ) : resource.error ? (
        <ErrorState {...resource} />
      ) : !offers.length ? (
        <EmptyState
          Icon={HandHeart}
          title="No offers right now"
          text="Nearby kitchen offers will arrive here the moment they are matched."
          offline={resource.offline}
        />
      ) : (
        <>
          {message && (
            <p className="mb-3 rounded bg-[#eaf1e8] p-3 text-sm">
              {message}
            </p>
          )}

          {offers.map((offer) => (
            <article key={offer.id} className="card mb-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3>{offer.foodItem || offer.title}</h3>
                  <p className="text-xs text-[#667268]">
                    {offer.kitchen?.name || "Kitchen"}
                  </p>
                </div>

                {offer.distanceKm != null && (
                  <span className="pill bg-[#eaf1e8]">
                    {offer.distanceKm} km
                  </span>
                )}
              </div>

              <p className="mt-3 text-sm">
                {offer.quantity} {offer.unit}
              </p>

              <p className="mt-1 text-xs text-[#667268]">
                Pickup by {formatDate(offer.pickupBy)}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() => decide(offer.id, "decline")}
                  className="btn-secondary text-red-700"
                >
                  <XCircle className="h-4 w-4" />
                  Decline
                </button>

                <button
                  onClick={() => decide(offer.id, "accept")}
                  className="btn-primary"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Accept
                </button>
              </div>
            </article>
          ))}
        </>
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
      setMessage("Enter the four-digit code from the restaurant.");
      return;
    }

    try {
      const response = await api.verifyDelivery(id, otp);

      setMessage(
        response.offline
          ? "OTP verification will work once the backend API is connected."
          : "Delivery verified successfully."
      );
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <Shell title="Your pickup" subtitle="Volunteer workspace" role="volunteer">
      {resource.loading ? (
        <Loading text="Loading assigned pickup…" />
      ) : resource.error ? (
        <ErrorState {...resource} />
      ) : !pickup ? (
        <EmptyState
          Icon={Truck}
          title="No pickup assigned yet"
          text="Your next kitchen collection and delivery will appear here."
          offline={resource.offline}
        />
      ) : (
        <>
          <section className="card h-72 p-2">
            <FoodMap pickup={pickup.pickup} recipient={pickup.recipient} />
          </section>

          <section className="card mt-3">
            <h3>Load</h3>
            <p className="mt-2 text-sm">
              {pickup.foodItem || pickup.title} · {pickup.quantity}{" "}
              {pickup.unit}
            </p>
          </section>

          <form onSubmit={verify} className="card mt-3">
            <h3>Confirm handover</h3>
            <p className="mt-1 text-xs text-[#667268]">
              Ask the restaurant representative to read their four-digit code.
            </p>

            <input
              required
              inputMode="numeric"
              maxLength="4"
              placeholder="0000"
              className="input text-center text-2xl tracking-[0.7em]"
              value={otp}
              onChange={(event) =>
                setOtp(
                  event.target.value.replace(/\D/g, "").slice(0, 4)
                )
              }
            />

            {message && (
              <p className="mt-3 text-xs text-[#173f2e]">{message}</p>
            )}

            <button className="btn-primary mt-4 w-full">
              <ShieldCheck className="h-4 w-4" />
              Verify delivery
            </button>
          </form>
        </>
      )}
    </Shell>
  );
}

function ImpactPage() {
  const resource = useApi(api.impact, "impact");
  const impact = resource.data || {};
  const trend = impact.trend || [];

  function metric(title, value, Icon, note) {
    return (
      <div className="card border-l-2 border-l-[#173f2e]">
        <p className="flex items-center gap-1 text-xs">
          {title}
          <InfoTip>{note}</InfoTip>
        </p>

        <div className="mt-2 flex items-center justify-between">
          <p className="font-serif text-3xl">{value}</p>
          <Icon className="h-5 w-5 text-[#173f2e]" />
        </div>
      </div>
    );
  }

  return (
    <Shell
      title="Impact"
      subtitle="Every figure explains how it was calculated"
      role="kitchen"
    >
      {resource.loading ? (
        <Loading text="Calculating impact…" />
      ) : resource.error ? (
        <ErrorState {...resource} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {metric(
              "Meals redistributed",
              formatNumber(impact.mealsRedistributed),
              UtensilsCrossed,
              impact.computations?.mealsRedistributed ||
                "Verified delivered quantity divided by the configured serving size."
            )}

            {metric(
              "Waste prevented",
              impact.wastePreventedKg != null
                ? `${formatNumber(impact.wastePreventedKg)} kg`
                : "—",
              Leaf,
              impact.computations?.wastePreventedKg ||
                "Total weight from OTP-verified deliveries."
            )}

            {metric(
              "Rupees saved",
              impact.rupeesSaved != null
                ? `₹${formatNumber(impact.rupeesSaved)}`
                : "—",
              Sparkles,
              impact.computations?.rupeesSaved ||
                "Replacement meal cost multiplied by verified meals."
            )}
          </div>

          <section className="card mt-4">
            <h3>Meals redistributed — trend</h3>

            {trend.length ? (
              <div className="mt-4 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend}>
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      dataKey="value"
                      stroke="#8d670e"
                      fill="#f2dfac"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="mt-4">
                <EmptyState
                  Icon={Sparkles}
                  title="Trend awaits verified deliveries"
                  text="This chart will use only real completed handovers."
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

function CompliancePage() {
  const resource = useApi(api.compliance, "compliance");
  const rows = asList(resource.data);

  function download(format) {
    if (apiConfigured) {
      window.open(api.exportRegister(format), "_blank");
    }
  }

  return (
    <Shell
      title="Compliance register"
      subtitle="FSSAI surplus-food handover log — OTP-verified deliveries"
      role="kitchen"
      action={
        <div className="flex gap-2">
          <button
            disabled={!apiConfigured}
            onClick={() => download("csv")}
            className="btn-secondary px-3 py-2 text-xs"
          >
            <Download className="h-3 w-3" />
            CSV
          </button>

          <button
            disabled={!apiConfigured}
            onClick={() => download("pdf")}
            className="btn-secondary px-3 py-2 text-xs"
          >
            PDF
          </button>
        </div>
      }
    >
      {resource.loading ? (
        <Loading text="Opening register…" />
      ) : resource.error ? (
        <ErrorState {...resource} />
      ) : !rows.length ? (
        <EmptyState
          Icon={ShieldCheck}
          title="No completed handovers yet"
          text="OTP-verified deliveries will automatically appear in this compliance register."
          offline={resource.offline}
        />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[650px] text-left text-xs">
            <thead className="bg-[#eeeee6]">
              <tr>
                {["ID", "Date", "Kitchen", "Restaurant", "Item", "Qty"].map(
                  (heading) => (
                    <th key={heading} className="p-3">
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="p-3">{row.reference || row.id}</td>
                  <td className="p-3">{formatDate(row.deliveredAt)}</td>
                  <td className="p-3">
                    {row.kitchen?.name || row.kitchenName}
                  </td>
                  <td className="p-3">
                    {row.recipient?.name || row.recipientName}
                  </td>
                  <td className="p-3">{row.foodItem}</td>
                  <td className="p-3">
                    {row.quantity} {row.unit}
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
    <main
      className="grid min-h-screen place-items-center bg-[#f5f5ef] p-4"
      style={backgroundImage}
    >
      <section className="card p-7 text-center">
        <h1 className="text-2xl">Page not found</h1>
        <Link to="/login" className="btn-primary mt-5">
          Go to login
        </Link>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<RolePicker />} />
      <Route path="/login/:role" element={<LoginPage />} />
      <Route path="/signout" element={<SignOutPage />} />

      <Route path="/kitchen/dashboard" element={<KitchenDashboard />} />
      <Route path="/kitchen/report-surplus" element={<ReportSurplus />} />
      <Route path="/kitchen/listings/:id" element={<ListingPage />} />

      <Route path="/restaurant/offers" element={<RestaurantOffers />} />

      <Route path="/volunteer/pickup/:id" element={<VolunteerPickup />} />

      <Route path="/impact" element={<ImpactPage />} />
      <Route path="/compliance" element={<CompliancePage />} />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
