import {resolve} from 'path';
import {Matchers, Pact} from '@pact-foundation/pact';
import supertest from 'supertest';
import server from '../server/server';
const app = server;

const consumerName = 'markstur-api-consumer';
const providerName = 'markstur-api-provider';
const providerPort = 3001;

  describe('canary test', () => {
    it('should verify test infrastructure', () => {
      console.log("in test infrastructure");
      expect(true).toEqual(true);
    });
  });

  describe('express server with api proxy to provider', () => {

    const expectedHelloText = "Hello, World!";
    const expectedProjects = {
      "projects": [
        {
          "id": 1,
          "name": "Learn React Native",
          "tasks": [
            {
              "id": 1
            },
            {
              "id": 2
            },
            {
              "id": 3
            }
          ]
        },
        {
          "id": 2,
          "name": "Workout",
          "tasks": [
            {
              "id": 4
            },
            {
              "id": 5
            }
          ]
        },
        {
          "id": 3,
          "name": "Other",
          "tasks": []
        }
      ]
    };

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
        uponReceiving: 'a bogus request path',
        withRequest: {
          method: 'GET',
          path: '/bogus',
        },
        willRespondWith: {
          status: 404,
        }
      }),

      provider.addInteraction({
        state: baseState,
        uponReceiving: 'a request for hello',
        withRequest: {
          method: 'GET',
          path: '/hello',
        },
        willRespondWith: {
          status: 200,
          headers: {
            "content-type" : "text/html; charset=utf-8",
          },
          body: Matchers.string(expectedHelloText),
        }
      }),

      provider.addInteraction({
        state: baseState,
        uponReceiving: 'a request for projects with GraphQL',
        withRequest: {
          method: 'POST',
          path: '/graphql',
          body: { "query": "{ projects { id, name, tasks { id } }}"},
          headers: {
            "content-type" : "application/json",
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            "content-type" : "application/json; charset=utf-8",
          },
          body: { data: expectedProjects }
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
    });

    describe("GET /api/hello", () => {
        it(`should return "${expectedHelloText}" from the proxy provider`, async () => {

        await supertest(app)
            .get("/api/hello")
            .expect(200)
            .then((response) => {
              expect(response.text).toEqual(expectedHelloText);
            })
      })
    });

    describe("GET /foo", async () => {
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

    describe("GET /api/bogus", () => {
      it("should return 404 from the proxy provider", async () => {
        await supertest(app)
            .get("/api/bogus")
            .expect(404)
      })
    });

    describe("POST /api/graphql with projects query", () => {
      it("should return nested projects/tasks from the proxy provider", async () => {

        const query = '{ projects { id, name, tasks { id } }}';

        await supertest(app)
            .post("/api/graphql")
            .set('content-type', 'application/json')
            .send( { query })
            .expect(200)
            .then((response) => {
              expect(Array.isArray(response.body.data.projects)).toBe(true)
              expect(response.body.data.projects.length).toEqual(3)
              expect(Array.isArray(response.body.data.projects[0].tasks)).toBe(true)
            })
      })
    });

});

