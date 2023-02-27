# Nigeria 2023 Elections Observer

This is a prototype automated observer for the 2023 federal and state elections.

It monitors the INEC election results portal for uploaded sheets and determines whether the sheets for a polling unit are suspect or not (with varying degrees of confidence) according to this rubric:

- The uploaded sheet is actually an INEC form for the right polling unit.
- The figures in the sheet are clearly legible.
- The figures have not been struck out or overwritten.

Additionally it serves as a (hopefully) more performant and publicly accessible mirror of the INEC portal's data, although it lags behind by a few minutes to save costs.

Note that this observer does not aim to tally election results; only to flag possible tampering/rigging.

## Self-hosting

While we have our [own deployed instance of the observer](https://elections2023.sentinel-osint.org), anybody can run it themselves and verify its operation.

<!-- TODO: Setup steps -->

Running the observer for the entire election is quite expensive in terms of bandwidth and storage space. If you are running this on a limited PC or server, you can enable the Focus Mode which will only observe selected wards.

## Contributing

We will eventually have a contributing guide, but in the meantime you are welcome to make bug reports or feature suggestions.
