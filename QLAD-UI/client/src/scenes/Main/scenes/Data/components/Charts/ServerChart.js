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

import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

import { Box } from 'grommet';
import {
  XYPlot,
  ArcSeries,
  MarkSeries,
  LabelSeries,
  LineSeries
} from 'react-vis';

const colors = ['#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462',
                '#b3de69','#fccde5','#d9d9d9','#bc80bd','#ccebc5','#ffed6f'];

const LABEL_STYLE = {
  fontSize: '12px',
  textAnchor: 'middle'
};

/**
 * Find the max radius value from the nodes to be rendered after they have been
 * transformed into an array
 * @param {Array} data - the tree data after it has been broken into a iterable
 * it is an array of objects!
 * @returns {number} the maximum value in coordinates for the radial variable
 */
function getRadialDomain(data) {
  return data.reduce((res, row) => Math.max(row.radius, res), 0);
}


/**
 * Create the list of nodes to render.
 * @param {Object} props
 * props.data {Object} - tree structured data (each node has a name anc an array of children)
 * props.height {number} - the height of the graphic to be rendered
 * props.hideRootNode {boolean} - whether or not to hide the root node
 * props.width {number} - the width of the graphic to be rendered
 * @returns {Array} Array of nodes.
 */
function getNodesToRender({data, height, hideRootNode, width}) {
  const partitionFunction = d3.partition();
  const structuredInput = d3.hierarchy(data).sum(d => d.size);
  const radius = (Math.min(width, height) / 2) - 10;
  const x = d3.scaleLinear().range([0, 2 * Math.PI]);
  const y = d3.scaleSqrt().range([0, radius]);

  return partitionFunction(structuredInput).descendants()
    .reduce((res, cell, index) => {
      if (hideRootNode && index === 0) {
        return res;
      }

      return res.concat([{
        angle0: Math.max(0, Math.min(2 * Math.PI, x(cell.x0))),
        angle: Math.max(0, Math.min(2 * Math.PI, x(cell.x1))),
        radius0: Math.max(0, y(cell.y0)),
        radius: Math.max(0, y(cell.y1)),
        depth: cell.depth,
        parent: cell.parent,
        ...cell.data
      }]);
    }, []);
}

function genHierarchy(originalData, groups) {
  Array.prototype.groupBy = function(prop) { // eslint-disable-line no-extend-native
    return this.reduce(function(groups, item) {
      var val = item[prop];
      groups[val] = groups[val] || [];
      groups[val].push(item);
      return groups;
    }, {});
  }

  var genGroups = function(key, data, isLeave) {
    return Object.entries(data).map(([index, element]) => {
      if (isLeave)
        return { key: key, name : index, children : element, size: element.length };
      else
        return { key: key, name : index, children : element };
    });
  };

  var nest = function(node, curIndex) {
    let isLeave = (curIndex+1 === groups.length);
    if (curIndex === 0) {
      node.children = genGroups(groups[0], originalData.groupBy(groups[0]), isLeave);
      node.children.forEach(function (child) {
        nest(child, curIndex + 1);
      });
    }
    else {
      if (curIndex < groups.length) {
        node.children = genGroups(
          groups[curIndex], node.children.groupBy(groups[curIndex]), isLeave
        );
        node.children.forEach(function (child) {
          nest(child, curIndex + 1);
        });
      }
    }
    return node;
  };
  return nest({}, 0);
}

function genRndInRange(min, max) {
  return (Math.random() * (max - min) + min).toFixed(4)
}

function getLeafNodes(leafNodes, obj){
    if(obj.children){
        obj.children.forEach(function(child){getLeafNodes(leafNodes, child)});
    } else{
        leafNodes.push(obj);
    }
}

class ServerChart extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      pathValue: false,
      data: this.updateData(genHierarchy(this.props.data, this.props.groupKeys), false),
      finalValue: '',
      activeServer: false
    }
  }

  updateData(data, keyPath, activeServer) {
    if (data.children) {
      data.children.map(child => this.updateData(child, keyPath, activeServer));
    }
    // add a fill to all the uncolored cells
    if (!data.color) {
      data.style = {
        fill: (data.name === 'Belgium') ? colors[1] : colors[0]
      };
    }
    data.style = {
      ...data.style,
      fillOpacity: keyPath && !keyPath[data.name] ? 0.2 : 1
    };
    if (activeServer) {
      let leaves = [];
      getLeafNodes(leaves, data);
      data.style = {
        ...data.style,
        fillOpacity: leaves.some(l => l.server === activeServer) ? 1 : 0.2
      };
    }

    return data;
  }

  getKeyPath(node) {
    if (!node.parent) {
      return ['root'];
    }

    return [node.data && node.data.name || node.name].concat(this.getKeyPath(node.parent)); // eslint-disable-line no-mixed-operators
  }
  
  render () {
    let height = 500, width = 500, hideRootNode = true, colorType = 'literal';
    const { data, finalValue, activeServer } = this.state;
    const { groupKeys, onApplyFilter } = this.props;

    const mappedData = getNodesToRender({data, height, hideRootNode, width});
    const radialDomain = getRadialDomain(mappedData);
    const servers = d3.nest()
      .key(d => d.server)
      .rollup(server => server.length )
      .entries(this.props.data)
      .map((d,i) => ({
        label: d.key,
        x: (i % 2 === 0 ? -1 : 1) * radialDomain,
        y: (i % 3 === 0 ? 1 : -1) * radialDomain,
        yOffset: (i % 3 === 0 ? -1 : 1) * 30,
        size: d.value,
        style: LABEL_STYLE,
        color: colors[i+2]
      }));

    return (
          <Box pad={{ horizontal: 'medium', vertical:'small', between:'small' }} direction='row'>
            <Box flex="grow">
              <XYPlot
                height={height}
                width={width}
                className={'rv-sunburst'}
                margin={{bottom: 60, left: 60, right: 60, top: 60}}
                xDomain={[-radialDomain, radialDomain]}
                yDomain={[-radialDomain, radialDomain]}>
                { mappedData.map(row => {
                  // selection: only draw links for selection
                  if (finalValue && row.name === finalValue) { 
                    let leaves = [];
                    getLeafNodes(leaves, row);
                    return leaves.map(l =>  {
                      let rnd = genRndInRange(row.angle0, row.angle);
                      let x = row.radius0*Math.sin(rnd);
                      let y = row.radius0*Math.cos(rnd);
                      let server = servers.find(s => s.label === l.server);
                      return <LineSeries 
                        stroke={server.color}
                        strokeWidth={1}
                        data={[{x: server.x, y: server.y}, {x: x, y: y}]} 
                      />
                    });
                  // default: draw links for level 2
                  } else if (row.children && !row.children.some(c => c.children)) {
                    let leaves = [];
                    getLeafNodes(leaves, row);
                    return leaves.map(l =>  {
                      let rnd = genRndInRange(row.angle0, row.angle);
                      let x = row.radius0*Math.sin(rnd);
                      let y = row.radius0*Math.cos(rnd);
                      let server = servers.find(s => s.label === l.server);
                      if (!activeServer || activeServer === l.server) {
                        return <LineSeries 
                          stroke={server.color}
                          data={[{x: server.x, y: server.y}, {x: x, y: y}]} 
                          strokeWidth={row.style.fillOpacity === 1 ? 1 : 0}
                        />
                      } else {
                        return null;
                      }
                    });
                  } else {
                    return null;
                  }
                }
                )}
                <ArcSeries
                  colorType={colorType}
                  radiusDomain={[0, radialDomain]}
                  data={mappedData}
                  _data={null}
                  arcClassName='rv-sunburst__series--radial__arc'
                  style={{
                    stroke: '#fff',
                    strokeOpacity: 0.3,
                    strokeWidth: '0.5'
                  }}
                  onValueMouseOver={node => {
                    const path = this.getKeyPath(node).reverse();
                    const pathAsMap = path.reduce((res, row) => {
                      res[row] = true;
                      return res;
                    }, {});
                    this.setState({
                      finalValue: path[path.length - 1],
                      pathValue: path.join(' > '),
                      data: this.updateData(genHierarchy(this.props.data, groupKeys), pathAsMap)
                    });
                  }}
                  onValueMouseOut={() => this.setState({
                    pathValue: false,
                    finalValue: false,
                    data: this.updateData(genHierarchy(this.props.data, groupKeys), false)
                  })}
                  onValueClick={datapoint => onApplyFilter(datapoint.key, datapoint.name)}
                />
              <MarkSeries
                colorType="literal"
                fill={"#fff"}
                sizeRange={[5, 15]}
                onValueMouseOver={node => {
                  this.setState({
                    activeServer: node.label,
                    data: this.updateData(genHierarchy(this.props.data, groupKeys), false, node.label)
                  });
                }}
                onValueMouseOut={() => this.setState({
                  activeServer: false,
                  data: this.updateData(genHierarchy(this.props.data, groupKeys), false, false)
                })}
                onValueClick={datapoint => onApplyFilter("server", datapoint.label)}
                data={servers}/>
              <LabelSeries
                data={[ {x: 0, y: 0, label: finalValue ? finalValue : "", style: LABEL_STYLE} ].concat(servers)} />
              </XYPlot>
            </Box>
          </Box>
      );
  }
};

ServerChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  groupKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  onApplyFilter: PropTypes.func
};

export default ServerChart;
