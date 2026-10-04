/* Shared behaviour for the PLASTIC WAR plan pages. No dependencies. */
(function () {
  "use strict";

  var PAGES = [
    { href: "index.html", label: "Briefing", title: "Mission Briefing" },
    { href: "gameplay.html", label: "Field Manual", title: "Gameplay & Combat" },
    { href: "world.html", label: "Theater", title: "Kitchen Map & World" },
    { href: "tech.html", label: "Engineering", title: "Tech & Assets" },
    { href: "roadmap.html", label: "Roadmap", title: "Milestones" },
    { href: "bootcamp.html", label: "Boot Camp", title: "Mac Setup Guide" },
    { href: "orders.html", label: "Your Orders", title: "Decisions to approve" }
  ];

  var SOLDIER_ICON =
    '<svg viewBox="0 0 32 32" aria-hidden="true"><g fill="#9cc552" stroke="#3d5c19" stroke-width="1.2">' +
    '<ellipse cx="16" cy="6.5" rx="5" ry="3"/><circle cx="16" cy="9" r="3"/>' +
    '<path d="M11 13h10l1 8h-3l-1 9h-4l-1-9h-3z"/><rect x="18" y="14" width="11" height="2" rx="1"/></g></svg>';

  // ---------- Storage (guarded: may be unavailable in private windows) ----------
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem("pw:" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem("pw:" + k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
  };
  window.PW = { store: store, toast: toast };

  // ---------- Nav + pager ----------
  var here = location.pathname.split("/").pop() || "index.html";
  var top = document.getElementById("topbar");
  if (top) {
    top.className = "topbar";
    top.innerHTML =
      '<div class="topbar-inner"><a class="brand" href="index.html">' + SOLDIER_ICON + "PLASTIC WAR</a>" +
      '<nav class="nav" aria-label="Plan sections">' +
      PAGES.map(function (p) {
        return '<a href="' + p.href + '"' + (p.href === here ? ' class="active" aria-current="page"' : "") + ">" + p.label + "</a>";
      }).join("") + "</nav></div>";
  }
  var pager = document.getElementById("pager");
  if (pager) {
    var i = PAGES.findIndex(function (p) { return p.href === here; });
    var prev = PAGES[i - 1], next = PAGES[i + 1];
    pager.className = "pager wrap";
    pager.innerHTML =
      (prev ? '<a href="' + prev.href + '"><small>← Previous</small>' + prev.title + "</a>" : "<span></span>") +
      (next ? '<a href="' + next.href + '" style="text-align:right"><small>Next →</small>' + next.title + "</a>" : "");
  }
  var foot = document.getElementById("foot");
  if (foot) {
    foot.className = "foot";
    foot.innerHTML = '<div class="wrap">PLASTIC WAR — private fan project plan, inspired by 3DO\'s <em>Army Men</em> series. ' +
      "Draft for review · not affiliated with the rights holders.</div>";
  }

  // ---------- Segmented tabs: <div data-tabs="name"> buttons[data-tab] + .tab-panel[data-panel] ----------
  document.querySelectorAll("[data-tabs]").forEach(function (group) {
    var name = group.getAttribute("data-tabs");
    var buttons = group.querySelectorAll("button[data-tab]");
    var panels = document.querySelectorAll('.tab-panel[data-group="' + name + '"]');
    function show(id) {
      buttons.forEach(function (b) { b.classList.toggle("on", b.dataset.tab === id); b.setAttribute("aria-pressed", b.dataset.tab === id); });
      panels.forEach(function (p) { p.classList.toggle("on", p.dataset.panel === id); });
      group.dispatchEvent(new CustomEvent("tabchange", { detail: id }));
    }
    buttons.forEach(function (b) { b.addEventListener("click", function () { show(b.dataset.tab); }); });
    if (buttons[0]) show(buttons[0].dataset.tab);
  });

  // ---------- Stat bars animate when visible ----------
  // ---------- Reveal on scroll ----------
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      e.target.querySelectorAll(".bar i[data-w]").forEach(function (b) { b.style.width = b.dataset.w + "%"; });
      io.unobserve(e.target);
    });
  }, { threshold: 0.12 }) : null;
  document.querySelectorAll(".reveal, .stats").forEach(function (el) {
    if (io) io.observe(el);
    else { el.classList.add("in"); el.querySelectorAll(".bar i[data-w]").forEach(function (b) { b.style.width = b.dataset.w + "%"; }); }
  });

  // ---------- Persistent checkboxes: <input type=checkbox data-persist="key"> ----------
  function refreshMeters() {
    document.querySelectorAll("[data-meter]").forEach(function (m) {
      var scope = document.querySelectorAll('input[data-persist^="' + m.dataset.meter + '"]');
      var done = Array.prototype.filter.call(scope, function (c) { return c.checked; }).length;
      var bar = m.querySelector("i"); if (bar) bar.style.width = (scope.length ? (done / scope.length) * 100 : 0) + "%";
      var label = document.querySelector('[data-meter-label="' + m.dataset.meter + '"]');
      if (label) label.textContent = done + " / " + scope.length;
    });
  }
  document.querySelectorAll("input[type=checkbox][data-persist]").forEach(function (c) {
    c.checked = !!store.get("chk:" + c.dataset.persist, false);
    c.addEventListener("change", function () { store.set("chk:" + c.dataset.persist, c.checked); refreshMeters(); });
  });
  refreshMeters();

  // ---------- Toast ----------
  var toastEl;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "toast"; document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add("show");
    clearTimeout(toastEl._t); toastEl._t = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }
})();
