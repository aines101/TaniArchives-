import React, { useState } from "react";
import { videos } from "../mock";
import { VideoCard, SectionHeader } from "../components/Cards";
import YouTubePlayer from "../components/YouTubePlayer";

const Videos = () => {
  const [active, setActive] = useState(null);
  const [filter, setFilter] = useState("All");
  const categories = ["All", ...Array.from(new Set(videos.map((v) => v.category)))];
  const list = filter === "All" ? videos : videos.filter((v) => v.category === filter);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="border-b border-neutral-800 pb-6">
        <div className="text-xs uppercase tracking-[0.22em] text-amber-400">Videos</div>
        <h1 className="mt-1 font-serif text-4xl text-neutral-100">Videos & Documentaries</h1>
        <p className="mt-2 max-w-2xl text-neutral-400">
          Field recordings, community documentaries and music of the Tani clan. Click any card to open the in-app player.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              filter === c
                ? "border-amber-500/60 bg-amber-500/10 text-amber-300"
                : "border-neutral-800 text-neutral-400 hover:border-amber-500/40 hover:text-amber-200"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {list.map((v) => (
          <VideoCard key={v.id} item={v} onPlay={setActive} />
        ))}
      </div>

      <YouTubePlayer video={active} open={!!active} onClose={() => setActive(null)} />
    </div>
  );
};

export default Videos;
