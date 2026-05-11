const KEY = "food-ordering-favorites";

export function loadFavorites() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveFavorites(favorites) {
  localStorage.setItem(KEY, JSON.stringify(favorites || []));
}

