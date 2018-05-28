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
import SQLParser from 'sql-parser'

import {
  Box,
  Paragraph,
  Heading,
  Header,
  Button,
  Form,
  Footer,
  FormField,
  TextInput,
  Layer,
  List,
  Menu,
  Anchor,
  ListItem
} from 'grommet';
import ListPlaceholder from 'grommet-addons/components/ListPlaceholder';
import Spinning from 'grommet/components/icons/Spinning';
import MenuIcon from 'grommet/components/icons/base/Menu';
import { 
  getSavedQueries, 
  unloadSavedQueries, 
  updateSavedQuery, 
  deleteSavedQuery
} from 'data/queries/actions'


class SavedQueries extends Component {

  constructor(props) {
    super(props);
    this.state = {
      editQuery: undefined,
      editQueryErrors: {}
    };
    this.handleDeleteQuery = this.handleDeleteQuery.bind(this);
    this.handleEditQueryInitial = this.handleEditQueryInitial.bind(this);
    this.handleEditQueryChange = this.handleEditQueryChange.bind(this);
    this.handleEditQueryFinal = this.handleEditQueryFinal.bind(this);
    this.getActionControls = this.getActionControls.bind(this);
  }

  componentDidMount() {
    this.props.dispatch(getSavedQueries());
  }

  componentWillUnmount() {
    this.props.dispatch(unloadSavedQueries());
  }

  handleEditQueryInitial(query) {
    this.setState({ editQuery: query });
  }

  handleEditQueryChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    var newEditQuery = Object.assign({}, this.state.editQuery);
    newEditQuery[name] = value;
    this.setState({ editQuery: newEditQuery });
  }

  handleEditQueryFinal() {
    let errors = {};
    let noErrors = true;
    if (! this.state.editQuery.name) {
      errors.name = 'required';
      noErrors = false;
    }
    if (! this.state.editQuery.sql) {
      errors.sql = 'required';
      noErrors = false;
    }
    if (noErrors) {
      let tokens = SQLParser.lexer.tokenize(this.state.editQuery.sql);
      let formattedSQL = SQLParser.parser.parse(tokens).toString();
      var newEditQuery = Object.assign({}, this.state.editQuery);
      newEditQuery.sql = formattedSQL;
      this.props.dispatch(updateSavedQuery(this.state.editQuery._id, newEditQuery))
      this.setState({ editQuery: undefined });
    } else {
      this.setState({editQueryErrors: errors});
    }
  }

  handleDeleteQuery(id, confirm) {
    if (confirm === true) {
      this.props.dispatch(deleteSavedQuery(id));
    }
  }

  getActionControls(query) {
    return (
      <Box>
        <Menu responsive={false}
            icon={<MenuIcon />}
            inline={false}
            primary={false}
            dropAlign={{right: 'right'}}
            size='small'>
          <Anchor onClick={() => this.props.onSubmit(query)}>
            Execute query
          </Anchor>
          <Anchor onClick={() => this.handleEditQueryInitial(query)}>
            Edit query
          </Anchor>
          <Anchor onClick={() => this.handleDeleteQuery(query._id, true)}>
            Delete query
          </Anchor>
        </Menu>
      </Box>
    );
  }

  render() {
    const { queries, status } = this.props;
    const { editQuery, editQueryErrors } = this.state;

    let listNode;
    if (status === 'loading') {
      listNode = (
        <Box direction='row' responsive={false}
          pad={{ between: 'small', horizontal: 'medium', vertical: 'medium' }}>
          <Spinning /><span>Loading...</span>
        </Box>
      );
    } else {
      const queriesNode = (queries || []).slice(0).reverse().map((query, index) => (
        <ListItem key={index} justify='between'>
          <Box direction='column' flex='grow' responsive={false}>
            <Heading tag='h5' strong={true}>{ query.name }</Heading>
            <Box direction='row' flex='grow' justify='between'>
              <Paragraph margin='small'>{query.sql}</Paragraph>
              { this.getActionControls(query) }
            </Box>
          </Box>
        </ListItem>
      ));

      listNode = (
        <List>
          <ListPlaceholder emptyMessage='You do not have any saved queries at the moment.'
            filteredTotal={queries.length}
            unfilteredTotal={queries.length} />
          {queriesNode}
        </List>
      );
    }

    let editQueryForm;
    if (editQuery) {
      editQueryForm = (
        <Layer closer={true} onClose={() => this.setState({ editQuery: undefined })} align='center'>
          <Form pad='large'>
            <Header>
              <Heading>
                Edit Query
              </Heading>
            </Header>
            <FormField label='Query name' error={editQueryErrors.name}>
              <TextInput name='name' onDOMChange={this.handleEditQueryChange} defaultValue={editQuery.name} />
            </FormField>
            <FormField label='SQL' error={editQueryErrors.sql}>
              <textarea name='sql' rows="5" type='text' onChange={this.handleEditQueryChange} defaultValue={editQuery.sql} />
            </FormField>
            <Footer pad={{between: "medium", vertical: "medium"}}>
              <Button label='Run without saving'
                primary={false}
                onClick={() => this.props.onSubmit({sql: editQuery.sql})} />
              <Button label='Save'
                primary={true}
                onClick={() => this.handleEditQueryFinal()} />
            </Footer>
          </Form>
        </Layer>
      );
    }

    return (
      <div>
        {listNode}
        {editQueryForm}
      </div>
    );
  }
}

SavedQueries.propTypes = {
  dispatch: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  queries: PropTypes.arrayOf(PropTypes.object),
  status: PropTypes.string
};

const select = state => ({
  queries: state.data.queries.saved_queries,
  status: state.data.queries.saved_queries_status
});

export default connect(select)(SavedQueries);
