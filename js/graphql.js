class GraphQLService {
    constructor() {
        this.endpoint = 'https://learn.zone01kisumu.ke/api/graphql-engine/v1/graphql';
    }

    async query(queryStr, variables = {}) {
        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.getToken()}`
                },
                body: JSON.stringify({
                    query: queryStr,
                    variables: variables
                })
            });

            if (!response.ok) {
                throw new Error('GraphQL query failed');
            }

            const data = await response.json();
            if (data.errors) {
                throw new Error(data.errors[0].message);
            }

            return data.data;
        } catch (error) {
            console.error('GraphQL Error:', error);
            throw error;
        }
    }

    // Example queries
    async getUserInfo() {
        const query = `
            query {
                user {
                    id
                    login
                }
            }
        `;
        return this.query(query);
    }

    async getUserXP() {
        const query = `
            query {
                transaction(where: {type: {_eq: "xp"}}) {
                    amount
                    createdAt
                    path
                }
            }
        `;
        return this.query(query);
    }

    // async getAllUserData() {
    //     const query = `
    //         query {
    //             user {
    //                 id
    //                 login
    //                 attrs
    //             }
    //             transaction(where: {type: {_eq: "xp"}}, order_by: {createdAt: asc}) {
    //                 amount
    //                 createdAt
    //                 path
    //             }
    //             progress {
    //                 grade
    //                 createdAt
    //                 path
    //             }
    //             result(where: {type: {_eq: "up"}}, order_by: {createdAt: desc}) {
    //                 grade
    //                 createdAt
    //                 path
    //                 type
    //             }
    //         }
    //     `;
    //     return this.query(query);
    // }

    // async getSkills() {
    //     const query = `
    //         query {
    //             progress {
    //                 path
    //                 grade
    //                 object {
    //                     name
    //                     type
    //                 }
    //             }
    //         }
    //     `;
    //     return this.query(query);
    // }
}

const graphql = new GraphQLService(); 