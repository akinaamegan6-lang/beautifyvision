import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import Seo from "../components/Seo";
import { GENDER_LABEL, AGE_LABEL } from "../lib/profile";

const QUIZ_LABEL = {
  produit: "Quiz produit",
  "routine-360": "Routine 360°",
  probleme: "Quiz problème de peau",
  "essayage-ia": "Essayage IA",
};

const KEY_LABEL = { visage: "Visage", corps: "Corps", cheveux: "Cheveux" };

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
  } catch { return iso; }
}

function quizTitle(s) {
  const base = QUIZ_LABEL[s.quiz_type] || s.quiz_type;
  if (!s.quiz_key) return base;
  const k = KEY_LABEL[s.quiz_key] || s.quiz_key.replace(/-/g, " ");
  return `${base} · ${k}`;
}

function renderValue(v) {
  if (v === null || v === undefined || v === "") return "—";
  if (Array.isArray(v)) return v.length ? v.map(renderValue).join(", ") : "—";
  if (typeof v === "object") {
    return Object.entries(v).map(([k, x]) => `${k.replace(/_/g, " ")} : ${renderValue(x)}`).join(" · ");
  }
  return String(v);
}

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-neutral-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}

function Breakdown({ title, rows, labels = {} }) {
  const entries = Object.entries(rows || {}).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, n]) => s + n, 0) || 1;
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <h3 className="font-semibold text-neutral-900 mb-3">{title}</h3>
      {entries.length === 0 && <p className="text-sm text-neutral-500">Aucune donnée pour l'instant.</p>}
      <ul className="space-y-2">
        {entries.map(([k, n]) => (
          <li key={k} className="text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-neutral-700">{labels[k] || k}</span>
              <span className="font-medium text-neutral-900">{n} <span className="text-neutral-400 font-normal">({Math.round((n / total) * 100)}%)</span></span>
            </div>
            <div className="mt-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#79C1E0]" style={{ width: `${(n / total) * 100}%` }}/>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SessionRow({ s }) {
  const [open, setOpen] = useState(false);
  const answers = s.answers || {};
  return (
    <li className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)} className="w-full text-left px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-1 hover:bg-neutral-50">
        <span className="text-xs text-neutral-500 w-28 shrink-0">{fmtDate(s.created_at)}</span>
        <span className="font-medium text-neutral-900">{quizTitle(s)}</span>
        <span className="text-xs text-neutral-500">{GENDER_LABEL[s.gender] || s.gender} · {AGE_LABEL[s.age_range] || s.age_range}</span>
        <span className="ml-auto text-xs text-[#79C1E0]">{(s.products || []).length} produit(s) {open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 grid md:grid-cols-2 gap-6 border-t border-neutral-100 pt-4">
          <div>
            <h4 className="text-xs uppercase tracking-[0.18em] text-neutral-500 mb-2">Réponses</h4>
            <dl className="space-y-1.5 text-sm">
              {Object.entries(answers).map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <dt className="text-neutral-500 shrink-0 capitalize">{k.replace(/_/g, " ")} :</dt>
                  <dd className="text-neutral-900 break-words min-w-0">{renderValue(v)}</dd>
                </div>
              ))}
              {Object.keys(answers).length === 0 && <p className="text-neutral-500">Aucune réponse enregistrée.</p>}
            </dl>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.18em] text-neutral-500 mb-2">Produits recommandés</h4>
            <ul className="space-y-1.5 text-sm">
              {(s.products || []).map((p, i) => (
                <li key={`${p.id}-${i}`} className="flex justify-between gap-3">
                  <span className="min-w-0 break-words">
                    {p.slot && <span className="text-neutral-400">{p.slot} · </span>}
                    <span className="text-neutral-900">{p.brand} — {p.name}</span>
                  </span>
                  <span className="shrink-0 text-neutral-500">{Number(p.price).toFixed(2)} €{p.score != null ? ` · ${p.score}%` : ""}</span>
                </li>
              ))}
              {(s.products || []).length === 0 && <p className="text-neutral-500">Aucun produit.</p>}
            </ul>
          </div>
        </div>
      )}
    </li>
  );
}

function AdminLogin() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try { await login(email, pw); } catch { setErr("Identifiants incorrects."); }
  };
  return (
    <form onSubmit={submit} className="max-w-sm mx-auto mt-10 space-y-3">
      <h1 className="text-2xl font-bold text-neutral-900">Espace administratrice</h1>
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" className="w-full border border-neutral-300 rounded-xl px-4 py-3"/>
      <input type="password" required value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Mot de passe" className="w-full border border-neutral-300 rounded-xl px-4 py-3"/>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button type="submit" className="w-full bg-[#79C1E0] text-white rounded-full py-3 font-medium">Se connecter</button>
    </form>
  );
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadSessions = useCallback(async (reset) => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/quiz-sessions", {
        params: { quiz_type: filter || undefined, skip: reset ? 0 : items.length, limit: 30 },
      });
      setItems((prev) => (reset ? data.items : [...prev, ...data.items]));
      setTotal(data.total);
    } catch {
      setError("Impossible de charger les passages.");
    } finally { setLoading(false); }
  }, [filter, items.length]);

  useEffect(() => {
    api.get("/admin/quiz-stats").then((r) => setStats(r.data)).catch(() => setError("Impossible de charger les statistiques."));
  }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadSessions(true); }, [filter]);

  const byQuizLabels = {};
  const byQuizRows = {};
  (stats?.by_quiz || []).forEach((r) => {
    const label = quizTitle({ quiz_type: r.quiz_type, quiz_key: r.quiz_key });
    byQuizRows[label] = r.count;
  });
  const typeRows = {};
  Object.entries(stats?.by_quiz_type || {}).forEach(([k, n]) => { typeRows[QUIZ_LABEL[k] || k] = n; });

  return (
    <div>
      <h1 className="text-3xl font-bold text-neutral-900">Suivi des quiz</h1>
      <p className="mt-1 text-sm text-neutral-500">Données anonymes : aucun nom, e-mail ni adresse IP n'est enregistré.</p>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {stats && (
        <>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Quiz faits (total)" value={stats.total} hint="Tous quiz confondus"/>
            <StatCard label="7 derniers jours" value={stats.last_7_days}/>
            <StatCard label="30 derniers jours" value={stats.last_30_days}/>
            <StatCard label="Types de quiz" value={Object.keys(stats.by_quiz_type || {}).length}/>
          </div>
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <Breakdown title="Total par type de quiz" rows={typeRows}/>
            <Breakdown title="Détail par quiz (produit, problème, Routine 360° visage/corps/cheveux…)" rows={byQuizRows} labels={byQuizLabels}/>
            <Breakdown title="Genre" rows={stats.by_gender} labels={GENDER_LABEL}/>
            <Breakdown title="Tranche d'âge" rows={stats.by_age_range} labels={AGE_LABEL}/>
          </div>
        </>
      )}

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-bold text-neutral-900">Passages ({total})</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="ml-auto border border-neutral-300 rounded-full px-4 py-2 text-sm bg-white">
          <option value="">Tous les quiz</option>
          {Object.entries(QUIZ_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
      </div>
      <ul className="mt-4 space-y-3">
        {items.map((s) => <SessionRow key={s.id} s={s}/>)}
        {!loading && items.length === 0 && <p className="text-sm text-neutral-500">Aucun passage enregistré pour l'instant.</p>}
      </ul>
      {items.length < total && (
        <div className="mt-6 text-center">
          <button type="button" disabled={loading} onClick={() => loadSessions(false)} className="border border-neutral-300 rounded-full px-6 py-2 text-sm hover:border-[#79C1E0] disabled:opacity-50">
            {loading ? "Chargement…" : "Voir plus"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminQuizPage() {
  const { user, status } = useAuth();
  return (
    <main className="bg-neutral-50 min-h-screen px-6 py-12">
      <Seo title="Suivi des quiz | Beautify Vision" description="Espace administratrice" path="/admin/quiz" noindex/>
      <div className="max-w-5xl mx-auto">
        {status === "loading" && <p className="text-neutral-500">Chargement…</p>}
        {status === "anon" && <AdminLogin/>}
        {status === "auth" && user?.role !== "admin" && (
          <p className="text-neutral-700">Cette page est réservée à l'administratrice du site.</p>
        )}
        {status === "auth" && user?.role === "admin" && <Dashboard/>}
      </div>
    </main>
  );
}
