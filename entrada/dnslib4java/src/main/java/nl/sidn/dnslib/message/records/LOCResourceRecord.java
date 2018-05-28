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

import java.text.DecimalFormat;
import java.text.NumberFormat;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

import nl.sidn.dnslib.exception.DnsDecodeException;
import nl.sidn.dnslib.message.util.NetworkData;

/**
 * http://tools.ietf.org/html/rfc1876
 * 
 * based on http://dnsjava.org/dnsjava-current/org/xbill/DNS/LOCRecord.java
 * Copyright (c) 1999-2004 Brian Wellington (bwelling@xbill.org)
 */

public class LOCResourceRecord extends AbstractResourceRecord {

	private static NumberFormat w2, w3;

	static {
		w2 = new DecimalFormat();
		w2.setMinimumIntegerDigits(2);

		w3 = new DecimalFormat();
		w3.setMinimumIntegerDigits(3);
	}

	/*
	 * MSB LSB +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+ 0| VERSION |
	 * SIZE | +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+ 2| HORIZ PRE |
	 * VERT PRE | +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+ 4| LATITUDE
	 * | +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+ 6| LATITUDE |
	 * +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+ 8| LONGITUDE |
	 * +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+ 10| LONGITUDE |
	 * +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+ 12| ALTITUDE |
	 * +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+ 14| ALTITUDE |
	 * +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+ (octet)
	 */

	private static final long serialVersionUID = 1L;

	private short version;
	private short size;
	private short size_base;
	private short size_power;
	private short horizontalPrecision;
	private short verticalPrecision;
	private long latitude;
	private long longitude;
	private long altitude;

	@Override
	public void decode(NetworkData buffer) {
		super.decode(buffer);

		version = buffer.readUnsignedByte();
		if (version != 0) {
			// illegal version
			throw new DnsDecodeException(
					"LOCResourceRecord Illegal version number: " + version);
		}

		size = buffer.readUnsignedByte();
		// get the first 4 bits, which represent the base.
		size_base = (short) ((size & 0x00f0) >>> 4);

		// get the last 4 bits, which represent the pwer
		size_power = (short) (size & 0x000f);

		horizontalPrecision = buffer.readUnsignedByte();

		verticalPrecision = buffer.readUnsignedByte();

		latitude = buffer.readUnsignedInt();

		longitude = buffer.readUnsignedInt();

		altitude = buffer.readUnsignedInt();

	}

	@Override
	public void encode(NetworkData buffer) {
		super.encode(buffer);

		buffer.writeChar(rdLength);

		buffer.writeByte(version);

		buffer.writeByte(size);

		buffer.writeByte(horizontalPrecision);

		buffer.writeByte(verticalPrecision);

		buffer.writeInt(latitude);

		buffer.writeInt(longitude);

		buffer.writeInt(altitude);

	}

	public String getCacheId() {
		return null;
	}

	public short getVersion() {
		return version;
	}

	public void setVersion(short version) {
		this.version = version;
	}

	public short getSize() {
		return size;
	}

	public void setSize(short size) {
		this.size = size;
	}

	public short getSize_base() {
		return size_base;
	}

	public void setSize_base(short size_base) {
		this.size_base = size_base;
	}

	public short getSize_power() {
		return size_power;
	}

	public void setSize_power(short size_power) {
		this.size_power = size_power;
	}

	public short getHorizontalPrecision() {
		return horizontalPrecision;
	}

	public void setHorizontalPrecision(short horizontalPrecision) {
		this.horizontalPrecision = horizontalPrecision;
	}

	public short getVerticalPrecision() {
		return verticalPrecision;
	}

	public void setVerticalPrecision(short verticalPrecision) {
		this.verticalPrecision = verticalPrecision;
	}

	public long getLatitude() {
		return latitude;
	}

	public void setLatitude(long latitude) {
		this.latitude = latitude;
	}

	public long getLongitude() {
		return longitude;
	}

	public void setLongitude(long longitude) {
		this.longitude = longitude;
	}

	public long getAltitude() {
		return altitude;
	}

	public void setAltitude(long altitude) {
		this.altitude = altitude;
	}

	@Override
	public String toString() {
		return "LOCResourceRecord [version=" + version + ", size=" + size
				+ ", size_base=" + size_base + ", size_power=" + size_power
				+ ", horizontalPrecision=" + horizontalPrecision
				+ ", verticalPrecision=" + verticalPrecision + ", latitude="
				+ latitude + ", longitude=" + longitude + ", altitude="
				+ altitude + "]";
	}

	/**
	 * The code for converting the data to zone format has been copied from
	 * dnsjava. see: http://www.dnsjava.org/
	 */
	@Override
	public String toZone(int maxLength) {

		StringBuffer sb = new StringBuffer();

		sb.append(super.toZone(maxLength) + "\t");

		/* Latitude */
		sb.append(positionToString(latitude, 'N', 'S'));
		sb.append(" ");

		/* Latitude */
		sb.append(positionToString(longitude, 'E', 'W'));
		sb.append(" ");

		/* Altitude */
		renderFixedPoint(sb, w2, altitude - 10000000, 100);
		sb.append("m ");

		/* Size */
		renderFixedPoint(sb, w2, size, 100);
		sb.append("m ");

		/* Horizontal precision */
		renderFixedPoint(sb, w2, horizontalPrecision, 100);
		sb.append("m ");

		/* Vertical precision */
		renderFixedPoint(sb, w2, verticalPrecision, 100);
		sb.append("m");

		return sb.toString();

	}
	
	@Override
	public JsonObject toJSon(){
		JsonObjectBuilder builder = super.createJsonBuilder();
		return builder.
			add("rdata", Json.createObjectBuilder().
				add("version", (int)version).
				add("size", (int)size).
				add("hor_pre", (int)horizontalPrecision).
				add("vert_pre", (int)verticalPrecision).
				add("lat", latitude).
				add("long", longitude).
				add("alt", altitude)).
			build();
	}
	

	private String positionToString(long value, char pos, char neg) {
		StringBuffer sb = new StringBuffer();
		char direction;

		long temp = value - (1L << 31);
		if (temp < 0) {
			temp = -temp;
			direction = neg;
		} else
			direction = pos;

		sb.append(temp / (3600 * 1000)); /* degrees */
		temp = temp % (3600 * 1000);
		sb.append(" ");

		sb.append(temp / (60 * 1000)); /* minutes */
		temp = temp % (60 * 1000);
		sb.append(" ");

		renderFixedPoint(sb, w3, temp, 1000); /* seconds */
		sb.append(" ");

		sb.append(direction);

		return sb.toString();
	}

	private void renderFixedPoint(StringBuffer sb, NumberFormat formatter,
			long value, long divisor) {
		sb.append(value / divisor);
		value %= divisor;
		if (value != 0) {
			sb.append(".");
			sb.append(formatter.format(value));
		}
	}

}
