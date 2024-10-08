let next = document.querySelector('.next');
let prev = document.querySelector('.prev');

// Function to slide the items to the next
function slideNext() {
    let items = document.querySelectorAll('.item');
    document.querySelector('.slide').appendChild(items[0]);
}

// Function to slide the items to the previous
function slidePrev() {
    let items = document.querySelectorAll('.item');
    document.querySelector('.slide').prepend(items[items.length - 1]);
}

next.addEventListener('click', slideNext);
prev.addEventListener('click', slidePrev);

// Add event listener for mouse wheel scroll
window.addEventListener('wheel', function (event) {
    if (event.deltaY > 0) {
        // Scrolling down
        slideNext();
    } else {
        // Scrolling up
        slidePrev();
    }
});
