export default class LoginPresenter {
  constructor({ view, authModel, storyModel }) {
    this._view = view;
    this._authModel = authModel;
    this._storyModel = storyModel;
  }

  init() {
    this._view.setSubmitHandler(this.handleLogin.bind(this));
    this._view.setNotificationHandlers(
      this._enableNotifications.bind(this),
      this._disableNotifications.bind(this)
    );
  }

  async handleLogin(email, password) {
    this._view.showLoading();
    try {
      if (typeof email !== "string" || !email.trim()) {
        throw new Error("Email harus berupa string yang valid");
      }
      if (typeof password !== "string" || !password.trim()) {
        throw new Error("Password harus berupa string yang valid");
      }

      const response = await this._authModel.login(email, password);
      if (!response) {
        this._view.showError("Respons server kosong");
        return;
      }
      if (this._authModel.getToken()) {
        this._view.showNotificationPrompt();
      } else {
        this._view.showError("Login gagal. Periksa email dan password Anda.");
      }
    } catch (error) {
      this._view.showError(error.message || "Terjadi kesalahan saat login.");
    } finally {
      this._view.hideLoading();
    }
  }

  async _enableNotifications() {
    try {
      console.log("Meminta izin notifikasi...");
      const permission = await Notification.requestPermission();
      console.log("Hasil izin notifikasi:", permission);
      if (permission === "granted") {
        console.log("Izin diberikan, mulai berlangganan...");
        await this._storyModel.subscribeToPush();
        console.log("Berhasil berlangganan push notification");
        this._view.showToast("Berhasil berlangganan push notification");
        await this._storyModel.setNotificationPreference(true);
        this._view.onLoginSuccess();
      } else {
        console.warn("Izin notifikasi ditolak atau default:", permission);
        this._view.showToast("Gagal berlangganan push notification");
        await this._storyModel.setNotificationPreference(false);
        this._view.onLoginSuccess();
      }
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      this._view.showToast("Gagal berlangganan push notification");
      await this._storyModel.setNotificationPreference(false);
      this._view.onLoginSuccess();
    }
  }

  async _disableNotifications() {
    console.log("Pengguna menolak notifikasi");
    this._view.showToast("Gagal berlangganan push notification");
    await this._storyModel.setNotificationPreference(false);
    this._view.onLoginSuccess();
  }

  showLoginPrompt() {
    if (!this._authModel.isLoggedIn()) {
      this._view.render();
    }
  }
}
