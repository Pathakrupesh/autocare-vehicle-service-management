/* AutoCare Phase 5 - authentication using localStorage (temporary mock auth) */
(function () {
  'use strict';
  const Store = window.AutoCareStore;
  if (!Store) return;

  function getUsers() { return Store.ensure('users'); }
  function currentUser() {
    const id = Number(localStorage.getItem('autocare_current_user'));
    return getUsers().find(function (u) { return Number(u.id) === id; }) || null;
  }
  function setSession(user, remember) {
    if (remember) localStorage.setItem('autocare_current_user', String(user.id));
    else sessionStorage.setItem('autocare_current_user', String(user.id));
    localStorage.setItem('autocare_token', 'mock-token-' + user.id);
  }
  function getSessionUser() {
    const localId = Number(localStorage.getItem('autocare_current_user'));
    const sessionId = Number(sessionStorage.getItem('autocare_current_user'));
    const id = localId || sessionId;
    return getUsers().find(function (u) { return Number(u.id) === id; }) || null;
  }
  function logout() {
    localStorage.removeItem('autocare_current_user');
    localStorage.removeItem('autocare_token');
    sessionStorage.removeItem('autocare_current_user');
    window.location.href = window.location.pathname.includes('/customer/') || window.location.pathname.includes('/staff/') || window.location.pathname.includes('/admin/') ? '../login.html' : 'login.html';
  }
  function redirectForRole(role) {
    const routes = { customer: 'customer/dashboard.html', staff: 'staff/dashboard.html', admin: 'admin/dashboard.html' };
    window.location.href = routes[role] || 'index.html';
  }

  window.AutoCareAuth = { currentUser: getSessionUser, logout: logout, redirectForRole: redirectForRole };

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('a[href="../login.html"], a[href="login.html"]').forEach(function (link) {
      if ((link.textContent || '').toLowerCase().includes('log out')) {
        link.addEventListener('click', function (e) { e.preventDefault(); logout(); });
      }
    });

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value;
        const user = getUsers().find(function (u) { return u.email.toLowerCase() === email && u.password === password; });
        if (!user) {
          if (window.showToast) showToast('Invalid email or password.', 'error'); else alert('Invalid email or password.');
          return;
        }
        const remember = loginForm.elements.remember ? loginForm.elements.remember.checked : true;
        setSession(user, remember);
        if (window.showToast) showToast('Login successful.');
        setTimeout(function () { redirectForRole(user.role); }, 250);
      });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', function (e) {
        e.preventDefault();
        let valid = registerForm.checkValidity();
        const password = document.getElementById('reg-password').value;
        const confirm = document.getElementById('confirm-password').value;
        const confirmGroup = document.getElementById('confirm-password-group');
        const match = password === confirm && confirm.length > 0;
        confirmGroup.classList.toggle('field-error', !match);
        valid = valid && match;
        if (!valid) { registerForm.reportValidity(); return; }

        const users = getUsers();
        const email = document.getElementById('reg-email').value.trim().toLowerCase();
        if (users.some(function (u) { return u.email.toLowerCase() === email; })) {
          if (window.showToast) showToast('An account with this email already exists.', 'error'); else alert('Email already exists.');
          return;
        }
        const user = {
          id: Store.nextId(users),
          name: document.getElementById('firstname').value.trim() + ' ' + document.getElementById('lastname').value.trim(),
          email: email,
          phone: document.getElementById('phone').value.trim(),
          password: password,
          role: 'customer'
        };
        users.push(user);
        Store.write('users', users);
        setSession(user, true);
        if (window.showToast) showToast('Account created successfully.');
        setTimeout(function () { redirectForRole('customer'); }, 250);
      });
    }

    const user = getSessionUser();
    if (user) {
      document.querySelectorAll('.dash-user-name').forEach(function (el) { el.textContent = user.name; });
      document.querySelectorAll('.dash-user-role').forEach(function (el) { el.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1); });
      document.querySelectorAll('.dash-avatar').forEach(function (el) {
        el.textContent = user.name.split(' ').map(function (n) { return n[0]; }).slice(0, 2).join('').toUpperCase();
      });
    }
  });
})();
