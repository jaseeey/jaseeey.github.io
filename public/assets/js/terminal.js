(() => {
    const logLimit = 40,
        bootDelay = 200,
        bootStep = 280,
        tagline = 'custom software / integrations / automation',
        commandNames = ['help', 'ls', 'links', 'open', 'whoami', 'clear', 'date', 'uname', 'contact'],
        bootLines = [
            ['jasey.io tty1 — session opened', 'dim'],
            ['· integrity ........... ok', 'dim'],
            ['· endpoints ........... 5 records', 'dim'],
            ['· type \'help\' for commands', 'accent']
        ],
        helpLines = [
            ['ls                list endpoints', 'fg'],
            ['open <n|name>     open endpoint', 'fg'],
            ['whoami            identity', 'fg'],
            ['clear             clear output', 'fg'],
            ['↹ completes · ↑↓ recalls history', 'dim']
        ];
    const isMotionReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        timers = [];
    let logLines = [],
        history = [],
        historyIndex = -1;

    window.addEventListener('pagehide', teardownTerminal);

    function initTerminal() {
        const session = document.querySelector('[data-session]'),
            input = document.querySelector('[data-prompt-input]'),
            form = document.querySelector('[data-prompt]');
        if (!session || !input || !form) return;
        form.addEventListener('submit', event => event.preventDefault());
        input.addEventListener('input', renderInput);
        input.addEventListener('keydown', handleKeyDown);
        session.addEventListener('click', event => focusPromptFromPane(event, input));
        bindShell(input);
        runBootSequence();
    }

    function bindShell(input) {
        const shell = document.querySelector('[data-shell]'),
            toggle = document.querySelector('[data-shell-toggle]'),
            close = document.querySelector('[data-shell-close]');
        if (!shell || !toggle || !close) return;
        toggle.addEventListener('click', () => {
            shell.dataset.open = 'true';
            toggle.setAttribute('aria-expanded', 'true');
            trackViewport();
            input.focus();
        });
        close.addEventListener('click', () => {
            shell.dataset.open = 'false';
            toggle.setAttribute('aria-expanded', 'false');
            input.blur();
            untrackViewport();
            toggle.focus();
        });
    }

    function runBootSequence() {
        if (isMotionReduced) {
            bootLines.forEach(line => pushLine(line[0], line[1]));
            return;
        }
        bootLines.forEach((line, lineIndex) => {
            timers.push(window.setTimeout(() => pushLine(line[0], line[1]), bootDelay + lineIndex * bootStep));
        });
    }

    function handleKeyDown(event) {
        const input = event.currentTarget;
        if (event.key === 'Enter') {
            event.preventDefault();
            submitCommand(input);
            return;
        }
        if (event.key === 'Tab') {
            event.preventDefault();
            completeCommand(input);
            return;
        }
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
            recallHistory(input, event.key === 'ArrowUp' ? -1 : 1);
            return;
        }
        if (event.key === 'l' && event.ctrlKey) {
            event.preventDefault();
            clearLog();
        }
    }

    function submitCommand(input) {
        const raw = input.value;
        if (raw.trim()) {
            history = history.concat([raw]);
        }
        historyIndex = -1;
        input.value = '';
        renderInput({currentTarget: input});
        runCommand(raw);
    }

    function runCommand(raw) {
        const command = (raw || '').trim();
        pushLine(`$ ${command}`, 'echo');
        if (!command) return;
        const parts = command.split(/\s+/),
            head = parts[0].toLowerCase(),
            argument = parts[1] || '';
        if (head === 'help') {
            helpLines.forEach(line => pushLine(line[0], line[1]));
            return;
        }
        if (head === 'ls' || head === 'links') {
            listEndpoints();
            return;
        }
        if (head === 'clear') {
            clearLog();
            return;
        }
        if (head === 'whoami') {
            pushLine('ji-dev', 'accent');
            pushLine(tagline, 'fg');
            return;
        }
        if (head === 'date') {
            pushLine(new Date().toUTCString(), 'fg');
            return;
        }
        if (head === 'uname') {
            pushLine('jasey.io 1.0 static x86_64', 'fg');
            return;
        }
        if (head === 'contact') {
            showContact();
            return;
        }
        if (head === 'open') {
            openEndpoint(argument, `open: no such endpoint: ${argument || '∅'}`);
            return;
        }
        openEndpoint(head, `${head}: command not found — try 'help'`);
    }

    function listEndpoints() {
        window.jaseyEndpoints.all().forEach(endpoint => {
            const value = endpoint.isResolved ? endpoint.value : 'resolving…';
            pushLine(`${endpoint.index}  ${endpoint.label.padEnd(11)}${value}`, 'fg');
        });
    }

    function showContact() {
        const email = window.jaseyEndpoints.find('email');
        if (!email.isResolved) {
            pushLine(`${email.label}: still resolving`, 'warn');
            return;
        }
        pushLine(email.value, 'ok');
    }

    function openEndpoint(token, missingMessage) {
        const endpoint = window.jaseyEndpoints.find(token);
        if (!endpoint) {
            pushLine(missingMessage, 'warn');
            return;
        }
        if (!endpoint.isResolved) {
            pushLine(`${endpoint.label}: still resolving`, 'warn');
            return;
        }
        pushLine(`→ ${endpoint.value}`, 'ok');
        window.jaseyEndpoints.open(endpoint.key);
    }

    function completeCommand(input) {
        const prefix = input.value.trim().toLowerCase();
        if (!prefix) return;
        const pool = commandNames.concat(window.jaseyEndpoints.all().map(endpoint => endpoint.key)),
            matches = pool.filter(candidate => candidate.indexOf(prefix) === 0)
                .filter((candidate, candidateIndex, all) => all.indexOf(candidate) === candidateIndex);
        if (matches.length === 1) {
            input.value = `${matches[0]} `;
            renderInput({currentTarget: input});
            return;
        }
        if (matches.length > 1) {
            pushLine(matches.join('  '), 'dim');
        }
    }

    function recallHistory(input, direction) {
        if (!history.length) return;
        if (direction < 0) {
            historyIndex = historyIndex < 0 ? history.length - 1 : Math.max(0, historyIndex - 1);
        } else if (historyIndex < 0 || historyIndex + 1 >= history.length) {
            historyIndex = -1;
        } else {
            historyIndex += 1;
        }
        input.value = historyIndex < 0 ? '' : history[historyIndex];
        renderInput({currentTarget: input});
    }

    function pushLine(text, tone) {
        const log = document.querySelector('[data-log]');
        if (!log) return;
        logLines = logLines.concat([{text, tone: tone || 'fg'}]).slice(-logLimit);
        const line = document.createElement('div');
        line.className = 'log-line';
        line.dataset.tone = tone || 'fg';
        line.textContent = text;
        log.appendChild(line);
        while (log.childElementCount > logLimit) {
            log.removeChild(log.firstElementChild);
        }
    }

    function clearLog() {
        const log = document.querySelector('[data-log]');
        logLines = [];
        if (log) {
            log.replaceChildren();
        }
    }

    function renderInput(event) {
        const echo = document.querySelector('[data-prompt-echo]');
        if (echo) {
            echo.textContent = event.currentTarget.value;
        }
    }

    function focusPromptFromPane(event, input) {
        const shell = document.querySelector('[data-shell]');
        if (event.target.closest('a, button')) return;
        if (shell && shell.dataset.open === 'false' && isShellCollapsible()) return;
        input.focus();
    }

    function isShellCollapsible() {
        const toggle = document.querySelector('[data-shell-toggle]');
        return !!toggle && window.getComputedStyle(toggle).display !== 'none';
    }

    function trackViewport() {
        if (!window.visualViewport) return;
        window.visualViewport.addEventListener('resize', syncViewportHeight);
        window.visualViewport.addEventListener('scroll', syncViewportHeight);
        syncViewportHeight();
    }

    function untrackViewport() {
        if (!window.visualViewport) return;
        window.visualViewport.removeEventListener('resize', syncViewportHeight);
        window.visualViewport.removeEventListener('scroll', syncViewportHeight);
        document.documentElement.style.removeProperty('--viewport-height');
    }

    function syncViewportHeight() {
        document.documentElement.style.setProperty('--viewport-height', `${window.visualViewport.height}px`);
    }

    function teardownTerminal() {
        timers.forEach(window.clearTimeout);
        timers.length = 0;
        untrackViewport();
    }

    initTerminal();
})();
