import HomePresenter from "./home-presenter.js";
import StoryModel from "../../model/storyModel.js";
import AuthModel from "../../model/authModel.js";
import api from "../../data/api.js";
import { getStories, saveStories } from "../../utils/indexedDB.js";

// Configure Leaflet marker icons
const markerIcon = "/icons/marker-icon.png";
const markerIcon2x = "/icons/marker-icon-2x.png";
const markerShadow = "/icons/marker-shadow.png";

async function loadLeaflet() {
  const L = await import("leaflet");
  const Leaflet = L.default || L;

  delete Leaflet.Icon.Default.prototype._getIconUrl;
  Leaflet.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  });

  return Leaflet;
}

export default class HomePage {
  #presenter;
  #map;

  constructor() {
    this._storiesContainer = null;
    this._loading = null;
    this._mapContainer = null;
    this._offlineMessage = null;
    this.#map = null;
    this.#initialize();
  }

  #initialize() {
    this.#presenter = new HomePresenter({
      view: this,
      storyModel: new StoryModel(api),
      authModel: new AuthModel(),
    });
  }

  async render() {
    return `
      <main id="main-content">
        <a href="#main-content" class="skip-link">Skip to content</a>
        <section class="container" aria-labelledby="home-title">
          <h1 id="home-title">Daftar Cerita</h1>
          <div id="map" style="height: 400px; margin-bottom: 20px;"></div>
          <div id="stories" class="stories" aria-label="Daftar cerita pengguna"></div>
          <div id="loading" style="display: none; text-align: center; margin-top: 10px;">
            <i class="fas fa-spinner fa-spin"></i> Memuat cerita...
          </div>
          <div id="offline-message" style="display: none; text-align: center; margin-top: 10px;" aria-live="polite">
            Data tidak tersedia saat offline. Menampilkan cerita yang tersimpan lokal.
          </div>
        </section>
      </main>
    `;
  }

  async afterRender() {
    this._storiesContainer = document.getElementById("stories");
    this._loading = document.getElementById("loading");
    this._mapContainer = document.getElementById("map");
    this._offlineMessage = document.getElementById("offline-message");

    if (
      !this._storiesContainer ||
      !this._loading ||
      !this._mapContainer ||
      !this._offlineMessage
    ) {
      console.error("Elemen DOM tidak ditemukan");
      return;
    }

    try {
      if (!this.#presenter) {
        throw new Error("Presenter tidak diinisialisasi dengan benar");
      }
      console.log("Calling loadStories");
      this.#presenter.loadStories();
    } catch (error) {
      console.error("Gagal memuat cerita:", error);
      this.showError("Gagal memuat halaman: " + error.message);
    }
  }

  showLoading() {
    if (this._loading) this._loading.style.display = "block";
    if (this._offlineMessage) this._offlineMessage.style.display = "none";
  }

  hideLoading() {
    if (this._loading) this._loading.style.display = "none";
  }

  async renderStories(stories) {
    console.log("Rendering stories:", stories);
    if (this._storiesContainer && this._mapContainer) {
      if (!navigator.onLine && stories.length === 0) {
        this._storiesContainer.innerHTML =
          "<p>Tidak ada cerita yang tersedia.</p>";
        this._offlineMessage.style.display = "block";
        return;
      }

      if (navigator.onLine) {
        this._offlineMessage.style.display = "none";
      } else {
        this._offlineMessage.style.display = "block";
      }

      const L = await loadLeaflet();

      if (this.#map) {
        this.#map.remove();
        this.#map = null;
      }

      this.#map = L.map(this._mapContainer).setView(
        [-2.548926, 118.0148634],
        5
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.#map);

      stories.forEach((story) => {
        if (story.lat && story.lon) {
          const marker = L.marker([story.lat, story.lon]).addTo(this.#map);
          marker.bindPopup(`
            <b>${story.name || "Tanpa Nama"}</b><br>
            ${story.description || "Tanpa Deskripsi"}<br>
            <small>${new Date(story.createdAt).toLocaleDateString()}</small>
          `);
        }
      });

      this._storiesContainer.innerHTML = stories
        .map(
          (story) => `
          <article class="story" aria-labelledby="story-${
            story.id || Math.random().toString(36).substr(2, 9)
          }">
            <h2 id="story-${
              story.id || Math.random().toString(36).substr(2, 9)
            }">${story.name || "Tanpa Nama"}</h2>
            <img src="${story.photoUrl || ""}" alt="Foto cerita oleh ${
            story.name || "Pengguna"
          }" style="width: 100%; max-width: 300px;" />
            <p>${story.description || "Tanpa Deskripsi"}</p>
            <p><small>Dibuat pada: ${new Date(
              story.createdAt || Date.now()
            ).toLocaleDateString()}</small></p>
            ${
              story.lat && story.lon
                ? `<p><i data-feather="map-pin"></i> Lokasi: ${story.lat}, ${story.lon}</p>`
                : ""
            }
          </article>
        `
        )
        .join("");

      // Inisialisasi Feather Icons dengan fallback
      if (window.feather) {
        window.feather.replace();
      }
    } else {
      console.error("Kontainer cerita atau peta tidak tersedia");
    }
  }

  showError(message) {
    if (this._storiesContainer) {
      this._storiesContainer.innerHTML = `<p>${message}</p>`;
      if (!navigator.onLine) {
        this._offlineMessage.style.display = "block";
      }
    } else {
      console.error(
        "Tidak dapat menampilkan error: _storiesContainer tidak ditemukan"
      );
    }
  }
}
