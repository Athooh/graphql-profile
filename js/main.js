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

            displayUserInfo(userData);
            displayXPProgress(xpData);
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
        const totalXP = xpData.transaction.reduce((sum, t) => sum + t.amount, 0);
        
        xpProgress.innerHTML = `
            <h3>XP Progress</h3>
            <p>Total XP: ${totalXP}</p>
        `;
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