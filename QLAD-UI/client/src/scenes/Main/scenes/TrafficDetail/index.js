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
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getDNSstats } from 'data/dnsstats/actions'
import {
  Article,
  Box,
  Button,
  Header,
  Title,
  Section,
  Label
} from 'grommet';
import LinkPreviousIcon from 'grommet/components/icons/base/LinkPrevious';
import NavControl from '../../components/NavControl';

import Spinning from 'grommet/components/icons/Spinning';
import QueryTypeChart from './components/Charts/QueryTypeChart';
import ResponseCodeChart from './components/Charts/ResponseCodeChart';
import ClientChart from './components/Charts/ClientChart';
import DomainNameChart from './components/Charts/DomainNameChart';
import CountryChart from './components/Charts/CountryChart';

class TrafficDetail extends Component {

  componentWillMount () {
    this.props.dispatch(getDNSstats({ts: this.props.params.ts}, this.props.params.server));
  }

  render() {
    const { status, error } = this.props;
    let stats = (this.props.stats && this.props.stats.length === 1) ? this.props.stats[0] : undefined;

    // Define primary page components
    let errorNode, dataNode;

    // Handle possible situations
    // - Error loading data
    if (error) {
      errorNode = (
          <Notification status='critical' size='small' state={error}
            message='An unexpected error happened.' />
        );
    // - Data still loading
    } else if (status === 'loading') {
        dataNode = (
          <Box direction='row' responsive={false}
            pad={{ between: 'small', horizontal: 'medium', vertical: 'medium' }}>
            <Spinning /><span>Loading...</span>
          </Box>
        );
    // - Successfully fetched the data
    } else if (stats) {
      dataNode = (
        <Box> 

          <Section key='QType' pad='none'>
            <Header size='small' justify='start' responsive={false}
              separator='top' pad={{ horizontal: 'medium', vertical:'none' }}>
             <Label size='small'>Query types</Label>
            </Header>
            <QueryTypeChart data={stats.qtype} />
          </Section>

          <Section key='RCode' pad='none'>
            <Header size='small' justify='start' responsive={false}
              separator='top' pad={{ horizontal: 'medium', vertical:'none' }}>
             <Label size='small'>Response code</Label>
            </Header>
            <ResponseCodeChart data={stats.rcode} />
          </Section>

          <Section key='Client' pad='none'>
            <Header size='small' justify='start' responsive={false}
              separator='top' pad={{ horizontal: 'medium', vertical:'none' }}>
             <Label size='small'>Clients</Label>
            </Header>
            <ClientChart data={stats.src} />
          </Section>

          <Section key='SLD' pad='none'>
            <Header size='small' justify='start' responsive={false}
              separator='top' pad={{ horizontal: 'medium', vertical:'none' }}>
             <Label size='small'>SLD</Label>
            </Header>
            <DomainNameChart data={stats.domainname} />
          </Section>

          <Section key='country' pad='none'>
            <Header size='small' justify='start' responsive={false}
              separator='top' pad={{ horizontal: 'medium', vertical:'none' }}>
             <Label size='small'>Country</Label>
            </Header>
            <CountryChart data={stats.country} />
          </Section>

        </Box>
      );
    }

    return (
      <Article>
        <Header size="large" pad={{horizontal: 'medium'}}>
            <Box direction='row' align="center" flex='shrink'>
              <Button icon={<LinkPreviousIcon />} secondary={true} onClick={() => window.history.back()} />
            </Box>
            <Title responsive={false}>
              <NavControl />
              <span>Traffic Details</span>
            </Title>
        </Header>
        {errorNode}
        {dataNode}
      </Article>
    )
  }
}

TrafficDetail.propTypes = {
  stats: PropTypes.arrayOf(PropTypes.object),
  status: PropTypes.string,
  error: PropTypes.string
};

let select = (state) => ({
  stats: state.data.dnsstats.stats,
  status: state.data.dnsstats.status,
  error: state.data.dnsstats.error
});

export default connect(select)(TrafficDetail);
