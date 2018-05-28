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

import java.io.Serializable;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

import nl.sidn.dnslib.message.util.DNSStringUtil;
import nl.sidn.dnslib.message.util.NetworkData;
import nl.sidn.dnslib.types.ResourceRecordClass;
import nl.sidn.dnslib.types.ResourceRecordType;

import org.apache.commons.lang3.StringUtils;

public abstract class AbstractResourceRecord implements ResourceRecord, Serializable {
	
	private static final long serialVersionUID = 1L;
	
	protected String name;
	protected char rawType;
	protected char rawClassz;
	protected ResourceRecordType type;
	protected ResourceRecordClass classz;
	protected long ttl;
	protected char rdLength;
	protected byte[] rdata;

	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public ResourceRecordType getType() {
		return type;
	}
	public void setType(ResourceRecordType type) {
		this.type = type;
	}
	public ResourceRecordClass getClassz() {
		return classz;
	}
	public void setClassz(ResourceRecordClass classz) {
		this.classz = classz;
	}
	public long getTtl() {
		return ttl;
	}
	public void setTtl(long ttl) {
		this.ttl = ttl;
	}
	
	
	
	
	@Override
	public void decode(NetworkData buffer) {
		setName(DNSStringUtil.readName(buffer));
		
		rawType = buffer.readUnsignedChar();
		setType(ResourceRecordType.fromValue(rawType));
		rawClassz = buffer.readUnsignedChar();
		setClassz(ResourceRecordClass.fromValue(rawClassz));
		setTtl(buffer.readUnsignedInt());
		
		//read 16 bits rdlength field 
		rdLength = buffer.readUnsignedChar();
	
		rdata = readRdata(rdLength, buffer);
	}
	
	@Override
	public void encode(NetworkData buffer) {
		DNSStringUtil.writeName(getName(), buffer);
		
		buffer.writeChar(getType().getValue());
		
		buffer.writeChar(getClassz().getValue());
		
		buffer.writeInt((int)getTtl());
	}

	protected byte[] readRdata(int rdlength, NetworkData buffer){
		buffer.markReaderIndex();
		byte[] rdata = new byte[rdlength];
		buffer.readBytes(rdata);
		buffer.resetReaderIndex();
		return rdata;
	}
	
	@Override
	public char getRdlength() {
		return rdLength;
	}
	
	@Override
	public byte[] getRdata() {
		return rdata;
	}
	
	public int getRawType() {
		return (int)rawType;
	}
	
	public int getRawClassz() {
		return (int)rawClassz;
	}
	
	@Override
	public String toZone(int maxLength) {
		int paddedSize = ( maxLength - name.length() ) + name.length();
		String ownerWithPadding = StringUtils.rightPad(name, paddedSize, " ");
		return ownerWithPadding + "\t" + ttl + "\t" + classz + "\t" + type;
	}
	
	public JsonObjectBuilder createJsonBuilder(){
		return Json.createObjectBuilder().
			add("name", name).
			add("type", type.name()).
			add("class", classz.name()).	
			add("ttl", ttl).
			add("rdLength", (int)rdLength);
	}
	
	public JsonObject toJSon(){
		JsonObjectBuilder builder = createJsonBuilder();
		return builder.
			add("rdata", Json.createObjectBuilder().
				add("dummy", "toddo")).
			build();
	}
	@Override
	public String toString() {
		return "AbstractResourceRecord [name=" + name + ", rawType=" + (int)rawType
				+ ", rawClassz=" + (int)rawClassz + ", type=" + type + ", classz="
				+ classz + ", ttl=" + ttl + ", rdLength=" + rdLength + "]";
	}
	
	
}
