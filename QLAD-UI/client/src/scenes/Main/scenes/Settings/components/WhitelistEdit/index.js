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
import { connect } from 'react-redux';

import { updateWhitelist } from 'data/settings/actions';

import LayerForm from 'grommet-templates/components/LayerForm';
import FormField from 'grommet/components/FormField';
import Paragraph from 'grommet/components/Paragraph';


class WhitelistEdit extends React.Component {

  constructor (props) {
    super(props);

    this._onSubmit = this._onSubmit.bind(this);
    this._onChange = this._onChange.bind(this);

    this.state = {
      errors: null,
      text: this._whitelistToText(this.props.whitelist)
    };
  }

  _onSubmit () {
    const { text } = this.state;
    let errors = null;
    let noErrors = true;

    var rules = text.replace(/^\s*[\r\n]/gm, "").split(/\r?\n/);
    var whitelist = rules.filter(str => str.length > 1)
      .map(function(rule, index) {
        var fields = rule.split(":");
        if (fields.length !== 2) {
          errors = `Rule number ${index+1} is invalid`;
          noErrors = false;
          return {};
        } else {
          return { name: fields[0].trim(), filter: fields[1].trim() };
        }
      });

    if (noErrors) {
      this.props.dispatch(updateWhitelist(whitelist));
      this.props.onClose();
    } else {
      this.setState({errors: errors});
    }
  }

  _onChange (event) {
    this.setState({text: event.target.value});
  }

  _whitelistToText(whitelist) {
    let result = '';
    whitelist.map( (item, index) => result += `${item.name}: ${item.filter} \n` );
    return result;
  }

  render () {
    const { text, errors } = this.state;

    const whitelistFields = ( 
      <fieldset>
        <FormField label='Whitelist [name: filter]' htmlFor='whitelist' error={errors}>
          <textarea rows="15" type='text' id='whitelist' name='whitelist' 
            value={text}
            onChange={(e) => { this._onChange(e); }} />
        </FormField>
      </fieldset>
    );

    return (
      <LayerForm title="Whitelist" submitLabel="Save"
        onClose={this.props.onClose} onSubmit={this._onSubmit}>
        <Paragraph>This list defines IP addressess, ASN and domain names
        from which traffic is trusted. Anomalies from a subject that corresponds
        to one of the filters defined in this list are not displayed.</Paragraph>
        {whitelistFields}
      </LayerForm>
    );
  }
}

WhitelistEdit.propTypes = {
};

let select = (state) => ({
  whitelist: state.data.settings.settings.whitelist
});

export default connect(select)(WhitelistEdit);
