import React, { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { phrases, clans, learningTools } from "../mock";
import { RefreshCw } from "lucide-react";

const missingLetters = [
  { letter: "A a", ipa: "/a/", ex: "An\u00e9 \u2014 mother" },
  { letter: "\u00c1 \u00e1", ipa: "/ɐ/", ex: "Ap\u00f3ng \u2014 rice beer" },
  { letter: "E e", ipa: "/e/", ex: "Eg\u00e9 \u2014 wraparound cloth" },
  { letter: "I i", ipa: "/i/", ex: "Ig\u00fc \u2014 water" },
  { letter: "O o", ipa: "/o/", ex: "Or\u00fang \u2014 fire" },
  { letter: "O: o:", ipa: "/ɔː/", ex: "Do:ley \u2014 clan name" },
  { letter: "U u", ipa: "/u/", ex: "Ur\u00e9 \u2014 basket" },
  { letter: "\u00dc \u00fc", ipa: "/ɨ/", ex: "G\u00fcmr\u00e1g \u2014 dance" },
  { letter: "K k", ipa: "/k/", ex: "K\u00e1ben \u2014 saying" },
  { letter: "G g", ipa: "/g/", ex: "G\u00e9ro \u2014 shawl" },
  { letter: "Ng ng", ipa: "/ŋ/", ex: "Ng\u00f3 \u2014 I" },
  { letter: "M m", ipa: "/m/", ex: "Mib\u00f9 \u2014 priest" },
];

const dictionary = [
  { mising: "An\u00e9", en: "mother", pos: "noun" },
  { mising: "Ab\u00fc", en: "father", pos: "noun" },
  { mising: "Ig\u00fc", en: "water", pos: "noun" },
  { mising: "Or\u00fang", en: "fire", pos: "noun" },
  { mising: "Do:ying", en: "paddy/rice", pos: "noun" },
  { mising: "Ap\u00f3ng", en: "rice beer", pos: "noun" },
  { mising: "Eg\u00e9", en: "wraparound cloth", pos: "noun" },
  { mising: "G\u00e9ro", en: "shawl", pos: "noun" },
  { mising: "Mib\u00f9", en: "priest / shaman", pos: "noun" },
  { mising: "Donyi", en: "the Sun", pos: "noun" },
  { mising: "Polo", en: "the Moon", pos: "noun" },
  { mising: "Ka:si", en: "come", pos: "verb" },
  { mising: "Cham\u00e9", en: "go", pos: "verb" },
  { mising: "Ng\u00f3", en: "I / me", pos: "pronoun" },
  { mising: "No", en: "you", pos: "pronoun" },
];

const nameParts = {
  male: ["Tomi", "Jom", "Miting", "Dambok", "Kaling", "Tayeng", "Padi", "Rina"],
  female: ["Yumi", "Rimi", "Junmoni", "Aben", "Nyame", "Miri", "Dumi", "Kabang"],
  clan: clans.map((c) => c.name),
};

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const PageShell = ({ title, kicker, children }) => (
  <div className="mx-auto max-w-5xl px-4 py-12">
    <div className="border-b border-neutral-800 pb-6">
      <div className="text-xs uppercase tracking-[0.22em] text-amber-400">{kicker}</div>
      <h1 className="mt-1 font-serif text-4xl text-neutral-100">{title}</h1>
    </div>
    <div className="mt-8">{children}</div>
  </div>
);

const AlphabetTool = () => (
  <PageShell title="Mising Alphabet" kicker="Language Tool">
    <p className="mb-6 max-w-2xl text-neutral-400">
      Mising is written today using a Roman–based orthography. Below is a reference chart with IPA and example words.
    </p>
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
      {missingLetters.map((l) => (
        <div key={l.letter} className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-2xl text-neutral-100">{l.letter}</span>
            <span className="text-xs text-amber-400">{l.ipa}</span>
          </div>
          <div className="mt-1 text-sm text-neutral-400">{l.ex}</div>
        </div>
      ))}
    </div>
  </PageShell>
);

const DictionaryTool = () => {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    if (!q) return dictionary;
    const s = q.toLowerCase();
    return dictionary.filter(
      (d) => d.mising.toLowerCase().includes(s) || d.en.toLowerCase().includes(s)
    );
  }, [q]);
  return (
    <PageShell title="Mising Dictionary" kicker="Language Tool">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search Mising or English word..."
        className="mb-6 h-10 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-amber-500/50 focus:outline-none md:w-96"
      />
      <div className="overflow-hidden rounded-lg border border-neutral-800">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900 text-left text-xs uppercase tracking-widest text-neutral-400">
            <tr>
              <th className="px-4 py-3">Mising</th>
              <th className="px-4 py-3">English</th>
              <th className="px-4 py-3">Part of Speech</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {list.map((row) => (
              <tr key={row.mising} className="hover:bg-neutral-900/50">
                <td className="px-4 py-3 font-serif text-neutral-100">{row.mising}</td>
                <td className="px-4 py-3 text-neutral-300">{row.en}</td>
                <td className="px-4 py-3 text-neutral-500">{row.pos}</td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-neutral-500">No entries found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
};

const PhrasesTool = () => (
  <PageShell title="Everyday Mising Phrases" kicker="Language Tool">
    <div className="grid gap-4 md:grid-cols-2">
      {phrases.map((p, i) => (
        <div key={i} className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
          <div className="font-serif text-lg text-neutral-100">{p.mising}</div>
          <div className="mt-1 text-sm text-neutral-400">{p.en}</div>
        </div>
      ))}
    </div>
  </PageShell>
);

const NameGeneratorTool = () => {
  const [gender, setGender] = useState("male");
  const [name, setName] = useState("Tomi Pegu");
  const generate = () => {
    const first = pickRandom(gender === "male" ? nameParts.male : nameParts.female);
    const clan = pickRandom(nameParts.clan);
    setName(`${first} ${clan}`);
  };
  return (
    <PageShell title="Tani Name Generator" kicker="Language Tool">
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-8 text-center">
        <div className="text-xs uppercase tracking-[0.22em] text-amber-400">Your Tani name</div>
        <div className="mt-2 font-serif text-4xl text-neutral-100">{name}</div>
        <div className="mt-6 flex items-center justify-center gap-3">
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="h-10 rounded-md border border-neutral-800 bg-neutral-950 px-3 text-sm text-neutral-100 focus:border-amber-500/50 focus:outline-none"
          >
            <option value="male">Masculine</option>
            <option value="female">Feminine</option>
          </select>
          <button onClick={generate} className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-amber-400">
            <RefreshCw className="h-4 w-4" /> Generate
          </button>
        </div>
      </div>
      <div className="mt-8">
        <h3 className="font-serif text-xl text-neutral-100">Common Tani clan names</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {clans.map((c) => (
            <div key={c.name} className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
              <div className="font-serif text-neutral-100">{c.name}</div>
              <div className="text-sm text-neutral-400">{c.meaning}</div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
};

const ComingSoonTool = ({ tool }) => (
  <PageShell title={tool.title} kicker="Language Tool">
    <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-900/30 p-12 text-center">
      <div className="mx-auto mb-3 h-14 w-14 rounded-full border border-amber-500/30 bg-amber-500/10" />
      <h3 className="font-serif text-2xl text-neutral-100">{tool.title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-neutral-400">{tool.desc}</p>
      <p className="mt-6 text-xs text-neutral-500">This tool is under active development. Check back soon.</p>
      <Link to="/" className="mt-6 inline-block text-sm text-amber-400 hover:text-amber-300">← Back to home</Link>
    </div>
  </PageShell>
);

const Tools = () => {
  const { toolId } = useParams();
  const tool = learningTools.find((t) => t.id === toolId);
  if (!tool) return <ComingSoonTool tool={{ title: "Unknown tool", desc: "" }} />;
  if (toolId === "alphabet") return <AlphabetTool />;
  if (toolId === "dictionary") return <DictionaryTool />;
  if (toolId === "phrases") return <PhrasesTool />;
  if (toolId === "names" || toolId === "name-generator") return <NameGeneratorTool />;
  return <ComingSoonTool tool={tool} />;
};

export default Tools;
