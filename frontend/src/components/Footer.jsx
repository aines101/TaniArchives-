import React from "react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="mt-24 border-t border-neutral-800 bg-neutral-950 text-neutral-400">
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-400/30 bg-gradient-to-br from-amber-500/20 to-red-700/10">
            <span className="font-serif text-lg text-amber-300">☀</span>
          </div>
          <span className="font-serif text-lg text-neutral-100">Tani Archive</span>
        </div>
        <p className="mt-4 text-sm leading-relaxed">
          An independent archive documenting the language, belief and memory
          of the Tani clan — Mising, Adi, Nyishi, Apatani and their kin — of
          Northeast India.
        </p>
      </div>

      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Explore</div>
        <ul className="mt-4 space-y-2 text-sm">
          <li><Link to="/articles" className="hover:text-amber-300">Articles</Link></li>
          <li><Link to="/manuscripts" className="hover:text-amber-300">Oral Texts</Link></li>
          <li><Link to="/folktales" className="hover:text-amber-300">Folktales</Link></li>
          <li><Link to="/videos" className="hover:text-amber-300">Videos</Link></li>
        </ul>
      </div>
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Language</div>
        <ul className="mt-4 space-y-2 text-sm">
          <li><Link to="/tools/alphabet" className="hover:text-amber-300">Alphabet</Link></li>
          <li><Link to="/tools/dictionary" className="hover:text-amber-300">Dictionary</Link></li>
          <li><Link to="/tools/phrases" className="hover:text-amber-300">Phrases</Link></li>
          <li><Link to="/tools/name-generator" className="hover:text-amber-300">Name Generator</Link></li>
        </ul>
      </div>
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Community</div>
        <ul className="mt-4 space-y-2 text-sm">
          <li><Link to="/community" className="hover:text-amber-300">Share a memory</Link></li>
          <li><Link to="/about" className="hover:text-amber-300">About</Link></li>
          <li><a href="#" className="hover:text-amber-300">Contribute</a></li>
          <li><a href="#" className="hover:text-amber-300">Contact</a></li>
        </ul>
      </div>
    </div>
    <div className="border-t border-neutral-900">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-4 py-6 text-xs text-neutral-500 md:flex-row md:items-center">
        <span>© {new Date().getFullYear()} Tani Archive — Donyi–Polo bless the keepers of memory.</span>
        <span>Made with care for the Tani clan of Northeast India</span>
      </div>
    </div>
  </footer>
);

export default Footer;
