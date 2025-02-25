document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginContainer = document.getElementById('loginContainer');
    const profileContainer = document.getElementById('profileContainer');
    const logoutBtn = document.getElementById('logoutBtn');
    const errorMessage = document.getElementById('errorMessage');

    // Check if user is already logged in
    if (auth.isAuthenticated()) {
        showProfile();
    }

    // Login form handler
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            await auth.login(username, password);
            showProfile();
        } catch (error) {
            errorMessage.textContent = error.message;
        }
    });

    // Logout handler
    logoutBtn.addEventListener('click', () => {
        auth.logout();
        showLogin();
    });

    // Show profile page
    async function showProfile() {
        try {
            loginContainer.classList.add('hidden');
            profileContainer.classList.remove('hidden');

            // Fetch and display user data
            const userData = await graphql.getUserInfo();
            const xpData = await graphql.getUserXP();
            const skillsData = await graphql.getSkills();

            displayUserInfo(userData);
            displayXPProgress(xpData);
            displayAudits(userData.result);
            displaySkills(skillsData.progress)
            createGraphs(xpData);
        } catch (error) {
            console.error('Error loading profile:', error);
            showLogin();
        }
    }

    // Show login page
    function showLogin() {
        loginContainer.classList.remove('hidden');
        profileContainer.classList.add('hidden');
        loginForm.reset();
        errorMessage.textContent = '';
    }

    // Display user information
    function displayUserInfo(userData) {
        const basicInfo = document.getElementById('basicInfo');
        basicInfo.innerHTML = `
            <h3>Basic Information</h3>
            <p>Login: ${userData.user[0].login}</p>
            <p>ID: ${userData.user[0].id}</p>
        `;
    }

    // Display XP progress
    function displayXPProgress(xpData) {
        const xpProgress = document.getElementById('xpProgress');
        const totalXPInBytes = xpData.transaction.reduce((sum, t) => sum + t.amount, 0);
        // Convert KB to MB for better readability
        const totalXPInMB = ((totalXPInBytes / 1024)/ 1024).toFixed(2);
        
        xpProgress.innerHTML = `
            <h3>XP Progress</h3>
            <p>Total XP: ${totalXPInMB} MB (${totalXPInBytes} Bytes)</p>
        `;
    }

    function displayAudits(audits) {
        const auditsSection = document.getElementById('audits');
        if (!audits || audits.length === 0) {
            auditsSection.innerHTML = `
                <h3>Audit Performance</h3>
                <p>No audit data available yet</p>
            `;
            return;
        }

        const totalAudits = audits.length;
        const passedAudits = audits.filter(a => a.grade > 0).length;
        const averageGrade = audits.reduce((sum, a) => sum + a.grade, 0) / totalAudits;
        
        auditsSection.innerHTML = `
            <h3>Audit Performance</h3>
            <p>Total Audits: ${totalAudits}</p>
            <p>Successful: ${passedAudits}</p>
            <p>Success Rate: ${((passedAudits/totalAudits) * 100).toFixed(1)}%</p>
            <p>Average Grade: ${averageGrade.toFixed(1)}</p>
            <div class="audit-list">
                <h4>Recent Audits:</h4>
                ${audits.slice(0, 5).map(audit => `
                    <div class="audit-item">
                        <span>${audit.path}</span>
                        <span class="grade ${audit.grade > 0 ? 'pass' : 'fail'}">
                            ${audit.grade.toFixed(1)}
                        </span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function displaySkills(skills) {
        console.log('Skills data:', skills);
        const skillsSection = document.getElementById('skills');
        const skillMap = new Map();
        
        if (!skills || skills.length === 0) {
            skillsSection.innerHTML = '<h3>Skills Progress</h3><p>No skills data available yet</p>';
            return;
        }
        
        skills.forEach(skill => {
            const category = skill.path.split('/')[2]; // Get skill category
            if (!skillMap.has(category)) {
                skillMap.set(category, { total: 0, completed: 0 });
            }
            skillMap.get(category).total++;
            if (skill.grade > 0) {
                skillMap.get(category).completed++;
            }
        });

        let skillsHTML = '<h3>Skills Progress</h3>';
        skillMap.forEach((value, category) => {
            const percentage = ((value.completed / value.total) * 100).toFixed(1);
            skillsHTML += `
                <div class="skill-bar">
                    <label>${category}</label>
                    <div class="progress">
                        <div class="progress-bar" style="width: ${percentage}%">
                            ${percentage}%
                        </div>
                    </div>
                </div>
            `;
        });

        skillsSection.innerHTML = skillsHTML;
    }

    // Create SVG graphs
    function createGraphs(xpData) {
        const graphManager = new GraphManager();
        const graph1 = document.getElementById('graph1');
        const graph2 = document.getElementById('graph2');

        // Create XP progress line graph
        graphManager.createLineGraph(xpData.transaction, graph1);

        // Calculate and create project success ratio pie chart
        graphql.query(`
            query {
                progress {
                    grade
                }
            }
        `).then(progressData => {
            const stats = progressData.progress.reduce((acc, curr) => {
                if (curr.grade > 0) acc.pass++;
                else acc.fail++;
                return acc;
            }, { pass: 0, fail: 0 });

            graphManager.createPieChart(stats, graph2);
        });
    }
}); 