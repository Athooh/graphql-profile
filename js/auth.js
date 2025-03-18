// Define the API endpoint for authentication
const AUTH_API = 'https://learn.zone01kisumu.ke/api/auth/signin';

// AuthService class to handle authentication-related functionality
class AuthService {
    constructor() {
        // Retrieve the token from localStorage if it exists
        this.token = localStorage.getItem('token');
    }

    // Method to handle user login
    async login(username, password) {
        try {
            // Encode the username and password in Base64 for Basic Auth
            const credentials = btoa(`${username}:${password}`);
            
            // Send a POST request to the authentication API
            const response = await fetch(AUTH_API, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${credentials}`, // Include the encoded credentials in the Authorization header
                    'Content-Type': 'application/json' // Set the content type to JSON
                }
            });

            // Check if the response is not OK (e.g., 401 Unauthorized)
            if (!response.ok) {
                throw new Error('Invalid credentials'); // Throw an error if credentials are invalid
            }

            // Parse the response to get the token
            const token = await response.json();
            this.token = token; // Store the token in the instance
            localStorage.setItem('token', token); // Save the token in localStorage for persistence
            return token; // Return the token
        } catch (error) {
            // Handle any errors that occur during the login process
            throw new Error('Login failed: ' + error.message);
        }
    }

    // Method to handle user logout
    logout() {
        this.token = null; // Clear the token from the instance
        localStorage.removeItem('token'); // Remove the token from localStorage
    }

    // Method to check if the user is authenticated
    isAuthenticated() {
        return !!this.token; // Return true if a token exists, false otherwise
    }

    // Method to get the current token
    getToken() {
        return this.token; // Return the stored token
    }
}

// Create an instance of AuthService to be used throughout the application
const auth = new AuthService();