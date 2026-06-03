(() => {
  const navLinks = Array.from(
    document.querySelectorAll(".page-nav-list a[href^='#'], .toc a[href^='#']")
  );
  if (!navLinks.length) return;

  const idToLinks = new Map();
  navLinks.forEach((link) => {
    const href = link.getAttribute("href") || "";
    const id = href.startsWith("#") ? href.slice(1) : "";
    if (!id) return;
    if (!idToLinks.has(id)) idToLinks.set(id, []);
    idToLinks.get(id).push(link);
  });

  const sections = Array.from(idToLinks.keys())
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  if (!sections.length) return;

  const setCurrent = (id) => {
    navLinks.forEach((link) => {
      const active = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("is-current", active);
      if (active) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  let currentId = sections[0].id;
  setCurrent(currentId);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          currentId = entry.target.id;
        }
      });
      setCurrent(currentId);
    },
    {
      root: null,
      rootMargin: "-120px 0px -55% 0px",
      threshold: [0, 0.15, 0.4],
    }
  );

  sections.forEach((section) => observer.observe(section));

  window.addEventListener("hashchange", () => {
    const hashId = decodeURIComponent(window.location.hash.replace("#", ""));
    if (hashId && idToLinks.has(hashId)) setCurrent(hashId);
  });
})();
