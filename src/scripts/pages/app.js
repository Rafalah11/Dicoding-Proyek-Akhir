import AppView from "./app/app-view.js";
import routes from "../routes/routes.js";
import { getActiveRoute } from "../routes/url-parser.js";

export default class App {
  #view;

  constructor({ navigationDrawer, drawerButton, content }) {
    console.log("App: Initializing with navigationDrawer:", navigationDrawer);
    if (!navigationDrawer || !drawerButton || !content) {
      console.error("App: Missing required elements", {
        navigationDrawer,
        drawerButton,
        content,
      });
      return;
    }
    this.#view = new AppView({ navigationDrawer, drawerButton, content });
    this._initApp();
  }

  _initApp() {
    console.log("App: Setting up hashchange listener");
    window.addEventListener("hashchange", () => this.renderPage());
  }

  async renderPage() {
    console.log("App: Rendering page");
    const url = getActiveRoute();
    console.log("App: Current route:", url);
    const Page = routes[url];
    if (!Page) {
      console.error("Route not found:", url);
      this.#view.showUnauthorizedMessage();
      return;
    }
    const page = new Page();
    await this.#view.showPageContent(
      await page.render(),
      page.afterRender?.bind(page)
    );
  }
}
