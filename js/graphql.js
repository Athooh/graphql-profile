// GraphQLService class to handle GraphQL queries and interactions with the API
class GraphQLService {
    constructor() {
        // Define the GraphQL API endpoint
        this.endpoint = 'https://learn.zone01kisumu.ke/api/graphql-engine/v1/graphql';
    }

    // Method to execute a GraphQL query
    async query(queryStr, variables = {}) {
        try {
            // Send a POST request to the GraphQL endpoint
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Set the content type to JSON
                    'Authorization': `Bearer ${auth.getToken()}` // Include the authorization token in the header
                },
                body: JSON.stringify({
                    query: queryStr, // Include the GraphQL query string
                    variables: variables // Include any variables for the query
                })
            });

            // Check if the response is not OK (e.g., 4xx or 5xx errors)
            if (!response.ok) {
                throw new Error('GraphQL query failed'); // Throw an error if the query fails
            }

            // Parse the response as JSON
            const data = await response.json();

            // Check if the response contains any errors
            if (data.errors) {
                throw new Error(data.errors[0].message); // Throw the first error message if errors exist
            }

            // Log the response data to the console for debugging
            console.log(data);

            // Return the data part of the response
            return data.data;
        } catch (error) {
            // Log any errors that occur during the query execution
            console.error('GraphQL Error:', error);
            throw error; // Re-throw the error for further handling
        }
    }

    // Example query to get user information
    async getUserInfo() {
        const query = `
            query {
                user {
                    id
                    login
                    email
                    campus
                    auditRatio
                    skills: transactions(
                        where: { type: { _like: "skill_%" } }
                        order_by: [{ amount: desc }]
                    ) {
                        type
                        amount
                    }
                }
                transaction(where: {_and: [{eventId:{_eq: 75}},]}, order_by: {createdAt: desc}) {
                    amount
                    createdAt
                    path
                    type
                }
                progress {
                    id
                    grade
                    createdAt
                    path
                }
                result {
                    id
                    grade
                    createdAt
                    path
                }
            }
        `;
        // Execute the query and return the result
        return this.query(query);
    }

    // Example query to get user XP (experience points)
    async getUserXP() {
        const query = `
            query {
                transaction(where: {_and: [{eventId:{_eq: 75}},{type:{_eq: "xp"}}]}, order_by: {createdAt: desc}) {
                    amount
                    createdAt
                    path
                }
            }
        `;
        // Execute the query and return the result
        return this.query(query);
    }

    // Example query to get user skills
    async getSkills() {
        const query = `
            query {
                progress(where: {path: {_like: "%/div-%"}}) {
                    id
                    path
                    grade
                    createdAt
                }
            }
        `;
        // Execute the query and return the result
        return this.query(query);
    }
}

// Create an instance of GraphQLService to be used throughout the application
const graphql = new GraphQLService();