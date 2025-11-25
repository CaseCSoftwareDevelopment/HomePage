const preloadImages = () => {
  const images = [
    'about-image.jpg',
    'services-image.jpg',
    'contact-image.jpg'
  ];
  
  images.forEach(img => {
    new Image().src = img;
  });
};

window.addEventListener('load', preloadImages);

javascript
// Comprehensive image debugging
console.log('=== DEBUGGING SIDEBAR IMAGE ===');

// Test multiple path variations
const testPaths = [
    'images/beach.jpg',
    './images/beach.jpg',
    '/images/beach.jpg',
    'beach.jpg'
];

testPaths.forEach((path, index) => {
    const testImg = new Image();
    testImg.onload = function() {
        console.log(`✅ SUCCESS with path "${path}"`);
        // If this works, apply it to the sidebar immediately
        document.getElementById('sidebar').style.backgroundImage = `url('${path}')`;
    };
    testImg.onerror = function() {
        console.log(`❌ FAILED with path "${path}"`);
    };
    testImg.src = path;
});

// Check current CSS
const sidebar = document.getElementById('sidebar');
const computedStyle = window.getComputedStyle(sidebar);
console.log('Current background-image:', computedStyle.backgroundImage);
console.log('Sidebar visibility:', computedStyle.display, computedStyle.visibility);
console.log('Sidebar dimensions:', sidebar.offsetWidth, 'x', sidebar.offsetHeight);
