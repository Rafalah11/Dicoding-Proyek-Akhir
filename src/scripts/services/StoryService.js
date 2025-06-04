const API_URL = "https://story-api.dicoding.dev/v1";

export default class StoryService {
  constructor(fetchWrapper = window.fetch.bind(window)) {
    this._fetch = fetchWrapper;
  }

  async getPhotoBlob(photoDataUrl) {
    if (!photoDataUrl || photoDataUrl === "") {
      throw new Error("Silakan ambil foto terlebih dahulu.");
    }

    const photoResponse = await this._fetch(photoDataUrl);
    if (!photoResponse.ok) {
      throw new Error("Gagal mengunduh foto");
    }
    return await photoResponse.blob();
  }

  async submitStory({ description, photoBlob, lat, lon, token }) {
    const formData = new FormData();
    formData.append("description", description);
    formData.append(
      "photo",
      new File([photoBlob], "photo.jpg", { type: "image/jpeg" })
    );
    if (lat && lon) {
      formData.append("lat", parseFloat(lat));
      formData.append("lon", parseFloat(lon));
    }

    const endpoint = token ? `${API_URL}/stories` : `${API_URL}/stories/guest`;
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await this._fetch(endpoint, {
      method: "POST",
      headers,
      body: formData,
    });

    const result = await response.json();
    if (result.error) {
      throw new Error(result.message || "Gagal menambahkan cerita");
    }
    return result;
  }

  async getStories(params = {}) {
    const token = localStorage.getItem("user_token");
    const { page, size, location } = params;
    const queryParams = new URLSearchParams();

    if (page) queryParams.append("page", page);
    if (size) queryParams.append("size", size);
    if (location !== undefined) queryParams.append("location", location);

    const endpoint = `${API_URL}/stories?${queryParams.toString()}`;
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await this._fetch(endpoint, {
      method: "GET",
      headers,
    });

    const result = await response.json();
    if (result.error) {
      throw new Error(result.message || "Gagal mengambil cerita");
    }
    return result;
  }
}
