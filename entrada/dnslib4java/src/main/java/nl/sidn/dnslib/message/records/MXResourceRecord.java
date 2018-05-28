/*
 * ENTRADA, a big data platform for network data analytics
 *
 * Copyright (C) 2016 SIDN [https://www.sidn.nl]
 * 
 * This file is part of ENTRADA.
 * 
 * ENTRADA is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * ENTRADA is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with ENTRADA.  If not, see [<http://www.gnu.org/licenses/].
 *
 */	
package nl.sidn.dnslib.message.records;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

import nl.sidn.dnslib.message.util.DNSStringUtil;
import nl.sidn.dnslib.message.util.NetworkData;

public class MXResourceRecord extends AbstractResourceRecord {
	
	private static final long serialVersionUID = 1L;
	
	private char preference;
	private String exchange;
	

	@Override
	public void decode(NetworkData buffer) {
		super.decode(buffer);
		
		preference = buffer.readUnsignedChar();
		
		exchange = DNSStringUtil.readName(buffer);
		
	}

	@Override
	public void encode(NetworkData buffer) {
		super.encode(buffer);
		
		//write rdlength exchange lentg + prefix and postfix and 2 bytes for preference
		
		buffer.writeChar(exchange.length() + 2 + 2);
		
		//write prefs
		buffer.writeChar(preference);
		
		DNSStringUtil.writeName(exchange, buffer);
	}
	
	public String getCacheId(){
		return null;
	}

	@Override
	public String toString() {
		return "MXResourceRecord [preference=" + (int)preference + ", exchange="
				+ exchange + "]";
	}

	@Override
	public String toZone(int maxLength) {
		return super.toZone(maxLength) + "\t" + (int)preference + " " + exchange;
	}
	
	@Override
	public JsonObject toJSon(){
		JsonObjectBuilder builder = super.createJsonBuilder();
		return builder.
			add("rdata", Json.createObjectBuilder().
				add("preference", (int)preference).
				add("exchange", exchange)).
			build();
	}
	
}
