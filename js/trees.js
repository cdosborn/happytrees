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
    d3.select(this).append('rect').classed('branch', true);
    d3.select(this).append('circle').classed('branch-leaf', true);
    d3.select(this).selectAll('.leaves').data(nCircles(0, 0, 50, 10, '#5fb54d')).enter().append('circle').classed('leaves', true);
  };
}

function updateTree(time, delta, globals) {
  return function(d, i) {

    d3.select(this)
      .selectAll('.trunk')
      .transition().duration(delta)
      .attr('x', -d.width / 2)
      .attr('y', 5 * -d.height)
      .attr('width', d.width)
      .attr('height', 5 * d.height)
      .attr('fill', d.theme);

    const randBranchAngle = 10*Math.sin(time * 0.001) - 5 + 135;

    d3.select(this)
      .selectAll('.branch')
      .transition().duration(delta)
      .ease(d3.easeLinear)
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 0.2 * d.width)
      .attr('height', d.height)
      .attr('transform', e => 'translate(0,'+(-1.5*d.height)+')rotate('+((i%2?-1:1) * randBranchAngle)+')')
      .attr('fill', d3.color(d.theme).darker());

    d3.select(this)
      .selectAll('.branch-leaf')
      .transition().duration(delta)
      .ease(d3.easeLinear)
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', d.height/100 * (40))
      .attr('transform', e => 'translate(' + ((i%2?1:-1)*0.7 * d.height)+','+(-2.1*d.height)+')rotate('+((i%2?-1:1) * randBranchAngle)+')')
      .attr('fill', d3.color(randColor('#5fb54d')).darker());

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
