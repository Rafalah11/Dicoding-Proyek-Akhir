import ToastUtil from "../../utils/toast.js";
import StoryModel from "../../model/storyModel.js";
import api from "../../data/api.js";

window.addEventListener("auth-changed", (event) => {
  console.log("Global auth-changed event received:", event.detail);
  if (window.appViewInstance) {
    window.appViewInstance._forceUpdateAuthUI();
  } else {
    console.warn("AppView instance not found");
  }
});

export default class AppView {
  #drawerButton;
  #navigationDrawer;
  #content;
  #storyModel;

  constructor({ navigationDrawer, drawerButton, content }) {
    if (!navigationDrawer || !drawerButton || !content) {
      console.error("AppView: Missing required elements", {
        navigationDrawer,
        drawerButton,
        content,
      });
      return;
    }
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#content = content;
    this.#storyModel = new StoryModel(api);
    console.log(
      "AppView initialized, Navigation Drawer:",
      this.#navigationDrawer
    );
    window.appViewInstance = this;
    this._setupDrawer();
    this._forceUpdateAuthUI();
    this._startAuthPolling();
  }

  _startAuthPolling() {
    let lastIsLoggedIn = null;
    const checkAuth = () => {
      const isLoggedIn = !!localStorage.getItem("user_token");
      console.log(
        "Polling: Token in localStorage:",
        localStorage.getItem("user_token")
      );
      console.log("Polling: isLoggedIn:", isLoggedIn);
      if (isLoggedIn !== lastIsLoggedIn) {
        console.log("Auth status changed via polling, isLoggedIn:", isLoggedIn);
        this._forceUpdateAuthUI();
        lastIsLoggedIn = isLoggedIn;
      }
      setTimeout(checkAuth, 100000);
    };
    setTimeout(checkAuth, 10000);
  }

  _setupDrawer() {
    console.log("Setting up drawer, drawerButton:", this.#drawerButton);
    this.#drawerButton.addEventListener("click", () => {
      console.log("Drawer button clicked, toggling open class");
      const isOpen = this.#navigationDrawer.classList.toggle("open");
      console.log(
        "Navigation drawer classList after toggle:",
        this.#navigationDrawer.classList,
        "isOpen:",
        isOpen
      );
    });

    document.body.addEventListener("click", (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        console.log("Click outside drawer, removing open class");
        this.#navigationDrawer.classList.remove("open");
      }

      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          console.log("Nav link clicked, removing open class");
          this.#navigationDrawer.classList.remove("open");
        }
      });
    });
  }

  _setupLogoutListener() {
    const logoutButton = this.#navigationDrawer.querySelector("#logout-button");
    if (logoutButton) {
      logoutButton.removeEventListener("click", this._handleLogout);
      console.log("Setting up logout button listener");
      logoutButton.addEventListener("click", this._handleLogout.bind(this));
    } else {
      console.warn("Logout button not found in DOM");
    }
  }

  async _handleLogout(e) {
    e.preventDefault();
    console.log("Logout button clicked");
    localStorage.removeItem("user_token");

    // Hentikan langganan push
    await this.#storyModel.unsubscribePush();
    ToastUtil.showToast("Berhenti berlangganan notifikasi");

    const authEvent = new CustomEvent("auth-changed", {
      detail: { isLoggedIn: false },
    });
    console.log("Dispatching auth-changed event with isLoggedIn: false");
    window.dispatchEvent(authEvent);
    window.location.hash = "#/";
    window.dispatchEvent(new Event("hashchange"));
  }

  showUnauthorizedMessage() {
    console.log("Showing unauthorized message");
    this.#content.innerHTML = `
      <section class="container">
        <h2>Anda harus login terlebih dahulu</h2>
        <p><a href="#/login">Silakan login untuk menambah cerita.</a></p>
      </section>
    `;
  }

  async showPageContent(html, afterRenderCallback) {
    console.log("Showing page content");
    this.#content.innerHTML = html;
    if (typeof afterRenderCallback === "function") {
      await afterRenderCallback();
    }
    console.log("Calling updateAuthUI after rendering page");
    requestAnimationFrame(() => {
      setTimeout(() => this._forceUpdateAuthUI(), 500);
    });
  }

  _updateAuthUI() {
    console.log("Updating Auth UI, Navigation Drawer:", this.#navigationDrawer);
    const isLoggedIn = !!localStorage.getItem("user_token");
    console.log("Updating Auth UI, isLoggedIn:", isLoggedIn);
    console.log("Token in localStorage:", localStorage.getItem("user_token"));
    const authLinks = this.#navigationDrawer.querySelectorAll(".auth-link a");
    const logoutLink = this.#navigationDrawer.querySelector(".logout-link a");

    console.log(
      "Found auth links:",
      authLinks.length,
      "logout link:",
      logoutLink ? "exists" : "not found"
    );

    if (authLinks.length === 0 || !logoutLink) {
      console.error("Navigation elements not found in DOM");
      return;
    }

    if (isLoggedIn) {
      authLinks.forEach((link, index) => {
        console.log(`Disabling auth link ${index}:`, link);
        link.classList.add("disabled");
        link.style.pointerEvents = "none";
      });
      console.log("Enabling logout link:", logoutLink);
      logoutLink.classList.remove("disabled");
      logoutLink.style.pointerEvents = "auto";
    } else {
      authLinks.forEach((link, index) => {
        console.log(`Enabling auth link ${index}:`, link);
        link.classList.remove("disabled");
        link.style.pointerEvents = "auto";
      });
      console.log("Disabling logout link:", logoutLink);
      logoutLink.classList.add("disabled");
      logoutLink.style.pointerEvents = "none";
    }

    this._setupLogoutListener();
  }

  _forceUpdateAuthUI() {
    console.log("Force updating Auth UI");
    this._updateAuthUI();
  }

  updateAuthUI() {
    this._forceUpdateAuthUI();
  }

  setHashChangeListener(callback) {
    window.addEventListener("hashchange", callback);
  }
}
