/**
 * LifeLink — Auth (login, signup, session)
 * Demo-only: passwords stored encoded in localStorage — not for production.
 */

const Auth = {
  USERS_KEY: 'lifelink_users',
  SESSION_KEY: 'lifelink_session',

  getUsers() {
    try {
      const data = localStorage.getItem(this.USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveUsers(users) {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  },

  hashPassword(password) {
    return btoa(unescape(encodeURIComponent(password)));
  },

  getSession() {
    try {
      const session = localStorage.getItem(this.SESSION_KEY);
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  },

  getCurrentUser() {
    const session = this.getSession();
    if (!session?.userId) return null;
    return this.getUsers().find((u) => u.id === session.userId) || null;
  },

  getActiveRole() {
    const session = this.getSession();
    if (session?.activeRole) return session.activeRole;
    const user = this.getCurrentUser();
    return user?.role || 'seeker';
  },

  getHomeUrl(role) {
    const activeRole = role || this.getActiveRole();
    return activeRole === 'donor' ? 'become-donor.html' : 'find-donors.html';
  },

  isLoggedIn() {
    return !!this.getCurrentUser();
  },

  register({ name, email, password, city, bloodGroup, phone, role }) {
    const users = this.getUsers();
    const normalizedEmail = email.trim().toLowerCase();

    if (users.some((u) => u.email === normalizedEmail)) {
      return { ok: false, error: 'An account with this email already exists.' };
    }

    if (password.length < 6) {
      return { ok: false, error: 'Password must be at least 6 characters.' };
    }

    const user = {
      id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: this.hashPassword(password),
      city: city.trim(),
      bloodGroup: bloodGroup || '',
      phone: phone?.trim() || '',
      role: role || 'seeker',
      searchHistory: [],
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    this.saveUsers(users);
    const userRole = user.role === 'donor' ? 'donor' : 'seeker';
    this.setSession(user.id, userRole);
    return { ok: true, user };
  },

  login(email, password, activeRole) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = this.getUsers().find((u) => u.email === normalizedEmail);

    if (!user || user.passwordHash !== this.hashPassword(password)) {
      return { ok: false, error: 'Invalid email or password.' };
    }

    const role = activeRole === 'donor' ? 'donor' : 'seeker';
    this.setSession(user.id, role);
    this.updateUserProfile({ role });
    return { ok: true, user: { ...user, role } };
  },

  setSession(userId, activeRole) {
    const session = { userId };
    if (activeRole) session.activeRole = activeRole;
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
  },

  logout() {
    localStorage.removeItem(this.SESSION_KEY);
  },

  addSearchToHistory(bloodGroup, city) {
    const user = this.getCurrentUser();
    if (!user) return;

    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx === -1) return;

    const entry = { bloodGroup, city: city || '', at: new Date().toISOString() };
    const history = users[idx].searchHistory || [];
    history.unshift(entry);
    users[idx].searchHistory = history.slice(0, 10);
    this.saveUsers(users);
    this.setSession(user.id, this.getActiveRole());
  },

  updateUserProfile(updates) {
    const user = this.getCurrentUser();
    if (!user) return false;

    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx === -1) return false;

    users[idx] = { ...users[idx], ...updates };
    this.saveUsers(users);
    return true;
  },
};
