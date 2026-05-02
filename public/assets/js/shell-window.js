(() => {
    let shellDrag = null;

    function initShellWindow() {
        const shell = document.querySelector('[data-shell-window]'),
            handle = document.querySelector('[data-shell-handle]');
        if (!shell || !handle) return;
        handle.addEventListener('pointerdown', event => startShellDrag(event, shell, handle));
        window.addEventListener('pointermove', moveShell);
        window.addEventListener('pointerup', stopShellDrag);
        window.addEventListener('pointercancel', stopShellDrag);
        window.addEventListener('resize', clampMovedShell);
    }

    function startShellDrag(event, shell, handle) {
        if (typeof event.button === 'number' && event.button !== 0) return;
        const rect = shell.getBoundingClientRect();
        event.preventDefault();
        if (handle.setPointerCapture) {
            handle.setPointerCapture(event.pointerId);
        }
        shellDrag = {
            shell,
            offsetX: event.clientX - rect.left,
            offsetY: event.clientY - rect.top
        };
        shell.classList.add('is-dragging');
        shell.style.position = 'fixed';
        shell.style.left = `${rect.left}px`;
        shell.style.top = `${rect.top}px`;
        shell.style.width = `${rect.width}px`;
        shell.style.maxWidth = 'none';
    }

    function moveShell(event) {
        if (!shellDrag) return;
        const rect = shellDrag.shell.getBoundingClientRect(),
            nextLeft = clamp(event.clientX - shellDrag.offsetX, 0, Math.max(0, window.innerWidth - rect.width)),
            nextTop = clamp(event.clientY - shellDrag.offsetY, 0, Math.max(0, window.innerHeight - rect.height));
        shellDrag.shell.style.left = `${nextLeft}px`;
        shellDrag.shell.style.top = `${nextTop}px`;
    }

    function stopShellDrag() {
        if (!shellDrag) return;
        shellDrag.shell.classList.remove('is-dragging');
        shellDrag = null;
    }

    function clampMovedShell() {
        const shell = document.querySelector('[data-shell-window]');
        if (!shell || shell.style.position !== 'fixed') return;
        const rect = shell.getBoundingClientRect(),
            nextWidth = Math.min(rect.width, window.innerWidth),
            nextLeft = clamp(rect.left, 0, Math.max(0, window.innerWidth - nextWidth)),
            nextTop = clamp(rect.top, 0, Math.max(0, window.innerHeight - rect.height));
        shell.style.width = `${nextWidth}px`;
        shell.style.left = `${nextLeft}px`;
        shell.style.top = `${nextTop}px`;
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    initShellWindow();
})();
