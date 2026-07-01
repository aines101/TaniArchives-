import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { exchangeSession } = useAuth();
  const processed = useRef(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;
    const hash = window.location.hash || "";
    const match = hash.match(/session_id=([^&]+)/);
    if (!match) {
      navigate("/login");
      return;
    }
    const sessionId = decodeURIComponent(match[1]);
    (async () => {
      try {
        await exchangeSession(sessionId);
        // Clear hash and go to community
        window.history.replaceState(null, "", window.location.pathname);
        navigate("/community", { replace: true });
      } catch (e) {
        setError("Sign-in failed. Please try again.");
        setTimeout(() => navigate("/login", { replace: true }), 1500);
      }
    })();
  }, [exchangeSession, navigate]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-12 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      <p className="mt-4 text-sm text-neutral-400">
        {error ? error : "Signing you in\u2026"}
      </p>
    </div>
  );
};

export default AuthCallback;
