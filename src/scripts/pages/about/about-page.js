export default class AboutPage {
  async render() {
    return `
      <main id="main-content">
        <a href="#main-content" class="skip-link">Skip to content</a>
        <section class="container" aria-labelledby="about-title">
          <h1 id="about-title">About Page</h1>
          <article>
            <p>Ini adalah halaman tentang aplikasi kami.</p>
          </article>
        </section>
      </main>
    `;
  }

  async afterRender() {
    if (document.startViewTransition) {
      document.startViewTransition();
    }
  }
}
