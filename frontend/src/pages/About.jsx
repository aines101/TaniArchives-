import React from "react";
import { Link } from "react-router-dom";

const About = () => (
  <div className="mx-auto max-w-3xl px-4 py-16">
    <div className="text-xs uppercase tracking-[0.22em] text-amber-400">About</div>
    <h1 className="mt-1 font-serif text-4xl text-neutral-100">About Tani Archive</h1>
    <div className="mt-8 space-y-5 text-neutral-300">
      <p>
        Tani Archive is an independent, non‑commercial documentation project
        for the Tani clan of Northeast India — the Mising, Adi, Nyishi,
        Apatani, Galo, Tagin and their kin.
      </p>
      <p>
        The archive collects articles on language, ritual, oral literature,
        material culture and history. It also invites the community to add
        their own memories through the Community Wall.
      </p>
      <h2 className="font-serif text-2xl text-neutral-100">The Tani people</h2>
      <p>
        The Tani people trace themselves back to a common ancestor, Abo‑Tani,
        the ‘first man’. Their communities span the Brahmaputra valley of
        Assam and the central belt of Arunachal Pradesh. Though divided by
        modern administrative borders, they share a common origin myth, a
        shared vocabulary and closely related belief systems centred on Donyi
        (Sun) and Polo (Moon).
      </p>
      <h2 className="font-serif text-2xl text-neutral-100">How this archive is built</h2>
      <p>
        Every entry begins as a working note. Elders, researchers and
        community members are then invited to review and refine it. Where a
        source is uncertain, we mark the entry as <em>partial</em> or
        <em> ongoing</em>.
      </p>
      <h2 className="font-serif text-2xl text-neutral-100">Contribute</h2>
      <p>
        You can contribute by sharing a memory on the <Link to="/community" className="text-amber-300 hover:text-amber-200">Community Wall</Link>,
        submitting a folktale, or writing to the maintainers with a correction.
      </p>
      <p className="text-neutral-500">
        Note: The site currently runs on mocked data stored in the browser. A
        MongoDB‑backed version is being prepared.
      </p>
    </div>
  </div>
);

export default About;
