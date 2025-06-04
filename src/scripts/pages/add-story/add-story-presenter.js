export default class AddStoryPresenter {
  constructor({ view, model }) {
    this._view = view;
    this._model = model;
    this.onShowLoading = null;
    this.onHideLoading = null;
    this.onSuccessSubmit = null;
    this.onErrorSubmit = null;
  }

  async handleSubmit({ description, photoDataUrl, lat, lon }) {
    if (this.onShowLoading) this.onShowLoading();

    try {
      if (!description || !photoDataUrl || !lat || !lon) {
        throw new Error("Harap lengkapi semua field");
      }

      const photoBlob = await this._model.getPhotoBlob(photoDataUrl);
      const token = this._model.getToken();

      await this._model.submitStory({
        description,
        photoBlob,
        lat,
        lon,
        token,
      });

      if (this.onSuccessSubmit) {
        this.onSuccessSubmit("Cerita berhasil ditambahkan!");
        this._view.navigateTo("");
      }
    } catch (error) {
      if (this.onErrorSubmit) {
        this.onErrorSubmit(
          error.message || "Terjadi kesalahan saat mengirim cerita."
        );
      }
    } finally {
      if (this.onHideLoading) this.onHideLoading();
    }
  }

  async savePendingStory({ description, photoDataUrl, lat, lon, createdAt }) {
    try {
      await this._model.savePendingStory({
        description,
        photoDataUrl,
        lat,
        lon,
        createdAt,
      });
    } catch (error) {
      if (this.onErrorSubmit) {
        this.onErrorSubmit(error.message || "Gagal menyimpan cerita tertunda.");
      }
    }
  }

  onCameraError() {
    if (this._view) {
      this._view.showMessage(
        "Error",
        "Gagal mengakses kamera. Pastikan Anda memberikan izin akses kamera."
      );
    } else {
      console.error("View is undefined in AddStoryPresenter");
    }
  }
}
