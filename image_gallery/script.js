
const photos = [
  {
    title: "Into the Wild",
    category: "nature",
    src: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=85"
  },
  {
    title: "Mountain Dreams",
    category: "nature",
    src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=85"
  },
  {
    title: "Ocean Escape",
    category: "nature",
    src: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=85"
  },
  {
    title: "City Lights",
    category: "city",
    src: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=85"
  },
  {
    title: "Urban Stories",
    category: "city",
    src: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=900&q=85"
  },
  {
    title: "Above the Streets",
    category: "city",
    src: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=85"
  },
  {
    title: "Coastal Journey",
    category: "travel",
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=85"
  },
  {
    title: "Paradise Found",
    category: "travel",
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=85"
  },
  {
    title: "Road to Somewhere",
    category: "travel",
    src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=900&q=85"
  },
  {
    title: "Wild and Free",
    category: "animals",
    src: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=900&q=85"
  },
  {
    title: "Little Explorer",
    category: "animals",
    src: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=85"
  },
  {
    title: "Into the Blue",
    category: "animals",
    src: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=900&q=85"
  }
];

const galleryGrid = document.getElementById("galleryGrid");
const filters = document.getElementById("filters");
const imageCount = document.getElementById("imageCount");

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxTitle = document.getElementById("lightboxTitle");
const lightboxCategory = document.getElementById("lightboxCategory");
const imageCounter = document.getElementById("imageCounter");

const closeBtn = document.getElementById("closeBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let currentCategory = "all";
let visiblePhotos = [...photos];
let currentIndex = 0;
let lastFocusedElement = null;

// Display images in the gallery
function renderGallery() {
  visiblePhotos = currentCategory === "all"
    ? [...photos]
    : photos.filter(photo => photo.category === currentCategory);

  galleryGrid.innerHTML = "";

  visiblePhotos.forEach((photo, index) => {
    const card = document.createElement("article");
    card.className = "photo-card";
    card.style.animationDelay = `${index * 45}ms`;
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `View ${photo.title}`);

    const imageWrap = document.createElement("div");
    imageWrap.className = "photo-wrap";

    const img = document.createElement("img");
    img.src = photo.src;
    img.alt = photo.title;
    img.loading = "lazy";

    // Display a fallback if an image cannot load
    img.onerror = () => {
      img.onerror = null;
      img.alt = `${photo.title} image unavailable`;
      img.src = "https://placehold.co/800x600/252620/f3f0e8?text=Image+Unavailable";
    };

    const overlay = document.createElement("div");
    overlay.className = "photo-overlay";

    const viewIcon = document.createElement("span");
    viewIcon.className = "view-icon";
    viewIcon.textContent = "↗";
    viewIcon.setAttribute("aria-hidden", "true");

    overlay.appendChild(viewIcon);
    imageWrap.append(img, overlay);

    const details = document.createElement("div");
    details.className = "photo-details";

    const categoryLabel = document.createElement("p");
    categoryLabel.className = "photo-category";
    categoryLabel.textContent = photo.category;

    const title = document.createElement("h3");
    title.textContent = photo.title;

    details.append(categoryLabel, title);
    card.append(imageWrap, details);

    card.addEventListener("click", () => openLightbox(index));

    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(index);
      }
    });

    galleryGrid.appendChild(card);
  });

  imageCount.textContent =
    `${visiblePhotos.length} photographs`;
}

// Category filtering
filters.addEventListener("click", event => {
  const button = event.target.closest(".filter-btn");

  if (!button) return;

  currentCategory = button.dataset.category;

  filters.querySelectorAll(".filter-btn").forEach(btn => {
    const selected = btn === button;
    btn.classList.toggle("active", selected);
    btn.setAttribute("aria-pressed", String(selected));
  });

  renderGallery();
});

// Open the selected image
function openLightbox(index) {
  if (!visiblePhotos.length) return;

  lastFocusedElement = document.activeElement;
  currentIndex = index;
  updateLightbox();

  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");

  closeBtn.focus();
}

// Update the large image and its details
function updateLightbox() {
  const photo = visiblePhotos[currentIndex];

  lightboxImage.src = photo.src;
  lightboxImage.alt = photo.title;
  lightboxTitle.textContent = photo.title;
  lightboxCategory.textContent = photo.category;
  imageCounter.textContent =
    `${currentIndex + 1} / ${visiblePhotos.length}`;
}

// Show the next image
function nextImage() {
  currentIndex = (currentIndex + 1) % visiblePhotos.length;
  updateLightbox();
}

// Show the previous image
function previousImage() {
  currentIndex =
    (currentIndex - 1 + visiblePhotos.length) % visiblePhotos.length;
  updateLightbox();
}

// Close the lightbox
function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");

  lightboxImage.removeAttribute("src");

  if (lastFocusedElement && lastFocusedElement.isConnected) {
    lastFocusedElement.focus();
  }
}

// Navigation buttons
nextBtn.addEventListener("click", nextImage);
prevBtn.addEventListener("click", previousImage);
closeBtn.addEventListener("click", closeLightbox);

// Close when clicking the dark background
lightbox.addEventListener("click", event => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

// Keyboard navigation
document.addEventListener("keydown", event => {
  if (!lightbox.classList.contains("open")) return;

  if (event.key === "ArrowRight") {
    nextImage();
  } else if (event.key === "ArrowLeft") {
    previousImage();
  } else if (event.key === "Escape") {
    closeLightbox();
  }
});

// Initial gallery
renderGallery();