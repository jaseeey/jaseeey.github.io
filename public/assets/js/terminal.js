(() => {
    const logLimit = 40,
        tagline = 'custom software / integrations / automation',
        commandNames = ['help', 'ls', 'links', 'open', 'whoami', 'clear', 'date', 'uname', 'contact'],
        motdLines = [
            ['jasey.io tty1 — session opened', 'dim'],
            ['Welcome to jasey.io.', 'fg'],
            ['· host ............... jasey.io', 'dim'],
            ['· build .............. 1.0 static x86_64', 'dim'],
            ['· integrity .......... ok', 'dim'],
            ['· endpoints .......... 5 records', 'dim']
        ],
        hintLine = '· type \'help\' for commands',
        helpLines = [
            ['ls                list endpoints', 'fg'],
            ['open <n|name>     open endpoint', 'fg'],
            ['whoami            identity', 'fg'],
            ['clear             clear output', 'fg'],
            ['↹ completes · ↑↓ recalls history', 'dim']
        ];
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
        renderMotd();
        scrollTranscript();
    }

    function bindShell(input) {
        const session = document.querySelector('[data-session]'),
            toggle = document.querySelector('[data-shell-toggle]'),
            close = document.querySelector('[data-shell-close]');
        if (!session || !toggle || !close) return;
        toggle.addEventListener('click', () => {
            session.dataset.shellOpen = 'true';
            toggle.setAttribute('aria-expanded', 'true');
            trackViewport();
            input.focus();
        });
        close.addEventListener('click', () => {
            session.dataset.shellOpen = 'false';
            toggle.setAttribute('aria-expanded', 'false');
            input.blur();
            untrackViewport();
            toggle.focus();
        });
    }

    function renderMotd() {
        const motd = document.querySelector('[data-motd]'),
            hint = document.querySelector('[data-hint]');
        if (!motd || !hint) return;
        const lines = motdLines.concat([[`· session ............ ${formatSessionTime(new Date())}`, 'dim']]);
        motd.replaceChildren(...lines.map(line => buildLine(line[0], line[1])));
        hint.textContent = hintLine;
    }

    function formatSessionTime(date) {
        const pad = value => String(value).padStart(2, '0');
        return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
            + ` ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())} UTC`;
    }

    function buildLine(text, tone) {
        const line = document.createElement('div');
        line.className = 'log-line';
        line.dataset.tone = tone;
        line.textContent = text;
        return line;
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
        const shouldStick = isTranscriptAtBottom();
        logLines = logLines.concat([{text, tone: tone || 'fg'}]).slice(-logLimit);
        log.appendChild(buildLine(text, tone || 'fg'));
        while (log.childElementCount > logLimit) {
            log.removeChild(log.firstElementChild);
        }
        if (shouldStick) {
            scrollTranscript();
        }
    }

    function clearLog() {
        const log = document.querySelector('[data-log]');
        logLines = [];
        if (log) {
            log.replaceChildren();
            scrollTranscript();
        }
    }

    function renderInput(event) {
        const echo = document.querySelector('[data-prompt-echo]');
        if (echo) {
            echo.textContent = event.currentTarget.value;
        }
    }

    function focusPromptFromPane(event, input) {
        if (event.target.closest('a, button')) return;
        if (event.currentTarget.dataset.shellOpen === 'false' && isShellCollapsible()) return;
        input.focus();
    }

    function scrollTranscript() {
        const transcript = document.querySelector('[data-transcript]');
        if (transcript) {
            transcript.scrollTop = transcript.scrollHeight;
        }
    }

    function isTranscriptAtBottom() {
        const transcript = document.querySelector('[data-transcript]');
        if (!transcript) return true;
        return transcript.scrollHeight - transcript.scrollTop - transcript.clientHeight < 4;
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
        untrackViewport();
    }

    initTerminal();
})();
