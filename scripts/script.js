async function displayProjects() {
    document.getElementById("logo").addEventListener("click", () => {
        deleteAllCookies();
        window.location.href = './index.html';
    });

    const projectList = document.getElementById('projectList');
    projectList.innerHTML = ''; // Clear existing content

    try {
        const response = await fetch('./projects.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const projectFolders = await response.json();

        projectFolders.forEach(project => {
            const projectItem = createProjectItem(project);
            projectList.appendChild(projectItem);
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        projectList.innerHTML = '<p>Error loading projects. Please try again later.</p>';
    }

    animateOnScroll();
}

function createProjectItem(projectData) {
    const projectItem = document.createElement('div');
    projectItem.className = 'project-item';
    projectItem.innerHTML = `<h3>${projectData.name}</h3>`;
    
    const lockPower = getCookie(projectData.folder);
    projectData.lockPower = lockPower !== undefined ? lockPower : 0;

    if (projectData.lockPower > 1) {
        setupLockMechanism(projectItem, projectData);
    } else {
        appendProjectDetails(projectItem, projectData);
    }

    return projectItem;
}

function setupLockMechanism(projectItem, projectData) {
    let clicksRemaining = projectData.lockPower;
    const lockText = createLockText(clicksRemaining);
    projectItem.appendChild(lockText);

    projectItem.addEventListener('click', () => handleProjectClick(projectItem, projectData, lockText));
}

function handleProjectClick(projectItem, projectData, lockText) {
    if (projectData.lockPower > 0) {
        projectData.lockPower--;
        lockText.innerText = projectData.lockPower;
        document.cookie = `${projectData.folder}=${projectData.lockPower}; expires=Fri, 31 Dec 2026 23:59:59 UTC; path=/`;

        if (projectData.lockPower === 0) {
            lockText.remove();
            unlockProject(projectItem, projectData);
        }
    }
}

function createLockText(clicksRemaining) {
    const lockText = document.createElement('p');
    lockText.className = 'lock-text odometer';
    lockText.innerText = clicksRemaining;
    new Odometer({ el: lockText, value: clicksRemaining, format: 'd' });
    return lockText;
}

function unlockProject(projectItem, projectData) {
    appendProjectDetails(projectItem, projectData);
}

function appendProjectDetails(projectItem, projectData) {
    if (projectData.hasImage) {
        const image = document.createElement('img');
        image.src = `./projects/${projectData.folder}/image.png`;
        image.className = 'project-image';
        projectItem.appendChild(image);
        projectItem.appendChild(document.createElement('br'));
    }

    projectItem.classList.add('unlocked');
    
    const description = document.createElement('p');
    description.innerText = projectData.description;
    projectItem.appendChild(description);

    const viewButton = document.createElement('button');
    viewButton.innerText = 'Open Project';
    viewButton.className = 'view-project-btn';
    viewButton.onclick = () => {
        window.location.href = `./projects/${projectData.folder}/index.html`;
    };
    projectItem.appendChild(viewButton);
}

function animateOnScroll() {
    const projectItems = document.querySelectorAll('.project-item');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            entry.target.classList.toggle('visible', entry.isIntersecting);
        });
    }, { threshold: 0.2 });

    projectItems.forEach(item => observer.observe(item));
}

function getCookie(name) {
    const matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function deleteAllCookies() {
    document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
        print(name);
    });
}

window.addEventListener('load', displayProjects);
