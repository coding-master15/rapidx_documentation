(function () {
  const pages = [...document.querySelectorAll(".page")];
  const links = [...document.querySelectorAll(".sidebar a.nav-link")];
  const outline = document.getElementById("outline");
  const crumb = document.getElementById("crumb");
  const prevEl = document.getElementById("prevPage");
  const nextEl = document.getElementById("nextPage");
  const search = document.getElementById("search");
  const searchEmpty = document.getElementById("searchEmpty");
  const order = links.map((a) => a.getAttribute("href").slice(1));

  function pageById(id) {
    return pages.find((p) => p.id === id);
  }

  function groupFor(link) {
    return link.closest(".nav-group")?.querySelector(".nav-group-toggle span")?.textContent || "Rapidx";
  }

  function buildOutline(page) {
    if (!outline) return;
    const heads = [...page.querySelectorAll("h2, h3")];
    if (!heads.length) {
      outline.innerHTML = "<h4>On this page</h4><p style='font-size:13px;color:var(--muted);margin:0'>No sections</p>";
      return;
    }
    outline.innerHTML =
      "<h4>On this page</h4>" +
      heads
        .map((h, i) => {
          if (!h.id) h.id = page.id + "-h-" + i;
          return `<a class="${h.tagName.toLowerCase()}" href="#${h.id}">${h.textContent}</a>`;
        })
        .join("");
  }

  function buildPager(id) {
    const i = order.indexOf(id);
    function fill(el, idx, label) {
      if (!el) return;
      if (idx < 0 || idx >= order.length) {
        el.classList.add("disabled");
        el.removeAttribute("href");
        return;
      }
      el.classList.remove("disabled");
      el.href = "#" + order[idx];
      const title = links[idx]?.textContent || order[idx];
      el.innerHTML = `<small>${label}</small><strong>${title}</strong>`;
    }
    fill(prevEl, i - 1, "Previous");
    fill(nextEl, i + 1, "Next");
  }

  function parseHash() {
    const raw = decodeURIComponent(location.hash.replace("#", ""));
    if (pageById(raw)) return { page: raw, heading: null };
    const heading = document.getElementById(raw);
    if (heading) return { page: heading.closest(".page")?.id || order[0], heading: raw };
    return { page: order[0], heading: null };
  }

  function show(id, heading) {
    const page = pageById(id) || pages[0];
    const activeId = page.id;
    pages.forEach((p) => p.classList.toggle("active", p.id === activeId));
    links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + activeId));
    const link = links.find((a) => a.getAttribute("href") === "#" + activeId);
    if (crumb) crumb.textContent = groupFor(link) + " / " + (link?.textContent || page.dataset.title || activeId);
    buildOutline(page);
    buildPager(activeId);
    document.body.classList.remove("nav-open");
    document.title = (link?.textContent || "Docs") + " · Rapidx";
    if (heading) {
      requestAnimationFrame(() => document.getElementById(heading)?.scrollIntoView({ block: "start" }));
    } else {
      window.scrollTo(0, 0);
    }
  }

  window.addEventListener("hashchange", () => {
    const { page, heading } = parseHash();
    show(page, heading);
  });
  const first = parseHash();
  show(first.page, first.heading);

  document.querySelectorAll(".nav-group-toggle").forEach((btn) => {
    btn.addEventListener("click", () => btn.closest(".nav-group").classList.toggle("collapsed"));
  });

  const menu = document.getElementById("menuToggle");
  const backdrop = document.getElementById("backdrop");
  menu?.addEventListener("click", () => document.body.classList.toggle("nav-open"));
  backdrop?.addEventListener("click", () => document.body.classList.remove("nav-open"));

  search?.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();
    let visible = 0;
    links.forEach((a) => {
      const page = pageById(a.getAttribute("href").slice(1));
      const hay = (a.textContent + " " + (page?.textContent || "")).toLowerCase();
      const match = !q || hay.includes(q);
      a.classList.toggle("hidden", !match);
      if (match) visible++;
    });
    document.querySelectorAll(".nav-group").forEach((g) => {
      const any = [...g.querySelectorAll(".nav-link")].some((a) => !a.classList.contains("hidden"));
      g.style.display = any ? "" : "none";
      if (q && any) g.classList.remove("collapsed");
    });
    if (searchEmpty) searchEmpty.style.display = visible ? "none" : "block";
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
      e.preventDefault();
      search?.focus();
    }
  });
})();
