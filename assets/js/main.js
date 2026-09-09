/* =========================================================
   AutoCare — main.js
   Shared foundation behavior: navbar, mobile nav, footer.
   No API calls here — see assets/js/api.js (added in Phase 7).
   ========================================================= */

(function () {
  "use strict";

  /* --- Mobile navigation toggle --- */
  function initMobileNav() {
    const navbar = document.querySelector("[data-navbar]");
    const toggle = document.querySelector("[data-nav-toggle]");
    if (!navbar || !toggle) return;

    function closeNav() {
      navbar.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }

    function openNav() {
      navbar.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
    }

    toggle.addEventListener("click", function () {
      const isOpen = navbar.classList.contains("is-open");
      isOpen ? closeNav() : openNav();
    });

    // Close when a nav link is tapped (mobile)
    navbar.querySelectorAll(".nav-links a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    // Close on outside click
    document.addEventListener("click", function (e) {
      if (!navbar.contains(e.target)) closeNav();
    });

    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });

    // Reset state if the viewport grows back to desktop
    window.addEventListener("resize", function () {
      if (window.innerWidth > 860) closeNav();
    });
  }

  /* --- Shadow on scroll --- */
  function initNavbarScrollShadow() {
    const navbar = document.querySelector("[data-navbar]");
    if (!navbar) return;

    function onScroll() {
      navbar.classList.toggle("is-scrolled", window.scrollY > 4);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* --- Highlight the current page's nav link --- */
  function initActiveNavLink() {
    const links = document.querySelectorAll(".nav-links a[href]");
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    links.forEach(function (link) {
      const linkPage = link.getAttribute("href").split("/").pop();
      if (linkPage === currentPage) link.classList.add("active");
    });
  }

  /* --- Show / hide password fields --- */
  function initPasswordToggles() {
    document.querySelectorAll("[data-password-toggle]").forEach(function (btn) {
      const targetId = btn.getAttribute("data-password-toggle");
      const input = document.getElementById(targetId);
      if (!input) return;

      btn.addEventListener("click", function () {
        const isHidden = input.type === "password";
        input.type = isHidden ? "text" : "password";
        btn.textContent = isHidden ? "Hide" : "Show";
        btn.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
      });
    });
  }

  /* --- Footer year --- */
  function initFooterYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* --- Dashboard: off-canvas sidebar (customer/staff/admin) --- */
  function initDashboardSidebar() {
    const shell = document.querySelector(".dashboard-shell");
    const toggle = document.querySelector("[data-sidebar-toggle]");
    const overlay = document.querySelector("[data-sidebar-overlay]");
    if (!shell || !toggle) return;

    function close() { shell.classList.remove("is-sidebar-open"); }
    function open() { shell.classList.add("is-sidebar-open"); }

    toggle.addEventListener("click", function () {
      shell.classList.contains("is-sidebar-open") ? close() : open();
    });
    if (overlay) overlay.addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 960) close();
    });
  }

  /* --- Dashboard: user menu dropdown --- */
  function initDashboardDropdown() {
    const btn = document.querySelector("[data-user-menu-toggle]");
    const menu = document.querySelector("[data-user-menu]");
    if (!btn || !menu) return;

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      menu.classList.toggle("is-open");
    });
    document.addEventListener("click", function (e) {
      if (!menu.contains(e.target)) menu.classList.remove("is-open");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") menu.classList.remove("is-open");
    });
  }

  /* --- Dashboard: highlight current page in the sidebar nav --- */
  function initDashboardActiveLink() {
    const links = document.querySelectorAll(".dash-nav a[href]");
    const currentPage = window.location.pathname.split("/").pop();

    links.forEach(function (link) {
      const linkPage = link.getAttribute("href").split("/").pop();
      if (linkPage === currentPage) link.classList.add("active");
    });
  }

  /* --- Generic tab switcher: [data-tabs] wraps [data-tab] buttons,
     each controlling a [data-tab-panel="id"] --- */
  function initTabs() {
    document.querySelectorAll("[data-tabs]").forEach(function (group) {
      const tabs = group.querySelectorAll("[data-tab]");
      tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          const targetId = tab.getAttribute("data-tab");
          tabs.forEach(function (t) { t.classList.remove("active"); });
          tab.classList.add("active");
          document.querySelectorAll("[data-tab-panel]").forEach(function (panel) {
            panel.style.display = panel.getAttribute("data-tab-panel") === targetId ? "" : "none";
          });
        });
      });
    });
  }

  /* --- Generic modal: [data-modal-open="id"] / [data-modal-close] / overlay click --- */
  function initModals() {
    document.querySelectorAll("[data-modal-open]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const modal = document.getElementById(btn.getAttribute("data-modal-open"));
        if (modal) modal.classList.add("is-open");
      });
    });
    document.querySelectorAll(".modal-overlay").forEach(function (overlay) {
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) overlay.classList.remove("is-open");
      });
    });
    document.querySelectorAll("[data-modal-close]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        btn.closest(".modal-overlay").classList.remove("is-open");
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        document.querySelectorAll(".modal-overlay.is-open").forEach(function (m) {
          m.classList.remove("is-open");
        });
      }
    });
  }

  /* --- Toasts: window.showToast(message, type) — type: "success" | "error" | "" --- */
  window.showToast = function (message, type) {
    let container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = "toast" + (type ? " " + type : "");
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(function () {
      toast.style.transition = "opacity .3s ease";
      toast.style.opacity = "0";
      setTimeout(function () { toast.remove(); }, 300);
    }, 3200);
  };

  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initNavbarScrollShadow();
    initActiveNavLink();
    initPasswordToggles();
    initFooterYear();
    initDashboardSidebar();
    initDashboardDropdown();
    initDashboardActiveLink();
    initTabs();
    initModals();
  });
})();