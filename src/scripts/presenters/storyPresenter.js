export default class StoryPresenter {
  constructor({ view, model }) {
    this.view = view;
    this.model = model;
  }

  async loadStories() {
    try {
      const token = this.model.auth.getToken();
      if (!token) {
        this.view.showLoginPrompt();
        return;
      }

      const stories = await this.model.story.getStories(token);
      this.view.showStories(stories);
      this.view.initMap(stories);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Terjadi kesalahan jaringan";
      this.view.showError(errorMessage);
    }
  }
}
