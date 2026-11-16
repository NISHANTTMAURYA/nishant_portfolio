if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const dividerObserver = new IntersectionObserver(entries => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.querySelector('.title-rule').classList.replace('is-awaiting-reveal', 'is-revealing');
            dividerObserver.unobserve(entry.target);
        }
    }, { threshold: 0.35 });

    for (const divider of document.querySelectorAll('.title-rule')) {
        divider.classList.add('is-awaiting-reveal');
        dividerObserver.observe(divider.parentElement);
    }
}

const story = document.querySelector('.business-needs');
const storyPin = story.querySelector('.story-pin');
const storyFooter = story.querySelector('.story-footer');
const scenes = Array.from(story.querySelectorAll('.story-scene'));
const storyMotion = window.matchMedia('(prefers-reduced-motion: no-preference) and (min-height: 480px)');
const clampProgress = value => Math.max(0, Math.min(1, value));
let storyFrame = 0;
let previousProgress = -1;
let activeScene = -1;
let storyInView = !('IntersectionObserver' in window);

function renderStory() {
    storyFrame = 0;
    const bounds = story.getBoundingClientRect();
    const distance = bounds.height - storyPin.getBoundingClientRect().height;
    if (distance <= 0) return;

    const progress = clampProgress(-bounds.top / distance);
    if (progress === previousProgress) return;
    previousProgress = progress;
    storyPin.style.setProperty('--story-progress', progress);

    // Leave each scene fully visible between transitions, with a hold at each end.
    const beat = Math.max(0, Math.min(scenes.length - 1, progress * scenes.length - 0.5));
    const from = Math.floor(beat);
    const transition = clampProgress((beat - from - 0.24) / 0.52);
    const eased = transition * transition * (3 - 2 * transition);
    const position = from + eased;
    const nextActive = Math.round(position);

    scenes.forEach((scene, index) => {
        const offset = Math.max(-1, Math.min(1, index - position));
        const visibility = 1 - Math.abs(offset);
        scene.style.setProperty('--scene-opacity', visibility);
        scene.style.setProperty('--copy-offset', `${offset * 30}px`);
        scene.style.setProperty('--art-offset', `${offset * 68}px`);
        scene.style.setProperty('--art-scale', 0.94 + visibility * 0.06);
        if (storyInView && visibility >= 0.35) scene.classList.add('is-playing');
        else if (visibility === 0) scene.classList.remove('is-playing');
        if (nextActive !== activeScene) scene.toggleAttribute('inert', index !== nextActive);
    });
    activeScene = nextActive;
}

function queueStoryRender() {
    if (storyMotion.matches && !storyFrame) storyFrame = requestAnimationFrame(renderStory);
}

function setStoryLayout() {
    story.classList.toggle('is-scroll-story', storyMotion.matches);
    storyFooter.hidden = !storyMotion.matches;
    previousProgress = -1;
    activeScene = -1;

    if (storyMotion.matches) {
        renderStory();
    } else {
        cancelAnimationFrame(storyFrame);
        storyFrame = 0;
        scenes.forEach(scene => {
            scene.removeAttribute('inert');
            scene.classList.remove('is-playing');
        });
    }
}

story.style.setProperty('--story-count', scenes.length);
storyMotion.addEventListener('change', setStoryLayout);
window.addEventListener('scroll', queueStoryRender, { passive: true });
window.addEventListener('resize', queueStoryRender);
setStoryLayout();

if ('IntersectionObserver' in window) {
    const storyObserver = new IntersectionObserver(([entry]) => {
        storyInView = entry.isIntersecting;
        if (storyInView) {
            previousProgress = -1;
            queueStoryRender();
        }
    }, { threshold: 0.55 });
    storyObserver.observe(storyPin);
}
