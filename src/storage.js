// Polyfill: emula window.storage API usando localStorage del navegador
if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    async get(key) {
      const v = localStorage.getItem(key);
      return v ? { key, value: v, shared: false } : null;
    },
    async set(key, value) {
      const str = typeof value === "string" ? value : JSON.stringify(value);
      localStorage.setItem(key, str);
      return { key, value: str, shared: false };
    },
    async delete(key) {
      localStorage.removeItem(key);
      return { key, deleted: true, shared: false };
    },
    async list(prefix = "") {
      const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix));
      return { keys, prefix, shared: false };
    },
  };
}