"use client";

import { useState, useEffect } from "react";

interface GoogleAuthButtonProps {
  onAuthSuccess?: () => void;
}

export default function GoogleAuthButton({ onAuthSuccess }: GoogleAuthButtonProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/google/status");
      const data = await response.json();
      setIsAuthorized(data.authorized);
    } catch (error) {
      console.error("Auth status check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = () => {
    window.location.href = "/api/auth/google";
  };

  if (loading) {
    return (
      <button className="btn-secondary" disabled>
        Lade...
      </button>
    );
  }

  if (isAuthorized) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-green-500">✓ Google Photos verbunden</span>
      </div>
    );
  }

  return (
    <button onClick={handleAuth} className="btn-primary">
      🔗 Mit Google Photos verbinden
    </button>
  );
}

