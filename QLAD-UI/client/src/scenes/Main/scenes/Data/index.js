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

import React from 'react'
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { countries, continents } from 'countries-list';

import { addFilter, deleteFilter } from 'data/queries/actions'

import NavControl from 'scenes/Main/components/NavControl';
import DataFilter from './components/DataFilter';
import ResolverDataView from './components/ResolverDataView';
import DomainDataView from './components/DomainDataView';
import {
  Button,
  Box,
  Article,
  Header,
  Title,
  Label,
  Notification,
} from 'grommet';
import FilterControl from 'grommet-addons/components/FilterControl';
import Spinning from 'grommet/components/icons/Spinning';
import LinkPreviousIcon from 'grommet/components/icons/base/LinkPrevious';


class AnomalyData extends React.Component {

  constructor(props) {
    super(props);
    this.state = { filterLayerActive: false };
    this.toggleFilter = this.toggleFilter.bind(this);
    this._onfilterLayerActivate = this._onfilterLayerActivate.bind(this);
    this._onfilterLayerDeactivate = this._onfilterLayerDeactivate.bind(this);
    this.enrichData(this.props.result);
  }

  _onfilterLayerActivate() {
    this.setState({ filterLayerActive: true });
  }

  _onfilterLayerDeactivate() {
    this.setState({ filterLayerActive: false });
  }

  toggleFilter(key, value) {
    const { id, filters } = this.props;
    if (filters && filters[key] === value)
      this.props.dispatch(deleteFilter(id, key));
    else
      this.props.dispatch(addFilter(id, key, value));
  }

  filterData(data, filters) {
    return (data || []).filter((query) =>
      Object.keys(filters || {}).every((filterKey) =>
        String(query[filterKey]) === String(filters[filterKey])
      )
    )
  }

  enrichData(data) {
    data.forEach(d => {
      d.countryName = countries[d.country] ? countries[d.country].name : d.country;
      d.continent = countries[d.country] ? continents[countries[d.country].continent] : "Unknown";
    });
  }

  render() {
    const { error, id, state, info, result, filters } = this.props;
    const { filterLayerActive } = this.state;

    // Define primary page components
    let errorNode, loadingNode, dataNode, filterControl;

    // Handle possible situations
    // - Error loading anomaly data
    if (error) {
      errorNode = (
          <Notification status='critical' size='small' state={error.message}
            message='An unexpected error happened.' />
        );
    // - Anomaly data still loading
    }
    if (state === "PROCESSING") {
        loadingNode = (
          <Box direction='row' responsive={false}
            pad={{ between: 'small', horizontal: 'medium', vertical: 'medium' }}>
            <Spinning /><span>{(result.length === 0) ? "Loading..." : "Loading more data..."}</span>
          </Box>
        );
    }
    // - Did not find any data for the anomaly
    if (result.length === 0 && state !== "PROCESSING") {
        errorNode = (
          <Notification status='critical' size='small'
            message='Could not find any data for this anomaly.' />
        );
        dataNode = undefined;
    // - Successfully fetched the anomaly data
    }
    if (result.length !== 0) {

      // Apply the selected filters to the data
      const data = this.filterData(result, filters);

      // Activate the filter control
      filterControl = (
        <FilterControl
          filteredTotal={data.length}
          unfilteredTotal={result.length}
          onClick={this._onfilterLayerActivate} />
      );

      switch (info.type) {
        case "Resolver":
          dataNode = (
            <ResolverDataView 
              info={info}
              data={data} 
              onApplyFilter={this.toggleFilter} />
          );
          break;
        case "Domain":
          dataNode = (
            <DomainDataView 
              info={info}
              data={data} 
              onApplyFilter={this.toggleFilter} />
          );
          break;
        default:
          errorNode = (
            <Notification status='critical' size='small'
              message='This anomaly type is not supported.' />
          );
      };

    }

    // Define an additional layer to display the active data filters
    let filterLayer;
    if (filterLayerActive) {
      filterLayer = (
        <DataFilter onClose={this._onfilterLayerDeactivate} 
          query_id={id} filters={filters} />
      );
    }

    let timeRange;
    if (moment.unix(info.start).dayOfYear() === moment.unix(info.end).dayOfYear())
      timeRange = `${moment.unix(info.start).format("ddd D MMM HH:mm:ss")} - ${moment.unix(info.end).format("HH:mm:ss")}`;
    else
      timeRange = `${moment.unix(info.start).format("ddd D MMM HH:mm:ss")} - ${moment.unix(info.end).format("HH:mm:ss")}`;

    return (
      <Article>
        <Header size='large' pad={{ horizontal: 'small' }}>
          <Box justify='between' direction='row' flex='grow'>
            <Box direction='row' align="center" flex='shrink'>
              <Button icon={<LinkPreviousIcon />} secondary={true} onClick={() => window.history.back()} />
            </Box>
            <Title responsive={false}>
              <NavControl />
              <Box direction='column' align="center">
                <span>Data for {info.subject}</span>
                <Label margin='none'>
                  { timeRange }
                </Label>
              </Box>
            </Title>
            <Box direction='row' align="center">
              {filterControl}
            </Box>
          </Box>
        </Header>
        {errorNode}
        {loadingNode}
        {dataNode}
        {filterLayer}
      </Article>
    );
  }
}

AnomalyData.propTypes = {
  dispatch: PropTypes.func.isRequired,
  error: PropTypes.object,
  id: PropTypes.string,
  info: PropTypes.object,
  state: PropTypes.string.isRequired,
  result: PropTypes.arrayOf(PropTypes.object),
  filters: PropTypes.object
};

const select = (state, props) => {
  return ({ 
    ...state.data.queries.queries.find(q => String(q.id) === props.params.id) 
  })
};

export default connect(select)(AnomalyData);
