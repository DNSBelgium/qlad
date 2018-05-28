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

import nl.sidn.dnslib.message.util.NetworkData;

import org.apache.commons.codec.binary.Hex;

public class SSHFPResourceRecord extends AbstractResourceRecord {
	
	private static final long serialVersionUID = 1L;
	
	private short algorithm;
	private short fingerprintType;
	private byte[] fingerprint;

	

	@Override
	public void decode(NetworkData buffer) {
		super.decode(buffer);
			
		algorithm = buffer.readUnsignedByte();
		
		fingerprintType = buffer.readUnsignedByte();
		
		fingerprint = new byte[rdLength-2];
		buffer.readBytes(fingerprint);
	}

	@Override
	public void encode(NetworkData buffer) {
		super.encode(buffer);
		
		//write rdlength
		buffer.writeChar(rdLength);
		
		buffer.writeBytes(rdata);
	}

	public short getAlgorithm() {
		return algorithm;
	}

	public void setAlgorithm(short algorithm) {
		this.algorithm = algorithm;
	}

	public short getFingerprintType() {
		return fingerprintType;
	}

	public void setFingerprintType(short fingerprintType) {
		this.fingerprintType = fingerprintType;
	}

	public byte[] getFingerprint() {
		return fingerprint;
	}

	public void setFingerprint(byte[] fingerprint) {
		this.fingerprint = fingerprint;
	}

	@Override
	public String toString() {
		return "SSHFPResourceRecord [algorithm=" + algorithm
				+ ", fingerprintType=" + fingerprintType + "]";
	}
	
	@Override
	public JsonObject toJSon(){
		JsonObjectBuilder builder = super.createJsonBuilder();
		return builder.
			add("rdata", Json.createObjectBuilder().
				add("algorithm", algorithm).
				add("fptype", fingerprintType).
				add("fingerprint", Hex.encodeHexString(fingerprint))).
			build();
	}
	
}
