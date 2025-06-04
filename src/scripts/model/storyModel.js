import CONFIG from "../config.js";

export default class StoryModel {
  constructor(api) {
    if (!api) {
      throw new Error("API module is required for StoryModel");
    }
    this.api = api;
    console.log("StoryModel initialized with api:", !!api);
  }

  async getStories(token) {
    const result = await this.api.getStories(token);
    if (result.error)
      throw new Error(result.message || "Gagal mengambil cerita");
    return result.listStory || [];
  }

  async getPhotoBlob(photoDataUrl) {
    if (!photoDataUrl || photoDataUrl === "") {
      throw new Error("Silakan ambil foto terlebih dahulu.");
    }
    try {
      console.log("Fetching photo from URL:", photoDataUrl);
      const photoResponse = await this.api.fetch(photoDataUrl);
      if (!photoResponse.ok) {
        throw new Error(`Gagal mengunduh foto: ${photoResponse.statusText}`);
      }
      const blob = await photoResponse.blob();
      console.log("Photo blob fetched successfully, size:", blob.size);
      return blob;
    } catch (error) {
      console.error("Error fetching photo:", error);
      throw new Error(`Gagal mengunduh foto: ${error.message}`);
    }
  }

  async submitStory({ description, photoBlob, lat, lon, token }) {
    const formData = new FormData();
    formData.append("description", description);
    formData.append(
      "photo",
      new File([photoBlob], "photo.jpg", { type: "image/jpeg" })
    );
    if (lat && lon) {
      formData.append("lat", parseFloat(lat));
      formData.append("lon", parseFloat(lon));
    }

    const endpoint = token
      ? `${CONFIG.BASE_URL}/stories`
      : `${CONFIG.BASE_URL}/stories/guest`;
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      console.log("Submitting story to:", endpoint);
      const response = await this.api.post(endpoint, formData, headers);
      const result = await response.json();
      console.log("Submit story response:", result);
      if (result.error) {
        throw new Error(result.message || "Gagal menambahkan cerita");
      }
      return result;
    } catch (error) {
      console.error("Error submitting story:", error);
      throw new Error(`Gagal mengirim cerita: ${error.message}`);
    }
  }

  getToken() {
    const token = localStorage.getItem("user_token");
    console.log("Token from localStorage in StoryModel:", token);
    return token;
  }

  async subscribeToPush() {
    try {
      console.log("Mendaftarkan service worker...");
      const registration = await navigator.serviceWorker.register(
        "/service-worker.js"
      );
      console.log("Service worker terdaftar:", registration);

      console.log("Berlangganan push notification...");
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.convertBase64ToUint8Array(
          "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk"
        ),
      });
      console.log("Push subscription:", JSON.stringify(pushSubscription));

      const token = this.getToken();
      if (!token) {
        throw new Error("Token autentikasi tidak ditemukan");
      }
      console.log("Token untuk subscribe:", token);

      const subscriptionData = {
        endpoint: pushSubscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(pushSubscription.getKey("p256dh")),
          auth: this.arrayBufferToBase64(pushSubscription.getKey("auth")),
        },
      };

      if (
        !subscriptionData.endpoint ||
        !subscriptionData.keys.p256dh ||
        !subscriptionData.keys.auth
      ) {
        throw new Error("Data subscription tidak lengkap");
      }
      console.log("Subscription data:", subscriptionData);

      const response = await this.api.post(
        `${CONFIG.BASE_URL}/notifications/subscribe`,
        JSON.stringify(subscriptionData),
        {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      );
      const result = await response.json();
      console.log("Respons subscribe:", result);

      if (result.error) {
        throw new Error(result.message || "Gagal berlangganan notifikasi");
      }
      return result;
    } catch (error) {
      console.error("Error subscribeToPush:", error);
      throw new Error(`Gagal berlangganan notifikasi: ${error.message}`);
    }
  }

  async unsubscribePush() {
    try {
      console.log("Menghentikan langganan push notification...");
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        console.log("Tidak ada service worker terdaftar");
        return;
      }

      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log("Push subscription dihentikan");
      } else {
        console.log("Tidak ada subscription aktif");
      }

      await this.setNotificationPreference(false);
      console.log("Preferensi notifikasi diatur ke false");
    } catch (error) {
      console.error("Error unsubscribing push:", error);
    }
  }

  async setNotificationPreference(enabled) {
    try {
      localStorage.setItem("pushNotificationEnabled", JSON.stringify(enabled));
      console.log("Preferensi notifikasi disimpan:", enabled);
    } catch (error) {
      console.error("Gagal menyimpan preferensi notifikasi:", error);
    }
  }

  getNotificationPreference() {
    try {
      const pref = localStorage.getItem("pushNotificationEnabled");
      return pref ? JSON.parse(pref) : false;
    } catch (error) {
      console.error("Gagal membaca preferensi notifikasi:", error);
      return false;
    }
  }

  convertBase64ToUint8Array(base64String) {
    const base64 = base64String
      .padEnd(base64String.length + ((4 - (base64String.length % 4)) % 4), "=")
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = atob(base64);
    return new Uint8Array(rawData.split("").map((char) => char.charCodeAt(0)));
  }

  arrayBufferToBase64(buffer) {
    if (!buffer) {
      console.warn("Buffer kosong, mengembalikan string kosong");
      return "";
    }
    const binary = String.fromCharCode.apply(null, new Uint8Array(buffer));
    return btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }
}
