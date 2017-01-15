function createCloud(globals) {
  return function(d) {
    const rects = d3.range(0, Math.floor(Math.random() * 5 + 4));
    d3.select(this).selectAll('rect').data(rects).enter().append('rect')
      .classed('outline', true)
      .attr('fill', 'white')
      .attr('opacity', '0.8')
      .attr('width', 4*d.width)
      .attr('height', 4*d.height);
  };
}

function updateCloud(time, delta, globals) {
  return function(d) {
    const xShift = ((time / (d.speed * 100)) % (3 * globals.width)) - globals.width;
    const yShift = globals.yScale(d.y);

    d3.select(this)
      .selectAll('.outline')
      .attr('x', (d, i) => xShift + 15 * i + Math.random() * 5)
      .attr('y', (d, i) => yShift + 20 * Math.sin(i * 40) + Math.random() * 5);

  };
}

const CLOUD = {
  name: 'cloud',
  create: createCloud,
  update: updateCloud
};

