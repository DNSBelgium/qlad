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
import { connect } from 'react-redux';

import {
  loadAnomalies,
  unloadAnomalies,
  queryAnomalies,
  moreAnomalies,
  selectAnomaly,
  deselectAnomaly
} from 'data/anomalies/actions';

import {
  Box,
  Header,
  Title,
  Section,
  Label,
  Search,
  Notification,
  Tiles
} from 'grommet';
import ListPlaceholder from 'grommet-addons/components/ListPlaceholder';
import FilterControl from 'grommet-addons/components/FilterControl';
import Query from 'grommet-addons/utils/Query';
import NavControl from '../../components/NavControl';
import AnomalyTile from './components/AnomalyTile';
import AnomalyFilter from './components/AnomalyFilter';
import AnomalyDetails from './components/AnomalyDetails';


const NOW = moment().toDate();
const TODAY = moment().startOf('day').toDate();
const LAST_7 = moment().subtract(1, 'week').toDate();
const LAST_30 = moment().subtract(1, 'month').toDate();

const SECTIONS = {
  most_recent: [
    {label: 'Today', value: TODAY},
    {label: 'Last 7 days', value: LAST_7},
    {label: 'Last 30 days', value: LAST_30},
    {label: 'Earlier'}
  ]
};

class Anomalies extends Component {

  constructor() {
    super();
    this._onSearch = this._onSearch.bind(this);
    this._onMore = this._onMore.bind(this);
    this._onFilterActivate = this._onFilterActivate.bind(this);
    this._onFilterDeactivate = this._onFilterDeactivate.bind(this);
    this._deselect = this._deselect.bind(this);
    this.state = { searchText: '' };
  }

  componentDidMount() {
    this.props.dispatch(loadAnomalies({
      sort: 'most_recent:desc'
    }));
  }

  componentWillUnmount() {
    this.props.dispatch(unloadAnomalies());
  }

  _onSearch(event) {
    const { anomalies } = this.props;
    const searchText = event.target.value;
    this.setState({ searchText });
    const query = new Query(searchText);
    this.props.dispatch(queryAnomalies(anomalies, query));
  }

  _onMore() {
    const { anomalies } = this.props;
    this.props.dispatch(moreAnomalies(anomalies));
  }

  _onFilterActivate() {
    this.setState({ filterActive: true });
  }

  _onFilterDeactivate() {
    this.setState({ filterActive: false });
  }

  _select(subject, type) {
    return () => {
      this.props.dispatch(selectAnomaly(subject, type));
    };
  }

  _deselect() {
    this.props.dispatch(deselectAnomaly());
  }

  _renderSection(label, items=[], onMore) {
    const tiles = items.map((item, index) => (
      <AnomalyTile key={item.subject} item={item} index={index}
        onClick={this._select(item.subject, item.type)}/>
    ));
    let header;
    if (label) {
      header = (
        <Header size='small' justify='start' responsive={false}
          separator='top' pad={{ horizontal: 'small' }}>
         <Label size='small'>{label}</Label>
        </Header>
      );
    }
    return (
      <Section key={label || 'section'} pad='none'>
        {header}
        <Tiles flush={false} fill={false} selectable={true} onMore={onMore}>
          {tiles}
        </Tiles>
      </Section>
    );
  }

  _renderSections(sortProperty, sortDirection) {
    const { anomalies } = this.props;
    const result = anomalies.result || { items: [] };
    const items = result.items.slice() || []; // slice() to make a copy
    let sections = [];

    SECTIONS[sortProperty].forEach((section) => {

      let sectionValue = section.value;
      if (sectionValue instanceof Date) {
        sectionValue = sectionValue.getTime();
      }
      let sectionItems = [];

      while (items.length > 0) {
        const item = items[0];
        let itemValue = (item.hasOwnProperty(sortProperty) ?
          item[sortProperty] : item.attributes[sortProperty]);
        if (itemValue instanceof Date) {
          itemValue = itemValue.getTime();
        }

        if (undefined === sectionValue ||
          ('asc' === sortDirection && itemValue <= sectionValue) ||
          ('desc' === sortDirection && itemValue >= sectionValue)) {
          // item is in section
          sectionItems.push(items.shift());
        } else {
          // done
          break;
        }
      }

      if (sectionItems.length > 0) {
        let onMore;
        if (items.length === 0 && result.count > 0 && result.count < result.total) {
          onMore = this._onMore;
        }
        sections.push(this._renderSection(section.label, sectionItems, onMore));
      }
    });

    return sections;
  }

  render() {
    const { anomalies } = this.props;
    const { filterActive, searchText } = this.state;
    const result = anomalies.result || { total: 0, unfilteredTotal: 0 };

    let errorNode;
    if (anomalies.error) {
      errorNode = (
          <Notification status='critical' size='small' state={anomalies.error.message}
            message='An unexpected error happened.' />
        );
    }

    let sections;
    let sortProperty, sortDirection;
    if (anomalies.sort) {
      [ sortProperty, sortDirection ] = anomalies.sort.split(':');
    }
    if (sortProperty && SECTIONS[sortProperty]) {
      sections = this._renderSections(sortProperty, sortDirection);
    } else {
      let onMore;
      if (result.count > 0 && result.count < result.total) {
        onMore = this._onMore;
      }
      sections = this._renderSection(undefined, result.items, onMore);
    }

    let filterLayer;
    if (filterActive) {
      filterLayer = <AnomalyFilter onClose={this._onFilterDeactivate} />;
    }

    let detailLayer;
    if (anomalies.selection) {
      detailLayer = <AnomalyDetails onClose={this._deselect} />;
    }

    return (
      <Box>
        <Header size='large' pad={{ horizontal: 'medium' }}>
          <Title responsive={false}>
            <NavControl />
            <span>Anomalies</span>
          </Title>
          <Search inline={true} fill={true} size='medium' placeHolder='Search'
            value={searchText} onDOMChange={this._onSearch} />
          <FilterControl filteredTotal={result.total}
            unfilteredTotal={result.unfilteredTotal}
            onClick={this._onFilterActivate} />
        </Header>
        {errorNode}
        {sections}
        <ListPlaceholder filteredTotal={result.total}
          unfilteredTotal={result.unfilteredTotal}
          emptyMessage='There are no anomalies at the moment.'
          />
        {filterLayer}
        {detailLayer}
      </Box>
    );
  }
}

Anomalies.propTypes = {
  anomalies: PropTypes.object
};

let select = (state) => ({
  anomalies: state.data.anomalies
});

export default connect(select)(Anomalies);
