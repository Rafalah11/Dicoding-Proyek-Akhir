import {
  getPendingStories,
  deletePendingStory,
} from "../../utils/indexedDB.js";
import ToastUtil from "../../utils/toast.js";

export default class PendingStoriesPage {
  async render() {
    return `
      <main id="main-content">
        <section class="container" aria-labelledby="pending-stories-title">
          <h1 id="pending-stories-title">Cerita Tertunda</h1>
          <div id="pending-stories-list" aria-live="polite"></div>
        </section>
      </main>
    `;
  }

  async afterRender() {
    await this._renderStories();
    this._setupSyncListener();
  }

  async _renderStories() {
    const storiesList = document.getElementById("pending-stories-list");
    if (!storiesList) {
      console.error("Elemen pending-stories-list tidak ditemukan");
      return;
    }

    try {
      const stories = await getPendingStories();
      if (stories.length === 0) {
        storiesList.innerHTML = "<p>Tidak ada cerita tertunda.</p>";
        return;
      }

      storiesList.innerHTML = stories
        .map(
          (story) => `
            <div class="story-item" data-id="${story.id}">
              <p><strong>Deskripsi:</strong> ${story.description}</p>
              <img src="${
                story.photoDataUrl
              }" alt="Foto cerita" style="max-width: 200px;" />
              <p><strong>Lokasi:</strong> (${story.lat}, ${story.lon})</p>
              <p><strong>Dibuat:</strong> ${new Date(
                story.createdAt
              ).toLocaleString()}</p>
              <button class="delete-story" data-id="${
                story.id
              }">Hapus Cerita</button>
            </div>
          `
        )
        .join("");
      this._setupDeleteListeners();
    } catch (error) {
      console.error("Gagal memuat cerita tertunda:", error);
      storiesList.innerHTML = "<p>Gagal memuat cerita tertunda.</p>";
    }
  }

  _setupDeleteListeners() {
    const deleteButtons = document.querySelectorAll(".delete-story");
    deleteButtons.forEach((button) => {
      button.removeEventListener("click", this._handleDelete);
      button.addEventListener("click", this._handleDelete.bind(this));
    });
  }

  async _handleDelete(event) {
    const button = event.target;
    const id = Number(button.getAttribute("data-id"));
    if (!id || isNaN(id)) {
      console.error(
        "ID tombol hapus tidak valid:",
        button.getAttribute("data-id")
      );
      ToastUtil.showToast("Gagal menghapus cerita: ID tidak valid.");
      return;
    }

    try {
      console.log("Menghapus cerita dengan ID:", id);
      await deletePendingStory(id);
      const storyItem = button.closest(".story-item");
      if (storyItem) {
        storyItem.remove();
      }
      ToastUtil.showToast("Cerita berhasil dihapus!");
      await this._renderStories(); // Perbarui UI
    } catch (error) {
      console.error("Gagal menghapus cerita:", error);
      ToastUtil.showToast("Gagal menghapus cerita: " + error.message);
    }
  }

  _setupSyncListener() {
    window.addEventListener("online", async () => {
      await this._renderStories();
    });
  }
}
