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

export default class StackedBarChartD3 {

  /* Initialization */
  constructor(el, props = {}) {
    // reference to svg element
    this.svg = d3.select(el).append('svg')
      .attr('class', 'chart-d3');

    // we'll actually be appending to a <g> element
    this.plot = this.svg.append('g')
          .attr('transform','translate('+props.margin.left+','+props.margin.top+')');
    this.xAxis = this.svg.append("g")
          .attr("class", "x axis");
    this.yAxis = this.svg.append("g")
          .attr("class", "y axis")
          .attr('transform','translate('+props.margin.left+','+props.margin.top+')');

    // reference to g element containing legend
    //this.legend = this.svg.append('g')
    //    .attr('class', 'chart-legend');

    this.adjustSize(el, props);
    this.update(el, props);
  }

  /**
   * Set this.widht and this.height, also size this.svg
   */
  adjustSize(el, props) {
    // helper values for positioning
    this.width = el.offsetWidth;
    this.height = el.offsetHeight;
    // center some stuff vertically
    this.svg.attr('width', this.width)
            .attr('height', this.height);
    this.xAxis.attr("transform", "translate("+props.margin.left+"," + (this.height-props.margin.bottom) + ")");

  }

  createScales(el, props) {

    // calculate max and min for data
    var yMax = d3.max(props.data, (d,i) => d.all);

    this.xScale = d3.scaleTime()
        .range([0, this.width-(props.margin.right+props.margin.left)])
        .domain([
          props.fixedDomain ? props.fixedDomain.min : d3.min(props.data, d => d.ts),
          props.fixedDomain ? props.fixedDomain.max : d3.max(props.data, d => d.ts)
        ]);

    this.yScale = d3.scaleLinear()
        .range([this.height-(props.margin.top+props.margin.bottom), 0])
        .domain([0, Math.max(10, yMax)]);

  }

  addAxes(el, props){
    // create and append axis elements
    // this is all pretty straightforward D3 stuff
    var xAxisScale = d3.axisBottom()
        .scale(this.xScale);

    var yAxisScale = d3.axisLeft()
        .scale(this.yScale)
        .tickFormat(d3.format("d"));

    this.xAxis.call(xAxisScale);
    this.yAxis.call(yAxisScale)
  }

  update(el, props) {
    var data = props.data;
    if (!data) return;

    this.createScales(el,props);
    this.addAxes(el,props);
    //this.configureLegend(el,props);

    var keys = Object.keys(props.colorLegend);
    if (undefined !== props.selectedKey)
      keys = [props.selectedKey];
    var stack = d3.stack().keys(keys);
    var stackedData = stack(data);

    // add each group
    const groups = this.plot.selectAll("g")
          .remove().exit()
          .data(stackedData, (d) => 'g' + d.key)

    groups.enter().append("g")
          .attr("fill", (d) => props.colorLegend[d.key] ? props.colorLegend[d.key].color : props.colorLegend.other.color)
          .attr("class", (d) => d.key)
          .selectAll("rect")
          .data((d) => d)
          .enter().append("rect")
          .attr("x", (d) => this.xScale(d.data.ts))
          .attr("y", (d) => this.yScale(d[1]))
          .attr("class", "bar")
          .attr("width", 2)
          .transition().duration(1000)
          .attr("height", (d) => this.yScale(d[0]) - this.yScale(d[1]));

  }

  configureLegend(el, props) {
    var t = d3.transition()
      .duration(750);

    // JOIN new keys with old keys.
    const legendKeys = this.legend.selectAll(".legend-key")
        .data(Object.keys(props.colorLegend), (d) => 'g' + d)

    // EXIT old keys not present in new legend.
    legendKeys.exit()
        .transition(t)
          .attr("opacity", 1e-6)
          .remove();

    // UPDATE old keys present in new legend.
    legendKeys.selectAll("rect")
        .style("stroke-width", (d) =>
          props.selectedKey === props.colorLegend[d].id ?  2 : 0
        )
      .transition(t)
        .style("opacity", (d) =>
          undefined === props.selectedKey || props.selectedKey === props.colorLegend[d].id ?  1 : 0.1
        );

    legendKeys.selectAll("text")
      .transition(t)
        .style("opacity", (d) =>
          undefined === props.selectedKey || props.selectedKey === props.colorLegend[d].id ?  1 : 0.1
        )

    // ENTER new elements present in new data.
    var newKeys = legendKeys.enter()
      .append("g")
      .attr('class', 'legend-key')
      .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

    // for each <g> create a rect and have its color... be the color
    newKeys.append("rect")
      .attr("id", (d) => "legend-" + d)
      .attr("x", this.width - props.margin.right - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", (d) => props.colorLegend[d].color)
      .style("opacity", (d) =>
        undefined === props.selectedKey || props.selectedKey === props.colorLegend[d].id ?  1 : 0.1
      )
      .style("stroke", "black")
      .style("stroke-width", (d) =>
        props.selectedKey === props.colorLegend[d].id ?  2 : 0
      )
      .on("click", function(d) {
        props.onClick("qtype", props.colorLegend[d].id);
      });

      // and for each key add the text label
     newKeys.append("text")
       .attr("x", this.width - props.margin.right - 24)
       .attr("y", 9)
       .attr("dy", ".35em")
       .style("text-anchor", "end")
       .style("opacity", (d) =>
         undefined === props.selectedKey || props.selectedKey === props.colorLegend[d].id ?  1 : 0.1
       )
       .text((d) => props.colorLegend[d].text);
  }

  /** Any necessary cleanup */
  destroy(el) {}

}
