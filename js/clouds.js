function poly(xr, yr) {
    const p = (x,y) => ({x,y});
    const points = [ p(-xr,-yr), p(-xr,yr), p(xr,yr), p(xr,-yr)];
    return (xshift, yshift) => points.map((p, i) => {
        return (i == 0 ? 'M' : 'L') + (p.x + xshift) + ' ' + (p.y + yshift);
    }).join('');
}

function createCloud(globals) {
  return function(d) {
    const paths = d3.range(0, Math.floor(Math.random() * 5 + 4)).map(() => poly(2*d.width, 2*d.height));
    d3.select(this).selectAll('path').data(paths).enter().append('path').classed('outline', true);
  };
}

function updateCloud(time, delta, globals) {
  return function(d) {

    const xShift = ((time / (d.speed * 100)) % (3 * globals.width)) - globals.width;
    const yShift = globals.yScale(d.y);

    d3.select(this)
      .selectAll('.outline')
      .attr('fill', 'white')
      .attr('opacity', '0.8')
      .attr('d', (d, i) => d(xShift + 15 * i + Math.random() * 5, yShift + 20 * Math.sin(i * 40) + Math.random() * 5));

  };
}

const CLOUD = {
  name: 'cloud',
  create: createCloud,
  update: updateCloud
};

