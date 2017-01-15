function createCloud(globals) {
  return function(d) {
    d3.select(this).append('path').classed('outline', true);
  };
}

function updateCloud(time, delta, globals) {
  return function(d) {

    const xShift = ((time / (d.speed * 400)) % (1.5 * globals.width)) - 0.25 * globals.width;
    const yShift = globals.yScale(d.y);

    const M = s => 'M' + s;
    const L = s => 'L' + s;
    const p = (x, y) => (x + xShift) + ' ' + (y + yShift);
    const xe = 2 * d.width;
    const ye = 2 * d.height;
    const path = M(p(-xe, -ye)) + L(p(xe, -ye)) +
                 L(p(xe, ye)) + L(p(-xe, ye)) +
                 L(p(-xe, -ye));

    d3.select(this)
      .selectAll('.outline')
      .attr('fill', 'white')
      .attr('opacity', '0.5')
      .attr('d', path);

  };
}

const CLOUD = {
  name: 'cloud',
  create: createCloud,
  update: updateCloud
};

