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

import { deleteFilter } from 'data/queries/actions'

import {
  Button,
  Header,
  Heading,
  Layer,
  List,
  ListItem,
  Section,
  Sidebar
} from 'grommet';
import ListPlaceholder from 'grommet-addons/components/ListPlaceholder';
import CloseIcon from 'grommet/components/icons/base/Close';
import TrashIcon from 'grommet/components/icons/base/Trash';


class DataFilter extends Component {

  constructor () {
    super();
    this._delFilter = this._delFilter.bind(this);
  }

  _delFilter(key) {
    this.props.dispatch(deleteFilter(this.props.query_id, key));
  }

  render () {
    const filters = this.props.filters;

    const filtersText = Object.keys(filters || {}).map((key) => (
        <ListItem key={key} justify='between'>
          <span><strong>{key}</strong>: {filters[key]}</span>
          <Button icon={<TrashIcon size='small' />} onClick={() => this._delFilter(key)} />
        </ListItem>
      ));

    return (
      <Layer align='right' flush={true} closer={false}
        a11yTitle='AnomaliesFilter'>
        <Sidebar size='medium'>
          <div>
            <Header size='large' justify='between' align='center'
              pad={{ horizontal: 'medium', vertical: 'medium' }}>
              <Heading tag='h2' margin='none'>Filters</Heading>
              <Button icon={<CloseIcon />} plain={true}
                onClick={this.props.onClose} />
            </Header>
            <Section pad={{ horizontal: 'none', vertical: 'small' }}>
              <List>
                {filtersText}
                <ListPlaceholder
                    emptyMessage='You do not have any filters at the moment.'
                    unfilteredTotal={Object.keys(filters).length}
                    filteredTotal={Object.keys(filters).length} />
              </List>
            </Section>
          </div>
        </Sidebar>
      </Layer>
    );
  }
}

DataFilter.propTypes = {
  query_id: PropTypes.string.isRequired,
  filters: PropTypes.object.isRequired,
  onClose: PropTypes.func
};

export default connect()(DataFilter);
