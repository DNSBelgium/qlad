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

import React, { Component } from 'react';
import { browserHistory as history } from 'react-router';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { SERVERS } from 'constants';
import { loadAnomalyData } from 'data/queries/actions'

import {
  Columns,
  Layer,
  Sidebar,
  Header,
  Button,
  Heading,
  List,
  ListItem,
  Label,
  Box
} from 'grommet';
import CloseIcon from 'grommet/components/icons/base/Close';
import PieChartIcon from 'grommet/components/icons/base/PieChart';
import Spinning from 'grommet/components/icons/Spinning';
import CalendarHeatmap from 'react-calendar-heatmap';
import ReactTooltip from 'react-tooltip'


class AnomalyDetails extends Component {

  constructor(props) {
    super(props);
    this.state = {
      dateFilter: undefined,
      serverFilter: SERVERS.map(s => s.value) 
    };
  }

  _onGetDataClick(anomaly) {
    this.props.dispatch(loadAnomalyData(anomaly))
      .then(() => history.push('/data/'+anomaly._id));
  }

  groupByDay(array) {
    var byday = {};
    function groupday(value, index, array) {
      var d = moment.unix(value["start"]).startOf('day').format('YYYY-MM-DD');
      byday[d]=byday[d]||[];
      byday[d].push(value);
    }
    array.map(groupday);
    return byday;
  }

  filterByDay(date) {
    if (this.state.dateFilter === date) 
      this.setState({ dateFilter: undefined });
    else
      this.setState({ dateFilter: date });
  }

  filterByServer(server) {
    if (this.state.serverFilter.includes(server)) 
      this.setState({ serverFilter: this.state.serverFilter.filter(s => s !== server) });
    else
      this.setState({ serverFilter: this.state.serverFilter.concat(server) });
  }

  tooltipData(value) {
    if (value && value.date)
      return ({ 'data-tip': `${moment(value.date, 'YYYY-MM-DD').format('DD MMM YYYY')}<br>
        ${value.count} anomalies` });
    else
      return ({ 'data-tip': `` });
  }

  render () {
    const { dateFilter, serverFilter } = this.state;
    const { selection } = this.props;
    const { anomalies, info, loading } = selection;
    let filteredAnomalies = anomalies || [];
    if (dateFilter) {
      filteredAnomalies = filteredAnomalies.filter(function(anomaly) {
        var a = moment.unix(anomaly["start"]).startOf('day').format('YYYY-MM-DD');
        var b = dateFilter;
        return a === b;
      });
    }
    if (serverFilter) {
      filteredAnomalies = filteredAnomalies.filter(anomaly =>
        serverFilter.includes(anomaly.server)
      );
    }


    let infoNode;
    if (info) {
      infoNode = (
        <ListItem direction='column' align="stretch">
          <Box pad="small" direction='column' colorIndex="neutral-4">
            <span><strong>IP:</strong> {info.ip}</span>
            <span><strong>Hostname:</strong> {info.hostname}</span>
            <span><strong>Network:</strong> {info.org}</span>
            <span><strong>Location:</strong> {[info.city, info.region, info.country].filter(Boolean).join(", ")}</span>
          </Box>
        </ListItem>
      );
    }

    let groupedAnomalies = this.groupByDay(filteredAnomalies || []);
    const calendarNode = (
          <ListItem direction='column' align="stretch"
              pad={{ between: 'small', horizontal: 'medium', vertical: 'medium' }}>
              <Heading tag='h3' margin='none'>History</Heading>
              <CalendarHeatmap
                  endDate={new Date()}
                  numDays={200}
                  values={Object.keys(groupedAnomalies).map(key => ({
                    date: key, 
                    count: groupedAnomalies[key].length
                  }))}
                  classForValue={(value) => (!value) ? 'color-empty' : 'color-filled'}
                  tooltipDataAttrs={this.tooltipData}
                  onClick={value => this.filterByDay(value['date'])}
                />
              <ReactTooltip effect="solid" multiline={true}/>
            </ListItem>
    );

    const serversNode = (
          <ListItem direction='column' align="stretch"
              pad={{ between: 'small', horizontal: 'medium', vertical: 'medium' }}>
              <Heading tag='h3' margin='none'>Servers</Heading>
              <Box flex='grow'>
              <Columns size='small' justify="center">
              { SERVERS.map(s =>
                  <Button
                    key={s.label}
                    label={`${s.label} (${filteredAnomalies.filter(a => a.server === s.value).length})`}
                    primary={serverFilter.includes(s.value)}
                    secondary={!serverFilter.includes(s.value)}
                    box={true}
                    margin='small'
                    onClick={() => this.filterByServer(s.value)} />
              )}
              </Columns>
              </Box>
          </ListItem>
    );

    var anomaliesListNode = filteredAnomalies.map((anomaly, index) => (
      <ListItem key={index} justify='between'>
        <Box direction='column' responsive={false} flex="grow">
          <Label>{moment(new Date(anomaly.start*1000)).format("ddd DD MMM")}</Label>
          <Box direction='column' responsive={false} pad={{horizontal: "medium"}}>
            <span><strong>Time:</strong> {moment(new Date(anomaly.start*1000)).format("HH:mm:ss")} - {moment(new Date(anomaly.end*1000)).format("HH:mm:ss")}</span>
            <span><strong>Server:</strong> {anomaly.server || "Undefined"}</span>
            <Box direction="row" justify="end">
              <Button icon={<PieChartIcon />}
                href='#'
                onClick={() => this._onGetDataClick(anomaly)}
                primary={false}
                secondary={true}
                accent={false}
                plain={false} />
            </Box>
          </Box>
        </Box>
      </ListItem>
    ));

    let content;
    if (loading) {
      content = (
        <Box direction='row' responsive={false}
            pad={{ between: 'small', horizontal: 'medium', vertical: 'medium' }}>
          <Spinning /><span>Loading...</span>
        </Box>
      );
    } else {
      content = (
        <List>
          {infoNode}
          {calendarNode}
          {serversNode}
          {anomaliesListNode}
        </List>
      );
    }

    return (
      <Layer align='right' flush={true} closer={false}>
        <Sidebar size='large'>
          <div>
            <Header size='large' justify='between' align='center'
              pad={{ horizontal: 'medium', vertical: 'medium' }}>
              <Heading tag='h2' margin='none'>Details</Heading>
              <Button icon={<CloseIcon />} plain={true}
                onClick={this.props.onClose} />
            </Header>
            {content}
          </div>
        </Sidebar>
      </Layer>
    );
  }
}

AnomalyDetails.propTypes = {
  selection: PropTypes.object
};

let select = (state) => ({ 
  selection: state.data.anomalies.selection, 
  queries: state.data.queries.queries
});

export default connect(select)(AnomalyDetails);
