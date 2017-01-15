/*
 * Mock "load from localstorage"
 */
function loadData() {
  // return [
  //   {
  //     type: 'tree',
  //     x: 40,
  //     y: 10,
  //     width: 25,
  //     height: 75,
  //     theme: 'blue',
  //     key: 'hello tree'
  //   },
  //   {
  //     type: 'tree',
  //     x: 60,
  //     y: 25,
  //     width: 40,
  //     height: 60,
  //     theme: 'green',
  //     key: 'hello tree2'
  //   },
  //   {
  //     type: 'cloud',
  //     x: 0,
  //     y: 80,
  //     width: 40,
  //     height: 25,
  //     speed: 1,
  //     theme: 'fluffy',
  //     key: 'cloud'
  //   },
  //   {
  //     type: 'cloud',
  //     x: 25,
  //     y: 80,
  //     width: 60,
  //     height: 30,
  //     speed: 1.4,
  //     theme: 'fluffy',
  //     key: 'cloud'
  //   }
  // ];
  return window.localstorage('log');
}

const data = loadData()


/*
 * These are values that every drawing function will have access to.
 */
const width = document.body.clientWidth;
const height = document.body.clientHeight;
const xScale = d3.scaleLinear().domain([0, 100]).range([0, width]);
const yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);
const globals = { width, height, xScale, yScale };

/* Add sky */
d3.select('svg.root')
  .append('rect')
  .classed('sky', true)
  .attr('fill', 'url(#Gradient2)')
  .attr('x', 0)
  .attr('y', 0)
  .attr('width', width)
  .attr('height', height);

/*
 * Add a 'g' for each 'thing'
 */
d3.select('svg.root')
  .selectAll('g')
  .data(data)
  .enter()
  .append('g')
  .attr('class', d => d.type)
  .attr('transform', d => 'translate(' + xScale(d.x) + ',' + (yScale(d.y) - d.height) + ')')

const recognizedEntities = [TREE, CLOUD];

function addAllThings() {
  recognizedEntities.forEach(entity => {
    const creator = entity.create(globals);
    d3.selectAll('.' + entity.name).each(creator);
  });
}

function updateAllThings(t, delta) {
  recognizedEntities.forEach(entity => {
    const updater = entity.update(t, delta, globals);
    d3.selectAll('.' + entity.name).each(updater);
  });
}

// main
addAllThings();
let last = Date.now();
setInterval(function() {
  const now = Date.now();
  updateAllThings(now, now - last);
  last = now;
}, 1000);
