document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('title').textContent = drama.title;
    document.getElementById('author').textContent = drama.author;
    renderSidebar();

    // Calculate page height based on viewport width to maintain aspect ratio
    const pageWidth = Math.min(window.innerWidth * 0.8, 600);
    const pageHeight = pageWidth * (4 / 3); // Maintain 3:4 aspect ratio
    const maxHeight = window.innerHeight * 0.8; // Limit to 80% of viewport height
    const finalPageHeight = Math.min(pageHeight, maxHeight);

    drama.acts.forEach((act, actIndex) => {
        act.scenes.forEach((scene, sceneIndex) => {
            scene.pages = paginateScene(scene, finalPageHeight);
        });
    });

    let currentAct = parseInt(localStorage.getItem('currentAct')) || 0;
    let currentScene = parseInt(localStorage.getItem('currentScene')) || 0;
    let currentPage = parseInt(localStorage.getItem('currentPage')) || 0;

    if (currentAct >= drama.acts.length) currentAct = 0;
    if (currentScene >= drama.acts[currentAct].scenes.length) currentScene = 0;
    if (currentPage >= drama.acts[currentAct].scenes[currentScene].pages.length) currentPage = 0;

    renderPage(currentAct, currentScene, currentPage);
});

function renderSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = '';
    drama.acts.forEach((act, actIndex) => {
        const actTitle = document.createElement('h3');
        actTitle.textContent = act.title;
        sidebar.appendChild(actTitle);
        act.scenes.forEach((scene, sceneIndex) => {
            const sceneLink = document.createElement('a');
            sceneLink.textContent = scene.title;
            sceneLink.href = '#';
            sceneLink.addEventListener('click', (event) => {
                event.preventDefault();
                renderPage(actIndex, sceneIndex, 0);
            });
            sidebar.appendChild(sceneLink);
        });
    });
}

function createElement(item) {
    if (item.type === 'banner') {
        const img = document.createElement('img');
        img.className = 'banner';
        img.src = item.url;
        return img;
    } else if (item.type === 'title') {
        if (item.subtype === 'h2') {
            const h = document.createElement('h2');
            h.textContent = item.text;
            return h;
        } else {
            const h = document.createElement('h1');
            h.textContent = item.text;
            return h;
        }
    } else if (item.type === 'centerText') {
        const p = document.createElement('p');
        p.className = 'center-text';
        p.textContent = item.text;
        return p;
    } else if (item.type === 'direction') {
        const p = document.createElement('p');
        p.className = 'direction';
        p.textContent = item.text;
        return p;
    } else if (item.type === 'description') {
        const p = document.createElement('p');
        p.className = 'description';
        p.textContent = item.text;
        return p;
    } else if (item.type === 'dialogue') {
        const p = document.createElement('p');

        const p1 = document.createElement('p');
        p1.className = 'dialogue-p';
        const characterSpan = document.createElement('span');
        characterSpan.className = 'character';
        characterSpan.textContent = item.character + ': ';
        if (item.direction != null) {
            characterSpan.textContent += ' ' + item.direction
        }
        p1.appendChild(characterSpan);
        p.appendChild(p1);

        if (item.subtype === 'poem') {
            const author = document.createElement('p');
            author.className = 'direction';
            author.textContent = "Wiersz - autor(ka): " + item.author
            p.appendChild(author)

            const p2 = document.createElement('p');
            p2.className = 'dialogue-p poem';
            const textSpan = document.createElement('span');
            textSpan.className = 'dialogue-text';
            // Split text by '\n' and add <br> for each line break
            const lines = item.text.split('\n');
            lines.forEach((line, idx) => {
                textSpan.appendChild(document.createTextNode(line));
                if (idx < lines.length - 1) {
                    textSpan.appendChild(document.createElement('br'));
                }
            });
            p2.appendChild(textSpan);
            p.appendChild(p2);
        } else {
            const p2 = document.createElement('p');
            p2.className = 'dialogue-p';
            const textSpan = document.createElement('span');
            textSpan.className = 'dialogue-text';
            textSpan.textContent = item.text;
            p2.appendChild(textSpan);
            p.appendChild(p2);
        }

        return p;
    }
}

function paginateScene(scene, pageHeight) {
    const container = document.createElement('div');
    container.className = 'measurement-container';
    container.style.height = pageHeight + 'px';
    container.style.overflow = 'hidden';
    document.body.appendChild(container);

    let pages = [];
    let currentPageContent = [];

    scene.content.forEach(item => {
        const element = createElement(item);
        container.appendChild(element);
        // Use 0.8 on phones, 0.9 on desktops
        const isPhone = window.innerWidth <= 600;
        const scrollFactor = isPhone ? 0.8 : 0.9;
        if (container.scrollHeight * scrollFactor > pageHeight) {
            container.removeChild(element);
            pages.push(currentPageContent);
            container.innerHTML = '';
            container.appendChild(element);
            currentPageContent = [item];
        } else {
            currentPageContent.push(item);
        }
    });

    if (currentPageContent.length > 0) {
        pages.push(currentPageContent);
    }

    document.body.removeChild(container);
    return pages;
}

function renderPage(actIndex, sceneIndex, pageIndex) {
    const act = drama.acts[actIndex];
    const scene = act.scenes[sceneIndex];
    const pageContent = scene.pages[pageIndex];

    document.getElementById('current-location').textContent = `${act.title}, ${scene.title}`;

    const main = document.getElementById('main');
    main.innerHTML = '';

    const pageDiv = document.createElement('div');
    pageDiv.className = 'page';
    pageContent.forEach(item => {
        const element = createElement(item);
        pageDiv.appendChild(element);
    });
    main.appendChild(pageDiv);

    const pageNumber = document.createElement('p');
    pageNumber.textContent = `Strona ${pageIndex + 1} z ${scene.pages.length}`;
    pageNumber.style.textAlign = 'center';
    main.appendChild(pageNumber);

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Poprzednia';
    prevButton.addEventListener('click', () => navigate(-1));

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Następna';
    nextButton.addEventListener('click', () => navigate(1));

    const navDiv = document.createElement('div');
    navDiv.style.textAlign = 'center';
    navDiv.appendChild(prevButton);
    navDiv.appendChild(nextButton);
    main.appendChild(navDiv);

    localStorage.setItem('currentAct', actIndex);
    localStorage.setItem('currentScene', sceneIndex);
    localStorage.setItem('currentPage', pageIndex);
}

function navigate(direction) {
    let actIndex = parseInt(localStorage.getItem('currentAct'));
    let sceneIndex = parseInt(localStorage.getItem('currentScene'));
    let pageIndex = parseInt(localStorage.getItem('currentPage'));

    if (direction === 1) {
        if (pageIndex < drama.acts[actIndex].scenes[sceneIndex].pages.length - 1) {
            pageIndex++;
        } else if (sceneIndex < drama.acts[actIndex].scenes.length - 1) {
            sceneIndex++;
            pageIndex = 0;
        } else if (actIndex < drama.acts.length - 1) {
            actIndex++;
            sceneIndex = 0;
            pageIndex = 0;
        }
    } else if (direction === -1) {
        if (pageIndex > 0) {
            pageIndex--;
        } else if (sceneIndex > 0) {
            sceneIndex--;
            pageIndex = drama.acts[actIndex].scenes[sceneIndex].pages.length - 1;
        } else if (actIndex > 0) {
            actIndex--;
            sceneIndex = drama.acts[actIndex].scenes.length - 1;
            pageIndex = drama.acts[actIndex].scenes[sceneIndex].pages.length - 1;
        }
    }

    renderPage(actIndex, sceneIndex, pageIndex);
}