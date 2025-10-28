export function getNafathIdFromJWT(token) {
  if (!token) return "";
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.nafath_id || payload.nafathId || payload.sub || "";
  } catch {
    return "";
  }
}