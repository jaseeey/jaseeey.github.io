(() => {
    function initNotFound() {
        const path = document.querySelector('[data-notfound-path]');
        if (!path) return;
        path.textContent = `${window.location.pathname}${window.location.search}`;
    }

    initNotFound();
})();
