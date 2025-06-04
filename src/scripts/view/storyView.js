export default class StoryView {
  constructor() {
    this._storiesContainer = null;
    this._loadingElement = null;
    this._mapElement = null;
  }

  init() {
    this._storiesContainer = document.getElementById("stories");
    this._loadingElement = document.getElementById("loading");
    this._mapElement = document.getElementById("map");
  }

  showLoginPrompt() {
    this._storiesContainer.innerHTML = `
      <section class="container">
        <h2>Anda harus login terlebih dahulu</h2>
        <p><a href="#/login">Silakan login untuk melihat cerita.</a></p>
      </section>
    `;
  }

  showLoading() {
    this._loadingElement.style.display = "block";
  }

  hideLoading() {
    this._loadingElement.style.display = "none";
  }

  showError(message) {
    this._storiesContainer.innerHTML = `<p>${message}</p>`;
  }

  displayStories(stories) {
    if (stories.length === 0) {
      this._storiesContainer.innerHTML =
        "<p>Tidak ada cerita yang tersedia.</p>";
      return;
    }

    // Render peta
    const map = L.map(this._mapElement).setView([-2.548926, 118.0148634], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
      map
    );

    // Render cerita
    this._storiesContainer.innerHTML = stories
      .map((story) => this._createStoryHTML(story))
      .join("");

    // Tambahkan marker
    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(map);
        marker.bindPopup(this._createPopupHTML(story));
      }
    });
  }

  _createStoryHTML(story) {
    return `
      <article class="story" aria-labelledby="story-${story.id}">
        <h2 id="story-${story.id}">${story.name}</h2>
        <img src="${story.photoUrl}" alt="Foto cerita oleh ${story.name}" />
        <p>${story.description}</p>
        <p><small>Dibuat pada: ${new Date(
          story.createdAt
        ).toLocaleDateString()}</small></p>
        ${
          story.lat && story.lon
            ? `<p>Lokasi: ${story.lat}, ${story.lon}</p>`
            : ""
        }
      </article>
    `;
  }

  _createPopupHTML(story) {
    return `
      <b>${story.name}</b><br>
      ${story.description}<br>
      <small>${new Date(story.createdAt).toLocaleDateString()}</small>
    `;
  }
}
