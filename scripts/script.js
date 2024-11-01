async function displayProjects() {
    try {
        const response = await fetch('./projects.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const projectFolders = await response.json();
        const projectList = document.getElementById('projectList');
        projectList.innerHTML = '';

        for (const project of projectFolders) {
            const projectItem = createProjectItem(project);
            projectList.appendChild(projectItem);
        }
    } catch (error) {
        console.error('Error fetching projects:', error);
        projectList.innerHTML = '<p>Error loading projects. Please try again later.</p>';
    }

    animateOnScroll();
}

function createProjectItem(projectData) {
    const projectItem = document.createElement('div');
    projectItem.classList.add('project-item');
    projectItem.innerHTML = `<h3>${projectData.name}</h3>`;

    if (projectData.lockPower && projectData.lockPower > 1) {
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

    projectItem.addEventListener('click', () => {
        if (clicksRemaining > 0) {
            clicksRemaining--;
            lockText.innerText = clicksRemaining;
            if (clicksRemaining === 0) {
                lockText.remove();
                unlockProject(projectItem, projectData);
            }
        }
    });
}

function createLockText(clicksRemaining) {
    const lockText = document.createElement('p');
    lockText.classList.add('lock-text', 'odometer');
    lockText.innerText = clicksRemaining;
    new Odometer({ el: lockText, value: clicksRemaining, format: 'd' });
    return lockText;
}

function unlockProject(projectItem, projectData) {
    projectItem.classList.add('unlocked');
    appendProjectDetails(projectItem, projectData);
}

function appendProjectDetails(projectItem, projectData) {
    const description = document.createElement('p');
    description.innerText = projectData.description;
    projectItem.appendChild(description);

    const viewButton = document.createElement('button');
    viewButton.innerText = 'Open Project';
    viewButton.classList.add('view-project-btn');
    viewButton.addEventListener('click', () => {
        window.location.href = `./projects/${projectData.folder}/index.html`;
    });
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

window.addEventListener('load', displayProjects);