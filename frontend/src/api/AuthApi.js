// src/api/AuthApi.js
import axios from "axios";
import { BASE_URL } from "./api";

export async function handleLogin(username, password, setIsAuthenticated) {
  try {
    const { data } = await axios.post(`${BASE_URL}token/`, {
      username,
      password,
    });
    const { access, refresh } = data;

    // Prefer HttpOnly cookies from backend; if you must store on client:
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    setIsAuthenticated(true);
  } catch (err) {
    // Normalize & bubble up a readable error
    const message =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      "Invalid username or password.";
    throw new Error(message);
  }
}
