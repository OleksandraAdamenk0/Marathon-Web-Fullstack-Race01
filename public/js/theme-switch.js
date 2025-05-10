const toggleButton = document.querySelector(".theme-switch__checkbox");

function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
}

toggleButton.addEventListener("click", (e) => {
    const currentTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    setTheme(currentTheme);
    e.stopPropagation();
});

document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    toggleButton.checked = savedTheme === "dark";
});