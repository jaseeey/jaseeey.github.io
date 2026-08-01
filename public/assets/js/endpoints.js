(() => {
    const resolveDelay = 700,
        resolveStep = 190,
        placeholderHref = '#',
        endpointRegistry = [
            {
                key: 'email',
                index: '01',
                label: 'email',
                ariaLabel: 'Email JI DEV',
                isExternal: false,
                display: [109, 101, 64, 106, 97, 115, 101, 121, 46, 105, 111],
                hrefPrefix: [109, 97, 105, 108, 116, 111, 58],
                href: [109, 101, 64, 106, 97, 115, 101, 121, 46, 105, 111]
            },
            {
                key: 'github',
                index: '02',
                label: 'github',
                ariaLabel: 'Open GitHub',
                isExternal: true,
                display: [
                    103, 105, 116, 104, 117, 98, 46, 99, 111, 109, 47,
                    106, 97, 115, 101, 101, 101, 121
                ],
                href: [
                    104, 116, 116, 112, 115, 58, 47, 47, 103, 105, 116, 104,
                    117, 98, 46, 99, 111, 109, 47, 106, 97, 115, 101, 101,
                    101, 121
                ]
            },
            {
                key: 'blog',
                index: '03',
                label: 'blog',
                ariaLabel: 'Open blog',
                isExternal: true,
                display: [106, 97, 115, 101, 121, 46, 98, 108, 111, 103],
                href: [104, 116, 116, 112, 115, 58, 47, 47, 106, 97, 115, 101, 121, 46, 98, 108, 111, 103]
            },
            {
                key: 'linkedin',
                index: '04',
                label: 'linkedin',
                ariaLabel: 'Open LinkedIn',
                isExternal: true,
                display: [
                    108, 105, 110, 107, 101, 100, 105, 110, 46, 99, 111, 109,
                    47, 105, 110, 47, 106, 97, 115, 101, 101, 101, 121
                ],
                href: [
                    104, 116, 116, 112, 115, 58, 47, 47, 119, 119, 119, 46,
                    108, 105, 110, 107, 101, 100, 105, 110, 46, 99, 111, 109,
                    47, 105, 110, 47, 106, 97, 115, 101, 101, 101, 121, 47
                ]
            },
            {
                key: 'stack',
                index: '05',
                label: 'stack',
                ariaLabel: 'Open Stack Overflow',
                isExternal: true,
                display: [
                    115, 116, 97, 99, 107, 111, 118, 101, 114, 102, 108, 111,
                    119, 47, 50, 49, 51, 48, 50, 53, 54
                ],
                href: [
                    104, 116, 116, 112, 115, 58, 47, 47, 115, 116, 97, 99,
                    107, 111, 118, 101, 114, 102, 108, 111, 119, 46, 99, 111, 109,
                    47, 117, 115, 101, 114, 115, 47, 50, 49, 51, 48, 50, 53, 54
                ]
            }
        ];
    const timers = [];

    window.addEventListener('pagehide', teardownEndpoints);

    /**
     * Public endpoint surface consumed by the terminal session.
     *
     * @type {{all: function, find: function, open: function}}
     */
    window.jaseyEndpoints = {
        all: listEndpoints,
        find: findEndpoint,
        open: openEndpoint
    };

    function initEndpoints() {
        endpointRegistry.forEach((entry, entryIndex) => {
            const link = getLink(entry.key);
            if (!link) return;
            link.dataset.resolved = 'false';
            bindDeferredHref(entry, link);
            timers.push(window.setTimeout(() => resolveEndpoint(entry, link), resolveDelay + entryIndex * resolveStep));
        });
    }

    function bindDeferredHref(entry, link) {
        ['pointerenter', 'pointerdown', 'focus'].forEach(eventName => {
            link.addEventListener(eventName, () => materializeHref(entry, link));
        });
        link.addEventListener('touchstart', () => materializeHref(entry, link), {passive: true});
        link.addEventListener('click', event => {
            materializeHref(entry, link);
            if (link.dataset.resolved !== 'true') {
                event.preventDefault();
            }
        });
    }

    function materializeHref(entry, link) {
        if (link.getAttribute('href') !== placeholderHref) return;
        link.href = `${decodeCodes(entry.hrefPrefix || [])}${decodeCodes(entry.href)}`;
        if (entry.isExternal) {
            link.target = '_blank';
            link.rel = 'noreferrer';
        }
    }

    function resolveEndpoint(entry, link) {
        const value = link.querySelector('[data-endpoint-value]');
        if (!value) return;
        value.textContent = decodeCodes(entry.display);
        link.setAttribute('aria-label', entry.ariaLabel);
        link.dataset.resolved = 'true';
    }

    /**
     * Lists every endpoint as a plain view object for the session's `ls` output and tab completion.
     *
     * @returns {Object[]} - One entry per endpoint, in registry order.
     */
    function listEndpoints() {
        return endpointRegistry.map(toView);
    }

    /**
     * Resolves a user-supplied token to an endpoint, accepting a name, a padded number or a bare number.
     *
     * @param {string} token - The argument typed at the prompt, for example `github`, `02` or `2`.
     * @returns {Object|null} - The matching endpoint view, or null when nothing matches.
     */
    function findEndpoint(token) {
        if (!token) return null;
        const query = String(token).toLowerCase(),
            entry = endpointRegistry.find(candidate => candidate.key === query
                || candidate.index === query
                || String(Number(candidate.index)) === query);
        return entry ? toView(entry) : null;
    }

    /**
     * Opens an endpoint by driving its anchor, so the browser applies the same navigation rules a pointer would.
     *
     * @param {string} key - The endpoint key, for example `linkedin`.
     * @returns {boolean} - True when the endpoint was opened, false when it has not resolved yet.
     */
    function openEndpoint(key) {
        const entry = endpointRegistry.find(candidate => candidate.key === key),
            link = entry ? getLink(entry.key) : null;
        if (!entry || !link || link.dataset.resolved !== 'true') return false;
        materializeHref(entry, link);
        link.click();
        return true;
    }

    function toView(entry) {
        const link = getLink(entry.key),
            isResolved = !!link && link.dataset.resolved === 'true';
        return {
            key: entry.key,
            index: entry.index,
            label: entry.label,
            isResolved,
            value: isResolved ? decodeCodes(entry.display) : null
        };
    }

    function getLink(key) {
        return document.querySelector(`[data-endpoint="${key}"]`);
    }

    function decodeCodes(codes) {
        return String.fromCharCode(...codes);
    }

    function teardownEndpoints() {
        timers.forEach(window.clearTimeout);
        timers.length = 0;
    }

    initEndpoints();
})();
