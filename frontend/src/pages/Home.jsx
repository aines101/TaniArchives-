import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  heroFeatured,
  featuredArticles,
  learningTools,
  latestArticles,
  manuscripts,
  folktales,
  videos,
  taniTribes,
} from "../mock";
import {
  SectionHeader,
  ArticleCard,
  ToolCard,
  CategoryTag,
  VideoCard,
} from "../components/Cards";
import {
  BookA,
  Languages,
  BookOpen,
  Keyboard,
  MessagesSquare,
  Lightbulb,
  Music2,
  SearchCode,
  Feather,
  ArrowRight,
} from "lucide-react";
import YouTubePlayer from "../components/YouTubePlayer";

const iconMap = {
  BookA, Languages, BookOpen, Keyboard, MessagesSquare, Lightbulb, Music2, SearchCode, Feather,
};

const Home = () => {
  const [active, setActive] = useState(null);

  return (
    <div>
      {/* Notice bar */}
      <div className="border-b border-neutral-800 bg-amber-500/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 text-xs text-amber-200">
          <div>
            <span className="font-semibold text-amber-300">A living archive.</span>{" "}
            Help preserve the voices of the Tani clan — contribute a memory, a song, or a story.
          </div>
          <Link to="/community" className="rounded-md border border-amber-400/40 px-3 py-1 text-amber-200 hover:bg-amber-500/10">
            Share
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-neutral-800">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.10),transparent_55%)]" />
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <h1 className="max-w-3xl font-serif text-4xl leading-tight text-neutral-50 md:text-5xl">
            Preserving Tani&ndash;Mising{" "}
            <span className="text-amber-300">Language, Belief &amp; Memory</span>
          </h1>
          <p className="mt-4 max-w-2xl text-neutral-400">
            Articles on Mising rituals, Tani culture, linguistics, ancestral traditions,
            and the historical continuity of the Tani clan of Northeast India.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 md:grid-cols-2 md:p-6">
            <div className="aspect-[16/10] w-full overflow-hidden rounded-lg bg-neutral-800">
              <img src={heroFeatured.image} alt={heroFeatured.title} className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col justify-center">
              <CategoryTag>{heroFeatured.category}</CategoryTag>
              <h2 className="mt-2 font-serif text-2xl leading-snug text-neutral-100 md:text-3xl">
                {heroFeatured.title}
              </h2>
              <p className="mt-3 text-neutral-400">{heroFeatured.excerpt}</p>
              <Link to={`/article/${heroFeatured.id}`} className="mt-6 inline-flex items-center gap-1 text-amber-400 hover:text-amber-300">
                Read article <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHeader title="Featured Articles" link="/articles" />
        <div className="grid gap-5 md:grid-cols-3">
          {featuredArticles.map((a) => (
            <Link
              key={a.id}
              to={`/article/${a.id}`}
              className="group rounded-lg border border-neutral-800 bg-neutral-900/40 p-5 transition-colors hover:border-amber-500/40 hover:bg-neutral-900"
            >
              <CategoryTag>{a.category}</CategoryTag>
              <h3 className="mt-2 font-serif text-lg text-neutral-100 group-hover:text-amber-200">{a.title}</h3>
              <p className="mt-2 text-sm text-neutral-400">{a.excerpt}</p>
              <span className="mt-4 inline-block text-xs text-amber-400">Read →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Tani Clans */}
      <section className="mx-auto max-w-6xl px-4 pb-8">
        <SectionHeader title="The Tani Clan" />
        <p className="-mt-2 mb-6 max-w-2xl text-sm text-neutral-400">
          The Tani people descend from a common ancestor, Abo&#8209;Tani. Today
          they form six major clans across Assam and Arunachal Pradesh, each
          with its own dialect, festival calendar and material culture.
        </p>
        <div className="grid gap-5 md:grid-cols-3">
          {taniTribes.map((t) => (
            <div key={t.id} className="group overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/40 transition-colors hover:border-amber-500/40">
              <div className="aspect-[16/10] w-full overflow-hidden bg-neutral-800">
                <img src={t.image} alt={`${t.name} tribe of Northeast India`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              </div>
              <div className="p-4">
                <div className="font-serif text-xl text-neutral-100">{t.name}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-amber-400/80">{t.region}</div>
                <p className="mt-2 text-sm text-neutral-400">{t.marker}</p>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* Learning & Tools */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <SectionHeader title="Learning & Tools" />
        <div className="grid gap-4 md:grid-cols-3">
          {learningTools.map((t) => (
            <Link key={t.id} to={`/tools/${t.id}`}>
              <ToolCard item={t} Icon={iconMap[t.icon]} />
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Articles */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHeader title="Latest Articles" link="/articles" />
        <div className="grid gap-6 md:grid-cols-3">
          {latestArticles.map((a) => (
            <ArticleCard key={a.id} item={a} to={`/article/${a.id}`} />
          ))}
        </div>
      </section>

      {/* Oral Texts / Manuscripts */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <SectionHeader title="Mising Oral Texts" link="/manuscripts" />
        <div className="grid gap-5 md:grid-cols-3">
          {manuscripts.slice(0, 3).map((m) => (
            <ArticleCard key={m.id} item={{ ...m, category: m.status }} to={`/manuscript/${m.id}`} />
          ))}
        </div>
      </section>

      {/* Folktales */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHeader title="Tani Folktales" link="/folktales" />
        <div className="grid gap-5 md:grid-cols-3">
          {folktales.slice(0, 6).map((f) => (
            <Link
              key={f.id}
              to={`/folktale/${f.id}`}
              className="group rounded-lg border border-neutral-800 bg-neutral-900/40 p-5 transition-colors hover:border-amber-500/40 hover:bg-neutral-900"
            >
              <CategoryTag>{f.tag}</CategoryTag>
              <h3 className="mt-2 font-serif text-lg text-neutral-100 group-hover:text-amber-200">{f.title}</h3>
              <p className="mt-2 text-sm text-neutral-400">{f.desc}</p>
              <span className="mt-4 inline-block text-xs text-amber-400">Read →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Videos */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <SectionHeader title="Videos & Documentaries" link="/videos" />
        <div className="grid gap-5 md:grid-cols-3">
          {videos.slice(0, 3).map((v) => (
            <VideoCard key={v.id} item={v} onPlay={setActive} />
          ))}
        </div>
      </section>

      {/* Why exists */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h2 className="font-serif text-3xl text-neutral-100">Why This Archive Exists</h2>
        <p className="mx-auto mt-6 max-w-2xl text-neutral-400">
          Tani Archive is an independent effort to document language, belief
          systems, oral traditions and historical memory of the Tani clan —
          Mising, Adi, Nyishi, Apatani and their kin — across Northeast India.
        </p>
        <p className="mx-auto mt-3 max-w-2xl text-neutral-400">
          This platform is not driven by trends or social media, but by
          continuity — preserving knowledge that was traditionally passed as
          well as lost.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/community" className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-amber-400">
            Contribute a memory
          </Link>
          <Link to="/about" className="rounded-md border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:border-amber-500/50 hover:text-amber-300">
            About the archive
          </Link>
        </div>
      </section>

      <YouTubePlayer video={active} open={!!active} onClose={() => setActive(null)} />
    </div>
  );
};

export default Home;
