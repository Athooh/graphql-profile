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
            
            displayUserInfo(userData);
            displayXPProgress(userData);
            displayAudits(userData.result);
            displaySkills(userData);
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
    function displayUserInfo(userData) {
        const basicInfo = document.getElementById('basicInfo');
        const auditRatio = userData.user[0].auditRatio;
        
        // Calculate done/received ratio
        const doneRatio = auditRatio ? auditRatio.toFixed(1) : '0.0';
        const receivedRatio = auditRatio ? (1/auditRatio).toFixed(1) : '0.0';
        
        basicInfo.innerHTML = `
            <h3>Basic Information</h3>
            <div class="user-info">
                <p><strong>Login:</strong> ${userData.user[0].login}</p>
                <p><strong>ID:</strong> ${userData.user[0].id}</p>
                <p><strong>Email:</strong> ${userData.user[0].email}</p>
                <p><strong>Campus:</strong> ${userData.user[0].campus}</p>
            </div>
            <div class="audit-ratio-section">
                <h4>Audit Ratio</h4>
                <div class="ratio-container">
                    <div class="ratio-box">
                        <span class="ratio-value">${doneRatio}</span>
                        <span class="ratio-label">Done</span>
                    </div>
                    <div class="ratio-divider">:</div>
                    <div class="ratio-box">
                        <span class="ratio-value">${receivedRatio}</span>
                        <span class="ratio-label">Received</span>
                    </div>
                </div>
            </div>
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

        // Filter out null grades and grades = 0, then sort by createdAt in descending order
        const validAudits = audits.filter(audit => audit.grade !== null);
        const passedAudits = validAudits.filter(audit => audit.grade > 0);
        const sortedAudits = passedAudits.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        const totalAudits = validAudits.length;
        const totalPassed = passedAudits.length;
        const averageGrade = validAudits.reduce((sum, a) => sum + a.grade, 0) / totalAudits;
        
        auditsSection.innerHTML = `
            <h3>Audit Performance</h3>
            <p>Total Audits: ${totalAudits}</p>
            <p>Successful: ${totalPassed}</p>
            <p>Success Rate: ${((totalPassed/totalAudits) * 100).toFixed(1)}%</p>
            <p>Average Grade: ${averageGrade.toFixed(1)}</p>
            <div class="audit-list">
                <h4>Recent Successful Audits:</h4>
                <div class="audit-items-container">
                    ${sortedAudits.map(audit => `
                        <div class="audit-item">
                            <span>${audit.path}</span>
                            <span class="grade pass">
                                ${audit.grade.toFixed(1)}
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    function displaySkills(userData) {
        const skillsSection = document.getElementById('skills');
        const skills = userData.user[0].skills;
        
        if (!skills || skills.length === 0) {
            skillsSection.innerHTML = '<h3>Skills</h3><p>No skills data available yet</p>';
            return;
        }

        // Group skills by category
        const groupedSkills = skills.reduce((acc, skill) => {
            const category = skill.type.replace('skill_', '').split('_')[0];
            
            if (!acc[category]) {
                acc[category] = {
                    amount: 0,
                    skills: []
                };
            }
            
            acc[category].amount += skill.amount;
            acc[category].skills.push(skill);
            return acc;
        }, {});

        const totalAmount = Object.values(groupedSkills)
            .reduce((sum, group) => sum + group.amount, 0);
        
        let skillsHTML = `
            <h3>Skills</h3>
            <div class="skills-wrapper">
                <div class="skills-container">
        `;

        // Sort categories by total amount
        Object.entries(groupedSkills)
            .sort(([,a], [,b]) => b.amount - a.amount)
            .forEach(([category, data]) => {
                const percentage = ((data.amount / totalAmount) * 100).toFixed(1);
                skillsHTML += `
                    <div class="skill-category">
                        <label>${category.toUpperCase()}</label>
                        <div class="progress">
                            <div class="progress-bar" style="width: ${percentage}%">
                                ${percentage}%
                            </div>
                        </div>
                    </div>
                `;
            });

        skillsHTML += `
                </div>
            </div>
        `;
        
        skillsSection.innerHTML = skillsHTML;
    }

    // Create SVG graphs
    function createGraphs(xpData) {
        const graphManager = new GraphManager();
        const graph1 = document.getElementById('graph1');
        const graph2 = document.getElementById('graph2');

        // Create XP progress line graph
        if (xpData && xpData.transaction && xpData.transaction.length > 0) {
            graphManager.createLineGraph(xpData.transaction, graph1);
        }

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