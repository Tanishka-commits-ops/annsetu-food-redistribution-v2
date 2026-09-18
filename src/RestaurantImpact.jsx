import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  HandHeart,
  Info,
  Leaf,
  Loader2,
  LogIn,
  Sparkles,
  Truck
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "./lib/api";

function number(value) {
  return typeof value === "number"
    ? new Intl.NumberFormat("en-IN").format(value)
    : "—";
}

function Tip({ children }) {
  return (
    <span className="group relative inline-flex cursor-help">
      <Info className="h-3.5 w-3.5 text-[#7a857d]" />
      <span className="pointer-events-none absolute bottom-5 left-1/2 z-30 hidden w-52 -translate-x-1/2 rounded bg-[#173f2e] p-2 text-center text-xs text-white group-hover:block">
        {children}
      </span>
    </span>
  );
}

function Metric({ title, value, Icon, note }) {
  return (
    <div className="card border-l-2 border-l-[#173f2e]">
      <p className="flex items-center gap-1 text-xs">
        {title}
        <Tip>{note}</Tip>
      </p>

      <div className="mt-2 flex items-center justify-between">
        <p className="font-serif text-3xl">{value}</p>
        <Icon className="h-5 w-5 text-[#173f2e]" />
      </div>
    </div>
  );
}

export default function RestaurantImpact() {
  const [state, setState] = useState({
    loading: true,
    data: null,
    error: null,
    offline: false
  });

  async function loadImpact() {
    setState((old) => ({ ...old, loading: true, error: null }));

    try {
      const response = await api.restaurantImpact();

      setState({
        loading: false,
        data: response?.data?.data ?? response?.data ?? null,
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
    loadImpact();
  }, []);

  const impact = state.data || {};
  const trend = impact.trend || [];

  return (
    <div className="min-h-screen bg-[#f5f5ef]">
      <header className="border-b bg-[#f5f5ef]">
        <div className="mx-auto flex max-w-[700px] items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-[25px]">Restaurant impact</h1>
            <p className="text-xs text-[#667268]">
              Verified food received and served by your organisation
            </p>
          </div>

          <Link to="/signout" className="btn-secondary px-3 py-2 text-xs">
            Sign out
          </Link>
        </div>
      </header>

      <main className="page">
        {state.loading ? (
          <div className="grid min-h-[40vh] place-items-center">
            <Loader2 className="h-7 w-7 animate-spin text-[#173f2e]" />
          </div>
        ) : state.error ? (
          <div className="card text-center">
            <h2 className="text-xl">Could not load restaurant impact</h2>
            <p className="mt-2 text-sm text-red-700">
              {state.error.message}
            </p>
            <button onClick={loadImpact} className="btn-secondary mt-4">
              Try again
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Metric
                title="Meals served"
                value={number(impact.mealsServed)}
                Icon={HandHeart}
                note={
                  impact.computations?.mealsServed ||
                  "Verified delivered food converted to meals using your organisation’s configured serving size."
                }
              />

              <Metric
                title="Food received"
                value={
                  impact.foodReceivedKg != null
                    ? `${number(impact.foodReceivedKg)} kg`
                    : "—"
                }
                Icon={Truck}
                note={
                  impact.computations?.foodReceivedKg ||
                  "Total food quantity from OTP-verified deliveries received by this restaurant."
                }
              />

              <Metric
                title="Waste prevented"
                value={
                  impact.wastePreventedKg != null
                    ? `${number(impact.wastePreventedKg)} kg`
                    : "—"
                }
                Icon={Leaf}
                note={
                  impact.computations?.wastePreventedKg ||
                  "Food received through verified redistribution rather than being discarded."
                }
              />

              <Metric
                title="Rupees saved"
                value={
                  impact.rupeesSaved != null
                    ? `₹${number(impact.rupeesSaved)}`
                    : "—"
                }
                Icon={Sparkles}
                note={
                  impact.computations?.rupeesSaved ||
                  "Estimated replacement-food cost avoided by accepting verified food deliveries."
                }
              />
            </div>

            <section className="card mt-4">
              <h3>Meals served — trend</h3>

              {trend.length ? (
                <div className="mt-4 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trend}>
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#8d670e"
                        fill="#f2dfac"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="mt-4 rounded-lg bg-[#eef3ec] p-5 text-center">
                  <Sparkles className="mx-auto h-6 w-6 text-[#173f2e]" />
                  <h3 className="mt-2">Restaurant impact will appear here</h3>
                  <p className="mt-2 text-sm text-[#667268]">
                    This chart uses only your organisation’s real,
                    OTP-verified food deliveries.
                  </p>
                  {state.offline && (
                    <p className="mt-2 text-xs text-[#7a857d]">
                      Connect the backend API to load your data.
                    </p>
                  )}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 flex justify-around border-t bg-white py-2">
        <NavLink
          to="/restaurant/offers"
          className="flex flex-col items-center gap-1 text-[10px] text-[#7e887f]"
        >
          <HandHeart className="h-4 w-4" />
          Offers
        </NavLink>

        <NavLink
          to="/restaurant/impact"
          className="flex flex-col items-center gap-1 text-[10px] text-[#173f2e]"
        >
          <Sparkles className="h-4 w-4" />
          Impact
        </NavLink>

        <NavLink
          to="/signout"
          className="flex flex-col items-center gap-1 text-[10px] text-[#7e887f]"
        >
          <LogIn className="h-4 w-4" />
          Sign out
        </NavLink>
      </nav>
    </div>
  );
}
