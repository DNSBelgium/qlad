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
import moment from 'moment';
import { SERVERS } from 'constants'

import {
  Box,
  Button,
  DateTime,
  Footer,
  Form,
  FormField,
  Label,
  Select,
  TextInput
} from 'grommet';
import PlayIcon from 'grommet/components/icons/base/Play';


class ResolverQuery extends Component {

  constructor(props) {
    super(props);
    this.state = {
      IP: undefined,
      from: moment().subtract('hour', 1).format('D/M/YYYY H:mm'),
      to: moment().format('D/M/YYYY H:mm'),
      server: {label: "All", value: "All"},
      data_points: 1024,
      errors: {}
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(field, value) {
    this.setState({
      [field]: value
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    let errors = {};
    let noErrors = true;

    if (! this.state.IP) {
      errors.IP = 'required';
      noErrors = false;
    }

    let archiveTime = moment().utc().hour(0).minute(0).second(0);
    var stillUtc = moment.utc(archiveTime).toDate();
    var localArchiveTime = moment(stillUtc).local();
    let startDate;
    if (! this.state.from) {
      errors.from = 'required';
      noErrors = false;
    } else {
      startDate = moment(this.state.from, 'D/M/YYYY H:mm');
      if (! startDate.isValid()) {
        errors.from = 'invalid date format';
        noErrors = false;
      }
    }

    let endDate;
    if (! this.state.to) {
      errors.to = 'required';
      noErrors = false;
    } else {
      endDate = moment(this.state.to, 'D/M/YYYY H:mm');
      if (! endDate.isValid()) {
        errors.to = 'invalid date format';
        noErrors = false;
      }
      if (endDate.isSameOrBefore(startDate)) {
        errors.to = 'should be after from date';
        noErrors = false;
      }
      if (startDate.isBefore(localArchiveTime) && endDate.isAfter(localArchiveTime)) {
        errors.to = 'archived data only available until ' + localArchiveTime.format('D/M/YYYY H:mm');
        noErrors = false;
      }
    }

    if (noErrors) {
      let table = (startDate.unix() < archiveTime.unix() ? 'dns.queries' : 'dns.staging');
      let server = '';
      if (this.state.server.label !== "All")
        server = `AND server='${this.state.server.value}'`
      let sql = ` SELECT *
        FROM ${table}
        WHERE src='${this.state.IP}'
        AND unixtime >= ${startDate.unix()} and unixtime < ${endDate.unix()}
        AND (year >= ${startDate.utc().year()} OR year <= ${endDate.utc().year()})
        AND (month >= ${startDate.utc().month()+1} AND month <= ${endDate.utc().month()+1})
        AND (day >= ${startDate.utc().date()} AND day <= ${endDate.utc().date()})
        ${server}
        LIMIT ${this.state.data_points-1}
        `;
      let query = {
        sql: sql,
        info: {
          subject: this.state.IP,
          type: "Resolver",
          start: startDate.unix(),
          end: endDate.unix(),
          server: this.state.server.value
        }
      };
      this.props.onSubmit(query, true);
    } else {
      this.setState({ errors: errors });
    }
  }

  render() {
    return (
        <Form plain={true} onSubmit={this.handleSubmit}>
          <FormField label="IP address"
              style={{"width":"100%"}}
              error={this.state.errors.IP}>
            <TextInput placeHolder='123.456.7.89' onDOMChange={(e) => this.handleInputChange("IP", e.target.value)} />
          </FormField>
          <FormField label="From"
              style={{"width":"100%"}}
              error={this.state.errors.from}>
            <DateTime format='D/M/YYYY H:mm' value={this.state.from} onChange={(e) => this.handleInputChange("from", e)} />
          </FormField>
          <FormField label="To"
              style={{"width":"100%"}}
              error={this.state.errors.to}>
            <DateTime format='D/M/YYYY H:mm' value={this.state.to} onChange={(e) => this.handleInputChange("to", e)} />
          </FormField>
          <FormField label="Server"
              style={{"width":"100%"}}
              error={this.state.errors.server}>
            <Select placeHolder='None'
                onChange={(e) => this.handleInputChange("server", e.value) }
                options={[{value: "All", label: "All"}].concat(SERVERS)}
                value={this.state.server} />
          </FormField>
          <FormField label="Max number of data points"
              style={{"width":"100%"}}
              error={this.state.errors.data_points}>
              <Box direction="row" flex="grow" pad={{horizontal: "medium", vertical: "small", between: "medium"}}>
                <input type="range" style={{"width":"100%"}} 
                    min={1024} max={10240} step={1024}
                    defaultValue={this.state.data_points}
                    onChange={(e) => this.handleInputChange("data_points", parseInt(e.target.value, 10))}/>
                <Label margin="none">{this.state.data_points}</Label>
              </Box>
          </FormField>
          <Footer pad={{"vertical": "medium"}}>
            <Box direction='row'
              justify='end' flex='grow'
              pad={{"between": "medium"}}>
              <Button label='Submit'
                type='submit'
                primary={true}
                icon={<PlayIcon />} />
            </Box>
          </Footer>
        </Form>
    );
  }
}

ResolverQuery.propTypes = {
  onSubmit: PropTypes.func.isRequired
};


export default ResolverQuery;
