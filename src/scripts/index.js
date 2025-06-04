import "../styles/styles.css";
import App from "./pages/app.js";
import AuthService from "./services/authService.js";
import {
  openDB,
  getPendingStories,
  deletePendingStory,
} from "./utils/indexedDB.js";
import StoryModel from "./model/storyModel.js";
import api from "./data/api.js";
import ToastUtil from "./utils/toast.js";

const authService = new AuthService();
const storyModel = new StoryModel(api);

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Index.js: Initializing App");

  try {
    await openDB();
    console.log("IndexedDB initialized");
  } catch (error) {
    console.error("Failed to initialize IndexedDB:", error);
  }

  const navigationDrawer = document.querySelector("#navigation-drawer");
  const drawerButton = document.querySelector("#drawer-button");
  const content = document.querySelector("#main-content");

  if (!navigationDrawer || !drawerButton || !content) {
    console.error("Index.js: Missing required DOM elements", {
      navigationDrawer,
      drawerButton,
      content,
    });
    return;
  }

  const app = new App({
    navigationDrawer,
    drawerButton,
    content,
  });

  // Definisikan runTransition sebelum pemanggilan
  let lastHash = window.location.hash;
  const runTransition = () => {
    console.log(
      "Running transition for path:",
      window.location.pathname + window.location.hash
    );
    if (document.startViewTransition) {
      document.startViewTransition(() => app.renderPage());
    } else {
      app.renderPage();
    }
  };

  // Render halaman awal
  console.log("Rendering initial page");
  runTransition(); // Panggil runTransition untuk render awal

  window.addEventListener("hashchange", () => {
    if (window.location.hash !== lastHash) {
      console.log("Hash changed:", window.location.hash);
      lastHash = window.location.hash;
      runTransition();
    } else {
      console.log("Hash unchanged, skipping render");
    }
  });

  // Sync pending stories when online
  const syncPendingStories = async () => {
    if (navigator.onLine) {
      try {
        const pendingStories = await getPendingStories();
        if (!pendingStories.length) {
          console.log("Tidak ada cerita tertunda.");
          return;
        }

        for (const story of pendingStories) {
          if (!story.id || isNaN(Number(story.id))) {
            console.warn("Cerita tidak memiliki ID valid:", story);
            continue;
          }

          console.log("Menyinkronkan cerita dengan ID:", story.id);
          await storyModel.submitStory({
            description: story.description,
            photoBlob: await storyModel.getPhotoBlob(story.photoDataUrl),
            lat: story.lat,
            lon: story.lon,
            token: storyModel.getToken(),
          });
          await deletePendingStory(story.id);
          ToastUtil.showToast(
            `Cerita "${story.description}" telah disinkronkan dan dihapus.`
          );
          console.log("Cerita tersinkronkan dan dihapus:", story.id);
        }
      } catch (error) {
        console.error("Gagal menyinkronkan cerita tertunda:", error);
        ToastUtil.showToast(
          "Gagal menyinkronkan cerita tertunda: " + error.message
        );
      }
    }
  };

  window.addEventListener("online", syncPendingStories);
  syncPendingStories();

  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", (e) => {
      e.preventDefault();
      authService.logout();
    });
  } else {
    console.warn("Index.js: Logout button not found in DOM");
  }

  const skipLink = document.querySelector(".skip-link");
  const mainContent = document.querySelector("#main-content");

  if (skipLink && mainContent) {
    skipLink.addEventListener("click", function (event) {
      event.preventDefault();
      skipLink.blur();
      mainContent.setAttribute("tabindex", "-1");
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: "smooth" });
    });
  } else {
    console.warn("Index.js: Skip link or main content not found in DOM");
  }
});
