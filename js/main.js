// Main JavaScript File

// Dark Mode Toggle
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

// Check for saved theme preference or use system preference
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

// Set initial theme
const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
setTheme(initialTheme);

// Update icon based on theme
function updateThemeIcon(theme) {
    if (theme === 'dark') {
        themeIcon.className = 'fas fa-sun';
        themeIcon.style.color = '#FFD700';
    } else {
        themeIcon.className = 'fas fa-moon';
        themeIcon.style.color = '#fff';
    }
}

// Set theme
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeIcon(theme);
}

// Toggle theme
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
});

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
// for open and close dropdown in navbar
const dropdownBtn = document.getElementById("loginDropdown");

if (dropdownBtn) {  // تحقق من وجود الزر
    const dropdownMenu = dropdownBtn.nextElementSibling;

    if (dropdownMenu) {  // تحقق من وجود القائمة
        dropdownBtn.addEventListener("click", () => {
            const expanded = dropdownBtn.getAttribute("aria-expanded") === "true";
            dropdownBtn.setAttribute("aria-expanded", !expanded);
            dropdownMenu.style.display = expanded ? "none" : "block";
        });
    }
}


// إغلاق القائمة عند الضغط خارجها
document.addEventListener("click", (e) => {
    if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.style.display = "none";
        dropdownBtn.setAttribute("aria-expanded", "false");
    }
});


// Scroll Animation
function checkScroll() {
    const elements = document.querySelectorAll('.fadeInUp, .fadeIn, .zoomIn, .slideInRight, .slideInLeft');

    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('animated');
        }
    });
}

// Run on scroll
window.addEventListener('scroll', checkScroll);

// Run on load
window.addEventListener('load', checkScroll);

// Mobile Menu Toggle (if needed)
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.navbar-nav');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('show');
    });
}

// Search Functionality
function searchMedicine() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.trim().toLowerCase();
    console.log("done")
    if (searchTerm.length === 0) {
        console.log("Emptys")
        const error = document.getElementById("searchError");
        error.textContent = "الرجاء إدخال اسم الدواء";
        error.style.display = "block";
        return;
    }

    // Redirect to search page with query parameter

    window.location.href = `search.html?query=${encodeURIComponent(searchTerm)}`;
}

// Load JSON Data
async function loadJSONData() {
    try {
        const response = await fetch('data/data.json');
        if (!response.ok) {
            throw new Error('Failed to load data');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading JSON data:', error);
        return null;
    }
}

// Initialize on DOMContentLoaded
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('Medicine Finder - Website Loaded');

        // Check for theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setTheme(savedTheme);
        }
    });
}