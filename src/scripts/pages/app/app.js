// import AuthService from "../../services/authService.js";

// window.addEventListener("auth-changed", (event) => {
//   console.log("Global auth-changed event received:", event.detail);
//   if (window.appViewInstance) {
//     window.appViewInstance._updateAuthUI();
//   } else {
//     console.warn("AppView instance not found");
//   }
// });

// export default class AppView {
//   #drawerButton;
//   #navigationDrawer;
//   #content;

//   constructor({ navigationDrawer, drawerButton, content }) {
//     if (!navigationDrawer || !drawerButton || !content) {
//       console.error("AppView: Missing required elements", {
//         navigationDrawer,
//         drawerButton,
//         content,
//       });
//       return;
//     }
//     this.#drawerButton = drawerButton;
//     this.#navigationDrawer = navigationDrawer;
//     this.#content = content;
//     console.log(
//       "AppView initialized, Navigation Drawer:",
//       this.#navigationDrawer
//     );
//     window.appViewInstance = this;
//     this._setupDrawer();
//     this._forceUpdateAuthUI(); // Paksa pembaruan UI awal
//     this._startAuthPolling();
//   }

//   _startAuthPolling() {
//     let lastIsLoggedIn = null;
//     const checkAuth = () => {
//       const authService = new AuthService();
//       console.log(
//         "Polling: Token in localStorage:",
//         localStorage.getItem("user_token")
//       );
//       console.log("Polling: isLoggedIn:", authService.isLoggedIn);
//       if (authService.isLoggedIn !== lastIsLoggedIn) {
//         console.log(
//           "Auth status changed via polling, isLoggedIn:",
//           authService.isLoggedIn
//         );
//         this._updateAuthUI();
//         lastIsLoggedIn = authService.isLoggedIn;
//       }
//       setTimeout(checkAuth, 1000);
//     };
//     setTimeout(checkAuth, 500);
//   }

//   _setupDrawer() {
//     this.#drawerButton.addEventListener("click", () => {
//       this.#navigationDrawer.classList.toggle("open");
//     });

//     document.body.addEventListener("click", (event) => {
//       if (
//         !this.#navigationDrawer.contains(event.target) &&
//         !this.#drawerButton.contains(event.target)
//       ) {
//         this.#navigationDrawer.classList.remove("open");
//       }

//       this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
//         if (link.contains(event.target)) {
//           this.#navigationDrawer.classList.remove("open");
//         }
//       });
//     });
//   }

//   _setupLogoutListener() {
//     const logoutButton = this.#navigationDrawer.querySelector("#logout-button");
//     if (logoutButton) {
//       logoutButton.removeEventListener("click", this._handleLogout);
//       console.log("Setting up logout button listener");
//       logoutButton.addEventListener("click", this._handleLogout.bind(this));
//     } else {
//       console.warn("Logout button not found in DOM");
//     }
//   }

//   _handleLogout(e) {
//     e.preventDefault();
//     console.log("Logout button clicked");
//     const authService = new AuthService();
//     authService.logout();
//     const authEvent = new CustomEvent("auth-changed", {
//       detail: { isLoggedIn: false },
//     });
//     console.log("Dispatching auth-changed event with isLoggedIn: false");
//     window.dispatchEvent(authEvent);
//     window.location.hash = "#/";
//     window.dispatchEvent(new Event("hashchange"));
//   }

//   showUnauthorizedMessage() {
//     this.#content.innerHTML = `
//       <section class="container">
//         <h2>Anda harus login terlebih dahulu</h2>
//         <p><a href="#/login">Silakan login untuk menambah cerita.</a></p>
//       </section>
//     `;
//   }

//   async showPageContent(html, afterRenderCallback) {
//     this.#content.innerHTML = html;
//     if (typeof afterRenderCallback === "function") {
//       await afterRenderCallback();
//     }
//     console.log("Calling updateAuthUI after rendering page");
//     requestAnimationFrame(() => {
//       setTimeout(() => this._forceUpdateAuthUI(), 500);
//     });
//   }

//   _updateAuthUI() {
//     console.log("Updating Auth UI, Navigation Drawer:", this.#navigationDrawer);
//     const authService = new AuthService();
//     console.log("Updating Auth UI, isLoggedIn:", authService.isLoggedIn);
//     console.log("Token in localStorage:", localStorage.getItem("user_token"));
//     const authLinks = this.#navigationDrawer.querySelectorAll(".auth-link");
//     const logoutLink = this.#navigationDrawer.querySelector(".logout-link");

//     console.log(
//       "Found auth links:",
//       authLinks.length,
//       "logout link:",
//       logoutLink ? "exists" : "not found"
//     );

//     if (authLinks.length === 0 || !logoutLink) {
//       console.error("Navigation elements not found in DOM");
//       return;
//     }

//     if (authService.isLoggedIn) {
//       authLinks.forEach((link, index) => {
//         console.log(`Hiding auth link ${index}:`, link);
//         link.style.display = "none";
//       });
//       console.log("Showing logout link:", logoutLink);
//       logoutLink.style.display = "block";
//     } else {
//       authLinks.forEach((link, index) => {
//         console.log(`Showing auth link ${index}:`, link);
//         link.style.display = "block";
//       });
//       console.log("Hiding logout link:", logoutLink);
//       logoutLink.style.display = "none";
//     }

//     this._setupLogoutListener();
//   }

//   _forceUpdateAuthUI() {
//     console.log("Force updating Auth UI");
//     this._updateAuthUI();
//   }

//   updateAuthUI() {
//     this._forceUpdateAuthUI();
//   }
// }
