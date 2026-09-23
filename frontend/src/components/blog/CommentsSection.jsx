import { useEffect, useState } from "react";
import { MessageCircle, Send, Heart } from "lucide-react";
import { api } from "../../lib/api";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function initials(name) {
  return (name || "?").trim().charAt(0).toUpperCase();
}

export default function CommentsSection({ articleId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!articleId) return;
    api.get(`/blog/articles/${articleId}/comments`)
      .then((r) => setComments(r.data || []))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [articleId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !text.trim() || submitting) return;
    setSubmitting(true);
    api.post(`/blog/articles/${articleId}/comments`, { name: name.trim(), text: text.trim() })
      .then((r) => {
        setComments((prev) => [r.data, ...prev]);
        setText("");
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <section className="mt-16 pt-10 border-t border-neutral-100" data-testid="comments-section">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
          <MessageCircle size={18} className="text-[#79C1E0]"/> Commentaires ({comments.length})
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#FEC4D2]/[0.06] border border-[#FEC4D2]/30 rounded-2xl p-4 mb-8" data-testid="comment-form">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ton prénom"
          maxLength={80}
          required
          className="w-full mb-2 px-4 py-2 rounded-full border border-[#FEC4D2]/40 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FEC4D2]/50 transition"
          data-testid="comment-name-input"
        />
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ajouter un commentaire..."
            maxLength={2000}
            required
            className="flex-1 px-4 py-2 rounded-full border border-[#FEC4D2]/40 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FEC4D2]/50 transition"
            data-testid="comment-text-input"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-10 h-10 shrink-0 rounded-full bg-[#FEC4D2] hover:bg-[#fdb2c3] text-neutral-900 flex items-center justify-center transition disabled:opacity-50"
            aria-label="Envoyer"
            data-testid="comment-submit"
          >
            <Send size={15}/>
          </button>
        </div>
      </form>

      {!loading && comments.length === 0 && (
        <p className="text-sm text-neutral-400">Sois la première à laisser un commentaire !</p>
      )}

      <ul className="space-y-5">
        {comments.map((c) => (
          <li key={c.id} className="flex gap-3" data-testid={`comment-${c.id}`}>
            <span className="shrink-0 w-9 h-9 rounded-full bg-[#79C1E0]/15 text-[#79C1E0] font-semibold text-sm flex items-center justify-center">
              {initials(c.name)}
            </span>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <p className="text-sm font-semibold text-neutral-900">{c.name}</p>
                <span className="text-xs text-neutral-400">{formatDate(c.created_at)}</span>
              </div>
              <p className="text-sm text-neutral-600 mt-0.5">{c.text}</p>
              <button className="mt-1.5 inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-[#FEC4D2] transition">
                <Heart size={12}/> Répondre
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
