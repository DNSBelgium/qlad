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
import moment from 'moment';
import json2csv from 'json2csv';

import {
  Box,
  Paragraph,
  Heading,
  Header,
  Button,
  Layer,
  Form,
  Footer,
  FormField,
  TextInput,
  List,
  Menu,
  Anchor,
  ListItem,
  Table,
  TableHeader,
  TableRow
} from 'grommet';
import ListPlaceholder from 'grommet-addons/components/ListPlaceholder';
import Spinning from 'grommet/components/icons/Spinning';
import CheckmarkIcon from 'grommet/components/icons/base/Checkmark';
import AlertIcon from 'grommet/components/icons/base/Alert';

import { cancelQuery } from 'data/queries/actions'



class QueryResultList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showResults: false,
      results: undefined,
      saveQuery: undefined,
      saveQueryErrors: {}
    };
    this.handleShowResults = this.handleShowResults.bind(this);
    this.handleHideResults = this.handleHideResults.bind(this);
    this.handleSaveQueryInitial = this.handleSaveQueryInitial.bind(this);
    this.handleSaveQueryChange = this.handleSaveQueryChange.bind(this);
    this.handleSaveQueryFinal = this.handleSaveQueryFinal.bind(this);
    this.getActionControls = this.getActionControls.bind(this);
  }

  handleShowResults(data) {
    this.setState({showResults: true, results: data});
  }

  handleHideResults() {
    this.setState({showResults: false});
  }

  handleDownloadAsCSV(data) {
    try {
      let csvContent;
      if ((data || []).length > 0) {
        var fields = Object.keys(data[0]);
        csvContent = json2csv({ data: data, fields: fields });
      } else {
        csvContent = "No results";
      }
      var a = document.createElement('a');
      a.id = 'downloadlink';
      a.textContent = 'download';
      a.download = "data.csv";
      a.href = 'data:text/csv;charset=utf-8,'+escape(csvContent);
      // a.style = 'display: none' // gives error in webkit
      document.body.appendChild(a);
      a.click();
      document.getElementById("downloadlink").remove();
    } catch (err) {
      // Errors are thrown for bad options, or if the data is empty and no fields are provided.
      // Be sure to provide fields if it is possible that your data array will be empty.
      console.error(err);
    }
  }

  handleSaveQueryInitial(query) {
    this.setState({ saveQuery: query });
  }

  handleSaveQueryChange(event) {
    var newSaveQuery = Object.assign({}, this.state.saveQuery);
    newSaveQuery.name = event.target.value;
    this.setState({ saveQuery: newSaveQuery });
  }

  handleSaveQueryFinal() {
    let errors = {};
    let noErrors = true;
    if (! this.state.saveQuery.name) {
      errors.name = 'required';
      noErrors = false;
    }
    if (! this.state.saveQuery.sql) {
      errors.sql = 'required';
      noErrors = false;
    }
    if (noErrors) {
      this.props.onSave(this.state.saveQuery);
      this.setState({ saveQuery: undefined });
    } else {
      this.setState({ saveQueryErrors: errors });
    }
  }

  handleCancelQuery(query) {
    this.props.dispatch(cancelQuery(query))
  }

  getActionControls(query) {
    if (query.state === 'CANCELLED') {
      return (
        <Box>
          <Menu responsive={false}
            icon={<AlertIcon />}
            inline={false}
            primary={false}
            dropAlign={{right: 'right'}}
            size='small'>
              Cancelled query
          </Menu>
        </Box>
      );
    } else if (query.state === 'PROCESSING') {
      return (
        <Box>
          <Menu responsive={false}
            icon={<Spinning />}
            inline={false}
            primary={false}
            dropAlign={{right: 'right'}}
            size='small'>
            <Anchor onClick={() => this.handleCancelQuery(query)}>
              Cancel query
            </Anchor>
          </Menu>
        </Box>
      );
    } else if (query.state === 'SUCCESS') {
      let visualiseDataOption;
      if (query.info && query.info.type && query.result.length) {
        visualiseDataOption = (
            <Anchor path={`/data/${query.id}`}>
              Visualise data
            </Anchor>
        );
      }
      let showDataOption, downloadDataOption;
      if (query.result.length) {
        showDataOption = (
          <Anchor onClick={() => this.handleShowResults(query.result)}>
            Show data
          </Anchor>
        );
        downloadDataOption = (
          <Anchor onClick={() => this.handleDownloadAsCSV(query.result)}>
            Download as CSV
          </Anchor>
        );
      } else {
        showDataOption = (
          <Anchor onClick={() => this.handleShowResults(query.result)}>
            No data found
          </Anchor>
        );
      }
      return (
        <Box>
          <Menu responsive={false}
            icon={<CheckmarkIcon />}
            inline={false}
            primary={false}
            dropAlign={{right: 'right'}}
            size='small'>
            { visualiseDataOption }
            { showDataOption }
            { downloadDataOption }
            <Anchor onClick={() => this.handleSaveQueryInitial(query)}>
              Save query
            </Anchor>
          </Menu>
        </Box>
      );
    } else if (query.state === "FAILED") {
      return (
        <Box>
          <Menu responsive={false}
            icon={<AlertIcon />}
            inline={false}
            primary={false}
            dropAlign={{right: 'right'}}
            size='small'>
            Could not execute the query: {query.error.message}
          </Menu>
        </Box>
      );
    }
  }

  render() {
    const { queries } = this.props;
    const { showResults, results, saveQuery, saveQueryErrors } = this.state;

    const queriesNode = (queries || []).slice(0).reverse().map((query, index) => (
      <ListItem key={index} justify='between'>
        <Box direction='column' flex='grow' responsive={false}>
          <Heading tag='h5' strong={true}>{ moment(query.date).fromNow() }</Heading>
          <Box direction='row' flex='grow' justify='between'>
            <Paragraph margin='small'>{query.sql}</Paragraph>
            { this.getActionControls(query) }
          </Box>
        </Box>
      </ListItem>
    ));

    const listNode = (
      <List>
        <ListPlaceholder emptyMessage='You do not have any queries at the moment.'
          filteredTotal={queries.length}
          unfilteredTotal={queries.length} />
        {queriesNode}
      </List>
    );

    let saveQueryForm;
    if (saveQuery) {
      saveQueryForm = (
        <Layer closer={true} onClose={() => this.setState({ saveQuery: undefined })} align='center'>
          <Form pad='large'>
            <Header>
              <Heading>
                Save Query
              </Heading>
            </Header>
            <FormField label='Query name' error={saveQueryErrors.name}>
              <TextInput onDOMChange={this.handleSaveQueryChange} />
            </FormField>
            <FormField label='SQL' error={saveQueryErrors.sql}>
              <textarea rows="5" type='text' value={saveQuery.sql} disabled={true} />
            </FormField>
            <Footer pad={{"vertical": "medium"}}>
              <Button label='Save'
                primary={true}
                onClick={() => this.handleSaveQueryFinal()} />
            </Footer>
          </Form>
        </Layer>
      );
    }

    let resultsLayer;
    let resultsTable;
    if ((results || []).length > 0) {
      var keys = Object.keys(results[0]);
      resultsTable = (
          <Table scrollable={true} responsive={false}>
            <TableHeader labels={keys} />
            <tbody>
            { (results || []).map((result, index) =>
                <TableRow key={index}>
                { keys.map((key, index) =>
                  <td key={index}>{ result[key] || undefined }</td>
                ) }
                </TableRow>
              )
            }
            </tbody>
          </Table>
      );
    } else {
      resultsTable = "No results";
    }

    if (showResults) {
      resultsLayer = (
        <Layer closer={true}
          onClose={() => this.handleHideResults()}>
          <Box margin='medium'>
            { resultsTable }
          </Box>
        </Layer>
      )
    }

    return (
      <div>
        {listNode}
        {resultsLayer}
        {saveQueryForm}
      </div>
    );
  }
}

QueryResultList.propTypes = {
  dispatch: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  queries: PropTypes.arrayOf(PropTypes.object)
};

const select = state => ({ ...state.data.queries });

export default connect(select)(QueryResultList);
