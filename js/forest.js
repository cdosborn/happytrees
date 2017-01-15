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

clouds = d3.range(1, 5).map(makeCloud);

function f(datas) {
    data = Array.prototype.concat.apply(clouds, datas[datas.length - 1]);

    function g(d){ console.log("GGGG"); return "URL: " + d.key + "\nTotal time: " + d.totalTime; };
        function h(d){ console.log("HHHH " + d.totalTime); return "URL: " + d.key + "\nTotal time: " + d.totalTime; };


    /*
     * Add a 'g' for each 'thing'
     */
    d3.select('svg.root')
        .selectAll('g')
        .data(data, function(d) { return d.key })
        .enter()
        .append('g')
        .attr('class', d => d.type)
        .call(addAllThings)
        .append("svg:title")
          .text(g);

    d3.select('svg.root')
        .selectAll('g')
        .attr('transform', function(d) {
            return 'translate(' + xScale(d.x) + ',' + (yScale(d.y) - d.height) + ')';
        })

    d3.select('svg.root')
      .selectAll('g')
      .selectAll('title')
      .text(h)

}

chrome.storage.sync.get('log', function(storage) {
    f(storage.log);
});

chrome.storage.onChanged.addListener(function(changedStorage) {
    if (!('log' in changedStorage)) {
        return;
    }
    f(changedStorage.log.newValue);
});

/*
 * These are values that every drawing function will have access to.
 */
const width = document.body.clientWidth;
const height = document.body.clientHeight;
const xScale = d3.scaleLinear().domain([0, 100]).range([0, width]);
const yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);
const globals = { width, height, xScale, yScale };

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
  d3.select('svg.root')
    .append('rect')
    .classed('ground', true)
    .attr('id', 'ground')
    .attr('fill', 'yellowgreen')
    .attr('x', 0)
    .attr('y', 8 *globals.height/10)
    .attr('width', globals.width)
    .attr('height', 2* globals.height/10);
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
