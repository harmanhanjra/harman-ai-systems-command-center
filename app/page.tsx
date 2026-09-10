"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Repo = {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
};

const site = {
  title: "AI Systems Command Center",
  kind: "Command",
  description: "Monitor the systems behind Harman Hanjra’s AI, automation, and research work.",
  tabs: ["All", "Agent Operating System", "Improver Agent", "Scalecraft", "Quant Research"],
  items: ["Agent Operating System", "Improver Agent", "Scalecraft", "Quant Research"],
};

const facts = [
  "Evidence before claims",
  "Responsive by default",
  "Motion with purpose",
  "Human review for risk",
];

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Home() {
  const [active, setActive] = useState(site.tabs[0]);
  const [selected, setSelected] = useState<string | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [reduced, setReduced] = useState(false);
  const modalRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/repos", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : { repos: [] }))
      .then((data: { repos?: Repo[] }) => {
        if (!controller.signal.aborted) {
          setRepos(Array.isArray(data.repos) ? data.repos : []);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setRepos([]);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setReduced(media.matches);
    syncPreference();
    media.addEventListener("change", syncPreference);
    return () => media.removeEventListener("change", syncPreference);
  }, []);

  useEffect(() => {
    if (!selected) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setSelected(null);
        return;
      }

      if (event.key !== "Tab" || !modalRef.current) return;
      const focusable = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((element) => !element.hasAttribute("disabled"));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus();
    };
  }, [selected]);

  const filtered = useMemo(
    () =>
      site.items.filter(
        (item) =>
          active === site.tabs[0] ||
          item.toLowerCase().includes(active.toLowerCase()),
      ),
    [active],
  );

  const openModule = (item: string, trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;
    setSelected(item);
  };

  return (
    <main className={reduced ? "reduced" : undefined}>
      <header className="top">
        <a className="brand" href="#top">
          HARMAN<span>.</span>
        </a>
        <nav aria-label="System modules">
          {site.tabs.map((tab) => (
            <button
              className={active === tab ? "active" : ""}
              onClick={() => setActive(tab)}
              key={tab}
              aria-pressed={active === tab}
            >
              {tab}
            </button>
          ))}
        </nav>
        <button
          className="motion"
          onClick={() => setReduced((value) => !value)}
          aria-pressed={reduced}
          aria-label="Reduce interface motion"
        >
          {reduced ? "Motion off" : "Motion on"}
        </button>
      </header>

      <section className="hero" id="top">
        <div className="eyebrow">{site.kind} / HARMAN HANJRA</div>
        <h1>{site.title}</h1>
        <p>{site.description}</p>
        <div className="hero-actions">
          <a className="primary" href="#workspace">Enter workspace ↓</a>
          <a className="secondary" href="https://github.com/harmanhanjra" target="_blank" rel="noreferrer">GitHub ↗</a>
        </div>
      </section>

      <section className="workspace" id="workspace">
        <div className="section-line">
          <span>LIVE WORKSPACE</span>
          <span>{filtered.length} ACTIVE MODULES</span>
        </div>
        <div className="module-grid">
          {filtered.map((item, index) => (
            <button
              className={`module module-${(index % 4) + 1}`}
              key={item}
              onClick={(event) => openModule(item, event.currentTarget)}
              aria-haspopup="dialog"
            >
              <small>0{index + 1}</small>
              <strong>{item}</strong>
              <span>Inspect module ↗</span>
            </button>
          ))}
        </div>
      </section>

      <section className="evidence">
        <div>
          <div className="eyebrow">SYSTEM PRINCIPLES</div>
          <h2>Useful intelligence, documented.</h2>
        </div>
        <div className="fact-list">
          {facts.map((fact) => (
            <div className="fact" key={fact}><span>+</span>{fact}</div>
          ))}
        </div>
      </section>

      <section className="github" id="github">
        <div className="section-line">
          <span>OPEN SOURCE SIGNAL</span>
          <a href="https://github.com/harmanhanjra" target="_blank" rel="noreferrer">View GitHub ↗</a>
        </div>
        <div className="repo-grid">
          {repos.length ? repos.map((repo) => (
            <a className="repo" href={repo.html_url} target="_blank" rel="noreferrer" key={repo.name}>
              <strong>{repo.name.replaceAll("-", " ")}</strong>
              <p>{repo.description || "Harman Hanjra project repository."}</p>
              <small>{repo.language || "Open source"} · ★ {repo.stargazers_count}</small>
            </a>
          )) : (
            <div className="empty">GitHub repositories will appear here when the public API responds.</div>
          )}
        </div>
      </section>

      <footer>
        <span>© 2026 HARMAN HANJRA</span>
        <span>{site.title} / BUILT WITH NEXT.JS</span>
      </footer>

      {selected && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelected(null);
        }}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="module-dialog-title"
            aria-describedby="module-dialog-description"
            ref={modalRef}
          >
            <button
              ref={closeButtonRef}
              className="close"
              onClick={() => setSelected(null)}
              aria-label="Close module inspector"
            >
              ×
            </button>
            <div className="eyebrow">MODULE INSPECTOR</div>
            <h2 id="module-dialog-title">{selected}</h2>
            <p id="module-dialog-description">
              This interactive module is grounded in Harman Hanjra’s project system. Use this surface for architecture, evidence, implementation notes, and verified next actions.
            </p>
            <a className="primary" href="https://github.com/harmanhanjra" target="_blank" rel="noreferrer">Inspect GitHub ↗</a>
          </section>
        </div>
      )}
    </main>
  );
}
