export default class HomePresenter {
  constructor({ view, storyModel, authModel }) {
    this._view = view;
    this._storyModel = storyModel;
    this._authModel = authModel;
  }

  async loadStories() {
    console.log("Starting loadStories");
    if (!this._authModel.isLoggedIn()) {
      this._view.showError("Silakan login untuk melihat cerita.");
      return;
    }
    this._view.showLoading();
    try {
      const token = this._authModel.getToken();
      console.log("Fetching stories with token:", token);
      const response = await this._storyModel.getStories(token);
      console.log("Stories response:", response);
      const stories = response || [];
      if (!Array.isArray(stories)) {
        throw new Error("Data cerita tidak dalam format yang benar");
      }
      this._view.renderStories(stories);
    } catch (error) {
      console.error("Error loading stories:", error);
      this._view.showError(
        "Terjadi kesalahan saat memuat cerita: " + error.message
      );
    } finally {
      this._view.hideLoading();
    }
  }
}
