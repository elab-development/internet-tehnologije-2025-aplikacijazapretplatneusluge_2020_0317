export function saveAuth(payload) {
  sessionStorage.setItem("auth", JSON.stringify(payload));
}

export function getAuth() {
  const raw = sessionStorage.getItem("auth");
  return raw ? JSON.parse(raw) : null;
}

export function clearAuth() {
  sessionStorage.removeItem("auth");
}

export function isLoggedIn() {
  const auth = getAuth();
  return Boolean(auth?.token);
}

export function getUserRole() {
  const auth = getAuth();
  return auth?.user?.role ?? null; // role je iz tabele users (admin / user)
}

export function getUserTip() {
  const auth = getAuth();
  return auth?.user?.tip ?? null; // tip je patron, kreator, oba
}