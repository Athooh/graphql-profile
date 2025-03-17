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

            console.log(data)
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
        return this.query(query);
    }

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
        return this.query(query);
    }

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
        return this.query(query);
    }
}

const graphql = new GraphQLService(); 