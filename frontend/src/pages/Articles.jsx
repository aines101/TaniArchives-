import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { latestArticles, featuredArticles, heroFeatured } from "../mock";
import { ArticleCard, CategoryTag, SectionHeader } from "../components/Cards";

const allArticles = () => {
  const list = [heroFeatured, ...featuredArticles, ...latestArticles];
  // dedupe by id
  const seen = new Set();
  return list.filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });
};

const Articles = () => {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const all = allArticles();
    if (!q) return all;
    const s = q.toLowerCase();
    return all.filter(
      (a) => a.title.toLowerCase().includes(s) || (a.excerpt || "").toLowerCase().includes(s)
    );
  }, [q]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-col gap-4 border-b border-neutral-800 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-amber-400">Archive</div>
          <h1 className="mt-1 font-serif text-4xl text-neutral-100">All Articles</h1>
          <p className="mt-2 max-w-xl text-neutral-400">
            Essays, notes and field-observations from and about the Tani clan.
          </p>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search articles..."
          className="h-10 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-amber-500/50 focus:outline-none md:w-64"
        />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {list.map((a) => (
          <ArticleCard key={a.id} item={a} to={`/article/${a.id}`} />
        ))}
        {list.length === 0 && (
          <div className="col-span-full py-16 text-center text-neutral-500">No matching articles.</div>
        )}
      </div>
    </div>
  );
};

export const ArticleDetail = () => {
  const { id } = useParams();
  const all = allArticles();
  const article = all.find((a) => a.id === id) || all[0];
  const related = all.filter((a) => a.id !== article.id).slice(0, 3);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link to="/articles" className="text-xs uppercase tracking-[0.22em] text-amber-400 hover:text-amber-300">
        ← Back to Articles
      </Link>
      <CategoryTag>{article.category}</CategoryTag>
      <h1 className="mt-2 font-serif text-4xl leading-tight text-neutral-100">{article.title}</h1>
      <p className="mt-3 text-neutral-400">{article.excerpt}</p>
      {article.image && (
        <div className="mt-8 overflow-hidden rounded-lg border border-neutral-800">
          <img src={article.image} alt={article.title} className="h-auto w-full object-cover" />
        </div>
      )}
      <article className="prose prose-invert mt-10 max-w-none text-neutral-300">
        <p>
          The Mising, also known as Miri in older colonial records, are a Tani
          people who migrated from the eastern Himalayan foothills down to the
          plains of the Brahmaputra valley several centuries ago. Their oral
          tradition places their origin near the Siang river in present‑day
          Arunachal Pradesh.
        </p>
        <p>
          The article you are reading is a working note. Like the rest of Tani
          Archive, it will be edited, corrected and expanded as more elders,
          scholars and community members contribute their voice.
        </p>
        <h3 className="font-serif text-neutral-100">Notes from the field</h3>
        <p>
          Every festival, phrase or clan name on this archive has been checked
          against at least one printed source and one spoken source. Where we
          are unsure, we mark the entry as <em>partial</em> or <em>ongoing</em>.
        </p>
        <blockquote className="border-l-4 border-amber-500/60 pl-4 text-neutral-200">
          “Agóm gu:mi:ng si‑lo, Tani po:ló gu:mi:ng si‑lo.” — If the word is
          kept, the Tani people are kept.
        </blockquote>
      </article>

      <div className="mt-16 border-t border-neutral-800 pt-10">
        <SectionHeader title="Continue reading" />
        <div className="grid gap-6 md:grid-cols-3">
          {related.map((r) => (
            <ArticleCard key={r.id} item={r} to={`/article/${r.id}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Articles;
