import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Search, Menu, X, ChevronDown, LogIn, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const navLink = ({ isActive }) =>
  `text-sm tracking-wide transition-colors ${
    isActive ? "text-amber-400" : "text-neutral-300 hover:text-amber-300"
  }`;

const Header = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/85 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-400/30 bg-gradient-to-br from-amber-500/20 to-red-700/10">
            <span className="font-serif text-lg text-amber-300">☀</span>
          </div>
          <div className="leading-tight">
            <div className="font-serif text-lg text-neutral-100">Tani Archive</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
              Mising · Adi · Nyishi · Apatani
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex whitespace-nowrap">
          <NavLink to="/articles" className={navLink}>Articles</NavLink>
          <NavLink to="/manuscripts" className={navLink}>Oral Texts</NavLink>
          <NavLink to="/folktales" className={navLink}>Folktales</NavLink>
          <NavLink to="/videos" className={navLink}>Videos</NavLink>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm text-neutral-300 hover:text-amber-300">
              Language <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="border-neutral-800 bg-neutral-950 text-neutral-200">
              <DropdownMenuItem asChild><Link to="/tools/alphabet">Alphabet</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/tools/dictionary">Dictionary</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/tools/phrases">Phrases</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/tools/name-generator">Name Generator</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <NavLink to="/community" className={navLink}>Community</NavLink>
          <NavLink to="/about" className={navLink}>About</NavLink>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <div className="relative hidden lg:block">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              placeholder="Search..."
              className="h-9 w-44 rounded-md border border-neutral-800 bg-neutral-900 pl-8 pr-3 text-sm text-neutral-200 placeholder:text-neutral-500 focus:border-amber-500/50 focus:outline-none"
            />
          </div>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2">
                <img src={user.picture} alt={user.name} className="h-8 w-8 rounded-full border border-neutral-700" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="border-neutral-800 bg-neutral-950 text-neutral-200">
                <DropdownMenuItem asChild><Link to="/community">My Community</Link></DropdownMenuItem>
                <DropdownMenuItem onClick={logout}><LogOut className="mr-2 h-4 w-4" /> Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline" size="sm" className="border-amber-500/40 bg-transparent text-amber-300 hover:bg-amber-500/10 hover:text-amber-200">
              <Link to="/login"><LogIn className="mr-2 h-4 w-4" /> Login</Link>
            </Button>
          )}
        </div>

        <button className="md:hidden text-neutral-200" onClick={() => setOpen(!open)} aria-label="menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-neutral-800 bg-neutral-950 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 text-sm text-neutral-300">
            <Link to="/articles" onClick={() => setOpen(false)}>Articles</Link>
            <Link to="/manuscripts" onClick={() => setOpen(false)}>Oral Texts</Link>
            <Link to="/folktales" onClick={() => setOpen(false)}>Folktales</Link>
            <Link to="/videos" onClick={() => setOpen(false)}>Videos</Link>
            <Link to="/tools/dictionary" onClick={() => setOpen(false)}>Language Tools</Link>
            <Link to="/community" onClick={() => setOpen(false)}>Community</Link>
            <Link to="/about" onClick={() => setOpen(false)}>About</Link>
            {user ? (
              <button onClick={() => { logout(); setOpen(false); }} className="text-left text-amber-300">Logout</button>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="text-amber-300">Login</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
