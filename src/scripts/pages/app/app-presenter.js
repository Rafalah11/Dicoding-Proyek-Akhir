export default class AppPresenter {
  #view;
  #authModel;
  #routes;
  #getActiveRoute;

  constructor({ view, authModel, routes, getActiveRoute }) {
    if (!view || !authModel || !routes || !getActiveRoute) {
      throw new Error("AppPresenter: Missing required dependencies");
    }
    this.#view = view;
    this.#authModel = authModel;
    this.#routes = routes;
    this.#getActiveRoute = getActiveRoute;
    this.#view.setHashChangeListener(() => this.renderPage());
    this.#view.updateAuthUI();
  }

  async renderPage() {
    const url = this.#getActiveRoute();
    console.log("Rendering page for URL:", url);
    const page = this.#routes[url];

    if (!page) {
      console.warn("No page found for URL:", url);
      this.#view.showUnauthorizedMessage();
      return;
    }

    if (url === "#/add-story" && !this.#authModel.isLoggedIn()) {
      console.log("User not logged in, redirecting to unauthorized message");
      this.#view.showUnauthorizedMessage();
      return;
    }

    try {
      if (typeof page.render !== "function") {
        throw new Error(`Page for URL ${url} does not have a render method`);
      }
      const html = await page.render(); // Perbaikan: Hapus #render, gunakan render
      // Mengikat afterRender ke instance page untuk menjaga konteks this
      const boundAfterRender =
        typeof page.afterRender === "function"
          ? page.afterRender.bind(page)
          : null;
      await this.#view.showPageContent(html, boundAfterRender);
    } catch (error) {
      console.error("Error rendering page:", error); // Perbaikan: Tambah penutup string dan sertakan error
      this.#view.showUnauthorizedMessage();
    }
  }
}
