import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const KEY = "sabo.token";

// SecureStore tidak ada di web (dipakai hanya untuk uji di browser), jadi fallback ke localStorage.
export async function getToken() {
  try {
    if (Platform.OS === "web") return window.localStorage.getItem(KEY);
    return await SecureStore.getItemAsync(KEY);
  } catch {
    return null;
  }
}

export async function setToken(token) {
  try {
    if (Platform.OS === "web") return window.localStorage.setItem(KEY, token);
    await SecureStore.setItemAsync(KEY, token);
  } catch {}
}

export async function clearToken() {
  try {
    if (Platform.OS === "web") return window.localStorage.removeItem(KEY);
    await SecureStore.deleteItemAsync(KEY);
  } catch {}
}
