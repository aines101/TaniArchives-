import React from "react";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";

export const SectionHeader = ({ title, link, linkLabel }) => (
  <div className="mb-6 flex items-end justify-between border-b border-neutral-800 pb-3">
    <h2 className="font-serif text-2xl text-neutral-100 md:text-3xl">{title}</h2>
    {link && (
      <Link to={link} className="text-xs uppercase tracking-[0.2em] text-amber-400 hover:text-amber-300">
        {linkLabel || "View all \u2192"}
      </Link>
    )}
  </div>
);

export const CategoryTag = ({ children }) => (
  <span className="text-[10px] uppercase tracking-[0.22em] text-amber-400">{children}</span>
);

export const ArticleCard = ({ item, to }) => (
  <Link
    to={to}
    className="group flex flex-col overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/40 transition-all hover:-translate-y-0.5 hover:border-amber-500/40 hover:bg-neutral-900"
  >
    {item.image && (
      <div className="aspect-[16/10] w-full overflow-hidden bg-neutral-800">
        <img
          src={item.image}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
    )}
    <div className="flex flex-1 flex-col gap-2 p-4">
      <CategoryTag>{item.category || item.tag || "article"}</CategoryTag>
      <h3 className="font-serif text-lg leading-snug text-neutral-100 group-hover:text-amber-200">
        {item.title}
      </h3>
      <p className="text-sm text-neutral-400">{item.excerpt || item.desc}</p>
      <span className="mt-auto pt-3 text-xs text-amber-400/80">Read →</span>
    </div>
  </Link>
);

export const ToolCard = ({ item, Icon }) => (
  <div className="group flex items-start gap-4 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4 transition-colors hover:border-amber-500/40 hover:bg-neutral-900">
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-amber-500/20 bg-amber-500/5 text-amber-300">
      {Icon ? <Icon className="h-5 w-5" /> : null}
    </div>
    <div>
      <div className="font-serif text-base text-neutral-100">{item.title}</div>
      <div className="text-sm text-neutral-400">{item.desc}</div>
    </div>
  </div>
);

export const VideoCard = ({ item, onPlay }) => (
  <button
    onClick={() => onPlay(item)}
    className="group relative flex flex-col overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/40 text-left transition-all hover:-translate-y-0.5 hover:border-amber-500/40"
  >
    <div className="relative aspect-video w-full overflow-hidden bg-neutral-800">
      <img
        src={item.thumbnail}
        alt={item.title}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/90 text-neutral-900">
          <Play className="h-6 w-6" />
        </div>
      </div>
    </div>
    <div className="p-4">
      <CategoryTag>{item.category}</CategoryTag>
      <h3 className="mt-1 font-serif text-base text-neutral-100 group-hover:text-amber-200">{item.title}</h3>
      <p className="mt-1 text-sm text-neutral-400">{item.desc}</p>
    </div>
  </button>
);
