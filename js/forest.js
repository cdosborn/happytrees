var data = [];

function f(datas) {
    data = datas[datas.length - 1];
    // console.log("data", data, datas);

    /*
     * Add a 'g' for each 'thing'
     */
    d3.select('svg.root')
        .selectAll('g')
        .data(data)
        .enter()
        .append('g')
        .attr('class', d => d.type)
        .attr('transform', function(d) {
            return 'translate(' + xScale(d.x) + ',' + (yScale(d.y) - d.height) + ')';
        })
        .call(addAllThings);

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
function makeSky(){
  return d3.select('svg.root')
    .append('rect')
    .classed('sky', true)
    .attr('id', 'sky')
    .attr('fill', 'url(#Gradient2)')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', globals.width)
    .attr('height', globals.height);
}
makeSky();
const recognizedEntities = [TREE, CLOUD];

function addAllThings(sel) {
    // console.log(sel);
    console.log("select all", sel.selectAll('.tree'));
    window.sel = sel.selectAll('.tree');
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
