function randWithinR(x, y, r) {
    const angle = Math.random() * 360;
    const x2 = x + Math.cos(angle) * r;
    const y2 = y + Math.sin(angle) * r;
    return [x2, y2];
}

function clamp(l, h, x) { return Math.max(l, Math.min(h, x)); }

function randColor(c) {
    const color = d3.color(c);
    const shift = 25;
    const r = clamp(0, 255, color.r + Math.floor(Math.random() * shift - shift/2));
    const g = clamp(0, 255, color.g + Math.floor(Math.random() * shift - shift/2));
    const b = clamp(0, 255, color.b + Math.floor(Math.random() * shift - shift/2));
    return `rgb(${r},${g},${b})`;
}

function nCircles(x, y, r, n, color) {
console.log(randColor(color));
    const circles = [{ cx: x, cy: y, r, color: randColor(color) }];
    for(let i = 1; i < n; i++) {
        const circle = {};
        const coord = randWithinR(x, y, r);
        circles.push({
            cx: coord[0],
            cy: coord[1],
            r: r * (Math.random() * 0.5 + 0.4),
            color: randColor(color)
        });
    }
    return circles;
}

function createTree(globals) {
  return function(d) {
    d3.select(this).append('rect').classed('trunk', true);
    d3.select(this).selectAll('circle').data(nCircles(0, 0, 50, 10, '#5fb54d')).enter().append('circle').classed('leaves', true);
  };
}

function updateTree(time, delta, globals) {
  return function(d) {

    d3.select(this)
      .selectAll('.trunk')
      .transition().duration(delta)
      .attr('x', -d.width / 2)
      .attr('y', 5 * -d.height)
      .attr('width', d.width)
      .attr('height', 5 * d.height)
      .attr('fill', d.theme);

    d3.select(this)
      .selectAll('.leaves')
      .transition().duration(delta)
      .ease(d3.easeLinear)
      .attr('cx', e => d.height/40 * e.cx)
      .attr('cy', e => d.height/40 * e.cy - 5 * d.height)
      .attr('r', e => Math.max(0, d.height/40 * e.r * (1 + 0.1 * Math.sin(time * 0.001))))
      .attr('fill', d => d.color);

  };
}

const TREE = {
  name: 'tree',
  create: createTree,
  update: updateTree
};
