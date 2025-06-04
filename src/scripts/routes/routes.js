import HomePage from "../pages/home/home-page.js";
import LoginPage from "../pages/login/login-page.js";
import RegisterPage from "../pages/register/register-page.js";
import AddStoryPage from "../pages/add-story/add-story-page.js";
import AboutPage from "../pages/about/about-page.js";
import PendingStoriesPage from "../pages/pending-stories/pending-stories-page.js";

const routes = {
  "/": new HomePage(),
  "/login": new LoginPage(),
  "/register": new RegisterPage(),
  "/add-story": new AddStoryPage(),
  "/pending-stories": new PendingStoriesPage(),
  "/about": new AboutPage(),
};

export default routes;
