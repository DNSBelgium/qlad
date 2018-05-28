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

#ifdef HAVE_CONFIG_H
#include "config.h"
#endif

#include <algorithm>
#include <vector>

/*!
 * @brief Merges n sorted ranges.
 *
 * Merges n input sequences of total length m in O( log(n) * m ) steps,
 * requiring O( n ) additional space.
 *
 * NB: To get a set union, use std::erase( std::unique( ... ), ... ) on the
 * result. If you need a multiset union, the algorithm would have to be
 * modified (and it would make it slower).
 */
template < typename InputIterator >
class NSetsMerge {
public:
	typedef ::std::pair< InputIterator, InputIterator > Range;
	typedef ::std::vector< Range > Frontier;
	typedef ::std::vector< int > Tree;

	/*! @brief Add a range to the merge. */
	void add( InputIterator first, InputIterator last ) {
		in.push_back( ::std::make_pair( first, last ) );
	}

	/*! @brief Merge the sequences into a specified output iterator. */
	template < typename OutputIterator >
	OutputIterator save( OutputIterator out ) {
		if ( in.empty() )
			return out;

		const int n = in.size(), t = n + n - 1;

		/* A tree for fast lookup of minimal elements. It's a left
		 * aligned tree stored in an array, root element at index 0.
		 * For traversing the tree, the parent(), left() and right()
		 * functions are provided. The nodes of the tree are indexes
		 * into the in vector. */
		Tree tree( t );

		/* Reorder input ranges so that the leaves are in correct
		 * order even if we number them sequentially without
		 * considering the tree layout. This trick is required to make
		 * the merge stable.
		 *
		 * As an example, here's the tree for 5 input sequences:
		 *
		 *         __0___
		 *        /      \
		 *      _1_       2
		 *     /   \     / \
		 *    3     4   5   6
		 *   / \   [4] [3] [2]
		 *  7   8
		 * [1] [0]
		 *
		 * To fix the leaf numbering, we have to permute the leafs:
		 *
		 *  1   0   4   3   2         0   1   2   3   4
		 *         ==>          ie.          ==>
		 *  4   3   2   1   0         3   4   0   1   2
		 *
		 * To do this, we find the number of elements in the bottom
		 * layer and put this many elements from the end of in to the
		 * beginning. */
		for ( int layer = 1; layer < t; layer *= 2 )
			if ( n - 1 < layer - 1 && layer - 1 < t ) {
				const int back = t - layer + 1;

				Frontier in2;
				in2.reserve( in.size() );
				::std::copy( in.end() - back, in.end(),
					::std::back_inserter( in2 ) );
				::std::copy( in.begin(), in.end() - back,
					::std::back_inserter( in2 ) );
				::std::swap( in, in2 );
			}

		/* Initialize the tree. Set the last n elements (leafs) to
		 * point to the n input ranges. Then make the inner nodes
		 * point to the minima of their subtrees. */
		for ( int i = t - 1; i >= 0; --i ) {
			const int r = t - 1 - i;
			if ( r < n )
				tree[ i ] = r;
			else
				tree[ i ] = minSubTree( tree, i );
		}

		/* The leaf with the smallest element. Due to the numbering of
		 * leaves, we don't have to traverse the tree to find this.
		 * That numbering, however, requires the above mentioned
		 * reordering of input sequences. */
		int smallest = t - 1 - tree[ 0 ];

		while ( !empty( in[ tree[ 0 ] ] ) ) {
			*out++ = *in[ tree[ 0 ] ].first++;

			/* Update the tree on the path from smallest to 0. */
			for ( int i = parent( smallest ); i >= 0; i = parent( i ) )
				tree[ i ] = minSubTree( tree, i );

			smallest = t - 1 - tree[ 0 ];
		}

		in.clear();
		return out;
	}

private:
	/*! @brief A list of input ranges. */
	Frontier in;

	/*!
	 * @brief Get the "smaller" range index of the two subtrees of i,
	 * "smaller" meaning the range with smaller first element.
	 */
	int minSubTree( const Tree &tree, int i ) {
		const int l = tree[ left( i ) ], r = tree[ right( i ) ];
		if ( empty( in[ l ] ) )
			return r; // min( empty, nonempty ) = nonempty
		if ( empty( in[ r ] ) )
			return l; // min( nonempty, empty ) = nonempty
		return ( *in[ l ].first < *in[ r ].first ) ? l : r;
	}

	static bool empty( const Range &r )
		{ return r.first == r.second; }

	/* Tree traversal functions. */
	static int parent( int i )
		{ return (i + 1) / 2 - 1; }
	static int left( int i )
		{ return 2 * i + 1; }
	static int right( int i )
		{ return 2 * i + 2; }
};
