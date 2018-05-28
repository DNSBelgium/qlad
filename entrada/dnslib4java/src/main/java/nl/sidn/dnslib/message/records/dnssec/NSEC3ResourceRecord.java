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
package nl.sidn.dnslib.message.records.dnssec;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

import nl.sidn.dnslib.message.records.AbstractResourceRecord;
import nl.sidn.dnslib.message.util.NetworkData;
import nl.sidn.dnslib.types.DigestType;
import nl.sidn.dnslib.types.TypeMap;

import org.apache.commons.codec.binary.Base32;
import org.apache.commons.codec.binary.Hex;

public class NSEC3ResourceRecord extends AbstractResourceRecord {
	
	private static final long serialVersionUID = 1L;
	
	/*
	      The RDATA of the NSEC3 RR is as shown below:

		                        1 1 1 1 1 1 1 1 1 1 2 2 2 2 2 2 2 2 2 2 3 3
		    0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
		   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
		   |   Hash Alg.   |     Flags     |          Iterations           |
		   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
		   |  Salt Length  |                     Salt                      /
		   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
		   |  Hash Length  |             Next Hashed Owner Name            /
		   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
		   /                         Type Bit Maps                         /
		   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
		
		   Hash Algorithm is a single octet.
		
		   Flags field is a single octet, the Opt-Out flag is the least
		   significant bit, as shown below:
		
		    0 1 2 3 4 5 6 7
		   +-+-+-+-+-+-+-+-+
		   |             |O|
		   +-+-+-+-+-+-+-+-+
	 
	 */

	private DigestType hashAlgorithm;
	private short flags;
	private char iterations;
	private short saltLength;
	private byte[] salt;
	private short hashLength;
	private String nexthashedownername;
	protected List<TypeMap> types = new ArrayList<>();
	private boolean optout;
	
	private static final int RDATA_FIXED_FIELDS_LENGTH = 6;
	private static final byte FLAG_OPTOUT_MASK = 0x01; 
	@Override
	public void decode(NetworkData buffer) {
		super.decode(buffer);
	
		short ha = buffer.readUnsignedByte();
		hashAlgorithm = DigestType.fromValue(ha);
		
		flags = buffer.readUnsignedByte();
		optout = (flags & FLAG_OPTOUT_MASK) == FLAG_OPTOUT_MASK;
		iterations = buffer.readUnsignedChar();
		
		saltLength = buffer.readUnsignedByte();
		
		salt = new byte[saltLength];
		if(saltLength > 0){
			buffer.readBytes(salt);
		}
		
		hashLength = buffer.readUnsignedByte();
		byte[] hash = new byte[hashLength];
		if(hashLength > 0){
			buffer.readBytes(hash);
		}
		
		Base32 b32 = new Base32(true);
		nexthashedownername = b32.encodeAsString(hash);
		
		int octetAvailable = rdLength - (RDATA_FIXED_FIELDS_LENGTH + saltLength + hashLength);
		new NSECTypeDecoder().decode(octetAvailable, buffer, types);
			
	}

	@Override
	public void encode(NetworkData buffer) {
		super.encode(buffer);
		
		buffer.writeChar(rdLength);
		
		buffer.writeBytes(rdata);
	}

	@Override
	public String toString() {
		return "NSEC3ResourceRecord ["+ super.toString() + " hashAlgorithm="
				+ hashAlgorithm + ", flags=" + flags + ", iterations="
				+ (int)iterations + ", saltLength=" + saltLength + ", salt="
				+ Arrays.toString(salt) + ", hashLength=" + hashLength
				+ "]";
	}
	
	@Override
	public JsonObject toJSon(){
		JsonObjectBuilder builder = super.createJsonBuilder();
		builder.
			add("rdata", Json.createObjectBuilder().
				add("hash-algorithm", hashAlgorithm.name()).
				add("flags", flags).
				add("iterations", (int)iterations).
				add("salt-length", saltLength).
				add("salt", Hex.encodeHexString(salt)).
				add("hash-length", (int)hashLength).
				add("nxt-own-name", nexthashedownername));
				
				JsonArrayBuilder typeBuilder = Json.createArrayBuilder();
				for (TypeMap type : types) {
					typeBuilder.add(type.getType().name());
				}
			return builder.add("types", typeBuilder.build()).
			build();
	}
	

	public DigestType getHashAlgorithm() {
		return hashAlgorithm;
	}

	public void setHashAlgorithm(DigestType hashAlgorithm) {
		this.hashAlgorithm = hashAlgorithm;
	}

	public short getFlags() {
		return flags;
	}

	public void setFlags(short flags) {
		this.flags = flags;
	}

	public char getIterations() {
		return iterations;
	}

	public void setIterations(char iterations) {
		this.iterations = iterations;
	}

	public short getSaltLength() {
		return saltLength;
	}

	public void setSaltLength(short saltLength) {
		this.saltLength = saltLength;
	}

	public byte[] getSalt() {
		return salt;
	}

	public void setSalt(byte[] salt) {
		this.salt = salt;
	}

	public short getHashLength() {
		return hashLength;
	}

	public void setHashLength(short hashLength) {
		this.hashLength = hashLength;
	}

	public String getNexthashedownername() {
		return nexthashedownername;
	}

	public void setNexthashedownername(String nexthashedownername) {
		this.nexthashedownername = nexthashedownername;
	}

	public List<TypeMap> getTypes() {
		return types;
	}

	public void setTypes(List<TypeMap> types) {
		this.types = types;
	}

	public boolean getOptout() {
		return optout;
	}

	
	@Override
	public String toZone(int maxLength) {
		StringBuffer b = new StringBuffer();
		b.append(super.toZone(maxLength) + "\t" + hashAlgorithm.getValue() + " " + flags + " " +
				+ (int)iterations + " ");
		
		if(saltLength == 0){
			b.append("- ");
		}else{
			b.append(Hex.encodeHexString(salt) + " ");
		}
		
		b.append(nexthashedownername + " ");
		
		for (TypeMap type : types) {
			b.append(type.name() + " ");
		}
	
		
		return b.toString();
	}

	

}
