import HomePage from "../pages/home/home-page.js";
import LoginPage from "../pages/login/login-page.js";
import RegisterPage from "../pages/register/register-page.js";
import AddStoryPage from "../pages/add-story/add-story-page.js";
import AboutPage from "../pages/about/about-page.js";
import PendingStoriesPage from "../pages/pending-stories/pending-stories-page.js";

const routes = {
  "/": HomePage,
  "/login": LoginPage,
  "/register": RegisterPage,
  "/add-story": AddStoryPage,
  "/pending-stories": PendingStoriesPage,
  "/about": AboutPage,
};

export default routes;
