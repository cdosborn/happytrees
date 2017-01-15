function createCloud(globals) {
  return function(d) {
    d3.select(this).append('path').classed('outline', true);
  };
}

function updateCloud(time, delta, globals) {
  return function(d) {
    if(d.type !== 'cloud') console.log('Tried to updateCloud(Tree)!!!', d.type);

    const points = d3.range(0, 25).map(() => Math.random() * Math.PI * 2).sort((a,b) => a - b);
    const xs = points.map(p => Math.cos(p) * 2 * d.width);
    const ys = points.map(p => Math.sin(p) * 2 * d.height);

    const xShift = ((time / (d.speed * 100)) % (1.5 * globals.width)) - 0.25 * globals.width;
    const yShift = globals.yScale(d.y);

    const path = points.map((_, i) => {
        return (i == 0 ? 'M' : 'L') + xs[i] + ' ' + ys[i];
    }).join('');

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

