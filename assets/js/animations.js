// Animation classes
const animationClasses = {
    fadeIn: 'animate-fade-in',
    slideInLeft: 'animate-slide-in-left',
    slideInRight: 'animate-slide-in-right',
    slideInUp: 'animate-slide-in-up',
    slideInDown: 'animate-slide-in-down',
    zoomIn: 'animate-zoom-in',
    typewriter: 'typewriter'
};

// Elements to animate
const elementsToAnimate = [
    { selector: '.hero h2', animation: 'typewriter' },
    { selector: '.hero .highlight', animation: 'typewriter' },
    { selector: '.product-card', animation: 'slideInUp' },
    { selector: '.popular .subtitle', animation: 'slideInDown' },
    { selector: '.contact-container', animation: 'fadeIn' },
    { selector: '.contact-form', animation: 'slideInUp' },
    { selector: '.contact-info', animation: 'slideInUp' }
];

// Initialize animations
function initAnimations() {
    // Create intersection observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const element = entry.target;
            const animation = elementsToAnimate.find(
                item => element.matches(item.selector)
            )?.animation;

            if (animation) {
                if (entry.isIntersecting) {
                    // Remove any existing animation classes
                    element.classList.remove(...Object.values(animationClasses));
                    // Force a reflow
                    void element.offsetWidth;
                    // Add the animation class
                    element.classList.add(animationClasses[animation]);
                } else {
                    // When element is out of view, remove animation class
                    element.classList.remove(animationClasses[animation]);
                }
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe all elements
    elementsToAnimate.forEach(({ selector }) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            observer.observe(element);
        });
    });
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', initAnimations); 