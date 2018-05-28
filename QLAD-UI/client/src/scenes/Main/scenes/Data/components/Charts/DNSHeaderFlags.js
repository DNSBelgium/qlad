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

import { Box } from 'grommet';
import MeterChart from 'components/MeterChart';

const DNSHeaderFlags = ({data, onApplyFilter}) => {

    return (
        <Box direction='row' wrap={true} margin="small"
          pad={{ horizontal: 'medium', vertical:'small', between:'medium'}}
          justify='start'>
          <MeterChart data={data} kei="opcode" onClick={onApplyFilter}
            value2labelMap={{
              0:	"Query",
              1:	"IQuery",
              2:	"Status",
              3:	"Unassigned",
              4:	"Notify",
              5:	"Update"
            }} />
          <MeterChart data={data} kei="rcode" onClick={onApplyFilter}
            value2labelMap={{
              0:	"No Error",
              1:	"Format Error",
              2:	"Server Failure",
              3:	"Non-Existent Domain",
              4:	"Not Implemented",
              5:	"Query Refused",
              6:	"Name Exists when it should not",
              7:	"RR Set Exists when it should not",
              8:	"RR Set that should exist does not",
              9:	"Not Authorized",
              10:	"Name not contained in zone",
              16:	"Bad OPT Version",
              17:	"Key not recognized",
              18:	"Signature out of time window",
              19:	"Bad TKEY Mode",
              20:	"Duplicate key name",
              21:	"Algorithm not supported",
              22:	"Bad Truncation",
              23:	"Bad/missing Server Cookie"
            }} />
          <MeterChart data={data} kei="aa" onClick={onApplyFilter}/>
          <MeterChart data={data} kei="tc" onClick={onApplyFilter}/>
          <MeterChart data={data} kei="rd" onClick={onApplyFilter}/>
          <MeterChart data={data} kei="ra" onClick={onApplyFilter}/>
          <MeterChart data={data} kei="cd" onClick={onApplyFilter}/>
          <MeterChart data={data} kei="ad" onClick={onApplyFilter}/>
        </Box>
    );
};

DNSHeaderFlags.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  onApplyFilter: PropTypes.func
};

export default DNSHeaderFlags;
