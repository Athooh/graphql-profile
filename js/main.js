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

            const userData = await graphql.getAllUserData();
            const skillsData = await graphql.getSkills();

            displayUserInfo(userData.user[0]);
            displayXPProgress(userData.transaction);
            displayGrades(userData.progress);
            displayAudits(userData.result);
            displaySkills(skillsData.progress);
            createGraphs(userData);
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
    function displayUserInfo(user) {
        const basicInfo = document.getElementById('basicInfo');
        // Check if attrs is a string that needs parsing, otherwise use it directly
        const attrs = typeof user.attrs === 'string' ? JSON.parse(user.attrs) : user.attrs;
        
        basicInfo.innerHTML = `
            <h3>Basic Information</h3>
            <p>Login: ${user.login}</p>
            <p>ID: ${user.id}</p>
            <p>Status: ${attrs?.status || 'Active'}</p>
        `;
    }

    // Display XP progress
    function displayXPProgress(xpData) {
        const xpProgress = document.getElementById('xpProgress');
        const totalXP = xpData.reduce((sum, t) => sum + t.amount, 0);
        
        xpProgress.innerHTML = `
            <h3>XP Progress</h3>
            <p>Total XP: ${totalXP}</p>
        `;
    }

    function displayGrades(grades) {
        const gradesSection = document.getElementById('grades');
        const totalGrades = grades.length;
        const passedGrades = grades.filter(g => g.grade > 0).length;
        
        gradesSection.innerHTML = `
            <h3>Grades Overview</h3>
            <p>Total Projects: ${totalGrades}</p>
            <p>Passed: ${passedGrades}</p>
            <p>Success Rate: ${((passedGrades/totalGrades) * 100).toFixed(1)}%</p>
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
        const skillsSection = document.getElementById('skills');
        const skillMap = new Map();
        
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
    function createGraphs(userData) {
        const graphManager = new GraphManager();
        const graph1 = document.getElementById('graph1');
        const graph2 = document.getElementById('graph2');

        // Create XP progress line graph
        graphManager.createLineGraph(userData.transaction, graph1);

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