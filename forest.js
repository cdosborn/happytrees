function loadData() {
  return [
    {
      type: 'tree',
      x: 40,
      y: 10,
      width: 25,
      height: 75,
      theme: 'blue',
      key: 'hello tree'
    },
    {
      type: 'tree',
      x: 60,
      y: 25,
      width: 40,
      height: 60,
      theme: 'green',
      key: 'hello tree'
    }
  ];
}

const data = loadData()

const width = document.body.clientWidth;
const height = document.body.clientHeight;

const xScale = d3.scaleLinear().domain([0, 100]).range([0, width]);
const yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);

d3.select('svg.root')
  .selectAll('g')
  .data(data)
  .enter()
  .append('g')
  .attr('class', d => d.type)
  .attr('transform', d => 'translate(' + d.x+ ',' + (yScale(d.y) - d.height) + ')')

function createTrees() {
  d3.selectAll('.tree')
    .each(function(d) {
      d3.select(this).append('rect').classed('trunk', true);
      d3.select(this).append('circle').classed('leaves', true);
    });
}

function drawTree(time, delta) {
  return function(d) {

    d3.select(this)
      .selectAll('.trunk')
      .transition().duration(delta)
      .attr('x', -d.width / 2)
      .attr('y', 0)
      .attr('width', d.width)
      .attr('height', d.height)
      .attr('fill', d.theme);

    d3.select(this)
      .selectAll('.leaves')
      .transition().duration(delta)
      .ease(d3.easeLinear)
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 30 + Math.sin(time * 0.001) * 10)
      .attr('fill', 'red');

  };
}

createTrees();
let last = Date.now();
setInterval(function() {
  d3.selectAll('.tree').each(drawTree(Date.now(), Date.now() - last));
  last = Date.now();
}, 1000);

