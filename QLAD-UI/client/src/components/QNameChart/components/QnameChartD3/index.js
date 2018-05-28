/*
 * QLAD - An anomaly detection system for DNS traffic
 * Copyright (C) 2017 DNS Belgium
 *
 * This file is part of QLAD.
 *
 * QLAD is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * QLAD is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with QLAD.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as d3 from 'd3';

export default class QnameBarChartD3 {

  constructor(el, legend_el, props = {}) {
    // reference to svg element
    this.svg = d3.select(el).append('svg')
      .attr('class', 'chart-d3');

    // we'll actually be appending to a <g> element
    this.plot = this.svg.append('g')
          .attr('transform','translate('+props.margin.left+','+props.margin.top+')');
    this.xAxis = this.svg.append("g")
          .attr("class", "x axis");
    // text label for the x axis
    this.xAxisLabel = this.svg.append("text")
        .attr("text-anchor", "middle")
        .text("# queries");

    // colored zones
    this.NXzone = this.plot.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .style('opacity', 0.2)
      .style('fill', '#fb8072');
    this.NXzoneText = this.plot.append("text")
      .attr("text-anchor", "middle")
      .style('opacity', 0.5)
      .style('fill', '#fb8072')
      .text("NXDOMAIN");
    this.OKzone = this.plot.append("rect")
      .attr("x", 0)
      .style('opacity', 0.2)
      .style('fill', '#8dd3c7');
    this.OKzoneText = this.plot.append("text")
      .attr("text-anchor", "middle")
      .style('opacity', 0.5)
      .style('fill', '#8dd3c7')
      .text("OK");

    // set size of compoments and draw data elements
    this.adjustSize(el, legend_el, props);
    this.update(el, props);
  }

  /**
   * Set this.widht and this.height, also size this.svg
   * and position all other components
   */
  adjustSize(el, legend_el, props) {
    // helper values for positioning
    this.width = el.offsetWidth;
    this.height = el.offsetHeight;
    // scale the svg
    this.svg.attr('width', this.width)
            .attr('height', this.height);
    // position the other components
    this.addLegend(legend_el, props);
    this.createScales(el,props);
    this.configAxes(el,props);
    this.configZones(el,props);
  }

  createScales(el, props) {
      var xMax = d3.max(props.data, (d) => d.value.count);

      this.xScale = d3.scaleLinear()
          .range([0, this.width-(props.margin.left+props.margin.right)])
          .domain([0.5, xMax+0.5]);

      this.yScale = d3.scaleLinear()
          .range([this.height-(props.margin.top+props.margin.bottom), 0])
          .domain([0, 2]);

      this.zScale = d3.scaleLinear()
          .domain([0, 100])
          .interpolate(d3.interpolateHcl)
          .range([d3.rgb("#ece7f2"), d3.rgb('#756bb1')]);
  }

  configAxes(el, props) {
      // create and append axis elements
      // this is all pretty straightforward D3 stuff
      var xMax = d3.max(props.data, (d) => d.value.count);

      var xAxis = d3.axisBottom()
          .scale(this.xScale)
          .ticks(xMax)
          .tickSize(-this.height);

      this.xAxis
          .attr("transform", "translate("+props.margin.left+"," + (this.height-props.margin.bottom) + ")")
          .call(xAxis);

      this.xAxisLabel.attr("transform",
          "translate(" + (props.margin.left + (this.width-props.margin.left-props.margin.right)/2) + " ," +
                         (this.height - 20) + ")")

      this.xAxis.selectAll(".tick line")
          .attr("stroke", "#777")
          .attr("opacity", 0.2)
          .attr("transform", "translate("+this.xScale(0)+", "+ props.margin.top +")");
  }

  configZones(el, props) {
      // color zone with NXdomains red
      this.NXzone
          .attr("width", this.width-(props.margin.right+props.margin.left))
          .attr("height", this.yScale(1));

      this.NXzoneText
          .attr("transform",
              "translate(" + (this.width-(props.margin.right+props.margin.left))/2 + " ," +
                             this.yScale(1.5) + ")");

      // color zone with correct domains green
      this.OKzone
          .attr("y", (this.height - props.margin.top - props.margin.bottom)/2)
          .attr("width", this.width-(props.margin.right+props.margin.left))
          .attr("height", this.yScale(1));

      this.OKzoneText
          .attr("transform",
              "translate(" + (this.width-(props.margin.right+props.margin.left))/2 + " ," +
                             this.yScale(.5) + ")");
  }

  update(el, props) {
    var data = props.data;
    if (!data) return;

    var dots = this.plot.selectAll('.dot')
          .data(data, (d) => d.key);

    var mapError = function(val) {
      if (val > 0) {
        return Math.random() + 1;
      } else {
        return Math.random();
      }
    };

    var update = dots.enter().append('circle')
      .attr("class", (d) => "dot " + d.key.replace(/\./g, ''))
      .attr("cx", (d) => this.xScale(d.value.count + (Math.random() - 0.5)/2))
      .attr("cy", (d) => this.yScale(mapError(d.value.error)))
      .style("fill", (d) => this.zScale(d.value.qnames / d.value.count * 100))
      .style("stroke", (d) => this.zScale(d.value.qnames / d.value.count * 100))
      .style("opacity", (d) =>
        undefined === props.selectedKey || props.selectedKey === d.key ? 1 : 0.1
      );

    update.transition().duration(1000).attr("r", 3.5);

    update.on("mouseover", function(d) {
        d3.select(this).transition().duration(200).attr("r", 6);
        props.onSetActive(d);
      })
      .on("mouseout", function(d) {
        d3.select(this).transition().duration(200).attr("r", 3.5);
        props.onSetInactive(d);
      })
      .on("click", function(d) {
        props.onClick("domainname", d.key);
      });

    dots.exit().transition().duration(1000)
      .attr("r", 0)
      .remove();
  }

  addLegend(el, props) {
      var legendFullHeight = 70;
      var legendFullWidth = props.legendWidth;

      var legendMargin = { top: 30, bottom: 30, left: 15, right: 15 };

      // use same margins as main plot
      var legendWidth = legendFullWidth - legendMargin.left - legendMargin.right;
      var legendHeight = legendFullHeight - legendMargin.top - legendMargin.bottom;

      // reference to svg element containing legend
      d3.select('.chart-legend').remove();
      var svg = d3.select(el).append('svg')
          .attr('class', 'chart-legend')
          .attr('width', legendFullWidth)
          .attr('height', legendFullHeight);

      // we'll actually be appending to a <g> element
      var legendSvg = svg.append('g')
        .attr('transform','translate('+legendMargin.left+','+legendMargin.top+')');

      // append gradient bar
      var gradient = legendSvg.append('defs')
          .append('linearGradient')
          .attr('id', 'gradient')
          .attr('x1', '0%') // bottom
          .attr('y1', '0%')
          .attr('x2', '100%') // to top
          .attr('y2', '0%')
          .attr('spreadMethod', 'pad');

      // programatically generate the gradient for the legend
      // this creates an array of [pct, colour] pairs as stop
      // values for legend
      function linspace(start, end, n) {
          var out = [];
          var delta = (end - start) / (n - 1);

          var i = 0;
          while(i < (n - 1)) {
              out.push(start + (i * delta));
              i++;
          }

          out.push(end);
          return out;
      }

      var zScale = d3.scaleLinear()
          .domain([0, 100])
          .interpolate(d3.interpolateHcl)
          .range([d3.rgb("#ece7f2"), d3.rgb('#756bb1')]);

      var pct = linspace(0, 100, 20).map(function(d) {
          return Math.round(d) + '%';
      });
      var color = linspace(0, 100, 20).map(function(d) {
          return zScale(d);
      });


      var colourPct = d3.zip(pct, color);

      colourPct.forEach(function(d) {
          gradient.append('stop')
              .attr('offset', d[0])
              .attr('stop-color', d[1])
              .attr('stop-opacity', 1);
      });

      legendSvg.append('rect')
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('width', legendWidth)
          .attr('height', legendHeight)
          .style('fill', 'url(#gradient)');

      // create a scale and axis for the legend
      var legendScale = d3.scaleLinear()
          .domain([0, 1])
          .range([0, legendWidth]);

      var legendAxis = d3.axisBottom()
          .scale(legendScale)
          .ticks(3)
          .tickFormat(d3.format(".0%"));

      legendSvg.append("g")
               .attr("class", "legend axis")
               .attr("transform", "translate(0," + legendHeight + ")")
               .call(legendAxis);

      // text label for the x axis
      legendSvg.append("text")
          .attr("transform",
              "translate(" + (legendWidth/2) + " ,-10)")
          .style("text-anchor", "middle")
          .text("Percentage of unique query names");

  }

  /** Any necessary cleanup */
  destroy(el) {}

}
