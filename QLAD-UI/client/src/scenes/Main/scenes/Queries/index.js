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

import { submitQuery, saveQuery } from 'data/queries/actions';

import {
  Anchor,
  Article,
  Box,
  Header,
  Menu,
  Notification,
  Tab,
  Tabs,
  Toast,
  Title
} from 'grommet';
import NavControl from '../../components/NavControl';
import QueryDoc from './components/QueryDoc';
import SavedQueries from './components/SavedQueries';
import QueryResultList from './components/QueryResultList';
import CustomQuery from './components/QueryTypes/CustomQuery';
import ResolverQuery from './components/QueryTypes/ResolverQuery';
import DomainQuery from './components/QueryTypes/DomainQuery';


const QUERY_TYPES = {
  Custom: CustomQuery,
  Resolver: ResolverQuery,
  Domain: DomainQuery
};

class Queries extends Component {

  constructor(props) {
    super(props);
    this.state = {
      activeTab: 0,
      queryType: "Custom",
      toast: {
        show: false
      }
    };
    this.handleTabChange = this.handleTabChange.bind(this);
    this.handleQuerySubmit = this.handleQuerySubmit.bind(this);
    this.handleQuerySave = this.handleQuerySave.bind(this);
    this.changeQueryType = this.changeQueryType.bind(this);
  }

  handleTabChange(index) {
    this.setState({ activeTab: index });
  }

  handleQuerySubmit(query, paginate = false) {
    this.props.dispatch(submitQuery(query, paginate))
      .then(() => this.setState({
        toast: {
          show: true,
          status: "ok",
          text: "Query submitted for execution. See the Results tab."
        }}));
  }

  handleQuerySave(query) {
    this.props.dispatch(saveQuery(query))
      .then(() => this.setState({
        toast: {
          show: true,
          status: "ok",
          text: "Query is saved."
        }}));
  }

  changeQueryType(newQueryType) {
    this.setState({ queryType: newQueryType });
  }

  renderQueryTypeForm () {
    let form;
    if (this.state.queryType) {
      const Form = QUERY_TYPES[this.state.queryType];
      form = <Form onSubmit={this.handleQuerySubmit} />;
    }
    return form;
  }

  render() {
    const { error } = this.props;
    const { activeTab, queryType, toast } = this.state;

    let errorNode;
    if (error) {
      errorNode = (
        <Notification status='critical' size='large' state={error.message}
          message='An unexpected error happened, please try again later' />
      );
    }

    let toastNode;
    if (toast.show) {
      toastNode = (
        <Toast status={toast.status}
          onClose={() => this.setState({ toast: {show:false}})}>
          { toast.text }
        </Toast>
      );
    }

    let queryTypeForm = this.renderQueryTypeForm();

    return (
      <Article primary={true}>
        { toastNode }
        <Header size='large' pad={{ horizontal: 'medium' }}>
          <Box justify='between' direction='row' flex='grow'>
            <Title responsive={false}>
              <NavControl />
              <span>Queries</span>
            </Title>
            <Box direction='row' align="center">
              <Menu responsive={false}
                label={`Query type: ${queryType}`}
                inline={false}
                primary={true}
                closeOnClick={true}
                direction='row'>
                <Anchor onClick={() => this.changeQueryType("Custom")}>
                  Custom
                </Anchor>
                <Anchor onClick={() => this.changeQueryType("Resolver")}>
                  Resolver 
                </Anchor>
                <Anchor onClick={() => this.changeQueryType("Domain")}>
                  Domainname
                </Anchor>
              </Menu>
            </Box>
          </Box>
        </Header>
        { errorNode }
        <Box direction='column' flex='grow' pad="medium">
          { queryTypeForm }
          <Tabs justify='start' responsive={false} activeIndex={activeTab}
            onActive={this.handleTabChange}>
            <Tab title='Documentation'>
              <QueryDoc />
            </Tab>
            <Tab title='Saved queries'>
              <SavedQueries onSubmit={this.handleQuerySubmit} />
            </Tab>
            <Tab title='Results'>
              <QueryResultList onSave={this.handleQuerySave} />
            </Tab>
          </Tabs>
        </Box>
      </Article>
    );
  }
}

Queries.propTypes = {
  dispatch: PropTypes.func.isRequired,
  error: PropTypes.object
};

let select = (state) => ({ error: state.data.queries.error });

export default connect(select)(Queries);
