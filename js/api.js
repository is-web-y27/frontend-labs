(() => {
    // ====== Работа с локальными комментариями (localStorage) ======
    const LS_KEY = 'kvantik.user.comments';

    const $ = (sel, root = document) => root.querySelector(sel);

    function loadUserComments() {
        try {
            return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
        } catch {
            return [];
        }
    }

    function saveUserComments(arr) {
        localStorage.setItem(LS_KEY, JSON.stringify(arr));
    }

    function renderUserComments() {
        const box = $('#userList');
        if (!box) return;
        const items = loadUserComments();
        box.innerHTML = '';

        if (!items.length) return;

        items.forEach((c) => {
            const card = document.createElement('article');
            card.className = 'card';
            card.dataset.id = String(c.id);

            const h3 = document.createElement('h3');
            h3.textContent = c.name;

            const p = document.createElement('p');
            p.textContent = c.body;

            const del = document.createElement('button');
            del.type = 'button';
            del.className = 'delete-btn';
            del.textContent = 'Удалить';
            del.addEventListener('click', () => {
                const curr = loadUserComments().filter((x) => x.id !== c.id);
                saveUserComments(curr);
                renderUserComments();
            });

            card.appendChild(h3);
            card.appendChild(p);
            card.appendChild(del);
            box.appendChild(card);
        });
    }

    function setupUserForm() {
        const form = $('#userCommentForm');
        const status = $('#userFormStatus');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(form);
            const name = (fd.get('name') || '').toString().trim();
            const body = (fd.get('body') || '').toString().trim();

            if (!name) {
                status.classList.remove('visually-hidden');
                status.textContent = 'Пожалуйста, укажите имя.';
                return;
            }
            if (!body || body.length < 2) {
                status.classList.remove('visually-hidden');
                status.textContent = 'Комментарий слишком короткий.';
                return;
            }

            const list = loadUserComments();
            const item = {
                id: Date.now(),
                name,
                body,
                createdAt: new Date().toISOString(),
            };
            list.unshift(item);
            saveUserComments(list);
            form.reset();
            status.classList.remove('visually-hidden');
            status.textContent = 'Комментарий добавлен.';
            renderUserComments();
        });

        renderUserComments();
    }

    // ====== «Живые» данные с JSONPlaceholder ======
    function setupRemoteComments() {
        const listEl = document.getElementById('commentList');
        const statusEl = document.getElementById('loadStatus');
        const preloader = document.getElementById('preloader');
        if (!listEl) return;

        statusEl.textContent = 'Загружаем данные…';

        const modeA = Math.random() > 0.5;
        const url = modeA
            ? 'https://jsonplaceholder.typicode.com/comments?_start=100&_limit=18'
            : 'https://jsonplaceholder.typicode.com/comments?_start=0&_limit=18';

        fetch(url)
            .then((res) => {
                if (!res.ok) throw new Error('Ошибка загрузки: ' + res.status);
                return res.json();
            })
            .then((comments) => {
                if (preloader) preloader.style.display = 'none';
                statusEl.textContent = 'Готово. Данные получены.';

                const names = [
                    'Иван Петров','Мария Смирнова','Алексей Кузнецов','Анна Иванова',
                    'Дмитрий Соколов','Ольга Морозова','Никита Орлов','Екатерина Волкова',
                    'Сергей Николаев','Татьяна Попова','Кирилл Васильев','Алина Сергеева'
                ];
                const phrases = [
                    'Очень полезная статья!','Не совсем согласен, есть нюансы.',
                    'Спасибо за разбор, стало понятнее.','А можно поподробнее про математику?',
                    'Захотелось самому провести эксперимент.','Супер, жду продолжения!',
                    'Это реально работает?','Отличное объяснение, респект!',
                    'Интересная точка зрения.','Проверю на практике.',
                    'Классный материал!','Было бы круто добавить примеры.'
                ];
                const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

                listEl.innerHTML = '';
                comments.forEach((c) => {
                    const card = document.createElement('article');
                    card.className = 'card';

                    const h3 = document.createElement('h3');
                    h3.textContent = pick(names);

                    const p1 = document.createElement('p');
                    p1.textContent = `✉ ${c.email}`;

                    const p2 = document.createElement('p');
                    p2.textContent = pick(phrases);

                    card.appendChild(h3);
                    card.appendChild(p1);
                    card.appendChild(p2);
                    listEl.appendChild(card);
                });

                if (!comments.length) {
                    statusEl.textContent = 'Нет подходящих данных.';
                }
            })
            .catch((err) => {
                if (preloader) preloader.style.display = 'none';
                statusEl.textContent = '⚠ Что-то пошло не так: ' + err.message;
            });
    }

    // ====== Инициализация после загрузки DOM ======
    document.addEventListener('DOMContentLoaded', () => {
        setupUserForm();
        setupRemoteComments();
    });
})();