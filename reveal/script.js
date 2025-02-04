/*
const element = document.getElementById("secret");
const OFFSET = 80; // snap to this postion for the sliders to work correctly
// center the element within the viewport BUT with the added snap to offset to ensure that the 
function centerElementWithSnap() {
  const x = (window.innerWidth - element.offsetWidth) / 2;
  const y = (window.innerHeight - element.offsetHeight) / 2;
  const snappedPosition = Math.round(x / OFFSET) * OFFSET;

  element.style.left = `${snappedPosition}px`;
  element.style.top = `${y}px`;
}
centerElementWithSnap();
window.addEventListener('resize', () => centerElementWithSnap());
*/