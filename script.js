const themeToggle = document.getElementById("themeToggle");
const themeLabel = document.getElementById("themeLabel");
const root = document.documentElement;
const nav = document.querySelector(".site-nav");
const navToggle = document.querySelector(".nav-toggle");
const yearNode = document.getElementById("year");

const savedTheme = localStorage.getItem("portfolio-theme");
if (savedTheme) {
  root.setAttribute("data-theme", savedTheme);
  themeLabel.textContent = savedTheme === "light" ? "Light" : "Dark";
}

const updateTheme = (theme) => {
  root.setAttribute("data-theme", theme);
  localStorage.setItem("portfolio-theme", theme);
  themeLabel.textContent = theme === "light" ? "Light" : "Dark";
};

themeToggle.addEventListener("click", () => {
  const nextTheme = root.getAttribute("data-theme") === "light" ? "dark" : "light";
  updateTheme(nextTheme);
});

navToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

yearNode.textContent = new Date().getFullYear();
