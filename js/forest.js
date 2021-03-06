var data = [];

function makeCloud() {
    return {
        type: 'cloud',
        x: Math.random() * 100,
        y: 70 + Math.random() * 30,
        width: 10 + Math.random() * 30,
        height: 10 + Math.random() * 10,
        speed: 0.5 + Math.random()
    };
}

clouds = d3.range(1, 6).map(makeCloud);

function mapLogStateToEntities(log) {
    let lastState = log[log.length - 1];

    let data = [];
    if (lastState) {
        let datas = Object.keys(lastState.domains).map(k => lastState.domains[k]);
        data = Array.prototype.concat.apply(clouds, datas);
    }

    function makeTooltip(d) {
      return "URL: " + d.key + "\nTotal time: " + d.totalTime;
    }

    /*
     * Add a 'g' for each 'thing'
     */
    d3.select('svg.root')
        .selectAll('g')
        .data(data)
        .enter()
        .append('g')
        .attr('class', d => d.type)
        .call(addAllThings)
        .filter(d => d.type === 'tree')
        .append("svg:title")
          .text(makeTooltip)

    d3.select('svg.root')
        .selectAll('g')
        .attr('transform', function(d) {
            return 'translate(' + xScale(d.x) + ',' + (yScale(d.y) - d.height) + ')';
        })

    d3.select('svg.root')
      .selectAll('g')
      .select('title')
      .text(makeTooltip)

}

var store = new HugeStorageSync();
store.get('log', mapLogStateToEntities);
chrome.storage.onChanged.addListener(() => store.get('log', mapLogStateToEntities));

/*
 * These are values that every drawing function will have access to.
 */
const width = document.body.clientWidth;
const height = document.body.clientHeight;
const xScale = d3.scaleLinear().domain([0, 100]).range([0, width]);
const yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);
const globals = { width, height, xScale, yScale,
  groundHeight: () => 4 * globals.height / 10
};

/* Add sky */
function makeSkyAndGround(){
  d3.select('svg.root')
    .append('rect')
    .classed('sky', true)
    .attr('id', 'sky')
    .attr('fill', 'url(#Gradient2)')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', globals.width)
    .attr('height', globals.height);

  // ground stuff
  d3.select('svg.root')
    .append('ellipse')
    .classed('ground', true)
    .attr('id', 'ground')
    .attr('fill', 'url(#Gradient1)')
    .attr('cx', globals.width / 2)
    .attr('cy', globals.height)
    .attr('rx', 3 *globals.width / 5)
    .attr('ry', globals.groundHeight());
}
makeSkyAndGround();
const recognizedEntities = [TREE, CLOUD];

function addAllThings(sel) {
    recognizedEntities.forEach(entity => {
        const creator = entity.create(globals);
        sel.filter((d) => d.type == entity.name).each(creator);
    });
}


function updateAllThings(t, delta) {
    recognizedEntities.forEach(entity => {
        const updater = entity.update(t, delta, globals);
        d3.selectAll('.' + entity.name).each(updater);
    });

    // Sort entities in descending y coordinate order. This puts the DOM nodes
    // for the lowest entities on top, which is what we would expect given the
    // perspective in this scene.
    d3.select('svg.root')
      .selectAll('g')
      .sort((a, b) => b.y - a.y);
}

// main

function make_update (){
  let last = Date.now();
  return function updater() {
      const now = Date.now();
      updateAllThings(now, now - last);
      last = now;
  }
}
let interval_code = setInterval(make_update(),  1000);
