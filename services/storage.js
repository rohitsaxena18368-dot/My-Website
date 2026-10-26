
const USERS_KEY = 'dronacharya_rd_lab_users';
const SESSION_KEY = 'rd_lab_user';
const DATA_KEY = 'dronacharya_rd_lab_data';

function readJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export const storage = {
  async register(username, password, name = username) {
    username = String(username || '').trim();

    if (!username || !password) {
      throw new Error('Username aur password zaroori hain.');
    }

    const users = readJSON(USERS_KEY, []);

    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error('Ye username pehle se registered hai.');
    }

    const user = {
      id: `${Date.now()}`,
      username,
      name: String(name || username).trim(),
      password: String(password)
    };

    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const safeUser = {
      id: user.id,
      username: user.username,
      name: user.name
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
    return safeUser;
  },

  async login(username, password) {
    username = String(username || '').trim();
    const users = readJSON(USERS_KEY, []);

    const user = users.find(
      (u) =>
        u.username.toLowerCase() === username.toLowerCase() &&
        u.password === String(password || '')
    );

    if (!user) {
      throw new Error('Login failed. Username/password check karein ya pehle register karein.');
    }

    const safeUser = {
      id: user.id,
      username: user.username,
      name: user.name
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
    return safeUser;
  },

  async logout() {
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser() {
    return readJSON(SESSION_KEY, null);
  },

  getData() {
    return readJSON(DATA_KEY, {});
  },

  saveData(data) {
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Data save failed:', error);
      return false;
    }
  },

  get(key) {
    return this.getData()[key] ?? null;
  },

  set(key, value) {
    const data = this.getData();
    data[key] = value;
    return this.saveData(data);
  },

  remove(key) {
    const data = this.getData();
    delete data[key];
    return this.saveData(data);
  }
};
