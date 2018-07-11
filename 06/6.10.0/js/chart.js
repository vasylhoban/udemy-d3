const svgWidth = 900,
			svgHeight = 600;
const margin = {left:100, right: 110, top: 10, bottom: 100};
const animation = d3.transition().duration(100);

const areaWidth = svgWidth - margin.left - margin.right;
const areaHeight = svgHeight - margin.top - margin.bottom;

let rawData;
let linePath;
let formattedData;

const parseTime = d3.timeParse("%d/%m/%Y");

const svg = d3.select("#chart-area")
	.append("svg")
	.attr('width', svgWidth)
	.attr('height', svgHeight);

const area = svg.append('g')
	.attr('transform', `translate(${margin.left}, ${margin.top})`);

area.append("text")
	.attr("class", "x axis-label")
	.attr("x", areaWidth / 2)
	.attr("y", areaHeight + 80)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("Time");

// Y Label
let yLabel = area.append("text")
	.attr("class", "y axis-label")
	.attr("x", - (areaHeight / 2))
	.attr("y", -80)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.attr("transform", "rotate(-90)")
	.text('Price in dollars');

const xAxisGroup = area.append('g')
	.attr('class', 'x axis')
	.attr('transform', `translate(0, ${areaHeight})`);

const yAxisGroup = area.append('g')
	.attr('class', 'y axis');

const x = d3.scaleTime().range([0, areaWidth]);
const y = d3.scaleLinear().range([areaHeight, 0]);

const line = d3.line()
	.x(function(d) { return x(d.date); })
	.y(function(d) { return y(d.value); });

linePath = area.append("path")
	.attr("class", "line")
	.attr("fill", "none")
	.attr("stroke", "grey")
	.attr("stroke-width", "1px");

d3.json("data/coins.json").then(function(data) {
	rawData = data;
	updateChart();
});

function updateChart() {
	let cryptoCurr = $('#coin-select').val();
	let yValue = $('#var-select').val();

	formattedData = rawData[cryptoCurr].filter(item => {
		return item.date && item[yValue];
	}).map(item => ({
			date: parseTime(item.date),
			value: +item[yValue]
		}));

	console.log(formattedData);

	x.domain(d3.extent(formattedData, function(d) { return d.date; }));
	y.domain([d3.min(formattedData, function(d) { return d.value; }) / 1.005,
		d3.max(formattedData, function(d) { return d.value; }) * 1.005]);

	const xAxisCall = d3.axisBottom(x)
		.ticks(6);
	const yAxisCall = d3.axisLeft(y)
		.ticks(5).tickFormat(d => `$${d}`);


	xAxisGroup.transition(animation).call(xAxisCall);
	yAxisGroup.transition(animation).call(yAxisCall);

	linePath.transition(animation).attr("d", line(formattedData));
}

$("#coin-select")
	.on('change', function () {
		updateChart();
	});

$("#var-select")
	.on('change', function () {
		const selectedValue = $(this).val();
		if (selectedValue === "price_usd") {
			yLabel.text('Price in dollars')
		}
		if (selectedValue === "market_cap") {
			yLabel.text('Market capitalization')
		}
		if (selectedValue === "24h_vol") {
			yLabel.text('24 hour trading volume')
		}
		updateChart();
	});

