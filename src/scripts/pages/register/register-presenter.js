export default class RegisterPresenter {
  constructor({ view, authModel }) {
    this._view = view;
    this._authModel = authModel;
  }

  async handleRegister({ name, email, password }) {
    if (!name || !email || !password) {
      this._view.showError("Semua field wajib diisi.");
      return;
    }
    this._view.showLoading();
    try {
      const registerResponse = await this._authModel.register(
        name,
        email,
        password
      );
      console.log("Registrasi berhasil:", registerResponse);
      this._view.onRegisterSuccess();
    } catch (err) {
      console.error("Error selama registrasi:", err);
      this._view.showError(
        err.message || "Registrasi gagal. Silakan coba lagi."
      );
    } finally {
      this._view.hideLoading();
    }
  }
}
