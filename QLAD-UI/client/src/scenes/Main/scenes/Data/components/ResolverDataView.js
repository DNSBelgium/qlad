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

import IPinfo from 'components/IPinfo';
import QueryTypeChart from './Charts/QueryTypeChart';
import QueryNameChart from './Charts/QueryNameChart';
import DNSHeaderFlags from './Charts/DNSHeaderFlags';
import IPHeaderFlags from './Charts/IPHeaderFlags';
import PacketSizeChart from './Charts/PacketSizeChart';
import ServerChart from './Charts/ServerChart';


const ResolverDataView = ({info, data, onApplyFilter}) => {

  // Define the visualisations
  return (
    <Box>
      <Section key='General info' pad='none'>
        <Header size='small' justify='start' responsive={false}
          separator='top' pad={{ horizontal: 'medium', vertical:'none' }}>
         <Label size='small'>General information</Label>
        </Header>
        <IPinfo ip={info.subject} showMap={true} />
      </Section>

      <Section key='QTypes' pad='none'>
        <Header size='small' justify='start' responsive={false}
          separator='top' pad={{ horizontal: 'medium', vertical:'none' }}>
         <Label size='small'>Query Types</Label>
        </Header>
        <QueryTypeChart data={data}
          fixedDomain={[info.start*1000, info.end*1000]}
          onClick={onApplyFilter} />
      </Section>

      <Section key='Query names' pad='none'>
        <Header size='small' justify='start' responsive={false}
          separator='top' pad={{ horizontal: 'medium', vertical:'none' }}>
         <Label size='small'>Query Names</Label>
        </Header>
        <QueryNameChart data={data} onClick={onApplyFilter} />
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
        <ServerChart data={data} groupKeys={['src']} onApplyFilter={onApplyFilter} />
      </Section>


    </Box>
  );
}

ResolverDataView.propTypes = {
  info: PropTypes.object.isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  onApplyFilter: PropTypes.func.isRequired
};

export default ResolverDataView;
