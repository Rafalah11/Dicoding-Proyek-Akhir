import api from "../data/api.js";

export default class AuthModel {
  getToken() {
    return localStorage.getItem("user_token");
  }

  isLoggedIn() {
    const token = localStorage.getItem("user_token");
    return !!token;
  }

  async login(email, password) {
    try {
      const response = await api.login(email, password);
      if (response.error) {
        throw new Error(response.message || "Login gagal");
      }
      const token = response.loginResult?.token;
      if (token) {
        localStorage.setItem("user_token", token);
      }
      return response;
    } catch (error) {
      throw error;
    }
  }
}
