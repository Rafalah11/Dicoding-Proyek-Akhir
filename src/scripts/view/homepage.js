// import StoryService from "../services/StoryService";

// export default class HomePage {
//   async render() {
//     return `
//     <main id="main-content">
//       <a href="#main-content" class="skip-link">Skip to content</a>
//       <section class="container" aria-labelledby="home-title">
//         <h1 id="home-title">Daftar Cerita</h1>
//         <div id="map" style="height: 400px; margin-bottom: 20px;"></div>
//         <div id="stories" class="stories" aria-label="Daftar cerita pengguna"></div>
//         <div id="loading" style="display: none; text-align: center; margin-top: 10px;">
//           <i class="fas fa-spinner fa-spin"></i> Memuat cerita...
//         </div>
//       </section>
//     </main>
//   `;
//   }

//   async afterRender() {
//     const storiesContainer = document.getElementById("stories");
//     const loading = document.getElementById("loading");
//     const storyService = new StoryService();

//     loading.style.display = "block";

//     try {
//       const response = await storyService.getStories({ location: 1 }); // Ambil cerita dengan lokasi
//       const stories = response.listStory || [];

//       if (stories.length === 0) {
//         storiesContainer.innerHTML = "<p>Tidak ada cerita yang tersedia.</p>";
//         return;
//       }

//       // Inisialisasi peta (seperti solusi sebelumnya)
//       const map = L.map("map").setView([-2.548926, 118.0148634], 5);
//       L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//         attribution:
//           '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//       }).addTo(map);

//       stories.forEach((story) => {
//         if (story.lat && story.lon) {
//           const marker = L.marker([story.lat, story.lon]).addTo(map);
//           marker.bindPopup(`
//           <b>${story.name}</b><br>
//           ${story.description}<br>
//           <small>${new Date(story.createdAt).toLocaleDateString()}</small>
//         `);
//         }
//       });

//       // Render daftar cerita
//       storiesContainer.innerHTML = stories
//         .map(
//           (story) => `
//           <article class="story" aria-labelledby="story-${story.id}">
//             <h2 id="story-${story.id}">${story.name}</h2>
//             <img src="${story.photoUrl}" alt="Foto cerita oleh ${
//             story.name
//           }" style="width: 100%; max-width: 300px;" />
//             <p>${story.description}</p>
//             <p><small>Dibuat pada: ${new Date(
//               story.createdAt
//             ).toLocaleDateString()}</small></p>
//             ${
//               story.lat && story.lon
//                 ? `<p>Lokasi: ${story.lat}, ${story.lon}</p>`
//                 : ""
//             }
//           </article>
//         `
//         )
//         .join("");
//     } catch (error) {
//       console.error("Gagal memuat cerita:", error);
//       storiesContainer.innerHTML =
//         '<p>Silakan <a href="#/login">login</a> untuk melihat cerita.</p>';
//     } finally {
//       loading.style.display = "none";
//     }
//   }
// }
