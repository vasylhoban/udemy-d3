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

let time = 0;
let interval;
let formattedData;

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


//Tooltip
const tip = d3.tip().attr('class', 'd3-tip').html((d) => {
	let text = `<strong>Country: </strong><span style="color:red">${d.country}</span><br>`;
	text += `<strong>Continent: </strong><span style="color:red">${d.continent}</span><br>`;
	text += `<strong>Life expectancy: </strong><span style="color:red">${d3.format(".2f")(d.life_exp)}</span><br>`;
	text += `<strong>Income: </strong><span style="color:red">${d3.format("$,.0f")(d.income)}</span><br>`;
	text += `<strong>Population: </strong><span style="color:red">${d3.format(",.0f")(d.population)}</span><br>`;
	return text;
});
area.call(tip);

//scales
const x = d3.scaleLog().domain([300, 150000])
	.range([0, areaWidth]).base(10);
const y = d3.scaleLinear().domain([0, 90])
	.range([areaHeight, 0]);
const r = d3.scaleLinear().domain([2000, 1400000000])
	.range([5, 50]);
const color = d3.scaleOrdinal(d3.schemeCategory10);

//Legend
const continents = ["europe", "asia", "americas", "africa"];
const legend = area.append("g")
    .attr("transform", `translate(${areaWidth - 10}, ${areaHeight - 125})`);

continents.forEach((continent, i)=> {
    let legendRow = legend.append("g")
        .attr('transform', `translate(0, ${i*20})`);

    legendRow.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", color(continent));

    legendRow.append('text')
		.attr("x", -10)
		.attr("y", 10)
		.attr('text-anchor', "end")
		.style('text-transform', "capitalize")
		.text(continent);
});

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

const continents = ['europe', 'asia', 'americas', 'africa'];
const legend = area.append('g')
	.attr('transform', `translate(${areaWidth - 10}, ${areaHeight - 125})`);

continents.forEach((continent, i) => {
	let legendRow = legend.append('g')
		.attr('transform', `translate(0, ${i*20})`);

	legendRow.append('rect')
		.attr('width', 10)
		.attr('height', 10)
		.attr('fill', color(continent));

	legendRow.append('text')
		.attr("x", -10)
		.attr("y", 10)
		.attr("text-anchor", "end")
		.style("text-transform", "capitalize")
		.text(continent);
});

let yearLabel = area.append("text")
	.attr("font-size", "40px")
	.attr("font-weight", "bold")
	.attr("color", "grey")
	.attr("x", areaWidth + 15)
	.attr("y", areaHeight + 15)
	.text('1800');

d3.json("data/data.json").then(function(data){
	formattedData = data.map(element => {
		return {
			year: element.year,
			countries: element.countries.filter(country => country.income && country.life_exp)
		};
	});

	console.log(formattedData);

    updateChart(formattedData[0].countries, formattedData[0].year);
});

$('#play-button')
	.on('click', function () {
		let button = $(this);
		if (button.text() === 'Play') {
            button.text("Pause");
            interval = setInterval(step, 100);
		} else {
            button.text("Play");
            clearInterval(interval);
		}
	});

$("#reset-button")
	.on('click', function () {
		time = 0;
        updateChart(formattedData[0].countries, formattedData[0].year);
    });

$("#continent-select")
	.on('change', function () {
        updateChart(formattedData[time].countries, formattedData[time].year);
    });

$('#date-slider').slider({
	max: 2014,
	min: 1800,
	step: 1,
	slide: function (e, ui) {
		time = ui.value - 1800;
        updateChart(formattedData[time].countries, formattedData[time].year);
    }
});

function step() {
    updateChart(formattedData[time].countries, formattedData[time].year);
    time++;
    if (formattedData[time].year === '2014') {
        time = 0;
    }
}

function updateChart(data, year) {
	const animation = d3.transition().duration(100);

	let continent = $('#continent-select').val();

	let filteredData = data.filter(d => {
		if (continent === 'all') {
			return true;
		} else {
			return d.continent === continent;
		}
	});

	let circles = area.selectAll('circle').data(filteredData, d => {
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
		.on('mouseover', tip.show)
		.on('mouseout', tip.hide)
		.merge(circles)
			.transition(animation)
				.attr('cx', d => x(d.income))
				.attr('r', d => r(d.population))
				.attr('cy', d => y(d.life_exp));

	yearLabel.text(year);
	$("#year")[0].innerHeight = time + 1800;
	
	$("#date-slider").slider('value', +(time + 1800));
}


