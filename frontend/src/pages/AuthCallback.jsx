import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthCallback() {
  const { exchangeGoogleSession } = useAuth();
  const navigate = useNavigate();
  const ran = useRef(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const hash = window.location.hash;
    const match = hash.match(/session_id=([^&]+)/);
    if (!match) { navigate("/"); return; }
    const sid = decodeURIComponent(match[1]);
    exchangeGoogleSession(sid)
      .then(() => navigate("/routine-360", { replace: true }))
      .catch((e) => setErr(e?.response?.data?.detail || e.message));
  }, [exchangeGoogleSession, navigate]);

  return (
    <main className="bg-white min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        {err ? (
          <>
            <p className="text-red-500">Erreur d'authentification : {String(err)}</p>
            <button onClick={() => navigate("/")} className="mt-4 text-sm underline text-[#79C1E0]">Retour à l'accueil</button>
          </>
        ) : (
          <>
            <div className="flex gap-2 justify-center mb-4">
              <span className="loader-dot"/><span className="loader-dot"/><span className="loader-dot"/>
            </div>
            <p className="text-neutral-600">Connexion en cours…</p>
          </>
        )}
      </div>
    </main>
  );
}
