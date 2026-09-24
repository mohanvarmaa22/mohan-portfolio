(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme ---------- */
  const themeToggle = document.getElementById("themeToggle");

  const syncThemeLabel = () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    themeToggle.setAttribute("aria-label", `Switch to ${next} theme`);
  };
  syncThemeLabel();

  themeToggle.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("portfolio-theme", next);
    } catch (e) {}
    syncThemeLabel();
  });

  /* ---------- Mobile nav ---------- */
  const nav = document.getElementById("siteNav");
  const navToggle = document.querySelector(".nav-toggle");

  navToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- The character ---------- */
  const heroFigure = document.querySelector('[data-mo="hero"]');
  const contactFigure = document.querySelector('[data-mo="contact"]');

  // Reuse the same drawing at the bottom of the page (clone before anything mutates it).
  contactFigure
    .querySelector(".mo-btn")
    .appendChild(heroFigure.querySelector(".mo").cloneNode(true));

  const lines = {
    hero: [
      "No PII past this point.",
      "Please remove that phone number.",
      "You're on the list. Barely.",
      "Prompt injection? Not tonight.",
      "ID, please. And a valid JWT.",
      "Every tenant stays in their own lane.",
      "Rate limit: fair, not personal.",
      "Names are fine. Emails, no.",
    ],
    contact: [
      "Cleared for entry.",
      "No cover charge.",
      "The email link works. Tested it.",
      "Plus one is fine.",
    ],
  };

  const instances = [];

  function createMo(figure, pool) {
    const svg = figure.querySelector(".mo");
    const btn = figure.querySelector(".mo-btn");
    const line = figure.querySelector(".placard-line");
    const pupils = svg.querySelector(".mo-pupils");
    const head = svg.querySelector(".mo-head");

    let queue = [];
    let sternTimer;

    const nextLine = () => {
      if (!queue.length) queue = [...pool].sort(() => Math.random() - 0.5);
      let text = queue.pop();
      if (text === line.textContent && queue.length) text = queue.pop();
      return text;
    };

    const setLine = (text) => {
      line.textContent = text;
      if (reduceMotion) return;
      line.classList.remove("swap");
      void line.offsetWidth; // restart the fade
      line.classList.add("swap");
    };

    // Lower the eyelids for a moment
    const stern = (ms = 1200) => {
      svg.classList.add("stern");
      clearTimeout(sternTimer);
      sternTimer = setTimeout(() => svg.classList.remove("stern"), ms);
    };

    // Raise the flipper: "halt"
    const halt = () => {
      if (reduceMotion) return;
      svg.classList.remove("halting");
      void svg.getBoundingClientRect();
      svg.classList.add("halting");
    };

    svg.addEventListener("animationend", (e) => {
      if (e.animationName === "mo-halt") svg.classList.remove("halting");
    });

    btn.addEventListener("click", () => {
      halt();
      stern(1400);
      setLine(nextLine());
    });

    // Eyes follow the pointer, and the lids lower as it gets close
    const look = (x, y) => {
      const r = svg.getBoundingClientRect();
      const cx = r.left + r.width * 0.5;
      const cy = r.top + r.height * 0.3;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const strength = Math.min(1, dist / 240);
      const ux = dx / dist;
      const uy = dy / dist;
      pupils.style.transform = `translate(${ux * 4.5 * strength}px, ${uy * 3.5 * strength}px)`;
      head.style.transform = `translate(${ux * 2.5 * strength}px, ${uy * 1.5 * strength}px)`;
      svg.classList.toggle("narrow", dist < 200);
    };

    // Occasional blink
    const blinkLoop = () => {
      setTimeout(() => {
        if (!document.hidden) {
          svg.classList.add("blink");
          setTimeout(() => svg.classList.remove("blink"), 140);
        }
        blinkLoop();
      }, 3000 + Math.random() * 4000);
    };
    if (!reduceMotion) blinkLoop();

    const instance = { look, halt, stern, setLine };
    instances.push(instance);
    return instance;
  }

  const hero = createMo(heroFigure, lines.hero);
  const contact = createMo(contactFigure, lines.contact);

  if (!reduceMotion) {
    let ticking = false;
    window.addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerType === "touch" || ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          instances.forEach((m) => m.look(e.clientX, e.clientY));
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  // Once the hero text has settled in, the bouncer stops you at the door
  setTimeout(() => hero.halt(), 1300);

  // At the bottom of the page: checks your ID, then lets you in
  if ("IntersectionObserver" in window) {
    const seen = new IntersectionObserver(
      (entries, obs) => {
        if (!entries.some((en) => en.isIntersecting)) return;
        obs.disconnect();
        contact.stern(1400);
        contact.setLine("Checking your ID…");
        setTimeout(() => contact.setLine("Cleared for entry."), 1400);
      },
      { threshold: 0.7 }
    );
    seen.observe(contactFigure);
  }
})();
