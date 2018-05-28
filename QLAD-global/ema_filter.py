
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

import numpy as np
import pickle
import os.path

class EMA(object):
    w = 0.5
    ema = 0
    ems = 0

    def __init__(self, w, ema=0, ems=0):
        self.w = w
        self.ema = ema
        self.ems = ems

    def update_ema(self, x):
        self.ema = self.w * self.ema + (1 - self.w) * x

    def update_ems(self, x):
        self.ems = self.w * self.ems + (1 - self.w) * ((x - self.ema)**2)

    def update(self, x):
        self.update_ems(x)
        self.update_ema(x)
        return (self.ema, self.ems)

    def is_anomaly(self, x, threshold):
        return abs(x - self.ema) > threshold * np.sqrt(self.ems)

def save(model, id):
    with open('EMA_{}.model'.format(id), 'wb') as output:
        pickle.dump(model, output, pickle.HIGHEST_PROTOCOL)

def load(id):
    if not os.path.isfile('EMA_{}.model'.format(id)):
        return EMA(0.99, ema=0.5, ems=0.01)
    with open('EMA_{}.model'.format(id), 'rb') as input:
        return pickle.load(input)
