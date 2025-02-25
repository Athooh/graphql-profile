class GraphManager {
    constructor() {
        this.svgNS = "http://www.w3.org/2000/svg";
    }

    createLineGraph(data, container) {
        // Sort data by date
        const sortedData = data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        
        // Calculate cumulative XP
        let cumulativeXP = 0;
        const points = sortedData.map(item => {
            cumulativeXP += item.amount;
            return {
                date: new Date(item.createdAt),
                xp: cumulativeXP
            };
        });

        const width = 600;
        const height = 300;
        const padding = 40;

        // Create SVG
        const svg = document.createElementNS(this.svgNS, "svg");
        svg.setAttribute("width", width);
        svg.setAttribute("height", height);

        // Calculate scales
        const xScale = (width - 2 * padding) / (points.length - 1);
        const yScale = (height - 2 * padding) / Math.max(...points.map(p => p.xp));

        // Create path
        let pathD = `M ${padding} ${height - padding - points[0].xp * yScale}`;
        points.forEach((point, i) => {
            pathD += ` L ${padding + i * xScale} ${height - padding - point.xp * yScale}`;
        });

        const path = document.createElementNS(this.svgNS, "path");
        path.setAttribute("d", pathD);
        path.setAttribute("stroke", "#007bff");
        path.setAttribute("fill", "none");
        path.setAttribute("stroke-width", "2");

        // Add axes
        const xAxis = document.createElementNS(this.svgNS, "line");
        xAxis.setAttribute("x1", padding);
        xAxis.setAttribute("y1", height - padding);
        xAxis.setAttribute("x2", width - padding);
        xAxis.setAttribute("y2", height - padding);
        xAxis.setAttribute("stroke", "black");

        const yAxis = document.createElementNS(this.svgNS, "line");
        yAxis.setAttribute("x1", padding);
        yAxis.setAttribute("y1", padding);
        yAxis.setAttribute("x2", padding);
        yAxis.setAttribute("y2", height - padding);
        yAxis.setAttribute("stroke", "black");

        svg.appendChild(path);
        svg.appendChild(xAxis);
        svg.appendChild(yAxis);

        // Add title
        const title = document.createElement("h3");
        title.textContent = "XP Progress Over Time";
        container.appendChild(title);
        container.appendChild(svg);
    }

    createPieChart(data, container) {
        const width = 300;
        const height = 300;
        const radius = Math.min(width, height) / 2 - 10;
        const centerX = width / 2;
        const centerY = height / 2;

        const svg = document.createElementNS(this.svgNS, "svg");
        svg.setAttribute("width", width);
        svg.setAttribute("height", height);

        const total = data.pass + data.fail;
        const passAngle = (data.pass / total) * 360;
        const failAngle = (data.fail / total) * 360;

        // Create pass slice
        const passSlice = this.createPieSlice(centerX, centerY, radius, 0, passAngle, "#28a745");
        const failSlice = this.createPieSlice(centerX, centerY, radius, passAngle, passAngle + failAngle, "#dc3545");

        svg.appendChild(passSlice);
        svg.appendChild(failSlice);

        // Add legend
        const legend = document.createElement("div");
        legend.innerHTML = `
            <div style="margin-top: 10px;">
                <span style="color: #28a745;">■</span> Pass (${Math.round(data.pass / total * 100)}%)
                <span style="color: #dc3545; margin-left: 10px;">■</span> Fail (${Math.round(data.fail / total * 100)}%)
            </div>
        `;

        const title = document.createElement("h3");
        title.textContent = "Project Success Ratio";
        container.appendChild(title);
        container.appendChild(svg);
        container.appendChild(legend);
    }

    createPieSlice(centerX, centerY, radius, startAngle, endAngle, color) {
        const start = this.polarToCartesian(centerX, centerY, radius, endAngle);
        const end = this.polarToCartesian(centerX, centerY, radius, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

        const d = [
            "M", centerX, centerY,
            "L", start.x, start.y,
            "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
            "Z"
        ].join(" ");

        const path = document.createElementNS(this.svgNS, "path");
        path.setAttribute("d", d);
        path.setAttribute("fill", color);

        return path;
    }

    polarToCartesian(centerX, centerY, radius, angleInDegrees) {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    }
}