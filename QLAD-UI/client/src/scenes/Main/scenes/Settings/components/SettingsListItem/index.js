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
import ListItem from 'grommet/components/ListItem';
import Box from 'grommet/components/Box';

export default (props) => {

  return (
    <ListItem
      pad={{vertical: 'medium', horizontal: 'medium', between: 'medium'}}
      justify="between" align="center" responsive={false}
      separator={props.first ? 'horizontal' : 'bottom'}>
      <Box>
        {props.children}
      </Box>
      {props.control}
    </ListItem>
  );
};
