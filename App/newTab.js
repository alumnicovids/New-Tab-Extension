document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll("#nav-list a");
  const sites = document.querySelectorAll(".website-container > div");

  const switchSite = (targetSiteId) => {
    sites.forEach((site) => {
      site.classList.remove("active-site");
    });

    const targetSite = document.getElementById(targetSiteId);
    if (targetSite) {
      targetSite.classList.add("active-site");
    }
  };

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      const targetId = link.getAttribute("href").substring(1);
      switchSite(targetId);
    });
  });
});
