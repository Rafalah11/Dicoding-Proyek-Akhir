export default class LoginPromptView {
  static showLoginPrompt(container) {
    container.innerHTML = `
      <section class="container">
        <h2>Anda harus login terlebih dahulu</h2>
        <p><a href="#/login">Silakan login untuk menambah cerita123.</a></p>
      </section>
    `;
  }
}
