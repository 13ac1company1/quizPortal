
// celebration.js
export function showCelebration(score) {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "0";
  container.style.left = "0";
  container.style.width = "100%";
  container.style.height = "100%";
  container.style.display = "flex";
  container.style.alignItems = "center";
  container.style.justifyContent = "center";
  container.style.zIndex = "9999";
  container.style.background = "rgba(255,255,255,0.8)";
  container.innerHTML = `<div style='text-align:center'>
    <h1 style='font-size:48px;color:gold;'>🌟 ${score}/15 Stars! 🌟</h1>
    <p style='font-size:24px;'>Great job!</p>
  </div>`;
  document.body.appendChild(container);
  setTimeout(() => container.remove(), 3000);
}
