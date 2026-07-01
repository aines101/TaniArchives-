import React from "react";
import { Link, useParams } from "react-router-dom";
import { manuscripts, folktales } from "../mock";
import { ArticleCard, CategoryTag, SectionHeader } from "../components/Cards";

export const Manuscripts = () => (
  <div className="mx-auto max-w-6xl px-4 py-12">
    <div className="border-b border-neutral-800 pb-6">
      <div className="text-xs uppercase tracking-[0.22em] text-amber-400">Oral Texts</div>
      <h1 className="mt-1 font-serif text-4xl text-neutral-100">Mising & Tani Oral Traditions</h1>
      <p className="mt-2 max-w-2xl text-neutral-400">
        Chants, epics and lyric traditions recited by Mibù priests and village singers.
      </p>
    </div>
    <div className="mt-8 grid gap-6 md:grid-cols-3">
      {manuscripts.map((m) => (
        <ArticleCard
          key={m.id}
          item={{ ...m, category: m.status, excerpt: m.desc }}
          to={`/manuscript/${m.id}`}
        />
      ))}
    </div>
  </div>
);

export const ManuscriptDetail = () => {
  const { id } = useParams();
  const item = manuscripts.find((m) => m.id === id) || manuscripts[0];
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link to="/manuscripts" className="text-xs uppercase tracking-[0.22em] text-amber-400 hover:text-amber-300">
        ← Back to Oral Texts
      </Link>
      <CategoryTag>{item.status}</CategoryTag>
      <h1 className="mt-2 font-serif text-4xl text-neutral-100">{item.title}</h1>
      <div className="mt-6 overflow-hidden rounded-lg border border-neutral-800">
        <img src={item.image} alt={item.title} className="h-auto w-full object-cover" />
      </div>
      <div className="mt-8 space-y-4 text-neutral-300">
        <p>{item.desc}</p>
        <p>
          This text is preserved primarily through oral transmission. The
          transcription work is ongoing, in collaboration with village elders
          and Mibù priests of Dhemaji, Majuli and Lakhimpur districts of Assam.
        </p>
        <p>
          If you would like to contribute a recording, a transcription or a
          correction, please write to the archive.
        </p>
      </div>
    </div>
  );
};

export const Folktales = () => (
  <div className="mx-auto max-w-6xl px-4 py-12">
    <div className="border-b border-neutral-800 pb-6">
      <div className="text-xs uppercase tracking-[0.22em] text-amber-400">Folktales</div>
      <h1 className="mt-1 font-serif text-4xl text-neutral-100">Tani Folktales</h1>
      <p className="mt-2 max-w-2xl text-neutral-400">
        Stories told around the hearth of the Chang-Ghar — of rivers, spirits, animals and ancestors.
      </p>
    </div>
    <div className="mt-8 grid gap-5 md:grid-cols-3">
      {folktales.map((f) => (
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
  </div>
);

export const FolktaleDetail = () => {
  const { id } = useParams();
  const item = folktales.find((f) => f.id === id) || folktales[0];
  const related = folktales.filter((f) => f.id !== item.id).slice(0, 3);
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link to="/folktales" className="text-xs uppercase tracking-[0.22em] text-amber-400 hover:text-amber-300">
        ← Back to Folktales
      </Link>
      <CategoryTag>{item.tag}</CategoryTag>
      <h1 className="mt-2 font-serif text-4xl text-neutral-100">{item.title}</h1>
      <div className="mt-8 space-y-4 text-neutral-300">
        <p>{item.desc}</p>
        <p>
          In the times of the ancestors, when Donyi and Polo still walked upon
          the earth, the Tani people lived in a great village at the source of
          the Siang. The story goes on to remind us of the debts we owe to
          rivers, forests and the small creatures of the earth.
        </p>
        <p>
          The elders end this tale with the same words they always use: “Si:ne
          agom, si:ne Tani” — <em>this is the word, this is the Tani</em>.
        </p>
      </div>
      <div className="mt-16 border-t border-neutral-800 pt-10">
        <SectionHeader title="More folktales" />
        <div className="grid gap-5 md:grid-cols-3">
          {related.map((r) => (
            <Link
              key={r.id}
              to={`/folktale/${r.id}`}
              className="group rounded-lg border border-neutral-800 bg-neutral-900/40 p-5 transition-colors hover:border-amber-500/40"
            >
              <CategoryTag>{r.tag}</CategoryTag>
              <h3 className="mt-2 font-serif text-base text-neutral-100 group-hover:text-amber-200">{r.title}</h3>
              <p className="mt-1 text-sm text-neutral-400">{r.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
