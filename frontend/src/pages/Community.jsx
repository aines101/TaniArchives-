import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePosts } from "../context/PostsContext";
import { Button } from "../components/ui/button";
import { Trash2, LogIn, Image as ImageIcon } from "lucide-react";
import { useToast } from "../hooks/use-toast";

const Community = () => {
  const { user } = useAuth();
  const { posts, addPost, removePost } = usePosts();
  const { toast } = useToast();
  const [form, setForm] = useState({ title: "", category: "Memory", imageUrl: "", description: "" });

  const categories = ["Memory", "Festival", "Craft", "Song", "Folktale", "Food", "Language"];

  const submit = (e) => {
    e.preventDefault();
    if (!user) return;
    if (!form.title.trim() || !form.description.trim()) {
      toast({ title: "Missing fields", description: "Please add both a title and a description." });
      return;
    }
    const post = {
      id: `p_${Date.now()}`,
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      author: { name: user.name, email: user.email, picture: user.picture },
      createdAt: new Date().toISOString(),
    };
    addPost(post);
    setForm({ title: "", category: "Memory", imageUrl: "", description: "" });
    toast({ title: "Posted!", description: "Your contribution is now visible on the community wall." });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="border-b border-neutral-800 pb-6">
        <div className="text-xs uppercase tracking-[0.22em] text-amber-400">Community Wall</div>
        <h1 className="mt-1 font-serif text-4xl text-neutral-100">Voices of the Tani Clan</h1>
        <p className="mt-2 max-w-2xl text-neutral-400">
          Share a memory, a festival photograph, a family recipe or a song lyric. Every contribution helps keep the Tani–Mising heritage alive.
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Posts feed */}
        <div className="space-y-6">
          {posts.map((p) => (
            <article key={p.id} className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/40">
              {p.imageUrl && (
                <div className="aspect-[16/9] w-full overflow-hidden bg-neutral-800">
                  <img src={p.imageUrl} alt={p.title} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-amber-400">{p.category}</span>
                  {user && user.email === p.author.email && (
                    <button onClick={() => removePost(p.id)} className="text-neutral-500 hover:text-red-400" aria-label="delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <h3 className="mt-1 font-serif text-xl text-neutral-100">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-300">{p.description}</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-neutral-500">
                  <img src={p.author.picture} alt={p.author.name} className="h-6 w-6 rounded-full border border-neutral-700" />
                  <span className="text-neutral-300">{p.author.name}</span>
                  <span>· {new Date(p.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </article>
          ))}
          {posts.length === 0 && (
            <div className="rounded-lg border border-dashed border-neutral-800 py-16 text-center text-neutral-500">
              Be the first to share a memory.
            </div>
          )}
        </div>

        {/* Compose card */}
        <aside className="h-fit rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
          {user ? (
            <>
              <div className="flex items-center gap-3">
                <img src={user.picture} alt={user.name} className="h-10 w-10 rounded-full border border-neutral-700" />
                <div>
                  <div className="text-sm text-neutral-100">{user.name}</div>
                  <div className="text-xs text-neutral-500">{user.email}</div>
                </div>
              </div>
              <form onSubmit={submit} className="mt-5 space-y-3">
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Give your memory a title..."
                  className="h-10 w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-amber-500/50 focus:outline-none"
                />
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="h-10 w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 text-sm text-neutral-100 focus:border-amber-500/50 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div className="relative">
                  <ImageIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <input
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="Image URL (optional)"
                    className="h-10 w-full rounded-md border border-neutral-800 bg-neutral-950 pl-9 pr-3 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-amber-500/50 focus:outline-none"
                  />
                </div>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={5}
                  placeholder="Share the story or memory in your own words..."
                  className="w-full rounded-md border border-neutral-800 bg-neutral-950 p-3 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-amber-500/50 focus:outline-none"
                />
                <Button type="submit" className="w-full bg-amber-500 text-neutral-900 hover:bg-amber-400">
                  Publish to Community
                </Button>
                <p className="text-[11px] leading-snug text-neutral-500">
                  Posts are stored in your browser for now. When the backend is enabled they will move to the shared archive.
                </p>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10">
                <LogIn className="h-6 w-6 text-amber-300" />
              </div>
              <h3 className="font-serif text-xl text-neutral-100">Sign in to contribute</h3>
              <p className="mt-2 text-sm text-neutral-400">
                You need to be signed in with a Gmail account to post to the community wall.
              </p>
              <Button asChild className="mt-5 w-full bg-amber-500 text-neutral-900 hover:bg-amber-400">
                <Link to="/login">Sign in with Google</Link>
              </Button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default Community;
