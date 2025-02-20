class GraphManager {
    constructor() {
        this.svgNS = "http://www.w3.org/2000/svg";
    }

    createLineGraph(data, container) {
        if (!data || data.length === 0) {
            container.innerHTML = '<h3>XP Progress Over Time</h3><p>No XP data available</p>';
            return;
        }

        const width = 600;
        const height = 300;
        const padding = 40;

        const svg = document.createElementNS(this.svgNS, "svg");
        svg.setAttribute("width", width);
        svg.setAttribute("height", height);

        // Calculate cumulative XP
        let cumulativeXP = 0;
        const points = data.map(item => {
            cumulativeXP += item.amount;
            return {
                date: new Date(item.createdAt),
                xp: cumulativeXP
            };
        });

        // Calculate scales
        const xScale = (width - 2 * padding) / (points.length - 1);
        const maxXP = Math.max(...points.map(p => p.xp));
        const yScale = (height - 2 * padding) / maxXP;

        // Create path
        let pathD = `M ${padding} ${height - padding - points[0].xp * yScale}`;
        points.forEach((point, i) => {
            const x = padding + i * xScale;
            const y = height - padding - point.xp * yScale;
            pathD += ` L ${x} ${y}`;
        });

        // Create and append path
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

        // Add Y-axis labels
        for (let i = 0; i <= 5; i++) {
            const yLabel = document.createElementNS(this.svgNS, "text");
            const value = Math.round((maxXP * i) / 5);
            yLabel.setAttribute("x", padding - 5);
            yLabel.setAttribute("y", height - padding - (i * (height - 2 * padding) / 5));
            yLabel.setAttribute("text-anchor", "end");
            yLabel.setAttribute("alignment-baseline", "middle");
            yLabel.textContent = value;
            svg.appendChild(yLabel);
        }

        svg.appendChild(path);
        
        // Add date labels
        const dateLabels = [points[0].date, points[Math.floor(points.length/2)].date, points[points.length-1].date];
        dateLabels.forEach((date, i) => {
            const x = padding + i * (width - 2 * padding) / 2;
            const label = document.createElementNS(this.svgNS, "text");
            label.setAttribute("x", x);
            label.setAttribute("y", height - padding + 20);
            label.setAttribute("text-anchor", "middle");
            label.textContent = date.toLocaleDateString();
            svg.appendChild(label);
        });

        container.innerHTML = '<h3>XP Progress Over Time</h3>';
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

    createSkillsBarGraph(progressData, container) {
        if (!progressData || progressData.length === 0) {
            container.innerHTML = '<h3>Skills Distribution</h3><p>No skills data available</p>';
            return;
        }

        const width = 600;
        const height = 400; // Increased height for better visibility
        const padding = 60;
        
        // Group and calculate skills
        const skillCategories = new Map();
        progressData.forEach(item => {
            const category = item.path.split('/')[2] || 'Other';
            if (!skillCategories.has(category)) {
                skillCategories.set(category, { total: 0, completed: 0 });
            }
            skillCategories.get(category).total++;
            if (item.grade > 0) {
                skillCategories.get(category).completed++;
            }
        });

        // Filter out categories with no data
        const validCategories = Array.from(skillCategories.entries())
            .filter(([_, value]) => value.total > 0);

        const barWidth = (width - 2 * padding) / validCategories.length - 10;
        const svg = document.createElementNS(this.svgNS, "svg");
        svg.setAttribute("width", width);
        svg.setAttribute("height", height);

        // Add bars and labels
        validCategories.forEach(([category, value], index) => {
            const percentage = (value.completed / value.total) * 100;
            const barHeight = (height - 2 * padding) * (percentage / 100);
            const x = padding + index * (barWidth + 10);
            const y = height - padding - barHeight;

            // Add bar
            const bar = document.createElementNS(this.svgNS, "rect");
            bar.setAttribute("x", x);
            bar.setAttribute("y", y);
            bar.setAttribute("width", barWidth);
            bar.setAttribute("height", barHeight);
            bar.setAttribute("fill", "#007bff");

            // Add hover effect
            bar.addEventListener('mouseover', () => {
                bar.setAttribute("fill", "#0056b3");
            });
            bar.addEventListener('mouseout', () => {
                bar.setAttribute("fill", "#007bff");
            });

            // Add labels
            const categoryLabel = document.createElementNS(this.svgNS, "text");
            categoryLabel.setAttribute("x", x + barWidth / 2);
            categoryLabel.setAttribute("y", height - padding + 20);
            categoryLabel.setAttribute("text-anchor", "middle");
            categoryLabel.setAttribute("transform", `rotate(45, ${x + barWidth / 2}, ${height - padding + 20})`);
            categoryLabel.textContent = category;

            const percentLabel = document.createElementNS(this.svgNS, "text");
            percentLabel.setAttribute("x", x + barWidth / 2);
            percentLabel.setAttribute("y", y - 5);
            percentLabel.setAttribute("text-anchor", "middle");
            percentLabel.textContent = `${Math.round(percentage)}%`;

            svg.appendChild(bar);
            svg.appendChild(categoryLabel);
            svg.appendChild(percentLabel);
        });

        container.innerHTML = '<h3>Skills Distribution</h3>';
        container.appendChild(svg);
    }
}