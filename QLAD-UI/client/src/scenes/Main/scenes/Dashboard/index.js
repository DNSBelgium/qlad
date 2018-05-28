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
import { connect } from 'react-redux';
import moment from 'moment';

import {
  Article,
  Box,
  Paragraph,
  Header,
  Title,
  Tiles,
  Section,
  Label,
  Notification
} from 'grommet';

import { loadDNSstats, unloadDNSstats } from 'data/dnsstats/actions'
import { loadAnomalies, unloadAnomalies, selectAnomaly, deselectAnomaly } from 'data/anomalies/actions';

import ListPlaceholder from 'grommet-addons/components/ListPlaceholder';
import Spinning from 'grommet/components/icons/Spinning';
import NavControl from 'scenes/Main/components/NavControl';
import QueriesPerServer from './components/Charts/QueriesPerServer';
import AnomalyTile from '../Anomalies/components/AnomalyTile';
import AnomalyDetails from '../Anomalies/components/AnomalyDetails';

class Dashboard extends Component {

  componentDidMount () {
    let timeRange = {
      label: 'Last 24h',
      from: moment().subtract(1, 'days').unix(),
      to: moment().unix()
    }
    this.props.dispatch(loadDNSstats(timeRange));
    this.props.dispatch(loadAnomalies({
      ...timeRange,
      sort: 'count:desc'
    }));
    this._deselectQLADflowAnomaly = this._deselectQLADflowAnomaly.bind(this);
  }

  componentWillUnmount() {
    this.props.dispatch(unloadDNSstats());
    this.props.dispatch(unloadAnomalies());
  }

  _selectQLADflowAnomaly(subject, type) {
    this.props.dispatch(selectAnomaly(subject, type));
  }

  _deselectQLADflowAnomaly() {
    this.props.dispatch(deselectAnomaly());
  }

  _renderQLADflowAnomalies(items=[], count=5) {
    const tiles = items.slice(0, count).map((item, index) => (
      <AnomalyTile key={item.subject} item={item} index={index}
        onClick={() => this._selectQLADflowAnomaly(item.subject, item.type)}/>
    ));
    return (
      <Section key={'section'} pad='none'>
        <Tiles flush={false} fill={false} selectable={true}>
          {tiles}
        </Tiles>
      </Section>
    );
  }

  render() {
    const { statsStatus, statsError, stats, 
      anomalies, anomaliesError, selectedAnomaly } = this.props;

    // Define primary page components
    let errorNode, trafficNode, anomaliesNode;

    // Handle possible situations
    // - Error loading data
    if (statsError) {
      errorNode = (
          <Notification status='critical' size='small' state={statsError.message}
            message='An unexpected error happened.' />
        );
    } else if (anomaliesError) {
    errorNode = (
        <Notification status='critical' size='small' state={anomaliesError.message}
          message='An unexpected error happened.' />
      );
    // - Data still loading
    } else if (statsStatus === 'loading') {
        trafficNode = (
          <Box direction='row' responsive={false}
            pad={{ between: 'small', horizontal: 'medium', vertical: 'medium' }}>
            <Spinning /><span>Loading...</span>
          </Box>
        );
    // - Did not find any data for the selected parameters
    } else if (stats && stats.length === 0) {
        trafficNode = (
          <ListPlaceholder filteredTotal={0}
            unfilteredTotal={0}
            emptyMessage='There is no traffic data at the moment.'
          />
        );
    // - Successfully fetched the data
    } else if (stats) {
        trafficNode = (
            <Section key='Traffic' pad='none'>
              <Header size='small' justify='start' responsive={false}
                separator='top' pad={{ horizontal: 'medium', vertical:'none' }}>
               <Label size='small'>QLAD-global (last 24h)</Label>
              </Header>
              <Box pad={{ horizontal: 'medium' }}>
                <Paragraph margin='none'>
                  { `QLAD-global detected 
                  ${ stats.filter(s => s.anomalies.length > 0).length } 
                  anomalies in the last 24h.` }
                </Paragraph>
                <QueriesPerServer data={stats.map(doc => ({
                    start: doc.start,
                    end: doc.end,
                    server: doc.server,
                    anomalies: doc.anomalies,
                    nb_queries: doc.nb_queries
                }))} />
              </Box>
            </Section>
        );
    }

    if (anomalies && anomalies.items.length > 0) {
      let tiles = this._renderQLADflowAnomalies(anomalies.items); 
      anomaliesNode = (
        <Section key='QLAD-flow' pad='none'>
          <Header size='small' justify='start' responsive={false}
            separator='top' pad={{ horizontal: 'medium', vertical:'none' }}>
            <Label size='small'>QLAD-flow (last 24h)</Label>
          </Header>
          <Box pad={{ horizontal: 'medium' }}>
            <Paragraph margin='none'>
              { `QLAD-flow detected 
              ${ anomalies.items.length } 
              anomalies in the last 24h. Thes are the most common:` }
            </Paragraph>
            {tiles}
          </Box>
        </Section>
      );
    } else {
      anomaliesNode = (
        <Section key='QLAD-flow' pad='none'>
          <Header size='small' justify='start' responsive={false}
            separator='top' pad={{ horizontal: 'medium', vertical:'none' }}>
            <Label size='small'>QLAD-flow (last 24h)</Label>
          </Header>
          <ListPlaceholder filteredTotal={0}
            unfilteredTotal={0}
            emptyMessage='There are no anomalies detected on the last 24h.'
          />
        </Section>
      );
    }

    let anomalyDetailLayer;
    if (selectedAnomaly) {
      anomalyDetailLayer = <AnomalyDetails onClose={this._deselectQLADflowAnomaly} />;
    }


    return (
      <Article>
        <Header size="large" justify="between" pad={{horizontal: 'medium'}}>
          <Title responsive={false}>
            <NavControl />
            <span>Dashboard</span>
          </Title>
        </Header>
        {errorNode}
        {trafficNode}
        {anomaliesNode}
        {anomalyDetailLayer}
      </Article>
    );
  }
}

let select = (state) => ({
  stats: state.data.dnsstats.stats,
  statsStatus: state.data.dnsstats.status,
  statsError: state.data.dnsstats.error,
  anomalies: state.data.anomalies.result,
  selectedAnomaly: state.data.anomalies.selection,
  anomaliesError: state.data.anomalies.error
});

export default connect(select)(Dashboard);
