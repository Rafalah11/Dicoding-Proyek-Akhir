export default class ToastUtil {
  static showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "polite");
    toast.textContent = message;
    document.body.appendChild(toast);

    // Styling untuk toast
    const style = document.createElement("style");
    style.textContent = `
      .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #333;
        color: white;
        padding: 10px 20px;
        border-radius: 4px;
        z-index: 2000;
        opacity: 1;
        transition: opacity 0.5s ease-out;
      }
      .toast.fade-out {
        opacity: 0;
      }
    `;
    document.head.appendChild(style);

    // Hilangkan toast setelah 2,5 detik
    setTimeout(() => {
      toast.classList.add("fade-out");
      setTimeout(() => toast.remove(), 500); // Tunggu animasi selesai
    }, 2500);

    console.log(`Toast displayed: ${message}`);
  }
}
