import routes from "../../routes/routes.js";
import { getActiveRoute } from "../../routes/url-parser.js";
import AuthModel from "../../model/authModel.js";

class AppPresenter {
  #view;
  #model;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#view = new AppView({ navigationDrawer, drawerButton, content });
    this.#model = new AuthModel();
    this.#view.setHashChangeListener(() => this.renderPage());
    this.#view.updateAuthUI();
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url];

    if (!page) {
      this.#view.showUnauthorizedMessage();
      return;
    }

    if (url === "#/add-story" && !this.#model.isLoggedIn()) {
      this.#view.showUnauthorizedMessage();
      return;
    }

    const html = await page.render();
    await this.#view.showPageContent(html, page.afterRender);
  }
}

export default AppPresenter;
