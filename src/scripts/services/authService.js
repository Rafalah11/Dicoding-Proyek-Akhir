import api from "../data/api";

export default class AuthService {
  constructor() {
    console.log(
      "AuthService initialized, Token:",
      localStorage.getItem("user_token")
    );
  }

  get isLoggedIn() {
    const token = localStorage.getItem("user_token");
    return !!token;
  }

  async login(email, password) {
    try {
      const response = await api.login(email, password);
      console.log("Login response dari server:", response);

      const token = response.loginResult?.token;
      if (!token) throw new Error("Token tidak diterima dari server");

      localStorage.setItem("user_token", token);
      console.log("Token saved, isLoggedIn:", this.isLoggedIn);
      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  loginWithToken(token) {
    localStorage.setItem("user_token", token);
    console.log("Login with token, isLoggedIn:", this.isLoggedIn);
  }

  logout() {
    localStorage.removeItem("user_token");
    console.log("Logged out, isLoggedIn:", this.isLoggedIn);
  }

  getToken() {
    const token = localStorage.getItem("user_token");
    console.log("Getting token:", token);
    return token;
  }
}
