QLAD-flow
==========

# Command line options

Several parameters can be adjusted to change the behaviour of the algorithm.

- `-w --window-size=<seconds>`
  The application analyses captured DNS communication within a fixed size time-window. The length of the window is set in seconds. Setting the window to 5–10 minutes yields good results. The lower bound on the usable window size depends on the traffic density as higher traffic will generate more reliable reference behaviour in shorter time windows.
- `-i, --detection-interval=<seconds>`
  The interval between the starts of the analysis is passed via the detection interval parameter. Using shorter detection intervals than the length of the detection window allows the application to work with overlapping time-windows.
- `-a, --aggregation-count=<num>`
  The application uses an exponential aggregation scheme. Given the parameter of num aggregation level count, the application will utilise aggregation levels of {1, 2, ..., 2^(num−1) } seconds. Low aggregation count (2) will turn focus in the direction of short-time anomalies (containing slightly elevated false positive rate in the short-term range). Higher count (4 up to 8) will lean towards long-term anomalies.
- `-p, --analysed-gamma-parameter=<"shape"|"scale"|"both">`
  Selects whether to analyse the shape, scale or both of the Gamma distribution parameters. Setting shape or scale yields similar results, setting both leads in several cases more precise results – in our case less false positives were emitted.
- `-t, --detection-threshold=<num>`
  The detection (distance) threshold parameter is left to user's choice. It determines the boundary past which the sketches are marked as anomalous. The threshold setting serves as trade-off between sensitivity and false positive rate. Threshold of 0.8 seems to be a good choice when analysing scale or shape. When analysing both the value should be raised by factor from 1.4 to 2 to get reciprocal behaviour.
- `-P, --policy=<"srcIP"|"dstIP"|"qname">`
  The choice of the policy strongly affects the type of detected anomalies. Choices are srcIP, dstIP and qname. 
- `-c, --hash-count=<num>`
  The user is free to select the count of the used hash functions. The ideal count of hash functions (algorithm iterations) to be used is the least number such that the set of resulting anomalies remains unaltered by adding another hash function (performing consecutive iteration). The purpose of increasing the number of used hash functions is to minimize the probability of a packet identifier A_k to be mapped repeatedly together with an anomalous identifier A_l into same sketches - thus minimizing the probability of marking a non-anomalous identifier as anomalous. The application currently does not determine the ideal count. Ideal value depends on the volume of analysed data and is loosely related to sketch count. (In general, increasing sketch count allows the decrease of the count of hash functions.) Too high values slow down the application with marginal detection improvement.
- `-s, --sketch-count=<num>`
  The size of the hash tables can be set via the sketch count parameter. Low values generate improper results, values between 16 to 32 seem to be a good choice.
