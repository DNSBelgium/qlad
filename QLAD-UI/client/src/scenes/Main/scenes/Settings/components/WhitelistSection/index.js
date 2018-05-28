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
import Button from 'grommet/components/Button';
import EditIcon from 'grommet/components/icons/base/Edit';
import SettingsListItem from '../SettingsListItem';

const WhitelistSection = (props) => {
	const { onOpen } = props;

  let control = (
    <Button icon={<EditIcon />}  onClick={onOpen} />
  );
  let contents = (
    <span>
    A list with IP addresses, domain names and ASN that can be trusted.
    </span>
  );
  return (
    <SettingsListItem key="whitelist" control={control} first={true}>
      <strong>Whitelist</strong>
      {contents}
    </SettingsListItem>
  );
};

WhitelistSection.propTypes = {
  onOpen: PropTypes.func
};

export default WhitelistSection;
