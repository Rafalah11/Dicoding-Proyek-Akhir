import CONFIG from "../config";

const API_ENDPOINT = CONFIG.BASE_URL;

const api = {
  async fetch(url) {
    try {
      const response = await fetch(url);
      console.log(`Fetching URL: ${url}, Status: ${response.status}`);
      return response;
    } catch (error) {
      console.error(`Fetch error: ${error.message}`);
      throw error;
    }
  },

  async post(url, body, headers = {}) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: body instanceof FormData ? body : body,
      });
      console.log(`POST to ${url}, Status: ${response.status}`);
      return response;
    } catch (error) {
      console.error(`POST error: ${error.message}`);
      throw error;
    }
  },

  async register(name, email, password) {
    const response = await fetch(`${API_ENDPOINT}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        data.message || `Registrasi gagal: HTTP ${response.status}`
      );
    }
    return data;
  },

  async login(email, password) {
    console.log("Calling login with:", { email, password });
    const response = await fetch(`${API_ENDPOINT}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    console.log("Login API response:", data);
    if (!response.ok) {
      throw new Error(data.message || `Login gagal: HTTP ${response.status}`);
    }
    if (!data) {
      throw new Error("Respons server kosong");
    }
    return data;
  },

  async addStory({ token, description, photo, lat, lon }) {
    const formData = new FormData();
    formData.append("description", description);
    formData.append("photo", photo);
    if (lat) formData.append("lat", lat);
    if (lon) formData.append("lon", lon);

    const response = await fetch(`${API_ENDPOINT}/stories`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await response.json();
    console.log("Add story response:", data);
    return data;
  },

  async getStories(token) {
    const queryParams = new URLSearchParams({ location: 1 });
    const endpoint = `${API_ENDPOINT}/stories?${queryParams.toString()}`;
    const response = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    console.log("API getStories response:", data);
    if (!response.ok) {
      throw new Error(
        data.message || `Gagal mengambil cerita: HTTP ${response.status}`
      );
    }
    return data;
  },
};

export default api;
