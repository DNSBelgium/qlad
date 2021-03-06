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

import {
  Box,
  Header,
  Section,
  Label,
} from 'grommet';

import QueryTypeChart from './Charts/QueryTypeChart';
import WorldMap from './Charts/WorldMap';
import PacketSizeChart from './Charts/PacketSizeChart';
import DNSHeaderFlags from './Charts/DNSHeaderFlags';
import IPHeaderFlags from './Charts/IPHeaderFlags';
import QuerySourceChart from './Charts/QuerySourceChart';
import ServerChart from './Charts/ServerChart';


const DoaminDataView = ({info, data, onApplyFilter}) => {

  // Define the visualisations
  return (
    <Box>

      <Section key='QTypes' pad='none'>
        <Header size='small' justify='start' responsive={false}
          separator='top' pad={{ horizontal: 'medium', vertical:'none' }}>
         <Label size='small'>Query Types</Label>
        </Header>
        <QueryTypeChart data={data} fixedDomain={[info.start*1000, info.end*1000]} onClick={onApplyFilter} />
      </Section>


      <Section key='Location' pad='none'>
        <Header size='small' justify='start' responsive={false}
        separator='top' pad={{ horizontal: 'medium', vertical:'none' }}>
          <Label size='small'>Geographical locations</Label>
        </Header>
        <Box direction='row' wrap={true} margin="small"
        pad={{ horizontal: 'medium', vertical:'small', between:'medium'}}
        justify='start'>
          <WorldMap data={data} onApplyFilter={onApplyFilter} />
        </Box>
      </Section>


      <Section key='Sources' pad='none'>
        <Header size='small' justify='start' responsive={false}
          separator='top' pad={{ horizontal: 'medium', vertical:'none' }}>
         <Label size='small'>Traffic sources</Label>
        </Header>
        <Box direction='row' wrap={true} margin="small"
          pad={{ horizontal: 'medium', vertical:'small', between:'medium'}}
          justify='start'>
          <QuerySourceChart data={data} onApplyFilter={onApplyFilter} />
        </Box>
      </Section>

      <Section key='Dns header' pad='none'>
        <Header size='small' justify='start' responsive={false}
          separator='top' pad={{ horizontal: 'medium', vertical:'none' }}>
         <Label size='small'>DNS Header</Label>
        </Header>
        <DNSHeaderFlags data={data} onApplyFilter={onApplyFilter} />
      </Section>

      <Section key='ip layer' pad='none'>
        <Header size='small' justify='start' responsive={false}
          separator='top' pad={{ horizontal: 'medium', vertical:'none' }}>
         <Label size='small'>IP Layer</Label>
        </Header>
        <IPHeaderFlags data={data} onApplyFilter={onApplyFilter} />
      </Section>

      <Section key='Packet sizes' pad='none'>
        <Header size='small' justify='start' responsive={false}
          separator='top' pad={{ horizontal: 'medium', vertical:'none' }}>
         <Label size='small'>Query and response length</Label>
        </Header>
        <PacketSizeChart data={data} onClick={onApplyFilter} />
      </Section>


      <Section key='Servers' pad='none'>
        <Header size='small' justify='start' responsive={false}
          separator='top' pad={{ horizontal: 'medium', vertical:'none' }}>
         <Label size='small'>Servers</Label>
        </Header>
        <ServerChart data={data} groupKeys={['continent', 'countryName', 'asn', 'src']} onApplyFilter={onApplyFilter} />
      </Section>


    </Box>
  );
}

DoaminDataView.propTypes = {
  info: PropTypes.object.isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  onApplyFilter: PropTypes.func.isRequired
};

export default DoaminDataView;
