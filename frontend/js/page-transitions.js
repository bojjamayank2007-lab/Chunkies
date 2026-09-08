document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('page-enter');
});

document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('//')) return;
    if (link.target === '_blank') return;
    if (link.dataset.noTransition) return;

    e.preventDefault();
    document.body.classList.add('page-exit');

    setTimeout(() => {
        window.location.href = href;
    }, 120);
});
