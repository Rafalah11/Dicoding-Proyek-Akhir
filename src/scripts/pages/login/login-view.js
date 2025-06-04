import ToastUtil from "../../utils/toast.js";

export default class LoginView {
  constructor(formElement) {
    this._form = formElement;
    this._submitHandler = null;
    this._errorMessageElement = document.getElementById("error-message");
    this._loadingElement = document.getElementById("loading");
    this._emailInput = document.getElementById("email");
    this._passwordInput = document.getElementById("password");
    this._notificationDialog = null;
    this._enableNotificationHandler = null;
    this._disableNotificationHandler = null;
  }

  setSubmitHandler(handler) {
    this._submitHandler = handler;
    this._form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = this._emailInput.value;
      const password = this._passwordInput.value;
      await this._submitHandler(email, password);
    });
  }

  setNotificationHandlers(enableHandler, disableHandler) {
    this._enableNotificationHandler = enableHandler;
    this._disableNotificationHandler = disableHandler;
  }

  showError(message) {
    if (this._errorMessageElement) {
      this._errorMessageElement.textContent = message;
      this._errorMessageElement.style.display = "block";
    }
  }

  showLoading() {
    if (this._loadingElement) {
      this._loadingElement.style.display = "block";
    }
    this._form.querySelector("button[type=submit]").disabled = true;
  }

  hideLoading() {
    if (this._loadingElement) {
      this._loadingElement.style.display = "none";
    }
    this._form.querySelector("button[type=submit]").disabled = false;
  }

  showNotificationPrompt() {
    const dialog = document.createElement("div");
    dialog.className = "notification-dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-labelledby", "notification-title");
    dialog.setAttribute("aria-describedby", "notification-desc");
    dialog.innerHTML = `
      <div class="dialog-content">
        <h2 id="login-success-title" style="color: green; margin-bottom: 10px;">Selamat, Login Anda telah Berhasil!</h2>
        <h3 id="notification-title">Aktifkan Notifikasi</h3>
        <p id="notification-desc">Apakah Anda ingin menerima notifikasi untuk cerita baru?</p>
        <button id="enable-notification" aria-label="Aktifkan notifikasi">Ya</button>
        <button id="disable-notification" aria-label="Nonaktifkan notifikasi">Tidak</button>
      </div>
    `;
    document.body.appendChild(dialog);
    this._notificationDialog = dialog;

    const style = document.createElement("style");
    style.textContent = `
      .notification-dialog {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }
      .dialog-content {
        background: white;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        max-width: 400px;
      }
      .dialog-content button {
        margin: 10px;
        padding: 8px 16px;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);

    document
      .getElementById("enable-notification")
      .addEventListener("click", () => {
        if (this._enableNotificationHandler) this._enableNotificationHandler();
        this.closeNotificationPrompt();
      });
    document
      .getElementById("disable-notification")
      .addEventListener("click", () => {
        if (this._disableNotificationHandler)
          this._disableNotificationHandler();
        this.closeNotificationPrompt();
      });
  }

  closeNotificationPrompt() {
    if (this._notificationDialog) {
      this._notificationDialog.remove();
      this._notificationDialog = null;
    }
  }

  showToast(message) {
    ToastUtil.showToast(message);
  }

  onLoginSuccess() {
    console.log("onLoginSuccess: Redirecting to #/");
    window.location.hash = "#/";
  }
}
