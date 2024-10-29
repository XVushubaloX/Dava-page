async function displayProjects() {
    try {
        console.log(window.Odometer);
        const response = await fetch('./projects.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const projectFolders = await response.json();
        const projectList = document.getElementById('projectList');
        projectList.innerHTML = '';

        for (const project of projectFolders) {
            const projectResponse = await fetch(`./projects/${project.folder.toLowerCase()}/project.json`);
            const projectData = await projectResponse.json();
            const projectItem = document.createElement('div');
            projectItem.classList.add('project-item');
            projectItem.innerHTML = `<h3>${projectData.name}</h3>`;
            
            let unlocked = false;

            if (projectData.lockPower && projectData.lockPower > 1) {
                let clicksRemaining = projectData.lockPower;
                const lockText = document.createElement('p');
                lockText.classList.add('lock-text', 'odometer');
                lockText.innerText = clicksRemaining;

                const odometer = new Odometer({
                    el: lockText,
                    value: clicksRemaining,
                    format: 'd',
                });

                projectItem.appendChild(lockText);

                projectItem.addEventListener('click', () => {
                    if (!unlocked) {
                        clicksRemaining--;
                        if (clicksRemaining > 0) {
                            odometer.update(clicksRemaining);
                        } else {
                            lockText.remove();
                            projectItem.classList.add('unlocked'); // Trigger CSS transition
                        
                            const description = document.createElement('p');
                            description.innerText = projectData.description;
                            projectItem.appendChild(description);
                        
                            const viewButton = document.createElement('button');
                            viewButton.innerText = 'Open Project';
                            viewButton.classList.add('view-project-btn');
                            viewButton.addEventListener('click', () => {
                                window.location.href = `./projects/${project.folder}/index.html`;
                            });
                            projectItem.appendChild(viewButton);
                        
                            unlocked = true;
                        }
                    }
                });
            } else {
                const description = document.createElement('p');
                description.innerText = projectData.description;
                projectItem.appendChild(description);

                const viewButton = document.createElement('button');
                viewButton.innerText = 'Open Project';
                viewButton.classList.add('view-project-btn');
                viewButton.addEventListener('click', () => {
                    window.location.href = `./projects/${project.folder}/index.html`;
                });
                projectItem.appendChild(viewButton);
            }

            projectList.appendChild(projectItem);
        }
    } catch (error) {
        console.error('Error fetching projects:', error);
        projectList.innerHTML = '<p>Error loading projects. Please try again later.</p>';
    }

    animateOnScroll();
}

function animateOnScroll() {
    const projectItems = document.querySelectorAll('.project-item');
    console.log('Project items found:', projectItems.length);

    // Create an Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            console.log('Intersecting: ${entry.isIntersecting}, entry.target');

            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, { threshold: 0.2 });

    projectItems.forEach(item => observer.observe(item));
}

window.addEventListener('load', () => {
    displayProjects();
});