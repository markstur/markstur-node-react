import {resolve} from 'path';
import {Pact} from '@pact-foundation/pact';
import supertest from 'supertest';
import server from '../server/server';

const app = server;
const consumerName = 'markstur-calculator-ui';
const providerName = 'markstur-calculator';
const providerPort = +process.env.CALCULATOR_PORT || 3002;

const smoothOperators = ['add', 'sub', 'mult', 'div'];
const badOperator = 'bogus';
const roman2021 = 'MMXXI';
const baseState = 'base state';

const provider = new Pact({
            cors: true,
            consumer: consumerName,
            provider: providerName,
            port: providerPort,
            log: resolve(process.cwd(), "logs", "pact.log"),
            dir: resolve(process.cwd(), "pacts"),
        });

describe("Calculator Pact test", () => {

    beforeAll(async () => {
        await provider.setup();
      });
    afterEach(() => provider.verify());
    afterAll(async () => {
        await provider.finalize();
        await app.close();
    });

    describe('given server requests to the calculator API provider via express.proxy', () => {
        describe("when the calculator provider has NO CONVERTER", () => {
            const state = 'NO CONVERTER';
            describe("when checking calculator/health", () => {
                it('returns 200, but DOWN', async () => {
                    await provider.addInteraction({
                        state,
                        uponReceiving: 'a GET request for /health',
                        withRequest: {
                            method: 'GET',
                            path: '/health',
                            query: {},
                        },
                        willRespondWith: {
                            status: 200,
                            headers: {
                                'Content-Type': 'application/json; charset=utf-8'
                            },
                            body: {status: 'DOWN', checks: [ { name: 'converterHealth', status: 'DOWN'} ] }
                        }
                    })
                    await supertest(app)
                        .get(`/api/calculator/health`)
                        .expect(
                            {
                                status: 'DOWN',
                                checks: [
                                    {
                                        name: 'converterHealth',
                                        status: 'DOWN',
                                    }
                                ]
                            }
                        )
                }, 90000);
            });
            describe('when given a single "operands" value', () => {
                it.each(smoothOperators)(
                    `/api/calculator/%s?operands=${roman2021} should return the value ${roman2021}`,
                    async (o) => {

                        await provider.addInteraction({
                            state,
                            uponReceiving: `a GET request for calculator/${o} with a single "operands=${roman2021}"`,
                            withRequest: {
                                method: 'GET',
                                path: `/calculator/${o}`,
                                query: `operands=${roman2021}`,
                            },
                            willRespondWith: {
                                status: 500,
                            }
                        })

                        await supertest(app)
                            .get(`/api/calculator/${o}`)
                            .query(`operands=${roman2021}`)
                            .expect(500)
                    }, 90000);
            });
        });
        describe("when the calculator provider has a converter", () => {
            const state = 'WITH CONVERTER';
            describe("when checking calculator/health", () => {
                it('returns 200, and UP', async () => {
                    await provider.addInteraction({
                        state,
                        uponReceiving: 'a GET request for /health',
                        withRequest: {
                            method: 'GET',
                            path: '/health',
                            query: {},
                        },
                        willRespondWith: {
                            status: 200,
                            headers: {
                                'Content-Type': 'application/json; charset=utf-8'
                            },
                            body: {status: 'UP', checks: [ { name: 'converterHealth', status: 'UP'} ] }
                        }
                    })
                    await supertest(app)
                        .get(`/api/calculator/health`)
                        .expect(
                            {
                                status: 'UP',
                                checks: [
                                    {
                                        name: 'converterHealth',
                                        status: 'UP',
                                    }
                                ]
                            }
                        )
                }, 90000);
            });
            describe('when given a single "operands" value', () => {
                it.each(smoothOperators)(
                    `/api/calculator/%s?operands=${roman2021} should return the value ${roman2021}`,
                    async (o) => {

                        await provider.addInteraction({
                            state,
                            uponReceiving: `a GET request for calculator/${o} with a single "operands=${roman2021}"`,
                            withRequest: {
                                method: 'GET',
                                path: `/calculator/${o}`,
                                query: `operands=${roman2021}`,
                            },
                            willRespondWith: {
                                status: 200,
                                body: roman2021,
                            }
                        })

                        await supertest(app)
                            .get(`/api/calculator/${o}`)
                            .query(`operands=${roman2021}`)
                            .expect(200)
                            .then((response) => {
                                expect(response.text).toEqual(roman2021);
                            })
                    }, 90000);
            });
        });

        describe('given server requests to proxy to the calculator API service provider', () => {
            describe("when given a bogus operator", () => {
                it('returns 404', async () => {
                    await provider.addInteraction({
                            state: baseState,
                            uponReceiving: `a GET request for calculator/${badOperator}`,
                            withRequest: {
                                method: 'GET',
                                path: `/calculator/${badOperator}`,
                            },
                            willRespondWith: {
                                status: 404,
                            }
                        })
                    await supertest(app)
                        .get(`/api/calculator/${badOperator}`)
                        .expect(404)
                }, 90000);
            });

            describe('when given a no operands', () => {
                it.each(smoothOperators)(
                    `/api/calculator/%s with no operands should throw 400`,
                    async (o) => {
                        await provider.addInteraction({
                            state: baseState,
                            uponReceiving: `a GET request for calculator/${o} with a no operands`,
                            withRequest: {
                                method: 'GET',
                                path: `/calculator/${o}`,
                                query: {},
                            },
                            willRespondWith: {
                                status: 400
                            }
                        })
                        await supertest(app)
                            .get(`/api/calculator/${o}`)
                            .expect(400)
                    }, 90000
                );
            });

        });

    });
});
