"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    // Check local storage for theme preference
    const savedTheme = localStorage.getItem("referralai-theme");
    if (savedTheme === "light") {
      setIsLight(true);
      document.body.classList.add("light-theme");
    }
  }, []);

  const toggleTheme = () => {
    if (isLight) {
      document.body.classList.remove("light-theme");
      localStorage.setItem("referralai-theme", "dark");
      setIsLight(false);
    } else {
      document.body.classList.add("light-theme");
      localStorage.setItem("referralai-theme", "light");
      setIsLight(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="btn-secondary-hover"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid var(--glass-border)",
        color: "var(--color-text-secondary)",
        padding: "0.5rem",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.2s ease"
      }}
      title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
    >
      {isLight ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
