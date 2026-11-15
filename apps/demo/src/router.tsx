import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";

export type RoutePath = "/" | "/lesson" | "/careers" | "/studio" | "/verify" | "/embed";

interface RouterContextType {
  currentPath: RoutePath;
  navigate: (path: RoutePath | string, replace?: boolean) => void;
  pageTitle: string;
}

const RouterContext = createContext<RouterContextType>({
  currentPath: "/",
  navigate: () => {},
  pageTitle: "Home",
});

export function normalizePath(pathname: string, hash: string): RoutePath {
  // Support both clean URLs and legacy .html filenames
  const path = pathname.toLowerCase();
  if (path.includes("careers") || path.includes("jobs")) return "/careers";
  if (path.includes("lesson")) return "/lesson";
  if (path.includes("studio")) return "/studio";
  if (path.includes("verify")) return "/verify";
  if (path.includes("embed") || path.includes("standalone")) return "/embed";

  // Support hash routing fallback if served from file:// or static server
  if (hash) {
    const cleanHash = hash.replace("#", "").toLowerCase();
    if (cleanHash.includes("careers") || cleanHash.includes("jobs")) return "/careers";
    if (cleanHash.includes("lesson")) return "/lesson";
    if (cleanHash.includes("studio")) return "/studio";
    if (cleanHash.includes("verify")) return "/verify";
    if (cleanHash.includes("embed")) return "/embed";
  }

  return "/";
}

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<RoutePath>(() =>
    normalizePath(window.location.pathname, window.location.hash)
  );
  const [announcement, setAnnouncement] = useState("");
  const isFirstRender = useRef(true);

  const getTitleForPath = (path: RoutePath): string => {
    switch (path) {
      case "/lesson":
        return "Accessible Lesson: Digital Workplace Skills";
      case "/careers":
        return "Career Gateway: Accessible Opportunities";
      case "/studio":
        return "Transcript Studio — Caption Review";
      case "/verify":
        return "Verify Certificate Credential";
      case "/embed":
        return "Standalone Level 1 Script-Tag Embed";
      case "/":
      default:
        return "Abugida Media Kit — Home";
    }
  };

  const navigate = useCallback((to: RoutePath | string, replace = false) => {
    const targetPath = normalizePath(to, "");
    if (replace) {
      window.history.replaceState({ path: targetPath }, "", to);
    } else {
      window.history.pushState({ path: targetPath }, "", to);
    }
    setCurrentPath(targetPath);
  }, []);

  // Listen to popstate for browser Back & Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = normalizePath(window.location.pathname, window.location.hash);
      setCurrentPath(path);
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("hashchange", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("hashchange", handlePopState);
    };
  }, []);

  // Manage focus and screen reader announcements on navigation
  useEffect(() => {
    const title = getTitleForPath(currentPath);
    document.title = `${title} — Abugida Media Kit`;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setAnnouncement(`Navigated to: ${title}`);

    // Shift focus to main heading or main content container
    const mainHeading = document.querySelector<HTMLElement>("main h2, main h1, #main-content");
    if (mainHeading) {
      mainHeading.setAttribute("tabindex", "-1");
      mainHeading.focus({ preventScroll: false });
    }
  }, [currentPath]);

  return (
    <RouterContext.Provider
      value={{
        currentPath,
        navigate,
        pageTitle: getTitleForPath(currentPath),
      }}
    >
      {/* Screen-reader route announcement live region */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        id="route-announcer"
      >
        {announcement}
      </div>
      {children}
    </RouterContext.Provider>
  );
};

export function useRouter() {
  return useContext(RouterContext);
}

export const NavLink: React.FC<{
  to: RoutePath;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}> = ({ to, children, className = "nav-link", style, onClick }) => {
  const { currentPath, navigate } = useRouter();
  const isActive = currentPath === to;

  return (
    <a
      href={to}
      className={className}
      style={style}
      aria-current={isActive ? "page" : undefined}
      onClick={(e) => {
        // Allow ctrl+click or meta+click to open in new tab
        if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
          e.preventDefault();
          navigate(to);
          if (onClick) onClick();
        }
      }}
    >
      {children}
    </a>
  );
};
