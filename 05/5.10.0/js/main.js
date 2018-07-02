/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 2 - Gapminder Clone
*/
const svgWidth = 900,
			svgHeight = 600;
const margin = {left:100, right: 110, top: 10, bottom: 100};

const areaWidth = svgWidth - margin.left - margin.right;
const areaHeight = svgHeight - margin.top - margin.bottom;

const svg = d3.select("#chart-area")
	.append("svg")
	.attr('width', svgWidth)
	.attr('height', svgHeight);

const area = svg.append('g')
	.attr('transform', `translate(${margin.left}, ${margin.top})`);

const xAxisGroup = area.append('g')
	.attr('class', 'x axis')
	.attr('transform', `translate(0, ${areaHeight})`);

const yAxisGroup = area.append('g')
	.attr('class', 'y axis');

const x = d3.scaleLog().domain([300, 150000])
	.range([0, areaWidth]).base(10);
const y = d3.scaleLinear().domain([0, 90])
	.range([areaHeight, 0]);
const r = d3.scaleLinear().domain([2000, 1400000000])
	.range([5, 50]);
const color = d3.scaleOrdinal(d3.schemeCategory10);

area.append("text")
	.attr("class", "x axis-label")
	.attr("x", areaWidth / 2)
	.attr("y", areaHeight + 80)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("GDP Per Capital ($)");

// Y Label
area.append("text")
	.attr("class", "y axis-label")
	.attr("x", - (areaHeight / 2))
	.attr("y", -80)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.attr("transform", "rotate(-90)")
	.text('Life Expectancy (Years)');

let yearLabel = area.append("text")
	.attr("font-size", "40px")
	.attr("font-weight", "bold")
	.attr("color", "grey")
	.attr("x", areaWidth + 15)
	.attr("y", areaHeight + 15)
	.text('1800');

d3.json("data/data.json").then(function(data){
	const formattedData = data.map(element => {
		return {
			year: element.year,
			countries: element.countries.filter(country => country.income && country.life_exp)
		};
	});

	console.log(formattedData);

	let index = 0;

	d3.interval(()=> {
		updateChart(formattedData[index].countries, formattedData[index].year);
		index++;
		if (formattedData[index].year === '2014') {
			index = 0;
		}
	}, 100);
});

function updateChart(data, year) {
	const animation = d3.transition().duration(100);
	let circles = area.selectAll('circle').data(data, d => {
		return d.country;
	});

	const xAxisCall = d3.axisBottom(x)
		.tickValues([400, 4000, 40000])
		.tickFormat(d => `$${d}`);
	xAxisGroup.call(xAxisCall);

	const yAxisCall = d3.axisLeft(y)
		.tickFormat(d => `${d} years`);
	yAxisGroup.call(yAxisCall);

	circles.exit()
		.attr("class", "exit")
		.remove();

	circles.enter().append('circle')
		.attr('cx', d => x(d.income))
		.attr('cy', d => y(d.life_exp))
		.attr('r', d => r(d.population))
		.attr('fill', d => color(d.continent))
		.merge(circles)
			.transition(animation)
				.attr('cx', d => x(d.income))
				.attr('r', d => r(d.population))
				.attr('cy', d => y(d.life_exp));

	yearLabel.text(year);
}


