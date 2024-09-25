import React, { useEffect, useRef } from 'react';
import axios from 'axios';
import { Chart, registerables } from 'chart.js'; 
import * as d3 from 'd3';

Chart.register(...registerables);

function HomePage() {
    const chartRef = useRef(null); // Create a ref to hold the chart instance
    const dataSource = {
        datasets: [
            {
                data: [],
                backgroundColor: [
                    '#ffcd56', // Eat out
                    '#ff6384', // Rent
                    '#36a2eb', // Grocery
                    '#fd6b19', // Entertainment
                    '#4bc0c0', // Utilities
                    '#9966ff', // Transport
                    '#ff9f40'  // Savings
                ]
            }
        ],
        labels: []
    };

    const createChart = () => {
        const ctx = document.getElementById('myChart').getContext('2d');

        // If a chart instance already exists, destroy it
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        // Create a new chart instance and save it to the ref
        chartRef.current = new Chart(ctx, {
            type: 'pie',
            data: dataSource
        });
    };

    const createD3Chart = (data) => {
        const container = document.getElementById('d3Chart');
        const width = container.clientWidth;
        const height = container.clientHeight;
        const radius = Math.min(width, height) / 2;

        const formattedData = data.map(d => ({
            label: d.title,
            value: d.budget
        }));

        d3.select("#d3Chart svg").remove();

        const svg = d3.select("#d3Chart")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        svg.append("g").attr("class", "slices");
        svg.append("g").attr("class", "labels");
        svg.append("g").attr("class", "lines");

        const pie = d3.pie().sort(null).value(d => d.value);
        const arc = d3.arc().outerRadius(radius * 0.8).innerRadius(radius * 0.4);
        const outerArc = d3.arc().innerRadius(radius * 0.9).outerRadius(radius * 0.9);

        const color = d3.scaleOrdinal()
            .domain(formattedData.map(d => d.label))
            .range(d3.schemeCategory10);

        function midAngle(d) {
            return d.startAngle + (d.endAngle - d.startAngle) / 2;
        }

        const slice = svg.select(".slices").selectAll("path.slice")
            .data(pie(formattedData), d => d.data.label);

        slice.enter()
            .append("path")
            .attr("class", "slice")
            .attr("fill", d => color(d.data.label))
            .each(function(d) { this._current = d; })
            .transition().duration(1000)
            .attrTween("d", function(d) {
                const interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return t => arc(interpolate(t));
            });

        slice.transition().duration(1000)
            .attrTween("d", function(d) {
                const interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return t => arc(interpolate(t));
            });

        slice.exit().remove();

        const text = svg.select(".labels").selectAll("text")
            .data(pie(formattedData), d => d.data.label);

        text.enter()
            .append("text")
            .attr("dy", ".35em")
            .text(d => d.data.label)
            .each(function(d) { this._current = d; })
            .transition().duration(1000)
            .attrTween("transform", function(d) {
                const interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return t => {
                    const d2 = interpolate(t);
                    const pos = outerArc.centroid(d2);
                    pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                    return `translate(${pos})`;
                };
            })
            .styleTween("text-anchor", function(d) {
                const interpolate = d3.interpolate(this._current, d);
                return t => midAngle(interpolate(t)) < Math.PI ? "start" : "end";
            });

        text.exit().remove();

        const polyline = svg.select(".lines").selectAll("polyline")
            .data(pie(formattedData), d => d.data.label);

        polyline.enter()
            .append("polyline")
            .each(function(d) { this._current = d; })
            .transition().duration(1000)
            .attrTween("points", function(d) {
                const interpolate = d3.interpolate(this._current, d);
                return t => {
                    const d2 = interpolate(t);
                    const pos = outerArc.centroid(d2);
                    pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                    return [arc.centroid(d2), outerArc.centroid(d2), pos];
                };
            });

        polyline.exit().remove();
    };

    const getBudget = () => {
        //axios.get('/budget-data.json')
        axios.get('http://localhost:3001/budget')
            .then(function (res) {
                for (let i = 0; i < res.data.myBudget.length; i++) {
                    dataSource.datasets[0].data[i] = res.data.myBudget[i].budget;
                    dataSource.labels[i] = res.data.myBudget[i].title;
                }
                createChart();
                createD3Chart(res.data.myBudget);
            });
    };

    useEffect(() => {
        getBudget();
    }, []);

    return (
        <main className="center" id="main" role="main">
            <div className="page-area">
                <article>
                    <h1>Stay on track</h1>
                    <p>
                        Do you know where you are spending your money? If you really stop to track it down,
                        you would get surprised! Proper budget management depends on real data... and this
                        app will help you with that!
                    </p>
                </article>
        
                <article>
                    <h1>Alerts</h1>
                    <p>
                        What if your clothing budget ended? You will get an alert. The goal is to never go over the budget.
                    </p>
                </article>
        
                <article>
                    <h1>Results</h1>
                    <p>
                        People who stick to a financial plan, budgeting every expense, get out of debt faster!
                        Also, they to live happier lives... since they expend without guilt or fear... 
                        because they know it is all good and accounted for.
                    </p>
                </article>
        
                <article>
                    <h1>Free</h1>
                    <p>
                        This app is free!!! And you are the only one holding your data!
                    </p>
                </article>
        
                <article>
                    <h1>Stay on track</h1>
                    <p>
                        Do you know where you are spending your money? If you really stop to track it down,
                        you would get surprised! Proper budget management depends on real data... and this
                        app will help you with that!
                    </p>
                </article>
        
                <article>
                    <h1>Alerts</h1>
                    <p>
                        What if your clothing budget ended? You will get an alert. The goal is to never go over the budget.
                    </p>
                </article>
        
                <article>
                    <h1>Results</h1>
                    <p>
                        People who stick to a financial plan, budgeting every expense, get out of debt faster! Also, they to live happier lives... since they expend without guilt or fear... because they know it is all good and accounted for.
                    </p>
                </article>

                <article>
                    <h1>Chart</h1>
                    <p>
                        <canvas id="myChart" width="400" height="400" role="img" aria-label="Spending chart showing budget breakdown"></canvas>
                    </p>
                </article>

                <article>
                    <h1>D3.js Spending Breakdown</h1>
                    <div id="d3Chart" role="img" aria-label="D3.js spending chart"></div>
                </article>
            </div>
        </main>
    );
}

export default HomePage;
