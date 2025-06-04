import RegisterPresenter from "./register-presenter.js";
import RegisterView from "./register-view.js";

export default class RegisterPage {
  constructor() {
    this._presenter = null;
  }

  async render() {
    return `
      <section class="auth-container" aria-labelledby="register-title">
        <div class="auth-card">
          <h2 id="register-title" style="text-align:center; font-weight:bold;">Register</h2>
          <form id="register-form" role="form" aria-label="Form Registrasi" novalidate>
            <!-- Name -->
            <div class="form-group">
              <label for="name">Nama Lengkap</label>
              <input 
                id="name" 
                type="text" 
                placeholder="Contoh: John Doe" 
                required 
                aria-required="true"
                aria-describedby="name-help"
              />
              <div id="name-help" class="form-hint" aria-live="polite">
                Masukkan nama lengkap Anda
              </div>
            </div>
            
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
                placeholder="Minimal 8 karakter" 
                required
                aria-required="true"
                minlength="8"
                aria-describedby="password-help"
              />
              <div id="password-help" class="form-hint" aria-live="polite">
                Minimal 8 karakter
              </div>
            </div>

            <!-- Error Message -->
            <div id="error-message" class="error-message" role="alert" aria-live="assertive" style="color:red; text-align:center;"></div>

            <!-- Loading -->
            <div id="loading" style="display: none; text-align: center; margin: 10px 0;" aria-live="polite">
              <i class="fas fa-spinner fa-spin" aria-hidden="true"></i> 
              <span>Memproses registrasi...</span>
            </div>

            <button type="submit" aria-label="Submit formulir registrasi">Daftar</button>

            <p style="margin-top:10px;text-align:center;">
              Sudah punya akun? <a href="#/login" aria-label="Navigasi ke halaman login">Login</a>
            </p>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const formElement = document.getElementById("register-form");
    if (!formElement) {
      console.error("Form element not found!");
      return;
    }
    const authModel = new (class {
      async register(name, email, password) {
        const api = (await import("../../data/api.js")).default;
        const response = await api.register(name, email, password);
        if (!response.ok)
          throw new Error(response.message || "Registrasi gagal");
        return response;
      }
    })();
    const view = new RegisterView(formElement);
    this._presenter = new RegisterPresenter({ view, authModel });
    view.setSubmitHandler((name, email, password) =>
      this._presenter.handleRegister({ name, email, password })
    );
  }
}
