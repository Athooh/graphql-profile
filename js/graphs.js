// GraphManager class to handle the creation of various types of graphs (e.g., line graphs, pie charts)
class GraphManager {
    constructor() {
        // Define the SVG namespace for creating SVG elements
        this.svgNS = "http://www.w3.org/2000/svg";
    }

    // Method to create a line graph
    createLineGraph(data, container) {
        // Sort the data by date in ascending order
        const sortedData = data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        
        // Calculate cumulative XP (experience points) over time
        let cumulativeXP = 0;
        const points = sortedData.map(item => {
            cumulativeXP += item.amount; // Accumulate XP
            return {
                date: new Date(item.createdAt), // Convert date string to Date object
                xp: cumulativeXP // Store cumulative XP
            };
        });

        // Define the dimensions of the graph
        const width = 600;
        const height = 300;
        const padding = 40; // Padding around the graph

        // Create an SVG element to hold the graph
        const svg = document.createElementNS(this.svgNS, "svg");
        svg.setAttribute("width", width);
        svg.setAttribute("height", height);

        // Calculate scales for the x and y axes
        const xScale = (width - 2 * padding) / (points.length - 1); // Scale for the x-axis (time)
        const yScale = (height - 2 * padding) / Math.max(...points.map(p => p.xp)); // Scale for the y-axis (XP)

        // Create the path for the line graph
        let pathD = `M ${padding} ${height - padding - points[0].xp * yScale}`; // Start the path at the first point
        points.forEach((point, i) => {
            pathD += ` L ${padding + i * xScale} ${height - padding - point.xp * yScale}`; // Add a line to each subsequent point
        });

        // Create the path element and set its attributes
        const path = document.createElementNS(this.svgNS, "path");
        path.setAttribute("d", pathD); // Set the path data
        path.setAttribute("stroke", "#007bff"); // Set the line color
        path.setAttribute("fill", "none"); // Ensure the path is not filled
        path.setAttribute("stroke-width", "2"); // Set the line thickness

        // Create the x-axis (horizontal line)
        const xAxis = document.createElementNS(this.svgNS, "line");
        xAxis.setAttribute("x1", padding);
        xAxis.setAttribute("y1", height - padding);
        xAxis.setAttribute("x2", width - padding);
        xAxis.setAttribute("y2", height - padding);
        xAxis.setAttribute("stroke", "black"); // Set the axis color

        // Create the y-axis (vertical line)
        const yAxis = document.createElementNS(this.svgNS, "line");
        yAxis.setAttribute("x1", padding);
        yAxis.setAttribute("y1", padding);
        yAxis.setAttribute("x2", padding);
        yAxis.setAttribute("y2", height - padding);
        yAxis.setAttribute("stroke", "black"); // Set the axis color

        // Create a group for grid lines
        const gridLines = document.createElementNS(this.svgNS, "g");
        gridLines.setAttribute("class", "grid-lines");
        
        // Add vertical grid lines (for time)
        for (let i = 0; i <= 5; i++) {
            const x = padding + (width - 2 * padding) * (i / 5); // Calculate the x position of the grid line
            const line = document.createElementNS(this.svgNS, "line");
            line.setAttribute("x1", x);
            line.setAttribute("y1", padding);
            line.setAttribute("x2", x);
            line.setAttribute("y2", height - padding);
            line.setAttribute("stroke", "#e0e0e0"); // Set the grid line color
            line.setAttribute("stroke-width", "1"); // Set the grid line thickness
            gridLines.appendChild(line); // Add the grid line to the group
            
            // Add date labels below the x-axis
            if (points.length > 0) {
                const dateLabel = document.createElementNS(this.svgNS, "text");
                const pointIndex = Math.min(Math.floor(i * points.length / 5), points.length - 1); // Find the corresponding data point
                const date = points[pointIndex].date; // Get the date for the label
                dateLabel.textContent = date.toLocaleDateString(); // Format the date
                dateLabel.setAttribute("x", x);
                dateLabel.setAttribute("y", height - padding + 20); // Position the label below the x-axis
                dateLabel.setAttribute("text-anchor", "middle"); // Center the text
                dateLabel.setAttribute("font-size", "12px"); // Set the font size
                svg.appendChild(dateLabel); // Add the label to the SVG
            }
        }

        // Add horizontal grid lines (for XP)
        const maxXP = Math.max(...points.map(p => p.xp)); // Find the maximum XP value
        for (let i = 0; i <= 5; i++) {
            const y = height - padding - (height - 2 * padding) * (i / 5); // Calculate the y position of the grid line
            const line = document.createElementNS(this.svgNS, "line");
            line.setAttribute("x1", padding);
            line.setAttribute("y1", y);
            line.setAttribute("x2", width - padding);
            line.setAttribute("y2", y);
            line.setAttribute("stroke", "#e0e0e0"); // Set the grid line color
            line.setAttribute("stroke-width", "1"); // Set the grid line thickness
            gridLines.appendChild(line); // Add the grid line to the group
            
            // Add XP labels to the left of the y-axis
            const xpLabel = document.createElementNS(this.svgNS, "text");
            xpLabel.textContent = Math.round(maxXP * i / 5).toLocaleString() + " XP"; // Format the XP value
            xpLabel.setAttribute("x", padding - 10); // Position the label to the left of the y-axis
            xpLabel.setAttribute("y", y);
            xpLabel.setAttribute("text-anchor", "end"); // Right-align the text
            xpLabel.setAttribute("alignment-baseline", "middle"); // Vertically center the text
            xpLabel.setAttribute("font-size", "12px"); // Set the font size
            svg.appendChild(xpLabel); // Add the label to the SVG
        }

        // Add axis labels
        const xLabel = document.createElementNS(this.svgNS, "text");
        xLabel.textContent = "Time"; // Label for the x-axis
        xLabel.setAttribute("x", width / 2); // Center the label
        xLabel.setAttribute("y", height - 5); // Position the label below the x-axis
        xLabel.setAttribute("text-anchor", "middle"); // Center the text
        xLabel.setAttribute("font-size", "14px"); // Set the font size

        const yLabel = document.createElementNS(this.svgNS, "text");
        yLabel.textContent = "XP Gained"; // Label for the y-axis
        yLabel.setAttribute("x", -height / 2); // Position the label to the left of the y-axis
        yLabel.setAttribute("y", 15); // Adjust the vertical position
        yLabel.setAttribute("text-anchor", "middle"); // Center the text
        yLabel.setAttribute("transform", "rotate(-90)"); // Rotate the label vertically
        yLabel.setAttribute("font-size", "14px"); // Set the font size

        // Add all elements to the SVG
        svg.appendChild(path);
        svg.appendChild(xAxis);
        svg.appendChild(yAxis);
        svg.insertBefore(gridLines, path); // Add grid lines before the path
        svg.appendChild(xLabel);
        svg.appendChild(yLabel);

        // Add a title to the graph
        const title = document.createElement("h3");
        title.textContent = "XP Progress Over Time"; // Set the title text
        container.appendChild(title); // Add the title to the container
        container.appendChild(svg); // Add the SVG to the container
    }

    // Method to create a pie chart
    createPieChart(data, container) {
        // Define the dimensions of the pie chart
        const width = 300;
        const height = 300;
        const radius = Math.min(width, height) / 2 - 10; // Calculate the radius of the pie chart
        const centerX = width / 2; // Center of the pie chart (x-coordinate)
        const centerY = height / 2; // Center of the pie chart (y-coordinate)

        // Create an SVG element to hold the pie chart
        const svg = document.createElementNS(this.svgNS, "svg");
        svg.setAttribute("width", width);
        svg.setAttribute("height", height);

        // Calculate the total value (pass + fail) and the angles for each slice
        const total = data.pass + data.fail;
        const passAngle = (data.pass / total) * 360; // Angle for the "pass" slice
        const failAngle = (data.fail / total) * 360; // Angle for the "fail" slice

        // Create the "pass" slice
        const passSlice = this.createPieSlice(centerX, centerY, radius, 0, passAngle, "#28a745");
        // Create the "fail" slice
        const failSlice = this.createPieSlice(centerX, centerY, radius, passAngle, passAngle + failAngle, "#dc3545");

        // Add the slices to the SVG
        svg.appendChild(passSlice);
        svg.appendChild(failSlice);

        // Add a legend to explain the pie chart
        const legend = document.createElement("div");
        legend.innerHTML = `
            <div style="margin-top: 10px;">
                <span style="color: #28a745;">■</span> Pass (${Math.round(data.pass / total * 100)}%)
                <span style="color: #dc3545; margin-left: 10px;">■</span> Fail (${Math.round(data.fail / total * 100)}%)
            </div>
        `;

        // Add a title to the pie chart
        const title = document.createElement("h3");
        title.textContent = "Project Success Ratio"; // Set the title text
        container.appendChild(title); // Add the title to the container
        container.appendChild(svg); // Add the SVG to the container
        container.appendChild(legend); // Add the legend to the container
    }

    // Helper method to create a pie chart slice
    createPieSlice(centerX, centerY, radius, startAngle, endAngle, color) {
        // Convert polar coordinates (angle) to Cartesian coordinates (x, y)
        const start = this.polarToCartesian(centerX, centerY, radius, endAngle);
        const end = this.polarToCartesian(centerX, centerY, radius, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"; // Determine if the arc is large or small

        // Create the path data for the slice
        const d = [
            "M", centerX, centerY, // Move to the center
            "L", start.x, start.y, // Draw a line to the start of the arc
            "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y, // Draw the arc
            "Z" // Close the path
        ].join(" ");

        // Create the path element and set its attributes
        const path = document.createElementNS(this.svgNS, "path");
        path.setAttribute("d", d); // Set the path data
        path.setAttribute("fill", color); // Set the fill color

        return path; // Return the path element
    }

    // Helper method to convert polar coordinates to Cartesian coordinates
    polarToCartesian(centerX, centerY, radius, angleInDegrees) {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0; // Convert degrees to radians
        return {
            x: centerX + (radius * Math.cos(angleInRadians)), // Calculate the x-coordinate
            y: centerY + (radius * Math.sin(angleInRadians)) // Calculate the y-coordinate
        };
    }
}