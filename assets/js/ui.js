const navbar = document.querySelector(".navbar");
const links = [...document.querySelectorAll(".nav-links a")];
const page = document.body.dataset.page;

function blurOnScroll() {
  if (!navbar) return;
  if (window.scrollY > 10) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
}

function activateNav() {
  const map = {
    today: "today.html",
    calendar: "calendar.html",
    progress: "progress.html",
    profile: "profile.html",
  };
  const target = map[page];
  links.forEach((link) => {
    if (target && link.getAttribute("href").includes(target)) {
      link.classList.add("active-link");
    }
  });
}

window.addEventListener("scroll", blurOnScroll);
blurOnScroll();
activateNav();
