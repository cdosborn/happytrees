/*
 * Return a function that will be invoked in a d3.each on a group for a
 * data item, which initializes the DOM state for that data item. The
 * parameter to the function will be the data item; its 'this' is the d3
 * selection (?).
 *
 * Below is the tree implementation, for example.
 */
function createTree(globals) {
  return function(d) {
    d3.select(this).append('rect').classed('trunk', true);
    d3.select(this).append('circle').classed('leaves', true);
  };
}

/*
 * Return a function that will be invoked in a d3.each on a group for a
 * data item, which updates the DOM state for that data item given the
 * current time data. The parameter to the function will be the data item;
 * its 'this' is the d3 selection (?).
 *
 * Below is the tree implementation, for example.
 */
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

