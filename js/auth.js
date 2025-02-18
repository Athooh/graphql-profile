const AUTH_API = 'https://learn.zone01kisumu.ke/api/auth/signin';

class AuthService {
    constructor() {
        this.token = localStorage.getItem('token');
    }

    async login(username, password) {
        try {
            const credentials = btoa(`${username}:${password}`);
            const response = await fetch(AUTH_API, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Invalid credentials');
            }

            const token = await response.json();
            this.token = token;
            localStorage.setItem('token', token);
            return token;
        } catch (error) {
            throw new Error('Login failed: ' + error.message);
        }
    }

    logout() {
        this.token = null;
        localStorage.removeItem('token');
    }

    isAuthenticated() {
        return !!this.token;
    }

    getToken() {
        return this.token;
    }
}

const auth = new AuthService(); 