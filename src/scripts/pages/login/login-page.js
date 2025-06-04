import LoginPresenter from "./login-presenter.js";
import LoginView from "./login-view.js";
import StoryModel from "../../model/storyModel.js";
import api from "../../data/api.js";

export default class LoginPage {
  constructor() {
    this._presenter = null;
  }

  async render() {
    return `
      <section class="auth-container" aria-labelledby="login-title">
        <div class="auth-card">
          <h2 id="login-title" style="text-align:center; font-weight:bold;">Login</h2>
          <form id="login-form" role="form" aria-label="Form Login" novalidate>
            <!-- Email -->
            <div class="form-group">
              <label for="email">Email</label>
              <input 
                id="email" 
                type="email" 
                placeholder="Contoh: johndoe@mail.com" 
                required 
                aria-required="true"
                aria-describedby="email-help"
              />
              <div id="email-help" class="form-hint" aria-live="polite">
                Masukkan email aktif yang valid
              </div>
            </div>

            <!-- Password -->
            <div class="form-group">
              <label for="password">Password</label>
              <input 
                id="password" 
                type="password" 
                placeholder="Masukkan password Anda" 
                required 
                aria-required="true"
                aria-describedby="password-help"
              />
              <div id="password-help" class="form-hint" aria-live="polite">
                Masukkan password yang sesuai
              </div>
            </div>

            <!-- Error Message -->
            <div id="error-message" class="error-message" role="alert" aria-live="assertive" style="color:red; text-align:center;"></div>

            <!-- Loading -->
            <div id="loading" style="display: none; text-align: center; margin: 10px 0;" aria-live="polite">
              <i class="fas fa-spinner fa-spin" aria-hidden="true"></i> 
              <span>Memproses login...</span>
            </div>

            <button type="submit" aria-label="Submit formulir login">Masuk</button>

            <p style="margin-top:10px;text-align:center;">
              Belum punya akun? <a href="#/register" aria-label="Navigasi ke halaman registrasi">Daftar</a>
            </p>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const formElement = document.getElementById("login-form");
    if (!formElement) {
      console.error("Form element not found!");
      return;
    }
    const authModel = new (class {
      async login(email, password) {
        const api = (await import("../../data/api.js")).default;
        const response = await api.login(email, password);
        if (response.error) throw new Error(response.message || "Login gagal");
        const token = response.loginResult?.token;
        if (token) localStorage.setItem("user_token", token);
        return response;
      }
      getToken() {
        return localStorage.getItem("user_token");
      }
      isLoggedIn() {
        return !!this.getToken();
      }
    })();
    const view = new LoginView(formElement);
    this._presenter = new LoginPresenter({
      view,
      authModel,
      storyModel: new StoryModel(api),
    });
    this._presenter.init();
  }
}
