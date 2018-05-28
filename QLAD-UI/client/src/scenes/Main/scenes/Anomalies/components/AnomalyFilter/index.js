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
import { connect } from 'react-redux';
import moment from 'moment';
import { SERVERS } from 'constants';
import { 
  filterAnomalies, 
  sortAnomalies, 
  disableWhitelist,
  filterTimeRange
} from 'data/anomalies/actions';

import {
  CheckBox,
  FormField,
  DateTime,
  Select
} from 'grommet';
import LayerForm from 'grommet-templates/components/LayerForm';
import Sort from 'grommet-addons/components/Sort';

class AnomalyFilter extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      errors: {},
      timeRange: {
        from: this.props.anomalies.from || 0,
        to: this.props.anomalies.to || moment().unix()
      }
    };
    this._onChangeSort = this._onChangeSort.bind(this);
    this._onDisableWhitelist = this._onDisableWhitelist.bind(this);
  }

  _change (name) {
    return (event) => {
      const { anomalies } = this.props;
      let nextFilter = { ...anomalies.filter };
      if (! event.option.value) {
        // user selected the 'All' option, which has no value, clear filter
        delete nextFilter[name];
      } else {
        // we get the new option passed back as an object,
        // normalize it to just a value
        nextFilter[name] = event.value.value;
      }
      this.props.dispatch(filterAnomalies(anomalies, nextFilter));
    };
  }

  _onChangeTimeRange(end, value) {
    let errors = {};
    let noErrors = true;
    const { anomalies } = this.props;
    let date = moment(value, 'D/M/YYYY H:mm');
    if (! date.isValid()) {
      errors.timeRange = 'invalid date format';
      noErrors = false;
    }
    let timeRange = {
      from: anomalies.from,
      to: anomalies.to
    };
    timeRange[end] = date.unix();
    if (noErrors && timeRange.from && timeRange.to && 
      timeRange.to < timeRange.from) {
        errors.timeRange = 'invalid time range';
        noErrors = false;
    }

    if (noErrors) {
      this.setState({ 
        errors: {},
        timeRange
      });
      this.props.dispatch(filterTimeRange(anomalies, timeRange));
    } else {
      this.setState({ errors: errors });
    }
  }

  _onChangeSort (sort) {
    const { anomalies } = this.props;
    this.props.dispatch(sortAnomalies(anomalies, `${sort.value}:${sort.direction}`));
  }

  _onDisableWhitelist (sort) {
    const { anomalies } = this.props;
    this.props.dispatch(disableWhitelist(anomalies, !anomalies.disable_whitelist ));
  }

  render () {
    const { anomalies } = this.props;

    const filter = anomalies.filter || {};
    let sortProperty, sortDirection;
    if (anomalies.sort) {
      [ sortProperty, sortDirection ] = anomalies.sort.split(':');
    }

    let disableWhitelist = anomalies.disable_whitelist || false;

    return (
      <LayerForm title='Display options' 
        submitLabel='OK'
        onClose={this.props.onClose} 
        onSubmit={this.props.onClose}>
          <fieldset>
              <Sort options={[
                { label: 'Most Recent', value: 'most_recent', direction: 'desc' },
                { label: 'Number of events', value: 'count', direction: 'desc' }
              ]} value={sortProperty} direction={sortDirection}
              onChange={this._onChangeSort} />
          </fieldset>
          <fieldset>
            <FormField label='Filter by time period'
              error={this.state.errors.timeRange}>
              <DateTime
                format='D/M/YYYY H:mm'
                value={moment.unix(this.state.timeRange.from).format('D/M/YYYY H:mm')}
                onChange={(e) => this._onChangeTimeRange("from", e)}
                />
              <DateTime
                format='D/M/YYYY H:mm'
                value={moment.unix(this.state.timeRange.to).format('D/M/YYYY H:mm')}
                onChange={(e) => this._onChangeTimeRange("to", e)}
                />
            </FormField>
          </fieldset>
          <fieldset>
            <FormField label='Filter by type'>
              <Select inline={true} multiple={false} options={[
                { label: 'All', value: undefined },
                { label: 'Resolver', value: 'Resolver' },
                { label: 'Domain', value: 'Domain' },
              ]} value={filter.type} onChange={this._change('type')} />
            </FormField>
          </fieldset>
          <fieldset>
            <FormField label='Filter by server'>
              <Select inline={true} multiple={false} 
                options={[{ label: 'All', value: undefined }].concat(SERVERS)} 
                value={filter.server} onChange={this._change('server')} />
            </FormField>
          </fieldset>
          <fieldset>
            <FormField label='Whitelist'>
              <CheckBox label='Select to show all anomalies' 
                checked={disableWhitelist} 
                onChange={this._onDisableWhitelist} />
            </FormField>
          </fieldset>
      </LayerForm>
    );
  }
}

AnomalyFilter.propTypes = {
  anomalies: PropTypes.object
};

let select = (state) => ({ anomalies: state.data.anomalies });

export default connect(select)(AnomalyFilter);
