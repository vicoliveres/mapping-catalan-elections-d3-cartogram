const padding = 2;

const margin = { top: 10, right: 5, bottom: 10, left: 5 };
const width = d3.select('.map').node().getBoundingClientRect().width;
const height = d3.select('.map').node().getBoundingClientRect().width;

const isMobile = d3.select('.map').node().getBoundingClientRect().width < 380;
const isTablet = d3.select('.map').node().getBoundingClientRect().width < 550;

var mapComWinner = function(d3) {
const svg = d3
  .select('#map-com-pop')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

const pop = d3.map();
const name = d3.map();
const winner = d3.map();
const namelong = d3.map();
const cs = d3.map();
const jxcat = d3.map();
const erc = d3.map();
const psc = d3.map();
const catcomu = d3.map();
const cup = d3.map();
const pp = d3.map();

const size = d3.scaleSqrt().range(isMobile ? [5, 60] : isTablet ? [7, 95] : [9, 135]);
const font = d3.scaleLinear().range(isMobile ? [7, 21] : isTablet ? [10, 37] : [12, 38]);
const color = d3.scaleOrdinal().range(['#ff3f8a', '#ffb523', '#f27200', '#c80a1e', '#701b73', '#f7df0e', '#4d94e3']).domain(['JxCat', 'ERC', 'Cs', 'PSC', 'CatComú', 'CUP', 'PP']);

d3
  .queue()
  .defer(d3.json, 'comarques.json')
  .defer(d3.csv, 'data-pop-winner.csv', d => {
    d.pop = +d.pop;

    pop.set(d.id, d.pop);
    name.set(d.id, d.abbr);
    winner.set(d.id, d.partit);
    namelong.set(d.id, d.name);
    cs.set(d.id, d.PtgCs);
    jxcat.set(d.id, d.PtgJxCat);
    erc.set(d.id, d.PtgERC);
    psc.set(d.id, d.PtgPSC);
    catcomu.set(d.id, d.PtgCatComu);
    cup.set(d.id, d.PtgCUP);
    pp.set(d.id, d.PtgPP);

    return d;
  })
  .await(ready);


function ready(error, cat, data) {
  if (error) throw error;

  size.domain(d3.extent(data, d => d.pop));
  font.domain(d3.extent(data, d => d.pop));

  const comarques = topojson.feature(cat, cat.objects.comarques);
  const features = comarques.features;

  // File is already projected
  const projection = d3
    .geoIdentity()
    .reflectY(true)
    .fitSize([width, height], comarques);

  const path = d3.geoPath().projection(projection);

  features.forEach(function(d) {
    d.pos = path.centroid(d);
    d.area = size(pop.get(d.properties.CODICOMAR));
    [d.x, d.y] = d.pos;
  });

  const simulation = d3
    .forceSimulation(features)
    .force('x', d3.forceX(d => d.x).strength(0.1))
    .force('y', d3.forceY(d => d.y).strength(0.1))
    .force('collide', collide);

  for (let i = 0; i < 125; ++i) simulation.tick();

  const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

  const rect = svg
    .selectAll('g')
    .data(features)
    .enter()
    .append('g')
    .attr('transform', d => `translate(${d.x}, ${d.y})`);

  rect
    .append('rect')
    .attr('width', d => d.area)
    .attr('height', d => d.area)
    .attr('x', d => -d.area / 2)
    .attr('y', d => -d.area / 2)
    .attr('fill', d => color(winner.get(d.properties.CODICOMAR)))
    .attr('stroke', 'white')
    .attr('rx', 2)
    .attr('class', 'rect')
    .on("mousemove", function(d) {
      d3.select(this)
        .style('stroke', 'grey')
        .style('stroke-oppacity', 0.5);
      tooltip.transition()
          .duration(100)
          .style("opacity", .9)
          .style("left", (d3.event.pageX - 56) + "px")
          .style("top", (d3.event.pageY + 5) + "px");
      tooltip.html("<b>" + namelong.get(d.properties.CODICOMAR) + "</b><br/>"
              + "C's: " + cs.get(d.properties.CODICOMAR) + "% <br/>"
              + "JxCat: " + jxcat.get(d.properties.CODICOMAR) + "% <br/>"
              + "ERC: " + erc.get(d.properties.CODICOMAR) + "% <br/>"
              + "PSC: " + psc.get(d.properties.CODICOMAR) + "% <br/>"
              + "CatComú: " + catcomu.get(d.properties.CODICOMAR) + "% <br/>"
              + "CUP: " + cup.get(d.properties.CODICOMAR) + "% <br/>"
              + "PP: " + pp.get(d.properties.CODICOMAR) + "% <br/>");
    })
    .on("mouseout", function(d) {
      d3.select(this)
        .style('stroke', 'white');
      tooltip.transition()
        .duration(200)
        .style("opacity", 0);
      });

  rect
    .append('text')
    .filter(d => d.area > 25) // Only labeling after a threshold
    .style('font-family', 'sans-serif')
    .style('font-size', d => `${font(pop.get(d.properties.CODICOMAR))}px`)
    .style('fill', 'white')
    .attr('text-anchor', 'middle')
    .attr('dy', 2)
    .text(d => name.get(d.properties.CODICOMAR))
    .on("mousemove", function(d) {
      d3.select(this.parentNode).selectAll('.rect')
        .style('stroke', 'grey')
        .style('stroke-width', 2);
      tooltip.transition()
          .duration(100)
          .style("opacity", .9)
          .style("left", (d3.event.pageX - 56) + "px")
          .style("top", (d3.event.pageY + 5) + "px");
      tooltip.html("<b>" + namelong.get(d.properties.CODICOMAR) + "</b><br/>"
              + "C's: " + cs.get(d.properties.CODICOMAR) + "% <br/>"
              + "JxCat: " + jxcat.get(d.properties.CODICOMAR) + "% <br/>"
              + "ERC: " + erc.get(d.properties.CODICOMAR) + "% <br/>"
              + "PSC: " + psc.get(d.properties.CODICOMAR) + "% <br/>"
              + "CatComú: " + catcomu.get(d.properties.CODICOMAR) + "% <br/>"
              + "CUP: " + cup.get(d.properties.CODICOMAR) + "% <br/>"
              + "PP: " + pp.get(d.properties.CODICOMAR) + "% <br/>");
    })
    .on("mouseout", function(d) {
      d3.select(this.parentNode).selectAll('.rect')
        .style('stroke', 'none');
      tooltip.transition()
          .duration(200)
          .style("opacity", 0);
        });

  // From https://bl.ocks.org/mbostock/4055889
  function collide() {
    for (var k = 0, iterations = 4, strength = 0.5; k < iterations; ++k) {
      for (var i = 0, n = features.length; i < n; ++i) {
        for (var a = features[i], j = i + 1; j < n; ++j) {
          var b = features[j],
            x = a.x + a.vx - b.x - b.vx,
            y = a.y + a.vy - b.y - b.vy,
            lx = Math.abs(x),
            ly = Math.abs(y),
            r = a.area / 2 + b.area / 2 + padding;
          if (lx < r && ly < r) {
            if (lx > ly) {
              lx = (lx - r) * (x < 0 ? -strength : strength);
              (a.vx -= lx), (b.vx += lx);
            } else {
              ly = (ly - r) * (y < 0 ? -strength : strength);
              (a.vy -= ly), (b.vy += ly);
            }
          }
        }
      }
    }
  }
}
}(d3);

var mapComWinnerCs = function(d3) {
const svg = d3
  .select('#map-com-pop-cs')
  .append('svg')
  .attr('width', (isMobile ? (width  + margin.left + margin.right) : width*0.5))
  .attr('height', (isMobile ? (height  + margin.top + margin.bottom) : height*0.5))
  .append('g')
  .attr('transform', 'translate');

const pop = d3.map();
const name = d3.map();
const cs = d3.map();
const namelong = d3.map();

const size = d3.scaleSqrt().range(isMobile ? [5, 60] : isTablet ? [4.3, 45] : [5, 60]);
const font = d3.scaleLinear().range(isMobile ? [7, 25] : isTablet ? [5, 18] : [7, 25]);
const color = d3.scaleLinear().range(['#ffcb9e', '#f27200']).domain([5, 37]);

d3
  .queue()
  .defer(d3.json, 'comarques.json')
  .defer(d3.csv, 'data-pop-winner.csv', d => {
    d.pop = +d.pop;

    pop.set(d.id, d.pop);
    name.set(d.id, d.abbr);
    cs.set(d.id, d.PtgCs);
    namelong.set(d.id, d.name);

    return d;
  })
  .await(ready);

function ready(error, cat, data) {
  if (error) throw error;

  size.domain(d3.extent(data, d => d.pop));
  font.domain(d3.extent(data, d => d.pop));

  const comarques = topojson.feature(cat, cat.objects.comarques);
  const features = comarques.features;

  // File is already projected
  const projection = d3
    .geoIdentity()
    .reflectY(true)
    .fitSize((isMobile ? [width, height] : [width/2, height/2]), comarques);

  const path = d3.geoPath().projection(projection);

  features.forEach(function(d) {
    d.pos = path.centroid(d);
    d.area = size(pop.get(d.properties.CODICOMAR));
    [d.x, d.y] = d.pos;
  });

  const simulation = d3
    .forceSimulation(features)
    .force('x', d3.forceX(d => d.x).strength(0.1))
    .force('y', d3.forceY(d => d.y).strength(0.1))
    .force('collide', collide);

  for (let i = 0; i < 125; ++i) simulation.tick();

  const rect = svg
    .selectAll('g')
    .data(features)
    .enter()
    .append('g')
    .attr('transform', d => `translate(${d.x}, ${d.y})`);

  const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip-small")
      .style("opacity", 0);

  rect
    .append('rect')
    .attr('width', d => d.area)
    .attr('height', d => d.area)
    .attr('x', d => -d.area / 2)
    .attr('y', d => -d.area / 2)
    .attr('fill', d => color(cs.get(d.properties.CODICOMAR)))
    .attr('stroke', 'white')
    .attr('rx', 2)
    .attr('class', 'rect')
    .on("mousemove", function(d) {
      d3.select(this)
        .style('stroke', 'grey')
        .style('stroke-oppacity', 0.5);
      tooltip.transition()
          .duration(100)
          .style("opacity", .9)
          .style("left", (d3.event.pageX - 56) + "px")
          .style("top", (d3.event.pageY + 5) + "px");
      tooltip.html("<b>" + namelong.get(d.properties.CODICOMAR) + "</b><br/>"
              + "C's: " + cs.get(d.properties.CODICOMAR) + "%");
    })
    .on("mouseout", function(d) {
      d3.select(this)
        .style('stroke', 'white');
      tooltip.transition()
        .duration(200)
        .style("opacity", 0);
      });


  rect
    .append('text')
    .filter(d => d.area > 60) // Only labeling after a threshold
    .style('font-family', 'sans-serif')
    .style('font-size', d => `${font(pop.get(d.properties.CODICOMAR))}px`)
    .style('fill', 'white')
    .attr('text-anchor', 'middle')
    .attr('dy', 2)
    .text(d => name.get(d.properties.CODICOMAR))
    .on("mousemove", function(d) {
      d3.select(this.parentNode).selectAll('.rect')
        .style('stroke', 'grey')
        .style('stroke-width', 2);
      tooltip.transition()
          .duration(100)
          .style("opacity", .9)
          .style("left", (d3.event.pageX - 56) + "px")
          .style("top", (d3.event.pageY + 5) + "px");
      tooltip.html("<b>" + namelong.get(d.properties.CODICOMAR) + "</b><br/>"
              + "C's: " + cs.get(d.properties.CODICOMAR));
    })
    .on("mouseout", function(d) {
      d3.select(this.parentNode).selectAll('.rect')
        .style('stroke', 'none');
      tooltip.transition()
          .duration(200)
          .style("opacity", 0);
        });

  // From https://bl.ocks.org/mbostock/4055889
  function collide() {
    for (var k = 0, iterations = 4, strength = 0.5; k < iterations; ++k) {
      for (var i = 0, n = features.length; i < n; ++i) {
        for (var a = features[i], j = i + 1; j < n; ++j) {
          var b = features[j],
            x = a.x + a.vx - b.x - b.vx,
            y = a.y + a.vy - b.y - b.vy,
            lx = Math.abs(x),
            ly = Math.abs(y),
            r = a.area / 2 + b.area / 2 + padding;
          if (lx < r && ly < r) {
            if (lx > ly) {
              lx = (lx - r) * (x < 0 ? -strength : strength);
              (a.vx -= lx), (b.vx += lx);
            } else {
              ly = (ly - r) * (y < 0 ? -strength : strength);
              (a.vy -= ly), (b.vy += ly);
            }
          }
        }
      }
    }
  }
}
}(d3);

var mapComWinnerJxCat = function(d3) {
const svg = d3
  .select('#map-com-pop-jxcat')
  .append('svg')
  .attr('width', (isMobile ? (width  + margin.left + margin.right) : width*0.5))
  .attr('height', (isMobile ? (height  + margin.top + margin.bottom) : height*0.5))
  .append('g')
  .attr('transform', 'translate');

const pop = d3.map();
const name = d3.map();
const jxcat = d3.map();
const namelong = d3.map();

const size = d3.scaleSqrt().range(isMobile ? [5, 60] : isTablet ? [4.3, 45] : [5, 60]);
const font = d3.scaleLinear().range(isMobile ? [7, 25] : isTablet ? [5, 18] : [7, 25]);
const color = d3.scaleLinear().range(['#ffa5c8', '#ff0063']).domain([12, 52]);

d3
  .queue()
  .defer(d3.json, 'comarques.json')
  .defer(d3.csv, 'data-pop-winner.csv', d => {
    d.pop = +d.pop;

    pop.set(d.id, d.pop);
    name.set(d.id, d.abbr);
    jxcat.set(d.id, d.PtgJxCat);
    namelong.set(d.id, d.name);

    return d;
  })
  .await(ready);

function ready(error, cat, data) {
  if (error) throw error;

  size.domain(d3.extent(data, d => d.pop));
  font.domain(d3.extent(data, d => d.pop));

  const comarques = topojson.feature(cat, cat.objects.comarques);
  const features = comarques.features;

  // File is already projected
  const projection = d3
    .geoIdentity()
    .reflectY(true)
    .fitSize((isMobile ? [width, height] : [width/2, height/2]), comarques);

  const path = d3.geoPath().projection(projection);

  features.forEach(function(d) {
    d.pos = path.centroid(d);
    d.area = size(pop.get(d.properties.CODICOMAR));
    [d.x, d.y] = d.pos;
  });

  const simulation = d3
    .forceSimulation(features)
    .force('x', d3.forceX(d => d.x).strength(0.1))
    .force('y', d3.forceY(d => d.y).strength(0.1))
    .force('collide', collide);

  for (let i = 0; i < 125; ++i) simulation.tick();

  const rect = svg
    .selectAll('g')
    .data(features)
    .enter()
    .append('g')
    .attr('transform', d => `translate(${d.x}, ${d.y})`);

  const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip-small")
      .style("opacity", 0);

  rect
    .append('rect')
    .attr('width', d => d.area)
    .attr('height', d => d.area)
    .attr('x', d => -d.area / 2)
    .attr('y', d => -d.area / 2)
    .attr('fill', d => color(jxcat.get(d.properties.CODICOMAR)))
    .attr('stroke', 'white')
    .attr('class', 'rect')
    .attr('rx', 2)
    .on("mousemove", function(d) {
      d3.select(this)
        .style('stroke', 'grey')
        .style('stroke-oppacity', 0.5);
      tooltip.transition()
          .duration(100)
          .style("opacity", .9)
          .style("left", (d3.event.pageX - 56) + "px")
          .style("top", (d3.event.pageY + 5) + "px");
      tooltip.html("<b>" + namelong.get(d.properties.CODICOMAR) + "</b><br/>"
              + "JxCat: " + jxcat.get(d.properties.CODICOMAR) + "%");
    })
    .on("mouseout", function(d) {
      d3.select(this)
        .style('stroke', 'white');
      tooltip.transition()
        .duration(200)
        .style("opacity", 0);
      });

  rect
    .append('text')
    .filter(d => d.area > 60) // Only labeling after a threshold
    .style('font-family', 'sans-serif')
    .style('font-size', d => `${font(pop.get(d.properties.CODICOMAR))}px`)
    .style('fill','white')
    .attr('text-anchor', 'middle')
    .attr('dy', 2)
    .text(d => name.get(d.properties.CODICOMAR))
    .on("mousemove", function(d) {
      d3.select(this.parentNode).selectAll('.rect')
        .style('stroke', 'grey')
        .style('stroke-width', 2);
      tooltip.transition()
          .duration(100)
          .style("opacity", .9)
          .style("left", (d3.event.pageX - 56) + "px")
          .style("top", (d3.event.pageY + 5) + "px");
      tooltip.html("<b>" + namelong.get(d.properties.CODICOMAR) + "</b><br/>"
              + "JxCat: " + jxcat.get(d.properties.CODICOMAR));
    })
    .on("mouseout", function(d) {
      d3.select(this.parentNode).selectAll('.rect')
        .style('stroke', 'none');
      tooltip.transition()
          .duration(200)
          .style("opacity", 0);
        });

  // From https://bl.ocks.org/mbostock/4055889
  function collide() {
    for (var k = 0, iterations = 4, strength = 0.5; k < iterations; ++k) {
      for (var i = 0, n = features.length; i < n; ++i) {
        for (var a = features[i], j = i + 1; j < n; ++j) {
          var b = features[j],
            x = a.x + a.vx - b.x - b.vx,
            y = a.y + a.vy - b.y - b.vy,
            lx = Math.abs(x),
            ly = Math.abs(y),
            r = a.area / 2 + b.area / 2 + padding;
          if (lx < r && ly < r) {
            if (lx > ly) {
              lx = (lx - r) * (x < 0 ? -strength : strength);
              (a.vx -= lx), (b.vx += lx);
            } else {
              ly = (ly - r) * (y < 0 ? -strength : strength);
              (a.vy -= ly), (b.vy += ly);
            }
          }
        }
      }
    }
  }
}
}(d3);

var mapComWinnerERC = function(d3) {
const svg = d3
  .select('#map-com-pop-erc')
  .append('svg')
  .attr('width', (isMobile ? (width  + margin.left + margin.right) : width*0.5))
  .attr('height', (isMobile ? (height + margin.top + margin.bottom) : height*0.5))
  .append('g')
  .attr('transform', 'translate');

const pop = d3.map();
const name = d3.map();
const erc = d3.map();
const namelong = d3.map();

const size = d3.scaleSqrt().range(isMobile ? [5, 60] : isTablet ? [4.3, 45] : [5, 60]);
const font = d3.scaleLinear().range(isMobile ? [7, 25] : isTablet ? [5, 18] : [7, 25]);
const color = d3.scaleLinear().range(['#ffecb7', '#edc500']).domain([12, 36]);

d3
  .queue()
  .defer(d3.json, 'comarques.json')
  .defer(d3.csv, 'data-pop-winner.csv', d => {
    d.pop = +d.pop;

    pop.set(d.id, d.pop);
    name.set(d.id, d.abbr);
    erc.set(d.id, d.PtgERC);
    namelong.set(d.id, d.name);

    return d;
  })
  .await(ready);

function ready(error, cat, data) {
  if (error) throw error;

  size.domain(d3.extent(data, d => d.pop));
  font.domain(d3.extent(data, d => d.pop));

  const comarques = topojson.feature(cat, cat.objects.comarques);
  const features = comarques.features;

  // File is already projected
  const projection = d3
    .geoIdentity()
    .reflectY(true)
    .fitSize((isMobile ? [width, height] : [width/2, height/2]), comarques);

  const path = d3.geoPath().projection(projection);

  features.forEach(function(d) {
    d.pos = path.centroid(d);
    d.area = size(pop.get(d.properties.CODICOMAR));
    [d.x, d.y] = d.pos;
  });

  const simulation = d3
    .forceSimulation(features)
    .force('x', d3.forceX(d => d.x).strength(0.1))
    .force('y', d3.forceY(d => d.y).strength(0.1))
    .force('collide', collide);

  for (let i = 0; i < 125; ++i) simulation.tick();

  const rect = svg
    .selectAll('g')
    .data(features)
    .enter()
    .append('g')
    .attr('transform', d => `translate(${d.x}, ${d.y})`);

  const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip-small")
      .style("opacity", 0);

  rect
    .append('rect')
    .attr('width', d => d.area)
    .attr('height', d => d.area)
    .attr('x', d => -d.area / 2)
    .attr('y', d => -d.area / 2)
    .attr('fill', d => color(erc.get(d.properties.CODICOMAR)))
    .attr('stroke', 'white')
    .attr('class', 'rect')
    .attr('rx', 2)
    .on("mousemove", function(d) {
      d3.select(this)
        .style('stroke', 'grey')
        .style('stroke-oppacity', 0.5);
      tooltip.transition()
          .duration(100)
          .style("opacity", .9)
          .style("left", (d3.event.pageX - 56) + "px")
          .style("top", (d3.event.pageY + 5) + "px");
      tooltip.html("<b>" + namelong.get(d.properties.CODICOMAR) + "</b><br/>"
              + "ERC: " + erc.get(d.properties.CODICOMAR) + "%");
    })
    .on("mouseout", function(d) {
      d3.select(this)
        .style('stroke', 'white');
      tooltip.transition()
        .duration(200)
        .style("opacity", 0);
      });

  rect
    .append('text')
    .filter(d => d.area > 60) // Only labeling after a threshold
    .style('font-family', 'sans-serif')
    .style('font-size', d => `${font(pop.get(d.properties.CODICOMAR))}px`)
    .style('fill', 'white')
    .attr('text-anchor', 'middle')
    .attr('dy', 2)
    .text(d => name.get(d.properties.CODICOMAR))
    .on("mousemove", function(d) {
      d3.select(this.parentNode).selectAll('.rect')
        .style('stroke', 'grey')
        .style('stroke-width', 2);
      tooltip.transition()
          .duration(100)
          .style("opacity", .9)
          .style("left", (d3.event.pageX - 56) + "px")
          .style("top", (d3.event.pageY + 5) + "px");
      tooltip.html("<b>" + namelong.get(d.properties.CODICOMAR) + "</b><br/>"
              + "ERC: " + erc.get(d.properties.CODICOMAR));
    })
    .on("mouseout", function(d) {
      d3.select(this.parentNode).selectAll('.rect')
        .style('stroke', 'none');
      tooltip.transition()
          .duration(200)
          .style("opacity", 0);
        });

  // From https://bl.ocks.org/mbostock/4055889
  function collide() {
    for (var k = 0, iterations = 4, strength = 0.5; k < iterations; ++k) {
      for (var i = 0, n = features.length; i < n; ++i) {
        for (var a = features[i], j = i + 1; j < n; ++j) {
          var b = features[j],
            x = a.x + a.vx - b.x - b.vx,
            y = a.y + a.vy - b.y - b.vy,
            lx = Math.abs(x),
            ly = Math.abs(y),
            r = a.area / 2 + b.area / 2 + padding;
          if (lx < r && ly < r) {
            if (lx > ly) {
              lx = (lx - r) * (x < 0 ? -strength : strength);
              (a.vx -= lx), (b.vx += lx);
            } else {
              ly = (ly - r) * (y < 0 ? -strength : strength);
              (a.vy -= ly), (b.vy += ly);
            }
          }
        }
      }
    }
  }
}
}(d3);

var mapMunWinner = function(d3) {

const svg = d3
  .select('#map-mun-pop')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

const popmun = d3.map();
const namemun = d3.map();
const winnermun = d3.map();
const namelongmun = d3.map();
const csmun = d3.map();
const jxcatmun = d3.map();
const ercmun = d3.map();
const pscmun = d3.map();
const catcomumun = d3.map();
const cupmun = d3.map();
const ppmun = d3.map();

const size = d3.scaleSqrt().range(isMobile ? [2.5, 45] : isTablet ? [3, 70] : [4, 102]);
const font = d3.scaleLinear().range(isMobile ? [5, 12] : isTablet ? [7, 19] : [10, 28]);
const color = d3.scaleOrdinal().range(['#ff3f8a', '#ffb523', '#fa7600', '#c80a1e', '#701b73', '#f7df0e', '#4d94e3']).domain(['JxCat', 'ERC', "Cs", 'PSC', 'CatComú', 'CUP', 'PP']);

d3
  .queue()
  .defer(d3.json, 'municipis.json')
  .defer(d3.csv, "data-popmun-winner.csv", d => {
    d.popmun = +d.popmun;

    popmun.set(d.idmun, d.popmun);
    namemun.set(d.idmun, d.abbrmun);
    winnermun.set(d.idmun, d.partitmun);
    namelongmun.set(d.idmun, d.namemun);
    csmun.set(d.idmun, d.PtgCsMun);
    jxcatmun.set(d.idmun, d.PtgJxCatMun);
    ercmun.set(d.idmun, d.PtgERCMun);
    pscmun.set(d.idmun, d.PtgPSCMun);
    catcomumun.set(d.idmun, d.PtgCatComuMun);
    cupmun.set(d.idmun, d.PtgCUPMun);
    ppmun.set(d.idmun, d.PtgPPMun);

    return d;
  })
  .await(ready);

function ready(error, cat, data) {
  if (error) throw error;

  size.domain(d3.extent(data, d => d.popmun));
  font.domain(d3.extent(data, d => d.popmun));

  const municipis = topojson.feature(cat, cat.objects.municipis);
  const features = municipis.features;

  // File is already projected
  const projection = d3
    .geoIdentity()
    .reflectY(true)
    .fitSize([width*0.95, height*0.95], municipis);

  const path = d3.geoPath().projection(projection);

  features.forEach(function(d) {
    d.pos = path.centroid(d);
    d.area = size(popmun.get(d.properties.CODIMUNI));
    [d.x, d.y] = d.pos;
  });

  const simulation = d3
    .forceSimulation(features)
    .force('x', d3.forceX(d => d.x).strength(0.3))
    .force('y', d3.forceY(d => d.y).strength(0.5))
    .force('collide', collide);

  for (let i = 0; i < 125; ++i) simulation.tick();

  const tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip-muni")
      .style("opacity", 0);

  const rect = svg
    .selectAll('g')
    .data(features)
    .enter()
    .append('g')
    .attr('transform', d => `translate(${d.x}, ${d.y})`);

  rect
    .append('rect')
    .attr('width', d => d.area)
    .attr('height', d => d.area)
    .attr('x', d => -d.area / 2)
    .attr('y', d => -d.area / 2)
    .attr('fill', d => color(winnermun.get(d.properties.CODIMUNI)))
    .attr('stroke', 'white')
    .attr('class', 'rect')
    .attr('stroke-width', (isMobile ? 0 : isTablet ? 0.5 : 0.5))
    .attr('rx', 2)
    .on("mousemove", function(d) {
      d3.select(this)
          .style('stroke', 'grey')
          .style('stroke-oppacity', 0.5);

        tooltip.transition()
            .duration(100)
            .style("opacity", .9)
            .style("left", (d3.event.pageX - 56) + "px")
            .style("top", (d3.event.pageY + 5) + "px");

        tooltip.html("<b>" + namelongmun.get(d.properties.CODIMUNI) + "</b><br/>"
                + "C's: " + csmun.get(d.properties.CODIMUNI) + "% <br/>"
                + "JxCat: " + jxcatmun.get(d.properties.CODIMUNI) + "% <br/>"
                + "ERC: " + ercmun.get(d.properties.CODIMUNI) + "% <br/>"
                + "PSC: " + pscmun.get(d.properties.CODIMUNI) + "% <br/>"
                + "CatComú: " + catcomumun.get(d.properties.CODIMUNI) + "% <br/>"
                + "CUP: " + cupmun.get(d.properties.CODIMUNI) + "% <br/>"
                + "PP: " + ppmun.get(d.properties.CODIMUNI) + "% <br/>");
    })
    .on("mouseout", function(d) {
      d3.select(this)
        .style('stroke', 'white');
      tooltip.transition()
        .duration(200)
        .style("opacity", 0);
      });

  rect
    .append('text')
    .filter(d => d.area > 28) // Only labeling after a threshold
    .style('font-family', 'sans-serif')
    .style('font-size', d => `${font(popmun.get(d.properties.CODIMUNI))}px`)
    .attr('text-anchor', 'middle')
    .attr('dy', 2)
    .attr('fill', 'white')
    .text(d => namemun.get(d.properties.CODIMUNI))
    .on("mousemove", function(d) {
      d3.select(this.parentNode).selectAll('.rect')
          .style('stroke', 'grey')
          .style('stroke-oppacity', 0.5);

        tooltip.transition()
            .duration(100)
            .style("opacity", .9)
            .style("left", (d3.event.pageX - 56) + "px")
            .style("top", (d3.event.pageY + 5) + "px");

        tooltip.html("<b>" + namelongmun.get(d.properties.CODIMUNI) + "</b><br/>"
                + "C's: " + csmun.get(d.properties.CODIMUNI) + "% <br/>"
                + "JxCat: " + jxcatmun.get(d.properties.CODIMUNI) + "% <br/>"
                + "ERC: " + ercmun.get(d.properties.CODIMUNI) + "% <br/>"
                + "PSC: " + pscmun.get(d.properties.CODIMUNI) + "% <br/>"
                + "CatComú: " + catcomumun.get(d.properties.CODIMUNI) + "% <br/>"
                + "CUP: " + cupmun.get(d.properties.CODIMUNI) + "% <br/>"
                + "PP: " + ppmun.get(d.properties.CODIMUNI) + "% <br/>");
    })
    .on("mouseout", function(d) {
      d3.select(this.parentNode).selectAll('.rect')
        .style('stroke', 'none');
      tooltip.transition()
          .duration(200)
          .style("opacity", 0);
        });

  // From https://bl.ocks.org/mbostock/4055889
  function collide() {
    for (var k = 0, iterations = 4, strength = 0.5; k < iterations; ++k) {
      for (var i = 0, n = features.length; i < n; ++i) {
        for (var a = features[i], j = i + 1; j < n; ++j) {
          var b = features[j],
            x = a.x + a.vx - b.x - b.vx,
            y = a.y + a.vy - b.y - b.vy,
            lx = Math.abs(x),
            ly = Math.abs(y),
            r = a.area / 2 + b.area / 2 + padding;
          if (lx < r && ly < r) {
            if (lx > ly) {
              lx = (lx - r) * (x < 0 ? -strength : strength);
              (a.vx -= lx), (b.vx += lx);
            } else {
              ly = (ly - r) * (y < 0 ? -strength : strength);
              (a.vy -= ly), (b.vy += ly);
            }
          }
        }
      }
    }
  }
}
}(d3);

var mapComIndepe = function(d3) {
const svg = d3
  .select('#map-com-indepe')
  .append('svg')
  .attr('width', (isMobile ? (width  + margin.left + margin.right) : width*0.75))
  .attr('height', (isMobile ? (height  + margin.top + margin.bottom) : height*0.85))
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

const pop = d3.map();
const name = d3.map();
const namelong = d3.map();
const catcomu = d3.map();
const indepe = d3.map();
const noindepe = d3.map();
const dif = d3.map();

const size = d3.scaleSqrt().range(isMobile ? [7, 68] : isTablet ? [7, 85] : [7, 112]);
const font = d3.scaleLinear().range(isMobile ? [9, 24] : isTablet ? [9, 28] : [11, 35]);
const color = d3.scaleLinear().range(['#730087', '#dac3dd', '#f0f0f0', '#fff9af', '#f7f700']).domain([-70, -0.6, 0, 0.6, 70]);

d3
  .queue()
  .defer(d3.json, 'comarques.json')
  .defer(d3.csv, 'data-pop-winner.csv', d => {
    d.pop = +d.pop;

    pop.set(d.id, d.pop);
    name.set(d.id, d.abbr);
    namelong.set(d.id, d.name);
    catcomu.set(d.id, d.PtgCatComu);
    indepe.set(d.id, d.PtgIndepe);
    noindepe.set(d.id, d.PtgNoIndepe);
    dif.set(d.id, d.Dif);

    return d;
  })
  .await(ready);


function ready(error, cat, data) {
  if (error) throw error;

  size.domain(d3.extent(data, d => d.pop));
  font.domain(d3.extent(data, d => d.pop));

  const comarques = topojson.feature(cat, cat.objects.comarques);
  const features = comarques.features;

  // File is already projected
  const projection = d3
    .geoIdentity()
    .reflectY(true)
    .fitSize((isMobile ? [width, height] : [width*0.75, height*0.85]), comarques);

  const path = d3.geoPath().projection(projection);

  features.forEach(function(d) {
    d.pos = path.centroid(d);
    d.area = size(pop.get(d.properties.CODICOMAR));
    [d.x, d.y] = d.pos;
  });

  const simulation = d3
    .forceSimulation(features)
    .force('x', d3.forceX(d => d.x).strength(0.1))
    .force('y', d3.forceY(d => d.y).strength(0.1))
    .force('collide', collide);

  for (let i = 0; i < 125; ++i) simulation.tick();

// Tooltip
  const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip-indy")
      .style("opacity", 0);

  const rect = svg
    .selectAll('g')
    .data(features)
    .enter()
    .append('g')
    .attr('transform', d => `translate(${d.x}, ${d.y})`);

  rect
    .append('rect')
    .attr('width', d => d.area)
    .attr('height', d => d.area)
    .attr('x', d => -d.area / 2)
    .attr('y', d => -d.area / 2)
    .attr('fill', d => color(dif.get(d.properties.CODICOMAR)))
    .attr('class', 'rect')
    // .attr('stroke', 'white')
    // .attr('stroke-width', '0.5')
    .attr('rx', 2)
    .on("mousemove", function(d) {
      d3.select(this)
        .style('stroke', 'grey')
        .style('stroke-oppacity', 0.5);
      tooltip.transition()
          .duration(100)
          .style("opacity", .9)
          .style("left", (d3.event.pageX - 56) + "px")
          .style("top", (d3.event.pageY + 5) + "px");
      tooltip.html("<b>" + namelong.get(d.properties.CODICOMAR) + "</b><br/>"
              + "Pro-indy: " + indepe.get(d.properties.CODICOMAR) + "% <br/>"
              + "Pro-union: " + noindepe.get(d.properties.CODICOMAR) + "%"
              );
    })
    .on("mouseout", function(d) {
      d3.select(this)
        .style('stroke', 'white');
      tooltip.transition()
        .duration(200)
        .style("opacity", 0);
      });

  rect
    .append('text')
    .filter(d => d.area > 25) // Only labeling after a threshold
    .style('font-family', 'sans-serif')
    .style('font-size', d => `${font(pop.get(d.properties.CODICOMAR))}px`)
    .style('fill', '#474747')
    .attr('text-anchor', 'middle')
    .attr('dy', 2)
    .text(d => name.get(d.properties.CODICOMAR))
    .on("mousemove", function(d) {
      d3.select(this.parentNode).selectAll('.rect')
        .style('stroke', 'grey')
        .style('stroke-oppacity', 0.5);
      tooltip.transition()
          .duration(100)
          .style("opacity", .9)
          .style("left", (d3.event.pageX - 56) + "px")
          .style("top", (d3.event.pageY + 5) + "px");
          tooltip.html("<b>" + namelong.get(d.properties.CODICOMAR) + "</b><br/>"
                  + "Pro-indy: " + indepe.get(d.properties.CODICOMAR) + "% <br/>"
                  + "Pro-union: " + noindepe.get(d.properties.CODICOMAR) + "%"
                  );
        })
    .on("mouseout", function(d) {
      d3.select(this.parentNode).selectAll('.rect')
        .style('stroke', 'none');
      tooltip.transition()
          .duration(200)
          .style("opacity", 0);
        });

  // From https://bl.ocks.org/mbostock/4055889
  function collide() {
    for (var k = 0, iterations = 4, strength = 0.5; k < iterations; ++k) {
      for (var i = 0, n = features.length; i < n; ++i) {
        for (var a = features[i], j = i + 1; j < n; ++j) {
          var b = features[j],
            x = a.x + a.vx - b.x - b.vx,
            y = a.y + a.vy - b.y - b.vy,
            lx = Math.abs(x),
            ly = Math.abs(y),
            r = a.area / 2 + b.area / 2 + padding;
          if (lx < r && ly < r) {
            if (lx > ly) {
              lx = (lx - r) * (x < 0 ? -strength : strength);
              (a.vx -= lx), (b.vx += lx);
            } else {
              ly = (ly - r) * (y < 0 ? -strength : strength);
              (a.vy -= ly), (b.vy += ly);
            }
          }
        }
      }
    }
  }
}
}(d3);

var mapComIndepePast = function(d3) {
const svg = d3
  .select('#map-com-indepe-1715')
  .append('svg')
  .attr('width', (isMobile ? (width  + margin.left + margin.right) : width*0.75))
  .attr('height', (isMobile ? (height  + margin.top + margin.bottom) : height*0.85))
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

const pop = d3.map();
const name = d3.map();
const namelong = d3.map();
const catcomu = d3.map();
const indepe = d3.map();
const noindepe = d3.map();
const dif = d3.map();
const canvipast = d3.map();
const blocdifpast = d3.map();
const canvipastsense = d3.map();

const size = d3.scaleSqrt().range(isMobile ? [7, 68] : isTablet ? [7, 85] : [7, 112]);
const font = d3.scaleLinear().range(isMobile ? [9, 24] : isTablet ? [9, 28] : [11, 35]);
const color = d3.scaleLinear().range(['#730087', '#dac3dd', '#f0f0f0', '#fff9af', '#f7f700']).domain([-10, -0.01, 0, 0.01, 10]);

d3
  .queue()
  .defer(d3.json, 'comarques.json')
  .defer(d3.csv, 'data-pop-winner.csv', d => {
    d.pop = +d.pop;

    pop.set(d.id, d.pop);
    name.set(d.id, d.abbr);
    namelong.set(d.id, d.name);
    catcomu.set(d.id, d.PtgCatComu);
    indepe.set(d.id, d.PtgIndepe);
    noindepe.set(d.id, d.PtgNoIndepe);
    dif.set(d.id, d.Dif);
    canvipast.set(d.id, d.CanviPast);
    blocdifpast.set(d.id, d.BlocDifPast);
    canvipastsense.set(d.id, d.CanviSenseSigne);

    return d;
  })
  .await(ready);


function ready(error, cat, data) {
  if (error) throw error;

  size.domain(d3.extent(data, d => d.pop));
  font.domain(d3.extent(data, d => d.pop));

  const comarques = topojson.feature(cat, cat.objects.comarques);
  const features = comarques.features;

  // File is already projected
  const projection = d3
    .geoIdentity()
    .reflectY(true)
    .fitSize((isMobile ? [width, height] : [width*0.75, height*0.85]), comarques);

  const path = d3.geoPath().projection(projection);

  features.forEach(function(d) {
    d.pos = path.centroid(d);
    d.area = size(pop.get(d.properties.CODICOMAR));
    [d.x, d.y] = d.pos;
  });

  const simulation = d3
    .forceSimulation(features)
    .force('x', d3.forceX(d => d.x).strength(0.1))
    .force('y', d3.forceY(d => d.y).strength(0.1))
    .force('collide', collide);

  for (let i = 0; i < 125; ++i) simulation.tick();

  const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip-indypast")
      .style("opacity", 0);

  const rect = svg
    .selectAll('g')
    .data(features)
    .enter()
    .append('g')
    .attr('transform', d => `translate(${d.x}, ${d.y})`);

  rect
    .append('rect')
    .attr('width', d => d.area)
    .attr('height', d => d.area)
    .attr('x', d => -d.area / 2)
    .attr('y', d => -d.area / 2)
    .attr('fill', d => color(canvipast.get(d.properties.CODICOMAR)))
    // .attr('stroke', 'white')
    // .attr('stroke-width', '0.5')
    .attr('class', 'rect')
    .attr('rx', 2)
    .on("mousemove", function(d) {
      d3.select(this)
        .style('stroke', 'grey')
        .style('stroke-oppacity', 0.5);
      tooltip.transition()
          .duration(100)
          .style("opacity", .9)
          .style("left", (d3.event.pageX - 56) + "px")
          .style("top", (d3.event.pageY + 5) + "px");
          tooltip.html("<b>" + namelong.get(d.properties.CODICOMAR) + "</b><br/>"
                  + "Change since 2015: " + canvipastsense.get(d.properties.CODICOMAR) + " points " + blocdifpast.get(d.properties.CODICOMAR));
        })
    .on("mouseout", function(d) {
      d3.select(this)
        .style('stroke', 'white');
      tooltip.transition()
        .duration(200)
        .style("opacity", 0);
      });

  rect
    .append('text')
    .filter(d => d.area > 25) // Only labeling after a threshold
    .style('font-family', 'sans-serif')
    .style('font-size', d => `${font(pop.get(d.properties.CODICOMAR))}px`)
    .style('fill', '#474747')
    .attr('text-anchor', 'middle')
    .attr('dy', 2)
    .text(d => name.get(d.properties.CODICOMAR))
    .on("mousemove", function(d) {
      d3.select(this.parentNode).selectAll('.rect')
        .style('stroke', 'grey')
        .style('stroke-oppacity', 0.5);
      tooltip.transition()
          .duration(100)
          .style("opacity", .9)
          .style("left", (d3.event.pageX - 56) + "px")
          .style("top", (d3.event.pageY + 5) + "px");
          tooltip.html("<b>" + namelong.get(d.properties.CODICOMAR) + "</b><br/>"
                  + "Change since 2015: " + canvipastsense.get(d.properties.CODICOMAR) + " points " + blocdifpast.get(d.properties.CODICOMAR));
    })
    .on("mouseout", function(d) {
      d3.select(this.parentNode).selectAll('.rect')
        .style('stroke', 'none');
      tooltip.transition()
          .duration(200)
          .style("opacity", 0);
        });

  // From https://bl.ocks.org/mbostock/4055889
  function collide() {
    for (var k = 0, iterations = 4, strength = 0.5; k < iterations; ++k) {
      for (var i = 0, n = features.length; i < n; ++i) {
        for (var a = features[i], j = i + 1; j < n; ++j) {
          var b = features[j],
            x = a.x + a.vx - b.x - b.vx,
            y = a.y + a.vy - b.y - b.vy,
            lx = Math.abs(x),
            ly = Math.abs(y),
            r = a.area / 2 + b.area / 2 + padding;
          if (lx < r && ly < r) {
            if (lx > ly) {
              lx = (lx - r) * (x < 0 ? -strength : strength);
              (a.vx -= lx), (b.vx += lx);
            } else {
              ly = (ly - r) * (y < 0 ? -strength : strength);
              (a.vy -= ly), (b.vy += ly);
            }
          }
        }
      }
    }
  }
}
}(d3);

var mapMunIndepe = function(d3) {
const svg = d3
  .select('#map-mun-indepe')
  .append('svg')
  .attr('width', (isMobile ? (width  + margin.left + margin.right) : width*0.75))
  .attr('height', (isMobile ? (height  + margin.top + margin.bottom) : height*0.85))
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

const popmun = d3.map();
const namemun = d3.map();
const namelongmun = d3.map();
const indepemun = d3.map();
const noindepemun = d3.map();
const difmun = d3.map();

const size = d3.scaleSqrt().range(isMobile ? [2, 42] : isTablet ? [2, 54] : [2.5, 88]);
const font = d3.scaleLinear().range(isMobile ? [5, 12] : isTablet ? [7, 19] : [10, 28]);
const color = d3.scaleLinear().range(['#730087', '#dac3dd', '#d8e0d7', '#fff9af', '#f7f700', '#f7f700']).domain([-85, -0.1, 0, 0.1, 75, 95]);

d3
  .queue()
  .defer(d3.json, 'municipis.json')
  .defer(d3.csv, 'data-popmun-winner.csv', d => {
    d.popmun = +d.popmun;

    popmun.set(d.idmun, d.popmun);
    namemun.set(d.idmun, d.abbrmun);
    namelongmun.set(d.idmun, d.namemun);
    indepemun.set(d.idmun, d.PtgIndepeMun);
    noindepemun.set(d.idmun, d.PtgNoIndepeMun);
    difmun.set(d.idmun, d.DifMun);

    return d;
  })
  .await(ready);


function ready(error, cat, data) {
  if (error) throw error;

  size.domain(d3.extent(data, d => d.popmun));
  font.domain(d3.extent(data, d => d.popmun));

  const municipis = topojson.feature(cat, cat.objects.municipis);
  const features = municipis.features;

  // File is already projected
  const projection = d3
    .geoIdentity()
    .reflectY(true)
    .fitSize((isMobile ? [width, height] : [width*0.75, height*0.85]), municipis);

  const path = d3.geoPath().projection(projection);

  features.forEach(function(d) {
    d.pos = path.centroid(d);
    d.area = size(popmun.get(d.properties.CODIMUNI));
    [d.x, d.y] = d.pos;
  });

  const simulation = d3
    .forceSimulation(features)
    .force('x', d3.forceX(d => d.x).strength(0.1))
    .force('y', d3.forceY(d => d.y).strength(0.1))
    .force('collide', collide);

  for (let i = 0; i < 125; ++i) simulation.tick();

// Tooltip
  const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip-indymun")
      .style("opacity", 0);

  const rect = svg
    .selectAll('g')
    .data(features)
    .enter()
    .append('g')
    .attr('transform', d => `translate(${d.x}, ${d.y})`);

  rect
    .append('rect')
    .attr('width', d => d.area)
    .attr('height', d => d.area)
    .attr('x', d => -d.area / 2)
    .attr('y', d => -d.area / 2)
    .attr('fill', d => color(difmun.get(d.properties.CODIMUNI)))
    // .attr('stroke', 'white')
    // .attr('stroke-width', '0.5')
    .attr('class', 'rect')
    .attr('rx', 2)
    .on("mousemove", function(d) {
      d3.select(this)
        .style('stroke', 'grey')
        .style('stroke-oppacity', 0.5);
      tooltip.transition()
          .duration(100)
          .style("opacity", .9)
          .style("left", (d3.event.pageX - 56) + "px")
          .style("top", (d3.event.pageY + 5) + "px");
      tooltip.html("<b>" + namelongmun.get(d.properties.CODIMUNI) + "</b><br/>"
              + "Pro-indy: " + indepemun.get(d.properties.CODIMUNI) + "% <br/>"
              + "Pro-union: " + noindepemun.get(d.properties.CODIMUNI) + "%"
              );
    })
    .on("mouseout", function(d) {
      d3.select(this)
        .style('stroke', 'white');
      tooltip.transition()
        .duration(200)
        .style("opacity", 0);
      });

  rect
    .append('text')
    .filter(d => d.area > 25) // Only labeling after a threshold
    .style('font-family', 'sans-serif')
    .style('font-size', d => `${font(popmun.get(d.properties.CODIMUNI))}px`)
    .style('fill', '#474747')
    .attr('text-anchor', 'middle')
    .attr('dy', 2)
    .text(d => namemun.get(d.properties.CODIMUNI))
    .on("mousemove", function(d) {
      d3.select(this.parentNode).selectAll('.rect')
        .style('stroke', 'grey')
        .style('stroke-oppacity', 0.5);
      tooltip.transition()
          .duration(100)
          .style("opacity", .9)
          .style("left", (d3.event.pageX - 56) + "px")
          .style("top", (d3.event.pageY + 5) + "px");
          tooltip.html("<b>" + namelongmun.get(d.properties.CODIMUNI) + "</b><br/>"
                  + "Pro-indy: " + indepemun.get(d.properties.CODIMUNI) + "% <br/>"
                  + "Pro-union: " + noindepemun.get(d.properties.CODIMUNI) + "%"
                  );
        })
    .on("mouseout", function(d) {
      d3.select(this.parentNode).selectAll('.rect')
        .style('stroke', 'none');
      tooltip.transition()
          .duration(200)
          .style("opacity", 0);
        });

  // From https://bl.ocks.org/mbostock/4055889
  function collide() {
    for (var k = 0, iterations = 4, strength = 0.5; k < iterations; ++k) {
      for (var i = 0, n = features.length; i < n; ++i) {
        for (var a = features[i], j = i + 1; j < n; ++j) {
          var b = features[j],
            x = a.x + a.vx - b.x - b.vx,
            y = a.y + a.vy - b.y - b.vy,
            lx = Math.abs(x),
            ly = Math.abs(y),
            r = a.area / 2 + b.area / 2 + padding;
          if (lx < r && ly < r) {
            if (lx > ly) {
              lx = (lx - r) * (x < 0 ? -strength : strength);
              (a.vx -= lx), (b.vx += lx);
            } else {
              ly = (ly - r) * (y < 0 ? -strength : strength);
              (a.vy -= ly), (b.vy += ly);
            }
          }
        }
      }
    }
  }
}
}(d3);

var mapMunIndepePast = function(d3) {
const svg = d3
  .select('#map-mun-indepe-1715')
  .append('svg')
  .attr('width', (isMobile ? (width  + margin.left + margin.right) : width*0.75))
  .attr('height', (isMobile ? (height  + margin.top + margin.bottom) : height*0.85))
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

const popmun = d3.map();
const namemun = d3.map();
const namelongmun = d3.map();
const indepemun = d3.map();
const noindepemun = d3.map();
const difmun = d3.map();
const canvipastmun = d3.map();
const blocdifpastmun = d3.map();
const canvipastsensemun = d3.map();

const size = d3.scaleSqrt().range(isMobile ? [2, 42] : isTablet ? [2, 54] : [2.5, 88]);
const font = d3.scaleLinear().range(isMobile ? [5, 12] : isTablet ? [7, 19] : [10, 28]);
const color = d3.scaleLinear().range(['#730087', '#dac3dd', '#d8e0d7', '#fff691', '#f7f700']).domain([-10, -0.01, 0, 0.01, 10]);

d3
  .queue()
  .defer(d3.json, 'municipis.json')
  .defer(d3.csv, 'data-popmun-winner.csv', d => {
    d.popmun = +d.popmun;

    popmun.set(d.idmun, d.popmun);
    namemun.set(d.idmun, d.abbrmun);
    namelongmun.set(d.idmun, d.namemun);
    indepemun.set(d.idmun, d.PtgIndepeMun);
    noindepemun.set(d.idmun, d.PtgNoIndepeMun);
    difmun.set(d.idmun, d.DifMun);
    canvipastmun.set(d.idmun, d.CanviPastMun);
    blocdifpastmun.set(d.idmun, d.BlocDifPastMun);
    canvipastsensemun.set(d.idmun, d.CanviSenseSigneMun);

    return d;
  })
  .await(ready);


function ready(error, cat, data) {
  if (error) throw error;

  size.domain(d3.extent(data, d => d.popmun));
  font.domain(d3.extent(data, d => d.popmun));

  const municipis = topojson.feature(cat, cat.objects.municipis);
  const features = municipis.features;

  // File is already projected
  const projection = d3
    .geoIdentity()
    .reflectY(true)
    .fitSize((isMobile ? [width, height] : [width*0.75, height*0.85]), municipis);

  const path = d3.geoPath().projection(projection);

  features.forEach(function(d) {
    d.pos = path.centroid(d);
    d.area = size(popmun.get(d.properties.CODIMUNI));
    [d.x, d.y] = d.pos;
  });

  const simulation = d3
    .forceSimulation(features)
    .force('x', d3.forceX(d => d.x).strength(0.1))
    .force('y', d3.forceY(d => d.y).strength(0.1))
    .force('collide', collide);

  for (let i = 0; i < 125; ++i) simulation.tick();

// Tooltip
  const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip-indypastmun")
      .style("opacity", 0);

  const rect = svg
    .selectAll('g')
    .data(features)
    .enter()
    .append('g')
    .attr('transform', d => `translate(${d.x}, ${d.y})`);

  rect
    .append('rect')
    .attr('width', d => d.area)
    .attr('height', d => d.area)
    .attr('x', d => -d.area / 2)
    .attr('y', d => -d.area / 2)
    .attr('fill', d => color(canvipastmun.get(d.properties.CODIMUNI)))
    // .attr('stroke', 'white')
    // .attr('stroke-width', '0.5')
    .attr('class', 'rect')
    .attr('rx', 2)
    .on("mousemove", function(d) {
      d3.select(this)
        .style('stroke', 'grey')
        .style('stroke-oppacity', 0.5);
      tooltip.transition()
          .duration(100)
          .style("opacity", .9)
          .style("left", (d3.event.pageX - 56) + "px")
          .style("top", (d3.event.pageY + 5) + "px");
      tooltip.html("<b>" + namelongmun.get(d.properties.CODIMUNI) + "</b><br/>"
              + "Change since 2015: " + canvipastsensemun.get(d.properties.CODIMUNI) + " points " + blocdifpastmun.get(d.properties.CODIMUNI)
              );
    })
    .on("mouseout", function(d) {
      d3.select(this)
        .style('stroke', 'white');
      tooltip.transition()
        .duration(200)
        .style("opacity", 0);
      });

  rect
    .append('text')
    .filter(d => d.area > 25) // Only labeling after a threshold
    .style('font-family', 'sans-serif')
    .style('font-size', d => `${font(popmun.get(d.properties.CODIMUNI))}px`)
    .style('fill', '#474747')
    .attr('text-anchor', 'middle')
    .attr('dy', 2)
    .text(d => namemun.get(d.properties.CODIMUNI))
    .on("mousemove", function(d) {
      d3.select(this.parentNode).selectAll('.rect')
        .style('stroke', 'grey')
        .style('stroke-oppacity', 0.5);
      tooltip.transition()
          .duration(100)
          .style("opacity", .9)
          .style("left", (d3.event.pageX - 56) + "px")
          .style("top", (d3.event.pageY + 5) + "px");
          tooltip.html("<b>" + namelongmun.get(d.properties.CODIMUNI) + "</b><br/>"
                  + "Change since 2015: " + canvipastsensemun.get(d.properties.CODIMUNI) + " points " + blocdifpastmun.get(d.properties.CODIMUNI)
                  );
        })
    .on("mouseout", function(d) {
      d3.select(this.parentNode).selectAll('.rect')
        .style('stroke', 'none');
      tooltip.transition()
          .duration(200)
          .style("opacity", 0);
        });

  // From https://bl.ocks.org/mbostock/4055889
  function collide() {
    for (var k = 0, iterations = 4, strength = 0.5; k < iterations; ++k) {
      for (var i = 0, n = features.length; i < n; ++i) {
        for (var a = features[i], j = i + 1; j < n; ++j) {
          var b = features[j],
            x = a.x + a.vx - b.x - b.vx,
            y = a.y + a.vy - b.y - b.vy,
            lx = Math.abs(x),
            ly = Math.abs(y),
            r = a.area / 2 + b.area / 2 + padding;
          if (lx < r && ly < r) {
            if (lx > ly) {
              lx = (lx - r) * (x < 0 ? -strength : strength);
              (a.vx -= lx), (b.vx += lx);
            } else {
              ly = (ly - r) * (y < 0 ? -strength : strength);
              (a.vy -= ly), (b.vy += ly);
            }
          }
        }
      }
    }
  }
}
}(d3);
