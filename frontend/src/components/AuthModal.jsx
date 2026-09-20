import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Lock } from "lucide-react";
import { toast } from "sonner";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b3a52" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 8.5v3.5h4.5c-.4 1.9-2.1 3.5-4.5 3.5a4 4 0 0 1 0-8c1.2 0 2.2.4 3 1.1"/>
    </svg>
  );
}

export default function AuthModal({ open, onOpenChange, defaultMode = "login" }) {
  const { login, register, googleLogin } = useAuth();
  const [mode, setMode] = useState(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      if (mode === "login") await login(email, password);
      else await register(email, password, name);
      toast.success(mode === "login" ? "Bienvenue !" : "Compte créé.");
      onOpenChange(false);
    } catch (er) {
      const d = er?.response?.data?.detail;
      const msg = Array.isArray(d) ? d.map(x => x.msg).join(" ") : (d || er.message);
      setErr(msg);
    } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-[#FEC4D2]/15 flex items-center justify-center">
              <Lock size={28} className="text-[#FEC4D2]"/>
            </div>
          </div>
          <DialogTitle className="text-center text-2xl font-bold text-[#FEC4D2]">
            {mode === "login" ? <>Connecte-toi pour <span className="editorial text-neutral-900">créer ta routine</span></> :
              <>Crée ton <span className="editorial text-neutral-900">compte</span></>}
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-neutral-500 mt-1">
            Sauvegarde tes routines et retrouve tes diagnostics à tout moment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-3 mt-2">
          {mode === "register" && (
            <div>
              <Label className="text-xs">Prénom</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ton prénom" data-testid="auth-name"/>
            </div>
          )}
          <div>
            <Label className="text-xs">Email</Label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ton@email.com" data-testid="auth-email"/>
          </div>
          <div>
            <Label className="text-xs">Mot de passe</Label>
            <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 caractères" data-testid="auth-password"/>
          </div>
          {err && <p className="text-sm text-red-500" data-testid="auth-error">{String(err)}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-[#FEC4D2] hover:bg-[#fdb2c3] text-neutral-900 py-3 rounded-full font-medium transition disabled:opacity-50"
            data-testid="auth-submit"
          >
            {busy ? "Patiente…" : (mode === "login" ? "Se connecter" : "Créer mon compte")}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4 text-xs text-neutral-400">
          <span className="flex-1 h-px bg-neutral-200"/>ou<span className="flex-1 h-px bg-neutral-200"/>
        </div>

        <button
          onClick={googleLogin}
          className="w-full inline-flex items-center justify-center gap-2 bg-white border border-neutral-200 hover:border-[#FEC4D2] text-neutral-800 py-3 rounded-full font-medium transition"
          data-testid="auth-google"
        >
          <GoogleIcon/> Continuer avec Google
        </button>

        <p className="text-center text-sm text-neutral-600 mt-5">
          {mode === "login" ? (
            <>Pas encore de compte ? <button type="button" onClick={() => setMode("register")} className="text-[#79C1E0] underline" data-testid="auth-switch-register">Créer un compte — c'est gratuit</button></>
          ) : (
            <>Déjà inscrite ? <button type="button" onClick={() => setMode("login")} className="text-[#79C1E0] underline" data-testid="auth-switch-login">Se connecter</button></>
          )}
        </p>
      </DialogContent>
    </Dialog>
  );
}
