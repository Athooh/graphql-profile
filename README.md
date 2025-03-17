# GraphQL Profile Page Project

## Overview

This project is a **GraphQL-based profile page** that allows users to log in, view their personal data, and visualize their progress using interactive SVG graphs. The project integrates with a GraphQL API to fetch user data such as XP, audits, skills, and more. The profile page is designed with a clean UI and includes a login system, logout functionality, and dynamic data visualization.

---

## Features

- **Login System**: Users can log in using their username/email and password. The system uses JWT (JSON Web Tokens) for authentication.
- **Profile Page**: Displays user information in three main sections:
  1. **Basic Information**: User ID, login, email, campus, and audit ratio.
  2. **XP Progress**: Total XP earned over time, displayed in a line graph.
  3. **Audit Performance**: Audit success rate, average grade, and recent successful audits.
  4. **Skills**: Displays skills grouped by category with progress bars.
- **Graphs**: Two interactive SVG graphs:
  1. **XP Progress Over Time**: A line graph showing cumulative XP earned over time.
  2. **Project Success Ratio**: A pie chart showing the ratio of passed vs. failed projects.
- **Logout Functionality**: Users can log out, which clears their JWT and redirects them to the login page.

---

## Technologies Used

- **Frontend**:
  - HTML, CSS, JavaScript
  - SVG for graph generation
- **Backend Integration**:
  - GraphQL API for data fetching
  - JWT for authentication
- **Hosting**:
  - The project can be hosted on platforms like GitHub Pages, Netlify, or any other static hosting service.

---

## Project Structure

### Files

1. **`index.html`**: The main HTML file containing the login form and profile page structure.
2. **`auth.js`**: Handles user authentication, including login and logout functionality.
3. **`graphql.js`**: Manages GraphQL queries to fetch user data from the API.
4. **`graphs.js`**: Generates SVG graphs (line graph and pie chart) for data visualization.
5. **`main.js`**: The main JavaScript file that ties everything together, handling DOM events and data display.
6. **`main.css`**: For page and components styling.

---

## How to Use

### 1. Login
- Enter your username/email and password in the login form.
- If the credentials are valid, the profile page will load with your data.
- If the credentials are invalid, an error message will be displayed.

### 2. Profile Page
- Once logged in, you will see your profile information divided into sections:
  - **Basic Information**: Displays your login, ID, email, campus, and audit ratio.
  - **XP Progress**: Shows your total XP earned and a line graph of your progress over time.
  - **Audit Performance**: Displays your audit success rate, average grade, and recent successful audits.
  - **Skills**: Shows your skills grouped by category with progress bars.
  - **Graphs**: Displays two interactive graphs:
    - **XP Progress Over Time**: A line graph showing your cumulative XP.
    - **Project Success Ratio**: A pie chart showing the ratio of passed vs. failed projects.

### 3. Logout
- Click the "Logout" button to log out of the profile page. You will be redirected back to the login page.

---

## Code Examples

### GraphQL Queries

Here are some examples of the GraphQL queries used in the project:

1. **Fetch User Information**:
   ```graphql
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
   }
   ```

2. **Fetch XP Transactions**:
   ```graphql
   query {
     transaction(where: {type: {_eq: "xp"}}, order_by: {createdAt: asc}) {
       amount
       createdAt
       path
     }
   }
   ```

3. **Fetch Progress Data**:
   ```graphql
   query {
     progress {
       id
       grade
       createdAt
       path
     }
   }
   ```

---

## Hosting

You can host this project on any static hosting service. Here are some options:

1. **GitHub Pages**:
   - Follow the [GitHub Pages guide](https://pages.github.com/) to host your project.
   - Push your code to a GitHub repository and enable GitHub Pages in the repository settings.

2. **Netlify**:
   - Use [Vercel](https://vercel.com/athoohs-projects/graphql) for easy deployment and hosting.
   - Drag and drop your project folder into Netlify, or connect your GitHub repository.

---

## Future Improvements

- **Responsive Design**: Improve the UI to make it more responsive and mobile-friendly.
- **Additional Graphs**: Add more graphs to visualize other data points, such as XP earned by project or audit ratio over time.
- **Custom GraphiQL**: Integrate a custom GraphiQL interface for easier query testing and exploration.
- **Error Handling**: Improve error handling for failed GraphQL queries or network issues.
- **UI Enhancements**: Add animations, transitions, and better styling to enhance the user experience.

---

## Resources

- [GraphQL Documentation](https://graphql.org/)
- [SVG Graphs Tutorial](https://www.tutorialspoint.com/svg/graph.htm)
- [JWT Introduction](https://jwt.io/introduction)
- [GitHub Pages Guide](https://pages.github.com/)
- [Netlify Hosting](https://www.netlify.com/)

---

## Hosting
check out the graphql web app here: https://vercel.com/athoohs-projects/graphql

---
## Conclusion

This project demonstrates how to integrate GraphQL with a frontend application to create a dynamic and interactive profile page. It includes authentication, data fetching, and data visualization using SVG graphs. The project is a great example of how to build a modern web application using GraphQL and JavaScript.

---
