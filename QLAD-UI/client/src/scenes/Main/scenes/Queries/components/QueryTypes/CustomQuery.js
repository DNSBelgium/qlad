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
import SQLParser from 'sql-parser'

import {
  Box,
  Button,
  Footer,
  Form,
  FormField,
  Paragraph
} from 'grommet';
import PlayIcon from 'grommet/components/icons/base/Play';


class CustomQuery extends Component {

  constructor(props) {
    super(props);
    this.state = {
      value: '',
      error: undefined
    };
    this.handleSQLChange = this.handleSQLChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSQLChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    try {
      let tokens = SQLParser.lexer.tokenize(this.state.value);
      let formattedSQL = SQLParser.parser.parse(tokens).toString();
      this.setState({value: formattedSQL, error: undefined});
      this.props.onSubmit({ sql: formattedSQL });
    } catch (error) {
      // send anyway; parser is not perfect
      this.props.onSubmit({ sql: this.state.value });
      this.setState({ error: error.message });
    } finally {
      event.preventDefault();
    }
  }

  render() {
    return (
        <Form plain={true} onSubmit={this.handleSubmit}>
          <FormField label="SQL"
              htmlFor="sql"
              style={{"width":"100%"}}
              error={this.state.error}>
            <textarea rows="6"
              placeholder="SELECT * FROM `dns.queries` WHERE ..."
              value={this.state.value}
              onChange={this.handleSQLChange} />
          </FormField>
          <Footer align="start">
            <Paragraph size='small' margin='small'>
              Note: This query will only return the first 1024 results.
            </Paragraph>
            <Box direction='row'
              justify='end' flex='grow'
              pad={{ vertical: "medium"}}>
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

CustomQuery.propTypes = {
  onSubmit: PropTypes.func.isRequired
};


export default CustomQuery;
