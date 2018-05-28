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
import {connect} from 'react-redux';
import {browserHistory as history} from 'react-router';
import moment from 'moment';
import {
  loadDNSstats,
  unloadDNSstats,
  changeTimeRange,
  setServer,
} from 'data/dnsstats/actions';
import {SERVERS} from 'constants';
import {
  Anchor,
  Article,
  Box,
  Button,
  Columns,
  DateTime,
  Footer,
  Form,
  FormField,
  FormFields,
  Header,
  Heading,
  Label,
  Section,
  Select,
  Title,
} from 'grommet';
import ListPlaceholder from 'grommet-addons/components/ListPlaceholder';
import Spinning from 'grommet/components/icons/Spinning';
import ClockIcon from 'grommet/components/icons/base/Clock';
import NavControl from '../../components/NavControl';

import QueryTypeChart from './components/Charts/QueryTypeChart';
import ResponseCodeChart from './components/Charts/ResponseCodeChart';
import DomainNameChart from './components/Charts/DomainNameChart';
import ClientChart from './components/Charts/ClientChart';
import ResponseSizeChart from './components/Charts/ResponseSizeChart';

class Traffic extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterActive: false,
      timeRange_from: moment
        .unix(this.props.dnsstats.timeRange.from)
        .format('D/M/YYYY H:mm'),
      timeRange_to: moment
        .unix(this.props.dnsstats.timeRange.to)
        .format('D/M/YYYY H:mm'),
    };
    this._onFilterToggle = this._onFilterToggle.bind(this);
    this._filterTimeRange = this._filterTimeRange.bind(this);
    this._handleTimeFromInputChange = this._handleTimeFromInputChange.bind(
      this,
    );
    this._handleTimeToInputChange = this._handleTimeToInputChange.bind(this);
  }

  componentDidMount() {
    this.props.dispatch(
      loadDNSstats(
        this.props.dnsstats.timeRange,
        this.props.dnsstats.server.value,
      ),
    );
  }

  componentWillUnmount() {
    this.props.dispatch(unloadDNSstats());
  }

  _onFilterToggle() {
    this.setState({filterActive: !this.state.filterActive});
  }

  _onSetServer(server) {
    this.props.dispatch(setServer(this.props.dnsstats, server));
  }

  _handleTimeFromInputChange(text) {
    this.setState({
      timeRange_from: text,
    });
  }

  _handleTimeToInputChange(text) {
    this.setState({
      timeRange_to: text,
    });
  }

  _filterTimeRange(label, from, to) {
    this.props.dispatch(changeTimeRange(this.props.dnsstats, label, from, to));
    this.setState({
      filterActive: false,
      timeRange_from: moment.unix(from).format('D/M/YYYY H:mm'),
      timeRange_to: moment.unix(to).format('D/M/YYYY H:mm'),
    });
  }

  onWindowClick(server, ts) {
    history.push(`/traffic/detail/${server}/${ts}`);
  };

  render() {
    const {status, error, stats, timeRange, server} = this.props.dnsstats;
    const {filterActive} = this.state;

    // Define primary page components
    let errorNode, dataNode, filterLayer;

    // Handle possible situations
    // - Error loading data
    if (error) {
      errorNode = (
        <Notification
          status="critical"
          size="small"
          state={error.message}
          message="An unexpected error happened."
        />
      );
      // - Data still loading
    } else if (status === 'loading') {
      dataNode = (
        <Box
          direction="row"
          responsive={false}
          pad={{between: 'small', horizontal: 'medium', vertical: 'medium'}}>
          <Spinning />
          <span>Loading...</span>
        </Box>
      );
      // - Did not find any data for the selected parameters
    } else if (stats && stats.length === 0) {
      dataNode = (
        <ListPlaceholder
          filteredTotal={0}
          unfilteredTotal={0}
          emptyMessage="There are no traffic statistics for the selected time period."
        />
      );
      // - Successfully fetched the data
    } else if (stats) {
      dataNode = (
        <Box>
          <Section key="QTypes" pad="none">
            <Header
              size="small"
              justify="start"
              responsive={false}
              separator="top"
              pad={{horizontal: 'medium', vertical: 'none'}}>
              <Label size="small">Query Types</Label>
            </Header>
            <QueryTypeChart
              domain={[timeRange.from * 1000, timeRange.to * 1000]}
              onWindowClick={this.onWindowClick}
              data={stats.map(doc => ({
                start: doc.start,
                end: doc.end,
                server: doc.server,
                histogram: doc.qtype.histogram,
                entropy: doc.qtype.entropy,
                anomaly: doc.anomalies.find(a => a['feature'] === 'qtype'),
              }))}
            />
          </Section>

          <Section key="RCode" pad="none">
            <Header
              size="small"
              justify="start"
              responsive={false}
              separator="top"
              pad={{horizontal: 'medium', vertical: 'none'}}>
              <Label size="small">Query Resonse Code</Label>
            </Header>
            <ResponseCodeChart
              domain={[timeRange.from * 1000, timeRange.to * 1000]}
              onWindowClick={this.onWindowClick}
              data={stats.map(doc => ({
                start: doc.start,
                end: doc.end,
                server: doc.server,
                histogram: doc.rcode.histogram,
                entropy: doc.rcode.entropy,
                anomaly: doc.anomalies.find(a => a['feature'] === 'rcode'),
              }))}
            />
          </Section>

          <Section key="Domain" pad="none">
            <Header
              size="small"
              justify="start"
              responsive={false}
              separator="top"
              pad={{horizontal: 'medium', vertical: 'none'}}>
              <Label size="small">Domain Names</Label>
            </Header>
            <DomainNameChart
              domain={[timeRange.from * 1000, timeRange.to * 1000]}
              onWindowClick={this.onWindowClick}
              data={stats.map(doc => ({
                start: doc.start,
                end: doc.end,
                server: doc.server,
                nb_queries: doc.nb_queries,
                histogram: doc.domainname.histogram,
                entropy: doc.domainname.entropy,
                max: doc.domainname.max,
                avg: doc.domainname.avg,
                anomaly: doc.anomalies.find(a => a['feature'] === 'domainname'),
              }))}
            />
          </Section>

          <Section key="Client" pad="none">
            <Header
              size="small"
              justify="start"
              responsive={false}
              separator="top"
              pad={{horizontal: 'medium', vertical: 'none'}}>
              <Label size="small">Clients</Label>
            </Header>
            <ClientChart
              domain={[timeRange.from * 1000, timeRange.to * 1000]}
              onWindowClick={this.onWindowClick}
              data={stats.map(doc => ({
                start: doc.start,
                end: doc.end,
                server: doc.server,
                nb_queries: doc.nb_queries,
                histogram: doc.src.histogram,
                entropy: doc.src.entropy,
                max: doc.src.max,
                avg: doc.src.avg,
                anomaly: doc.anomalies.find(a => a['feature'] === 'src'),
              }))}
            />
          </Section>

          <Section key="ResponseSize" pad="none">
            <Header
              size="small"
              justify="start"
              responsive={false}
              separator="top"
              pad={{horizontal: 'medium', vertical: 'none'}}>
              <Label size="small">Response Size</Label>
            </Header>
            <ResponseSizeChart
              domain={[timeRange.from * 1000, timeRange.to * 1000]}
              onWindowClick={this.onWindowClick}
              data={stats.map(doc => ({
                start: doc.start,
                end: doc.end,
                server: doc.server,
                entropy: doc.res_len.entropy,
                max: doc.res_len.max,
                avg: doc.res_len.avg,
                anomaly: doc.anomalies.find(a => a['feature'] === 'res_len'),
              }))}
            />
          </Section>
        </Box>
      );
    }

    if (filterActive) {
      filterLayer = (
        <Box full="horizontal" colorIndex="light-2" pad="medium">
          <Box direction="row" pad={{between: 'large'}}>
            <Form pad="small">
              <Header>
                <Heading>Time range</Heading>
              </Header>
              <FormFields>
                <FormField label="From">
                  <DateTime
                    name="timeRange_from"
                    format="D/M/YYYY H:mm"
                    onChange={this._handleTimeFromInputChange}
                    value={this.state.timeRange_from}
                  />
                </FormField>
                <FormField label="To">
                  <DateTime
                    name="timeRange_to"
                    format="D/M/YYYY H:mm"
                    onChange={this._handleTimeToInputChange}
                    value={this.state.timeRange_to}
                  />
                </FormField>
              </FormFields>
              <Footer pad={{vertical: 'medium'}}>
                <Button
                  label="Submit"
                  type="button"
                  primary={true}
                  onClick={() =>
                    this._filterTimeRange(
                      // this.state.timeRange_from + ' - ' + this.state.timeRange_to,
                      'Custom range',
                      moment(this.state.timeRange_from, 'D/M/YYYY H:mm').unix(),
                      moment(this.state.timeRange_to, 'D/M/YYYY H:mm').unix(),
                    )}
                />
              </Footer>
            </Form>
            <Box pad="small" flex="grow" direction="column">
              <Header>
                <Heading>Quick ranges</Heading>
              </Header>
              <Columns masonry={false} responsive={false}>
                <Anchor
                  label="Today"
                  primary={false}
                  onClick={e =>
                    this._filterTimeRange(
                      'Today',
                      moment().startOf('day').unix(),
                      moment().endOf('day').unix(),
                    )}
                />
                <Anchor
                  label="Today so far"
                  primary={false}
                  onClick={e =>
                    this._filterTimeRange(
                      'Today so far',
                      moment().startOf('day').unix(),
                      moment().unix(),
                    )}
                />
                <Anchor
                  label="Yesterday"
                  primary={false}
                  onClick={e =>
                    this._filterTimeRange(
                      'Yesterday',
                      moment().subtract(1, 'days').startOf('day').unix(),
                      moment().subtract(1, 'days').endOf('day').unix(),
                    )}
                />
                <Anchor
                  label="Last 2 days"
                  primary={false}
                  onClick={e =>
                    this._filterTimeRange(
                      'Last 2 days',
                      moment().subtract(2, 'days').unix(),
                      moment().unix(),
                    )}
                />
                <Anchor
                  label="This week"
                  primary={false}
                  onClick={e =>
                    this._filterTimeRange(
                      'This week',
                      moment().startOf('week').unix(),
                      moment().unix(),
                    )}
                />
              </Columns>
            </Box>
          </Box>
        </Box>
      );
    }

    return (
      <Article>
        <Header size="large" justify="between" pad={{horizontal: 'medium'}}>
          <Title responsive={false}>
            <NavControl />
            <span>Traffic</span>
          </Title>
          <Box direction="row" pad={{between: 'small'}}>
            <Select
              options={SERVERS}
              onChange={e => this._onSetServer(e.option)}
              value={server.label}
            />
            <Button
              icon={<ClockIcon />}
              primary={false}
              onClick={this._onFilterToggle}
              label={timeRange.label}
            />
          </Box>
        </Header>
        {filterLayer}
        {errorNode}
        {dataNode}
      </Article>
    );
  }
}

Traffic.propTypes = {
  dnsstats: PropTypes.shape({
    stats: PropTypes.arrayOf(PropTypes.object),
    status: PropTypes.string,
    error: PropTypes.object,
    timeRange: PropTypes.shape({
      label: PropTypes.string,
      from: PropTypes.number,
      to: PropTypes.number,
    }),
    server: PropTypes.object,
  }),
};

let select = state => ({
  dnsstats: state.data.dnsstats,
});

export default connect(select)(Traffic);
