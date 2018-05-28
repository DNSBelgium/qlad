
# QLAD - An anomaly detection system for DNS traffic
# Copyright (C) 2017 DNS Belgium
#
# This file is part of QLAD.
#
# QLAD is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# QLAD is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with QLAD.  If not, see <http://www.gnu.org/licenses/>.

'''
Simple implementation of a Kalman filter.
'''
from numpy.linalg import inv
from numpy import identity


class KalmanFilter:
    """
    Simple Kalman filter
    Control term has been omitted for now
    """
    def __init__(self, X, P, F, Q, Z, H, R):
        """
        Initialise the filter
        Args:
            X: State estimate
            P: Estimate covaConfigureriance
            F: State transition model
            Q: Process noise covariance
            Z: Measurement of the state X
            H: Observation model
            R: Observation noise covariance
        """
        self.X = X
        self.P = P
        self.F = F
        self.Q = Q
        self.Z = Z
        self.H = H
        self.R = R

    def predict(self, X, P, w=0):
        """
        Predict the future state
        Args:
            X: State estimate
            P: Estimate covariance
            w: Process noise
        Returns:
            updated (X, P)
        """
        # Project the state ahead
        X = self.F * X + w
        P = self.F * P * (self.F.T) + self.Q
        return (X, P)

    def update(self, X, P, Z):
        """
        Update the Kalman Filter from a measurement
        Args:
            X: State estimate
            P: Estimate covariance
            Z: State measurement
        Returns:
            updated (X, P)
        """
        K = P * (self.H.T) * inv(self.H * P * (self.H.T) + self.R)
        X += K * (Z - self.H * X)
        P = (identity(P.shape[1]) - K * self.H) * P
        return (X, P)
