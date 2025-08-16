const preloadImages = () => {
  const images = [
    'about-image.jpg',
    'services-image.jpg',
    'contact-image.jpg'
  ];
  images.forEach(img => new Image().src = img);
};
window.addEventListener('load', preloadImages);