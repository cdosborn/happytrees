(function() {
    var throttle = function(type, name, obj) {
        obj = obj || window;
        var running = false;
        var func = function() {
            if (running) { return; }
            running = true;
             requestAnimationFrame(function() {
                obj.dispatchEvent(new CustomEvent(name));
                running = false;
            });
        };
        obj.addEventListener(type, func);
    };
    throttle("resize", "optimizedResize");
})();

// handle event
window.addEventListener("optimizedResize", function() {
    if(globals){
      globals.width = document.body.clientWidth;
      globals.height = document.body.clientHeight;
      globals.xScale.range([0, globals.width]);
      globals.yScale.range([globals.width, 0]);
      let sky = d3.select("#sky")
        .attr('width', globals.width)
        .attr('height', globals.height);
      let ground = d3.select('#ground')
        .attr('width', globals.width)
        .attr('height', globals.height);
    }
});
