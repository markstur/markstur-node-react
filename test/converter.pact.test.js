import {resolve} from 'path';
import {Matchers, Pact} from '@pact-foundation/pact';
import supertest from 'supertest';
import server from '../server/server';
const app = server;

const consumerName = 'markstur-converter-ui';
const providerName = 'markstur-converter';
const providerPort = 3003;

  describe('canary test', () => {
    it('should verify test infrastructure', () => {
      console.log("in test infrastructure");
      expect(true).toEqual(true);
    });
  });

  describe('express server with api proxy to provider', () => {

    let provider;
  beforeAll(async () => {
    provider = new Pact({
      cors: true,
      consumer: consumerName,
      provider: providerName,
      port: providerPort,
      log: resolve(process.cwd(), "logs", "pact.log"),
      dir: resolve(process.cwd(), "pacts"),
    });
    await provider.setup();
    console.log("in before all, provider setup for all");

    console.log("Adding provider interactions beforeAll tests");
    const baseState = 'base state';
    return Promise.all([
      provider.addInteraction({
        state: baseState,
        uponReceiving: 'a request to convert to-roman from 2021',
        withRequest: {
          method: 'GET',
          path: '/converter/to-roman',
          query: 'value=2021',
        },
        willRespondWith: {
          status: 200,
          body: 'MMXXI'
        }
      }),

      provider.addInteraction({
        state: baseState,
        uponReceiving: 'a request to convert to-roman from zero',
        withRequest: {
          method: 'GET',
          path: '/converter/to-roman',
          query: 'value=0',
        },
        willRespondWith: {
          status: 200,
          body: 'nulla'
        }
      }),

      provider.addInteraction({
        state: baseState,
        uponReceiving: 'a request to convert to-roman from 3999',
        withRequest: {
          method: 'GET',
          path: '/converter/to-roman',
          query: 'value=3999',
        },
        willRespondWith: {
          status: 200,
          body: 'MMMCMXCIX'
        }
      }),

    provider.addInteraction({
        state: baseState,
        uponReceiving: 'a request to convert to-roman from -1',
        withRequest: {
          method: 'GET',
          path: '/converter/to-roman',
          query: 'value=-1',
        },
        willRespondWith: {
          status: 400,
        }
      }),

      provider.addInteraction({
        state: baseState,
        uponReceiving: 'a request to convert to-roman from 12.34',
        withRequest: {
          method: 'GET',
          path: '/converter/to-roman',
          query: 'value=12.34',
        },
        willRespondWith: {
          status: 400,
        }
      }),

      provider.addInteraction({
        state: baseState,
        uponReceiving: 'a request to convert to-roman from 4000',
        withRequest: {
          method: 'GET',
          path: '/converter/to-roman',
          query: 'value=4000',
        },
        willRespondWith: {
          status: 400,
        }
      }),

      provider.addInteraction({
        state: baseState,
        uponReceiving: 'a request to convert to-number from XIIII',
        withRequest: {
          method: 'GET',
          path: '/converter/to-number',
          query: 'value=XIIII',
        },
        willRespondWith: {
          status: 400,
        }
      }),

      provider.addInteraction({
        state: baseState,
        uponReceiving: 'a request to convert to-roman from "foo"',
        withRequest: {
          method: 'GET',
          path: '/converter/to-roman',
          query: 'value=foo',
        },
        willRespondWith: {
          status: 400,
        }
      }),

      provider.addInteraction({
        state: baseState,
        uponReceiving: 'a request to convert to-number from MMXXI',
        withRequest: {
          method: 'GET',
          path: '/converter/to-number',
          query: 'value=MMXXI',
        },
        willRespondWith: {
          status: 200,
          body: '2021'
        }
      }),

    ])

  }, 30000);

  afterAll(async () => {
        console.log("in afterAll, going to close and finalize");
        await server.close((err) => { console.log('server closed') })
        await provider.verify().finally(provider.finalize());
  });

  describe('given server requests', () => {
    describe("the proxy to the converter service provider should...", () => {
      it('The result of the conversion should be placed in the body of the reply.', async () => {
        await supertest(app)
            .get("/api/converter/to-roman?value=2021")
            .expect(200)
            .then((response) => {
              expect(response.text).toEqual('MMXXI');
            })
      });
      it('handle positive integers between 0 and 3999 inclusive', async () => {
        await supertest(app)
            .get("/api/converter/to-roman?value=0")
            .expect(200)
            .then((response) => {
              expect(response.text).toEqual('nulla');
            })

        await supertest(app)
            .get("/api/converter/to-roman?value=3999")
            .expect(200)
            .then((response) => {
              expect(response.text).toEqual('MMMCMXCIX');
            })
      });

      it('return HTTP error code 400 - Bad Request if the number is negative, above 3999 or contains a floating point number', async () => {
        await supertest(app)
            .get("/api/converter/to-roman?value=-1")
            .expect(400)
        await supertest(app)
            .get("/api/converter/to-roman?value=4000")
            .expect(400)
        await supertest(app)
            .get("/api/converter/to-roman?value=12.34")
            .expect(400)
      });
      it('when converting from Roman Numerals if the value if not a valid Roman Numeral, such as XIIII, then return HTTP error code 400 - Bad Request', async () => {
        await supertest(app)
            .get("/api/converter/to-number?value=XIIII")
            .expect(400)
      });
      it('when converting to a Roman Numerals, if the value parameter is not a valid number then return HTTP error code 400 - Bad Request', async () => {
        await supertest(app)
            .get("/api/converter/to-roman?value=foo")
            .expect(400)
      });
    });
  });

    describe("GET /api/converter/to-roman?value=2021", () => {
      it("should return MMXXI from the proxy provider", async () => {

        await supertest(app)
            .get("/api/converter/to-roman?value=2021")
            .expect(200)
            .then((response) => {
              expect(response.text).toEqual('MMXXI');
            })
      })
    });

    describe("GET /api/converter/to-number?value=MMXXI", () => {
      it("should return 2021 from the proxy provider", async () => {
        await supertest(app)
            .get("/api/converter/to-number?value=MMXXI")
            .expect(200)
            .then((response) => {
              expect(response.text).toEqual('2021');
            })
      })
    });

    describe("GET /api/converter/foo", async () => {
      it("should return web page without going to proxy provider", async () => {
        // NOT USING /api again to verify /foo does not go to the proxy
        await supertest(app)
            .get("/foo")
            .expect(200)
            .then((response) => {
              expect(response.text).toContain('IBM Cloud Web Starter');
            })
      })
    });

});

