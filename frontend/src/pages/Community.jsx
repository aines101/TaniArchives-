import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePosts } from "../context/PostsContext";
import { Button } from "../components/ui/button";
import {
  Trash2, LogIn, Image as ImageIcon, Music, Video, Upload, Shield, Loader2,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { api, API } from "../lib/api";

const categories = ["Memory", "Festival", "Craft", "Song", "Folktale", "Food", "Language"];

// Convert relative /api/uploads/... into absolute URL
const absolute = (url) => {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/api/")) return `${API.replace(/\/api$/, "")}${url}`;
  return url;
};

// Extract YouTube ID from url
const ytId = (url) => {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return m ? m[1] : null;
};

const MediaBlock = ({ post }) => {
  const yt = ytId(post.videoUrl);
  const video = post.videoUrl && !yt ? absolute(post.videoUrl) : null;
  const audio = post.audioUrl ? absolute(post.audioUrl) : null;
  return (
    <>
      {post.imageUrl && (
        <div className="aspect-[16/9] w-full overflow-hidden bg-neutral-800">
          <img src={absolute(post.imageUrl)} alt={post.title} className="h-full w-full object-cover" />
        </div>
      )}
      {yt && (
        <div className="aspect-video w-full overflow-hidden bg-black">
          <iframe
            title={post.title}
            src={`https://www.youtube.com/embed/${yt}?rel=0`}
            width="100%" height="100%" frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      )}
      {video && (
        <video controls className="w-full bg-black" preload="metadata">
          <source src={video} />
        </video>
      )}
      {audio && (
        <div className="px-5 pt-4">
          <audio controls className="w-full" preload="metadata">
            <source src={audio} />
          </audio>
        </div>
      )}
    </>
  );
};

const emptyForm = { title: "", category: "Memory", imageUrl: "", audioUrl: "", videoUrl: "", description: "" };

const Community = () => {
  const { user } = useAuth();
  const { posts, loading, addPost, removePost } = usePosts();
  const { toast } = useToast();

  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(null); // 'image' | 'audio' | 'video' | null

  const uploadFile = async (kind, file) => {
    if (!file) return;
    const maxMB = 25;
    if (file.size > maxMB * 1024 * 1024) {
      toast({ title: "Too large", description: `Files must be under ${maxMB} MB.` });
      return;
    }
    setUploading(kind);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post("/uploads", fd, { headers: { "Content-Type": "multipart/form-data" } });
      const key = kind === "image" ? "imageUrl" : kind === "audio" ? "audioUrl" : "videoUrl";
      setForm((f) => ({ ...f, [key]: res.data.url }));
      toast({ title: "Uploaded", description: `${kind[0].toUpperCase() + kind.slice(1)} attached.` });
    } catch (err) {
      toast({ title: "Upload failed", description: err?.response?.data?.detail || "Please try a smaller file." });
    } finally {
      setUploading(null);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!form.title.trim() || !form.description.trim()) {
      toast({ title: "Missing fields", description: "Please add both a title and a description." });
      return;
    }
    setBusy(true);
    try {
      await addPost({
        title: form.title.trim(),
        category: form.category,
        imageUrl: form.imageUrl || null,
        audioUrl: form.audioUrl || null,
        videoUrl: form.videoUrl || null,
        description: form.description.trim(),
      });
      setForm(emptyForm);
      toast({ title: "Posted!", description: "Your contribution is now on the community wall." });
    } catch (err) {
      toast({
        title: "Could not post",
        description: err?.response?.data?.detail || "Please try again.",
      });
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id) => {
    try { await removePost(id); }
    catch (err) { toast({ title: "Delete failed", description: err?.response?.data?.detail || "Try again." }); }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="border-b border-neutral-800 pb-6">
        <div className="text-xs uppercase tracking-[0.22em] text-amber-400">Community Wall</div>
        <h1 className="mt-1 font-serif text-4xl text-neutral-100">Voices of the Tani Clan</h1>
        <p className="mt-2 max-w-2xl text-neutral-400">
          Share a memory, a festival photograph, an audio song or a video clip. Every contribution helps keep the Tani&ndash;Mising heritage alive.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/5 px-3 py-1 text-[11px] text-amber-300">
          <Shield className="h-3.5 w-3.5" />
          AI-moderated &mdash; explicit / 18+ content is automatically blocked.
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Posts feed */}
        <div className="space-y-6">
          {loading ? (
            <div className="rounded-lg border border-dashed border-neutral-800 py-16 text-center text-neutral-500">
              Loading community posts&hellip;
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-neutral-800 py-16 text-center text-neutral-500">
              Be the first to share a memory.
            </div>
          ) : (
            posts.map((p) => (
              <article key={p.id} className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/40">
                <MediaBlock post={p} />
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.22em] text-amber-400">{p.category}</span>
                    {user && (user.email === p.author.email || user.user_id === p.author.user_id) && (
                      <button onClick={() => onDelete(p.id)} className="text-neutral-500 hover:text-red-400" aria-label="delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <h3 className="mt-1 font-serif text-xl text-neutral-100">{p.title}</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-neutral-300">{p.description}</p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-neutral-500">
                    <img src={p.author.picture} alt={p.author.name} className="h-6 w-6 rounded-full border border-neutral-700" />
                    <span className="text-neutral-300">{p.author.name}</span>
                    <span>&middot; {new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </article>
            ))
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

                {/* Image */}
                <div className="rounded-md border border-neutral-800 bg-neutral-950 p-2">
                  <div className="flex items-center justify-between px-1 pb-1">
                    <span className="flex items-center gap-1.5 text-[11px] text-neutral-400"><ImageIcon className="h-3.5 w-3.5" /> Image</span>
                    <label className="cursor-pointer text-[11px] text-amber-400 hover:text-amber-300">
                      <input type="file" accept="image/*" hidden onChange={(e) => uploadFile("image", e.target.files?.[0])} />
                      {uploading === "image" ? "Uploading…" : "Upload file"}
                    </label>
                  </div>
                  <input
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="… or paste an image URL"
                    className="h-9 w-full rounded border border-neutral-800 bg-neutral-950 px-2 text-xs text-neutral-100 placeholder:text-neutral-500 focus:border-amber-500/50 focus:outline-none"
                  />
                </div>

                {/* Audio */}
                <div className="rounded-md border border-neutral-800 bg-neutral-950 p-2">
                  <div className="flex items-center justify-between px-1 pb-1">
                    <span className="flex items-center gap-1.5 text-[11px] text-neutral-400"><Music className="h-3.5 w-3.5" /> Audio</span>
                    <label className="cursor-pointer text-[11px] text-amber-400 hover:text-amber-300">
                      <input type="file" accept="audio/*" hidden onChange={(e) => uploadFile("audio", e.target.files?.[0])} />
                      {uploading === "audio" ? "Uploading…" : "Upload file"}
                    </label>
                  </div>
                  <input
                    value={form.audioUrl}
                    onChange={(e) => setForm({ ...form, audioUrl: e.target.value })}
                    placeholder="… or MP3 / SoundCloud direct URL"
                    className="h-9 w-full rounded border border-neutral-800 bg-neutral-950 px-2 text-xs text-neutral-100 placeholder:text-neutral-500 focus:border-amber-500/50 focus:outline-none"
                  />
                </div>

                {/* Video */}
                <div className="rounded-md border border-neutral-800 bg-neutral-950 p-2">
                  <div className="flex items-center justify-between px-1 pb-1">
                    <span className="flex items-center gap-1.5 text-[11px] text-neutral-400"><Video className="h-3.5 w-3.5" /> Video</span>
                    <label className="cursor-pointer text-[11px] text-amber-400 hover:text-amber-300">
                      <input type="file" accept="video/*" hidden onChange={(e) => uploadFile("video", e.target.files?.[0])} />
                      {uploading === "video" ? "Uploading…" : "Upload file"}
                    </label>
                  </div>
                  <input
                    value={form.videoUrl}
                    onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                    placeholder="… or YouTube link"
                    className="h-9 w-full rounded border border-neutral-800 bg-neutral-950 px-2 text-xs text-neutral-100 placeholder:text-neutral-500 focus:border-amber-500/50 focus:outline-none"
                  />
                </div>

                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={5}
                  placeholder="Share the story or memory in your own words..."
                  className="w-full rounded-md border border-neutral-800 bg-neutral-950 p-3 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-amber-500/50 focus:outline-none"
                />

                <Button type="submit" disabled={busy} className="w-full bg-amber-500 text-neutral-900 hover:bg-amber-400 disabled:opacity-70">
                  {busy ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting…</>) : "Publish to Community"}
                </Button>
                <p className="text-[11px] leading-snug text-neutral-500">
                  Media files up to 25 MB. All posts are AI-moderated for explicit content and hate speech before publishing.
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
