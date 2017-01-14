function createTree(globals) {
  return function(d) {
    d3.select(this).append('rect').classed('trunk', true);
    d3.select(this).append('circle').classed('leaves', true);
  };
}

function updateTree(time, delta, globals) {
  return function(d) {

    d3.select(this)
      .selectAll('.trunk')
      .transition().duration(delta)
      .attr('x', -d.width / 2)
      .attr('y', 0)
      .attr('width', d.width)
      .attr('height', d.height)
      .attr('fill', d.theme);

    d3.select(this)
      .selectAll('.leaves')
      .transition().duration(delta)
      .ease(d3.easeLinear)
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 30 + Math.sin(time * 0.001) * 10)
      .attr('fill', 'red');

  };
}

const TREE = {
  name: 'tree',
  create: createTree,
  update: updateTree
};
