(() => {
    'use strict';

    const $ = (sel, root = document) => root.querySelector(sel);
    const LS_KEY = 'kvantik.builder.preset';

    const dayNames = {
        ru5: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'],
        ru6: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
        en5: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        en6: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    };

    // --- utils ---
    function pad(n) { return n < 10 ? '0' + n : '' + n; }
    function parseTimeToMinutes(hhmm) {
        const [h, m] = hhmm.split(':').map(Number);
        return h * 60 + m;
    }
    function minutesToHHMM(min) {
        const h = Math.floor(min / 60);
        const m = min % 60;
        return `${pad(h)}:${pad(m)}`;
    }
    function addMinutes(base, add) { return base + add; }

    function buildSlots(startHHMM, lessonMin, gapMin, count) {
        const start = parseTimeToMinutes(startHHMM);
        const slots = [];
        let cur = start;
        for (let i = 0; i < count; i++) {
            const from = cur;
            const to = addMinutes(from, lessonMin);
            slots.push({ idx: i + 1, from, to });
            cur = addMinutes(to, gapMin);
        }
        return slots;
    }

    function readFormParams(form) {
        const fd = new FormData(form);
        const lang = (fd.get('lang') || 'ru').toString();
        const days = Math.max(1, Math.min(6, parseInt(fd.get('days') || '5', 10)));
        const lessons = Math.max(1, Math.min(12, parseInt(fd.get('lessons') || '6', 10)));
        const start = (fd.get('start') || '08:30').toString();
        const dur = Math.max(1, parseInt(fd.get('dur') || '90', 10));
        const gap = Math.max(0, parseInt(fd.get('gap') || '10', 10));
        return { lang, days, lessons, start, dur, gap };
    }

    function savePreset(preset) {
        localStorage.setItem(LS_KEY, JSON.stringify(preset));
    }
    function loadPreset() {
        try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null'); }
        catch { return null; }
    }
    function fillForm(form, preset) {
        if (!preset) return;
        $('#lang', form).value = preset.lang;
        $('#days', form).value = String(preset.days);
        $('#lessons', form).value = String(preset.lessons);
        $('#start', form).value = preset.start;
        $('#dur', form).value = String(preset.dur);
        $('#gap', form).value = String(preset.gap);
    }

    // --- render ---
    function renderSchedule(container, params) {
        container.innerHTML = '';

        // дни недели — каждый в своём div.day-card (по требованию)
        const key = `${params.lang}${params.days}`;
        const daysArr = dayNames[key] || dayNames['ru5'];

        // тайм-слоты одинаковые для всех дней
        const slots = buildSlots(params.start, params.dur, params.gap, params.lessons);

        // Заголовок для таблиц: "Пара N (hh:mm—hh:mm)"
        const headerCells = slots.map(s => `Пара ${s.idx}<br>(${minutesToHHMM(s.from)}—${minutesToHHMM(s.to)})`);

        daysArr.forEach(dayLabel => {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'day-card';

            const h4 = document.createElement('h4');
            h4.className = 'day-title';
            h4.textContent = dayLabel;
            dayDiv.appendChild(h4);

            const table = document.createElement('table');
            table.className = 'day-table';
            const thead = document.createElement('thead');
            const headRow = document.createElement('tr');

            // Первая ячейка — заголовок "День"
            const thDay = document.createElement('th');
            thDay.textContent = 'День';
            headRow.appendChild(thDay);

            headerCells.forEach(html => {
                const th = document.createElement('th');
                th.innerHTML = html;
                headRow.appendChild(th);
            });
            thead.appendChild(headRow);
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            const row = document.createElement('tr');

            // Первая ячейка строки — название дня
            const tdDay = document.createElement('td');
            tdDay.textContent = dayLabel;
            row.appendChild(tdDay);

            // Далее пустые ячейки для предметов — пользователь может потом вписать
            for (let i = 0; i < params.lessons; i++) {
                const td = document.createElement('td');
                td.className = 'slot';
                td.setAttribute('contenteditable', 'true');
                td.title = 'Кликните, чтобы ввести предмет';
                row.appendChild(td);
            }
            tbody.appendChild(row);
            table.appendChild(tbody);

            dayDiv.appendChild(table);
            container.appendChild(dayDiv);
        });
    }

    // --- init ---
    document.addEventListener('DOMContentLoaded', () => {
        const form = $('#builderForm');
        const result = $('#builderResult');
        const status = $('#builderStatus');
        const btnSave = $('#savePreset');
        const btnLoad = $('#loadPreset');
        const btnClear = $('#clearPreset');

        if (!form || !result) return;

        // загрузка пресета при входе
        const preset = loadPreset();
        if (preset) fillForm(form, preset);

        // первичная генерация
        renderSchedule(result, readFormParams(form));

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const params = readFormParams(form);
            renderSchedule(result, params);
            status.classList.remove('visually-hidden');
            status.textContent = 'Расписание сгенерировано.';
        });

        btnSave?.addEventListener('click', () => {
            const params = readFormParams(form);
            savePreset(params);
            status.classList.remove('visually-hidden');
            status.textContent = 'Параметры сохранены.';
        });

        btnLoad?.addEventListener('click', () => {
            const pr = loadPreset();
            if (pr) {
                fillForm(form, pr);
                renderSchedule(result, readFormParams(form));
                status.classList.remove('visually-hidden');
                status.textContent = 'Параметры загружены.';
            } else {
                status.classList.remove('visually-hidden');
                status.textContent = 'Сохранённых параметров нет.';
            }
        });

        btnClear?.addEventListener('click', () => {
            localStorage.removeItem(LS_KEY);
            form.reset();
            // вернуть дефолты
            $('#lang', form).value = 'ru';
            $('#days', form).value = '5';
            $('#lessons', form).value = '6';
            $('#start', form).value = '08:30';
            $('#dur', form).value = '90';
            $('#gap', form).value = '10';
            renderSchedule(result, readFormParams(form));
            status.classList.remove('visually-hidden');
            status.textContent = 'Сброшено.';
        });
    });
})();