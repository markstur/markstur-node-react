<p>
    <img src="https://img.shields.io/badge/platform-node-lightgrey.svg?style=flat" alt="platform">
    <img src="https://img.shields.io/badge/license-Apache2-blue.svg?style=flat" alt="Apache 2">
</p>

# Roman numeral calculator UI

Calculator UI which depends on a calculator service which depends on a converter service.

> **Usage**: It is meant to be "reverse-polish notation", but it uses the comma to separate operands. Using any operator (`+ - * /`) will send the operand list to be calculated with the operator. Chaining is not implemented, so continuing after an operand acts like a clear.

For example: Entering `M C X I V , X , I I /` will calculate 1114 divided by 10, divided by 2. Division results show fractions).

The odd-looking abacus emoji is shown on clear because we don't really start on zero/nulla.  I.e., `X *` just returns `X`. It does not assume `nulla, X *`.

![roman_calculator.png](doc/source/images/roman_calculator.png)

## Cloud native

This repo is based on a Cloud Native Toolkit starter kit (template-node-react). Using Cloud Native Toolkit with this repo gets you started with lots of cloud native goodness.

The React part was all replaced w/ a new simple project using Create React App.

## Run locally

### Install dependencies

The root directory and client subdirectory both have npm dependencies (see package.json and client/package.json).

```bash
npm install
cd client; npm install; cd ..
```

### Build the UI

For the express server to serve the UI, build it first.

### Start the server (with UI)

Use the CALCULATOR_API_HOST environment variable to tell the server proxy where your calculator service is.

```bash
export CALCULATOR_API_HOST=https://markstur-graphql-typescript-training-markstur.eco-training-f2c6cdc6801be85fd188b09d006f13e3-0000.us-east.containers.appdomain.cloud
npm run start
```

## Dev mode

Not documented here, but if you are working on this UI, you probably want to serve a dynamic version of the UI (and a separate server using API_HOST) instead of always using the static version that the server gives you.

Environment variables to help with that:

```bash
# How to set the port this runs on
PORT=http://localhost:3000
# How to refer to a separate server that proxies to the calculator
API_HOST=http://localhost:3001
# How to configure the calculator service
CALCULATOR_API_HOST=http://localhost:3002
# How to configure the converter service
# (not used here? just in case you go direct from the UI)
CONVERTER_API_HOST=http://localhost:3003
```

## License

This sample application is licensed under the Apache License, Version 2. Separate third-party code objects invoked within this code pattern are licensed by their respective providers pursuant to their own separate licenses. Contributions are subject to the [Developer Certificate of Origin, Version 1.1](https://developercertificate.org/) and the [Apache License, Version 2](https://www.apache.org/licenses/LICENSE-2.0.txt).

[Apache License FAQ](https://www.apache.org/foundation/license-faq.html#WhatDoesItMEAN)