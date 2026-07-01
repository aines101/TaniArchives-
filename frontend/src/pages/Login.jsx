import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-8">
        <div className="text-xs uppercase tracking-[0.22em] text-amber-400">Sign in</div>
        <h1 className="mt-2 font-serif text-3xl text-neutral-100">Join the Tani Archive</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Sign in with your Gmail account to contribute memories, songs and stories to the community wall.
        </p>

        <button
          onClick={signInWithGoogle}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-md border border-neutral-700 bg-white px-4 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-100"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.3 6.5 29.4 4.5 24 4.5 12.7 4.5 3.5 13.7 3.5 25S12.7 45.5 24 45.5 44.5 36.3 44.5 25c0-1.5-.2-3-.9-4.5z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.7 18.9 12.5 24 12.5c3 0 5.8 1.1 7.9 3l5.7-5.7C34.3 6.5 29.4 4.5 24 4.5c-7.7 0-14.4 4.4-17.7 10.2z" />
            <path fill="#4CAF50" d="M24 45.5c5.3 0 10.1-2 13.7-5.3l-6.3-5.3c-2 1.4-4.5 2.3-7.4 2.3-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 41.1 16.2 45.5 24 45.5z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4 5.6l6.3 5.3c-.4.4 6.9-5 6.9-13.9 0-1.5-.2-3-.9-4.5z" />
          </svg>
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-neutral-800" />
          <span className="text-[10px] uppercase tracking-widest text-neutral-500">Secured by Emergent</span>
          <div className="h-px flex-1 bg-neutral-800" />
        </div>

        <p className="text-xs leading-relaxed text-neutral-500">
          By signing in you agree to help preserve the language, belief and memory
          of the Tani clan. Your data is stored securely and never shared.
        </p>
        <p className="mt-4 text-center text-xs text-neutral-500">
          <Link to="/" className="hover:text-amber-300">&larr; Back to home</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
