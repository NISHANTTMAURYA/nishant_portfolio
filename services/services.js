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
