async function displayProjects() {
    try {
        const response = await fetch('./projects.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const projectFolders = await response.json();
        const projectList = document.getElementById('projectList');
        projectList.innerHTML = '';

        for (const project of projectFolders) {
            const projectItem = await createProjectItem(project);
            projectList.appendChild(projectItem);
        }
    } catch (error) {
        console.error('Error fetching projects:', error);
        document.getElementById('projectList').innerHTML = '<p>Error loading projects. Please try again later.</p>';
    }

    animateOnScroll();
}

async function createProjectItem(project) {
    const response = await fetch(`./projects/${project.folder.toLowerCase()}/project.json`);
    const projectData = await response.json();
    
    const projectItem = document.createElement('div');
    projectItem.classList.add('project-item');
    projectItem.innerHTML = `<h3>${projectData.name}</h3>`;

    let unlocked = false;
    let clicksRemaining = projectData.lockPower || 0;

    if (clicksRemaining > 1) {
        addLockText(projectItem, clicksRemaining, () => unlockProject(projectItem, projectData));
    } else {
        unlockProject(projectItem, projectData);
    }

    return projectItem;
}

function addLockText(projectItem, clicksRemaining, unlockCallback) {
    const lockText = document.createElement('p');
    lockText.classList.add('lock-text', 'odometer');
    lockText.innerText = clicksRemaining;

    const odometer = new Odometer({ el: lockText, value: clicksRemaining, format: 'd' });
    projectItem.appendChild(lockText);

    projectItem.addEventListener('click', () => {
        if (clicksRemaining > 1) {
            odometer.update(--clicksRemaining);
        } else {
            lockText.remove();
            unlockCallback();
        }
    });
}

function unlockProject(projectItem, projectData) {
    projectItem.classList.add('unlocked');

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
