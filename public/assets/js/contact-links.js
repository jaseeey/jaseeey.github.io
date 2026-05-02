(() => {
    const contactRevealDelay = 3200,
        contactEntries = {
            email: {
                display: [109, 101, 64, 106, 97, 115, 101, 121, 46, 105, 111],
                href: [109, 101, 64, 106, 97, 115, 101, 121, 46, 105, 111],
                hrefPrefix: [109, 97, 105, 108, 116, 111, 58],
                ariaLabel: [69, 109, 97, 105, 108, 32, 74, 73, 32, 68, 69, 86]
            },
            github: {
                display: [
                    103, 105, 116, 104, 117, 98, 46, 99, 111, 109, 47,
                    106, 97, 115, 101, 101, 101, 121
                ],
                href: [
                    104, 116, 116, 112, 115, 58, 47, 47, 103, 105, 116, 104,
                    117, 98, 46, 99, 111, 109, 47, 106, 97, 115, 101, 101,
                    101, 121
                ],
                ariaLabel: [79, 112, 101, 110, 32, 71, 105, 116, 72, 117, 98],
                isExternal: true
            },
            blog: {
                display: [106, 97, 115, 101, 121, 46, 98, 108, 111, 103],
                href: [104, 116, 116, 112, 115, 58, 47, 47, 106, 97, 115, 101, 121, 46, 98, 108, 111, 103],
                ariaLabel: [79, 112, 101, 110, 32, 98, 108, 111, 103],
                isExternal: true
            },
            linkedin: {
                display: [47, 105, 110, 47, 106, 97, 115, 101, 101, 101, 121],
                href: [
                    104, 116, 116, 112, 115, 58, 47, 47, 119, 119, 119, 46,
                    108, 105, 110, 107, 101, 100, 105, 110, 46, 99, 111, 109,
                    47, 105, 110, 47, 106, 97, 115, 101, 101, 101, 121, 47
                ],
                ariaLabel: [79, 112, 101, 110, 32, 76, 105, 110, 107, 101, 100, 73, 110],
                isExternal: true
            },
            stack: {
                display: [
                    115, 116, 97, 99, 107, 111, 118, 101, 114, 102, 108, 111,
                    119, 47, 50, 49, 51, 48, 50, 53, 54
                ],
                href: [
                    104, 116, 116, 112, 115, 58, 47, 47, 115, 116, 97, 99,
                    107, 111, 118, 101, 114, 102, 108, 111, 119, 46, 99, 111, 109,
                    47, 117, 115, 101, 114, 115, 47, 50, 49, 51, 48, 50, 53, 54
                ],
                ariaLabel: [79, 112, 101, 110, 32, 83, 116, 97, 99, 107, 32, 79, 118, 101, 114, 102, 108, 111, 119],
                isExternal: true
            }
        };
    let selectedContactIndex = -1;

    function initContactLinks() {
        window.setTimeout(hydrateContactLinks, contactRevealDelay);
        initializeContactKeyboard();
    }

    function hydrateContactLinks() {
        getContactLinks().forEach(link => {
            const entry = contactEntries[link.dataset.contactLink],
                value = link.querySelector('[data-contact-value]');
            if (!entry || !value) return;
            link.href = `${decodeContact(entry.hrefPrefix || [])}${decodeContact(entry.href)}`;
            link.setAttribute('aria-label', decodeContact(entry.ariaLabel));
            link.dataset.contactResolved = 'true';
            value.textContent = decodeContact(entry.display);
            if (entry.isExternal) {
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
            }
        });
    }

    function initializeContactKeyboard() {
        getContactLinks().forEach(link => {
            link.addEventListener('click', event => {
                if (link.dataset.contactResolved !== 'true') {
                    event.preventDefault();
                }
            });
        });
        window.addEventListener('keydown', handleContactKeydown);
    }

    function handleContactKeydown(event) {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        if (event.target && event.target.matches && event.target.matches('input, textarea, select, button')) return;
        if (/^[1-5]$/.test(event.key)) {
            event.preventDefault();
            const link = selectContactByNumber(event.key);
            activateContact(link);
            return;
        }
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            moveContactSelection(1);
            return;
        }
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            moveContactSelection(-1);
            return;
        }
        if (event.key === 'Enter' && selectedContactIndex >= 0) {
            event.preventDefault();
            activateContact(getContactLinks()[selectedContactIndex]);
        }
    }

    function selectContactByNumber(number) {
        const link = getContactLinks().find(contactLink => contactLink.dataset.contactIndex === number);
        return selectContact(link);
    }

    function selectContact(link) {
        const links = getContactLinks(),
            nextIndex = links.indexOf(link);
        if (nextIndex < 0) return null;
        selectedContactIndex = nextIndex;
        links.forEach((contactLink, linkIndex) => {
            contactLink.classList.toggle('is-selected', linkIndex === selectedContactIndex);
        });
        links[selectedContactIndex].focus();
        return links[selectedContactIndex];
    }

    function activateContact(link) {
        if (!link || link.dataset.contactResolved !== 'true') return;
        link.click();
    }

    function moveContactSelection(direction) {
        const links = getContactLinks();
        if (!links.length) return;
        const nextIndex = selectedContactIndex < 0
            ? (direction > 0 ? 0 : links.length - 1)
            : (selectedContactIndex + direction + links.length) % links.length;
        selectContact(links[nextIndex]);
    }

    function getContactLinks() {
        return Array.from(document.querySelectorAll('[data-contact-link]'));
    }

    function decodeContact(codes) {
        return String.fromCharCode(...codes);
    }

    initContactLinks();
})();
