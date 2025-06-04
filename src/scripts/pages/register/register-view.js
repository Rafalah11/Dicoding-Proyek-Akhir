export default class RegisterView {
  constructor(formElement) {
    this._formElement = formElement;
  }

  setSubmitHandler(handler) {
    if (!this._formElement) {
      console.error("Form element is not defined");
      return;
    }

    this._formElement.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const name = this._formElement.querySelector("#name")?.value.trim();
        const email = this._formElement.querySelector("#email")?.value.trim();
        const password = this._formElement
          .querySelector("#password")
          ?.value.trim();

        if (!name || !email || !password) {
          this.showError("Semua field harus diisi");
          return;
        }

        handler(name, email, password);
      } catch (error) {
        console.error("Submit error:", error);
        this.showError("Terjadi kesalahan saat memproses formulir");
      }
    });
  }

  render() {
    const content = document.getElementById("main-content");
    if (content) {
      content.innerHTML =
        this._formElement.parentElement.parentElement.outerHTML;
    }
  }

  showLoading() {
    document.getElementById("loading").style.display = "block";
  }

  hideLoading() {
    document.getElementById("loading").style.display = "none";
  }

  showError(message) {
    const errorElement = document.getElementById("error-message");
    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  showSuccess(message) {
    const errorElement = document.getElementById("error-message");
    if (errorElement) {
      errorElement.style.color = "green";
      errorElement.textContent = message;
    }
  }

  onRegisterSuccess() {
    this.showError("");
    const successMsg = "Pendaftaran berhasil! Mengarahkan ke halaman Login...";
    const errorElement = document.getElementById("error-message");
    if (errorElement) {
      errorElement.style.color = "green";
      errorElement.textContent = successMsg;
    }
    setTimeout(() => {
      window.location.hash = "/login";
    }, 2000);
  }
}
