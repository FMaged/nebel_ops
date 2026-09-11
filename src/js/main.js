/* ==========================================================================
   Nebel Lounge — gemeinsames JavaScript
   1. Mobiles Menü öffnen / schließen
   2. Header verkleinern beim Scrollen
   3. Abschnitte beim Scrollen einblenden
   Alles respektiert prefers-reduced-motion.
   ========================================================================== */

// Möchte der Nutzer weniger Bewegung?
var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* 1. Mobiles Menü ---------------------------------------------------------- */
var burger = document.querySelector(".burger");
var nav = document.querySelector(".nav");

if (burger && nav) {
  burger.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
  });

  // Nach einem Klick auf einen Link schließt sich das Menü wieder
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      nav.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    }
  });

  // Escape schließt das Menü
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      nav.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      burger.focus();
    }
  });
}

/* 2. Header beim Scrollen ------------------------------------------------- */
var header = document.querySelector(".header");

function onScroll() {
  if (!header) return;
  if (window.scrollY > 40) {
    header.classList.add("is-scrolled");
  } else {
    header.classList.remove("is-scrolled");
  }
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* 3. Abschnitte einblenden ------------------------------------------------ */
var revealItems = document.querySelectorAll(".reveal");

if (reduceMotion || !("IntersectionObserver" in window)) {
  // Ohne Animation: alles sofort sichtbar
  revealItems.forEach(function (el) { el.classList.add("is-in"); });
} else {
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });

  revealItems.forEach(function (el) { observer.observe(el); });
}

/* 3b. Anfrageformular (events.html) --------------------------------------- */
// Das Formular ist ein echtes POST-Formular und funktioniert auch ohne
// JavaScript. Mit JavaScript schicken wir es im Hintergrund und zeigen die
// Bestätigung direkt auf der Seite, ohne Seitenwechsel.
var form = document.querySelector("#anfrage");
var formOk = document.querySelector("#anfrage-ok");
var formError = document.querySelector("#anfrage-fehler");

function zeige(box) {
  box.classList.add("is-visible");
  box.setAttribute("tabindex", "-1");
  box.focus();
}

if (form && formOk && formError) {
  form.addEventListener("submit", function (e) {
    // Ohne novalidate feuert submit nur, wenn der Browser das Formular
    // für gültig hält — eigene Prüfung ist nicht nötig.
    var ziel = form.getAttribute("action");

    if (!ziel) {
      // Kein Endpunkt hinterlegt (site.yaml: formAction). Lieber ehrlich
      // scheitern als eine Bestätigung zeigen, der nichts folgt.
      e.preventDefault();
      zeige(formError);
      return;
    }

    e.preventDefault();
    var senden = form.querySelector("button[type=submit]");
    if (senden) { senden.disabled = true; }

    fetch(ziel, { method: "POST", body: new FormData(form) })
      .then(function (antwort) {
        if (!antwort.ok) { throw new Error(antwort.status); }
        form.hidden = true;
        zeige(formOk);
      })
      .catch(function () {
        if (senden) { senden.disabled = false; }
        zeige(formError);
      });
  });
}

/* 4. Heutigen Tag in den Öffnungszeiten markieren ------------------------- */
// Jede Zeile hat data-day="1" (Montag) bis data-day="0" (Sonntag).
var today = String(new Date().getDay());
document.querySelectorAll("[data-day]").forEach(function (row) {
  if (row.getAttribute("data-day").split(",").indexOf(today) !== -1) {
    row.classList.add("is-today");
  }
});
