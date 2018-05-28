
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

import json
import matplotlib.pyplot as plt
import numpy as np
from api import API
from ema_filter import EMA
from plotting import plot_filter

features = [
    ("tld", "TLD"),
    ("sld", "SLD"),
    ("qtype", "Qtype"),
    ("rcode", "Rcode"),
    ("client", "Client"),
    ("asn", "ASN"),
    ("country_code", "CountryCode"),
    ("msglen_reply", "MsgLen")
]

def process_batch(threshold=3):
    anomalies = {}

    db = API()
    for (feature, dim) in features:
        data = db.get_entropy(feature, dim)

        ema_filter = EMA(0.99, ema=data[0][1], ems=0.01)
        estimates = []
        ps = []
        anomaly_indices = []
        for index, (ts, x) in enumerate(data):
            newEMA, newEMS = ema_filter.update(x)
            estimates.append(newEMA)
            ps.append(newEMS)
            if ema_filter.is_anomaly(x, threshold):
                anomaly_indices.append(index)
                anomalies.setdefault(ts,[]).append(feature)
            ema_filter = EMA(0.99, newEMA, newEMS)
        x_val = [x[0] for x in data]
        y_val = [x[1] for x in data]
        plot_filter(plt, x_val, estimates, label=feature, var=np.array(ps))
        plt.scatter(x_val, y_val, c='green')
        plt.scatter([x_val[i] for i in anomaly_indices], [y_val[i] for i in anomaly_indices], c='red')
        plt.show()
    print json.dumps(anomalies, indent=1, sort_keys=True)

if __name__ == "__main__":
    process_batch()

