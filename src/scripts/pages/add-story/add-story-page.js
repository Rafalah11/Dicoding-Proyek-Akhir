import L from "leaflet";
import AddStoryPresenter from "./add-story-presenter.js";
import StoryModel from "../../model/storyModel.js";
import api from "../../data/api.js";

// Use local marker images
const markerIcon = "/icons/marker-icon.png";
const markerIcon2x = "/icons/marker-icon-2x.png";
const markerShadow = "/icons/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default class AddStoryPage {
  constructor() {
    this._cameraStream = null;

    this._presenter = new AddStoryPresenter({
      view: this,
      model: new StoryModel(api),
    });

    this._presenter.onShowLoading = () => this.showLoading();
    this._presenter.onHideLoading = () => this.hideLoading();
    this._presenter.onSuccessSubmit = (message) =>
      this.showMessage("Sukses", message);
    this._presenter.onErrorSubmit = (message) =>
      this.showMessage("Error", message);
  }

  async render() {
    return `
      <main id="main-content">
        <a href="#main-content" class="skip-link">Skip to content</a>
        <section class="container" aria-labelledby="add-story-title">
          <h1 id="add-story-title">Tambah Cerita</h1>
          <form id="story-form" role="form" aria-label="Form Tambah Cerita">
            <div class="form-group">
              <label for="description">Deskripsi:</label>
              <textarea id="description" required aria-required="true" autocomplete="off"></textarea>
            </div>

            <div class="form-group">
              <label for="camera"><i class="fas fa-camera-retro"></i> Foto:</label>
              <video id="camera" autoplay style="width: 100%; max-width: 400px;" aria-label="Camera preview"></video>
              <canvas id="photoCanvas" style="display:none;" aria-hidden="true"></canvas>
              <img id="preview" style="margin-top: 10px; width: 100%; max-width: 400px;" alt="Preview foto yang diambil" />
              <button type="button" id="capture" aria-label="Ambil foto"><i class="fas fa-camera"></i> Ambil Foto</button>
            </div>

            <div class="form-group">
              <label for="map">Lokasi (klik pada peta):</label>
              <div id="map" class="map" aria-label="Peta pemilihan lokasi"></div>
              <input type="hidden" id="latitude" aria-label="Latitude" autocomplete="off" />
              <input type="hidden" id="longitude" aria-label="Longitude" autocomplete="off" />
            </div>

            <div id="loading" style="display: none; text-align: center; margin-top: 10px;">
              <i class="fas fa-spinner fa-spin"></i> Mengirim cerita...
            </div>

            <div id="offline-message" style="display: none; text-align: center; margin-top: 10px;" aria-live="polite">
              Anda sedang offline. Cerita akan disimpan lokal dan disinkronkan saat online.
            </div>

            <button type="submit"><i class="fas fa-save"></i> Simpan</button>
          </form>
        </section>
      </main>
    `;
  }

  async afterRender() {
    this._initCamera();
    this._initMap();
    this._setupEventListeners();
  }

  _initCamera = () => {
    const video = document.getElementById("camera");
    const canvas = document.getElementById("photoCanvas");
    const preview = document.getElementById("preview");

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        this._cameraStream = stream;
        video.srcObject = stream;

        document.getElementById("capture").onclick = () => {
          const ctx = canvas.getContext("2d");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          preview.src = canvas.toDataURL("image/jpeg");
          this._stopCamera(); // Hentikan kamera setelah mengambil foto
        };
      })
      .catch((error) => {
        console.error("Gagal mengakses kamera:", error);
        this._presenter.onCameraError();
        this._stopCamera(); // Hentikan kamera jika ada error
      });
  };

  _initMap = () => {
    const map = L.map("map").setView([-6.2, 106.8], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    map.on("click", (e) => {
      document.getElementById("latitude").value = e.latlng.lat;
      document.getElementById("longitude").value = e.latlng.lng;

      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) layer.removeFrom(map);
      });

      L.marker([e.latlng.lat, e.latlng.lng])
        .addTo(map)
        .bindPopup("Lokasi dipilih")
        .openPopup();
    });
  };

  _setupEventListeners = () => {
    const form = document.getElementById("story-form");
    this._offlineMessage = document.getElementById("offline-message");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const description = document.getElementById("description").value;
      const photoDataUrl = document.getElementById("preview").src;
      const lat = document.getElementById("latitude").value;
      const lon = document.getElementById("longitude").value;

      if (
        !description ||
        !photoDataUrl ||
        photoDataUrl === "" ||
        !lat ||
        !lon
      ) {
        this.showMessage(
          "Error",
          "Harap lengkapi semua field sebelum mengirim."
        );
        return;
      }

      if (!navigator.onLine) {
        await this._presenter.savePendingStory({
          description,
          photoDataUrl,
          lat,
          lon,
          createdAt: new Date().toISOString(),
        });
        this._offlineMessage.style.display = "block";
        this.showMessage(
          "Sukses",
          "Cerita disimpan lokal, akan disinkronkan saat online."
        );
        this._stopCamera(); // Hentikan kamera sebelum navigasi
        this.navigateTo("");
      } else {
        this._presenter.handleSubmit({ description, photoDataUrl, lat, lon });
        this._stopCamera(); // Hentikan kamera setelah submit online
      }
    });

    window.addEventListener("hashchange", this._cleanup.bind(this));
    window.addEventListener("beforeunload", this._cleanup.bind(this));
  };

  _stopCamera = () => {
    if (this._cameraStream) {
      this._cameraStream.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      this._cameraStream = null;
      const video = document.getElementById("camera");
      if (video) {
        video.srcObject = null;
        video.pause();
      }
    }
  };

  _cleanup = () => {
    this._stopCamera();
    window.removeEventListener("hashchange", this._cleanup.bind(this));
  };

  showLoading() {
    const loading = document.getElementById("loading");
    if (loading) loading.style.display = "block";
    if (this._offlineMessage) this._offlineMessage.style.display = "none";
  }

  hideLoading() {
    const loading = document.getElementById("loading");
    if (loading) loading.style.display = "none";
  }

  showMessage(type, message) {
    alert(`${type}: ${message}`);
  }

  navigateTo(path) {
    window.location.hash = `#/${path}`;
  }
}
