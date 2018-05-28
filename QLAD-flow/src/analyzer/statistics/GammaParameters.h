/*
 * This file is part of the DNS traffic analyser project.
 *
 * Copyright (C) 2011 CZ.NIC, z.s.p.o.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

#pragma once

#ifdef HAVE_CONFIG_H
#include "config.h"
#endif

#include <cassert>
#include <cmath>
#include <ostream>

/*!
 * @class GammaParameters GammaParameters.h "GammaParameters.h"
 * @brief Gamma Distribution parameters wrapper class.
 *
 * Supports basic arithmetic operations and formated output.
 */
class GammaParameters
{
public:
	static GammaParameters Invalid;

	/*!
	 * @brief Convenience names for used parameters.
	 */
	enum type {
		gammaShape = 0,
		gammaScale = 1,
		gammaBoth  = 2
	};

	/*!
	 *
	 */
	static const char * const typeNames[];

	/*!
	 * @brief Constructs class using provided parameters.
	 * @param shape Shape(k) parameter
	 * @param scale Scale(θ) parameter
	 *
	 * Sets mShape and mScale to supplied values.
	 */
	GammaParameters( long double shape, long double scale )
		: mShape( shape ), mScale( scale )
		{ assert( isValid() ); }

	/*!
	 * @brief Constructs copy of supplied GammaParameters class instance.
	 * @param other Instance to copy
	 * @note Supplied instance does not have to represent valid parameters.
	 *
	 * Constructed instance will inherit the validity of the supplied
	 * instance.
	 */
	GammaParameters( const GammaParameters &other )
		: mShape( other.mShape ), mScale( other.mScale ) {}

	/*!
	 * @brief Modifies instance by addition.
	 * @param other Instance to add
	 * @note Supplied instance does not have to represent valid parameters.
	 * @note Modified instance does not have to represent valid parameters.
	 *
	 * If original or supplied instance was valid, modified instance will
	 * be valid as well.
	 */
	GammaParameters & operator += ( const GammaParameters &other ) {
		mShape += other.mShape; mScale += other.mScale; return *this;
	}

	/*!
	 * @brief Modifies instance by substraction.
	 * @param other Instance to add
	 * @note Supplied instance does not have to represent valid parameters.
	 * @note Modified instance does not have to represent valid parameters.
	 */
	GammaParameters & operator -= ( const GammaParameters &other ) {
		mShape -= other.mShape; mScale -= other.mScale; return *this;
	}

	/*!
	 * @brief Modifies instance by division.
	 * @param divisor Value to use for division
	 * @note Modified instance does not have to represent valid parameters.
	 *
	 * If original instance was valid, modified instance will be valid as
	 * well.
	 */
	GammaParameters & operator /= ( long double divisor )
		{ mShape /= divisor; mScale /= divisor; return *this; }

	/*!
	 * @brief Modifies instance by exponentiation
	 * @param exponent Value to use as exponent.
	 * @note Modified instance does not have to represent valid parameters.
	 *
	 * Modified instance might be valid even if the original instance was
	 * not.
	 */
	GammaParameters & operator ^= ( long double exponent )
	{
		mShape = powl( mShape, exponent );
		mScale = powl( mScale, exponent );
		return *this;
	}

	/*!
	 * @brief Read-only access to protected member.
	 * @return Value of #mShape member
	 */
	long double shape() const
		{ return mShape; }

	/*!
	 * @brief Read-only access to protected member.
	 * @return Value of #mScale member
	 */
	long double scale() const
		{ return mScale; }

	/*! @brief Tests validity of stored parameters. */
	bool isValid() const
		{ return (mShape > 0) && (mScale > 0); }

protected:
	/*!
	 * @brief Constructs instance using zero parameters.
	 * @note These are not valid parameters for a Gamma distribution.
	 *
	 * Sets mShape and mScale to zero.
	 */
	GammaParameters(): mShape( 0 ), mScale( 0 ) {}

	long double mShape;  /*!< @brief Shape(k) parameter. */
	long double mScale;  /*!< @brief Scale(θ) parameter. */
};
/* ------------------------------------------------------------------------- */
/*!
 * @brief ::std::ostream operator for formatted output.
 * @param stream Output stream
 * @param params GammaParameters to print
 * @return ::std::ostream used
 *
 * Output string: "(Scale: %fscale, Shape: %fshape)", where %fscale is the
 * value of mScale member and %fshape is the value of mShape member.
 */
inline ::std::ostream & operator << (
  ::std::ostream &stream, const GammaParameters &params )
{
	stream << "("
	  << "Shape: " << params.shape() << ", Scale: " << params.scale()
	  << ")";
	return stream;
}
/* ------------------------------------------------------------------------- */
/*!
 * @brief Binary comparator.
 * @param a Left parameter
 * @param b Right parameter
 * @return True if structures hold identical parameters, false otherwise.
 */
inline bool operator == (
  const GammaParameters &a, const GammaParameters &b )
	{ return (a.scale() == b.scale()) && (a.shape() == b.shape()); }
/* ------------------------------------------------------------------------- */
/*!
 * @brief Binary comparator.
 * @param a Left parameter
 * @param b Right parameter
 * @return True if structures hold different parameters, false otherwise.
 */
inline bool operator != (
  const GammaParameters &a, const GammaParameters &b )
	{ return !(a == b); }
/* ------------------------------------------------------------------------- */
/*!
 * @brief Binary operator of addition.
 * @param a Left parameter
 * @param b Right parameter
 * @return Newly constructed instance.
 *
 * Uses copy constructor and operator +=;
 */
inline GammaParameters operator + (
  const GammaParameters &a, const GammaParameters &b )
	{ GammaParameters tmp(a); tmp += b; return tmp; }
/* ------------------------------------------------------------------------- */
/*!
 * @brief Binary operator of substraction.
 * @param a Left parameter
 * @param b Right parameter
 * @return Newly constructed instance.
 *
 * Uses copy constructor and operator -=;
 */
inline GammaParameters operator - (
  const GammaParameters &a, const GammaParameters &b )
	{ GammaParameters tmp(a); tmp -= b; return tmp; }
/* ------------------------------------------------------------------------- */
/*!
 * @brief Binary operator of exponentiation
 * @param a Left parameter
 * @param scalar Right parameter, a scalar value.
 * @return Newly constructed instance.
 *
 * Uses copy constructor and operator ^=;
 */
inline GammaParameters operator ^ (
  const GammaParameters &a, long double scalar )
	{ GammaParameters tmp(a); tmp ^= scalar; return tmp; }
/* ------------------------------------------------------------------------- */
/*!
 * @brief Binary operator of division
 * @param a Left parameter
 * @param scalar Right parameter, a scalar value.
 * @return Newly constructed instance.
 *
 * Uses copy constructor and operator /=;
 */
inline GammaParameters operator / (
  const GammaParameters &a, long double scalar )
	{ GammaParameters tmp(a); tmp /= scalar; return tmp; }
