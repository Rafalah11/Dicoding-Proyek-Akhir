import AppView from "./app/app-view.js";
import AppPresenter from "./app/app-presenter.js";
import routes from "../routes/routes.js";
import { getActiveRoute } from "../routes/url-parser.js";
import AuthModel from "../model/authModel.js";

export default class App {
  #presenter;

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
    this.#presenter = new AppPresenter({
      view: new AppView({ navigationDrawer, drawerButton, content }),
      authModel: new AuthModel(),
      routes,
      getActiveRoute,
    });
    this._initApp();
  }

  _initApp() {
    console.log("App: Setting up initial render");
    this.#presenter.renderPage();
  }
}
