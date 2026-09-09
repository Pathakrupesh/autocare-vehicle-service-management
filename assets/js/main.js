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

  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initNavbarScrollShadow();
    initActiveNavLink();
    initPasswordToggles();
    initFooterYear();
  });
})();