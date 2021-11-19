import {resolve} from 'path';
import {Matchers, Pact} from '@pact-foundation/pact';
import supertest from 'supertest';
import server from '../server/server';

const app = server;
const consumerName = 'markstur-calculator-api-consumer';
const providerName = 'markstur-api-provider';
const providerPort = 3001;

describe('canary test', () => {
    it('should verify test infrastructure', () => {
        console.log("in test infrastructure");
        expect(true).toEqual(true);
    });
});

describe('express server with api proxy to calculator provider', () => {

    const baseState = 'base state';
    const roman2021 = 'MMXXI';
    const smoothOperators = ['add', 'sub', 'mult', 'div'];
    const badOperator = 'bogus';

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

        const promisedInteractions = [];
        for (const operator of smoothOperators) {
            promisedInteractions.push(
                provider.addInteraction({
                    state: baseState,
                    uponReceiving: `a GET request for calculator/${operator} with a no operands`,
                    withRequest: {
                        method: 'GET',
                        path: `/calculator/${operator}`,
                        query: {},
                    },
                    willRespondWith: {
                        status: 400
                    }
                })
            )
            promisedInteractions.push(
                provider.addInteraction({
                    state: baseState,
                    uponReceiving: `a GET request for calculator/${operator} with a single "operands=${roman2021}"`,
                    withRequest: {
                        method: 'GET',
                        path: `/calculator/${operator}`,
                        query: `operands=${roman2021}`,
                    },
                    willRespondWith: {
                        status: 200,
                        body: roman2021,
                    }
                })
            )
        }
        promisedInteractions.push(
            provider.addInteraction({
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
        )

        return Promise.all(promisedInteractions);
    }, 30000);

    afterAll(async () => {
        console.log("in afterAll, going to close and finalize");
        await server.close((err) => {
            console.log('server closed')
        })
        await provider.verify().finally(provider.finalize());
    });

    /**
     * Calculator Service¶
     You need to create a web API that implements a roman numeral calculator with the following details:

     parameters is the operands for the calculation, given as Roman Numerals, separated with a comma (,)
     There may be more than 2 operands. All operands should be included in the calculation
     for an add operation with parameters "I, IV, X, XX", the expected result should be XXXV : 1(I) + 4(IV) +10(X)+ 20(XX) = 35(XXXV)
     for a sub operation with parameters "L, III, X, VI, I, IX", the expected result should be XXI : 50(L) - 3(III) - 10(X) - 6(VI) - 1(I) - 9(IX) = 21(XXI)
     for a mult operation with parameters "I, II, III, IV, V), the expected result should be CXX : 1(I) * 2(II) * 3(III) * 4(IV) * 5(V) = 120(CXX)
     for a div operation with parameters "LX, III, II), then expected result should be XV : 60(LX) / 3(III) / 2(II) = 10(X)
     so to add numbers 12 and 6 the URL would look like https://myapp.com/add?operands=XII,VI

     the calculator should only handle 0 or positive numbers up to and including 3999 (MMMCMXCIX) if either of the operands is negative or over 3999 then the API should return HTTP error code 400 - Bad Request. If the calculated result is negative or over 3999 then the API should return an error code 501 - Not Implemented.

     any invalid Roman Numeral input, such as XIIII instead of XIV, should return HTTP status code of 400 - Bad Request
     the API should handle Roman Numerals in upper, lower or mixed case letters
     for division the result should be returned as the integer result of the division. If the division result is not an exact integer (there is a remainder) then the result should be given in format <div result> (<modulus result>/divisor), so div(X, V) will return II, and div(XI, IV) will return II (III/IV)
     If there are more than 2 parameters you need to work out the remainder, to make the divisor is the smallest possible integer
     div(XX, II, III) should return III (I/III) : 20/2 = 10; 10 / 3 = 3
     div(XIX, III, II) should return III (I/VI) : 19/3 = 6; 6/2 = 3 div(XX, III, II) should return III (I/III) : 20/3 = 6; 6/2 = 3 = 3 There should be no conversion functionality within the calculator service. It should make use of the converter service.
     **/

    describe('given server requests to proxy to the calculator API service provider', () => {
        describe("when given a bogus operator", () => {
            it('returns 404', async () => {
                await supertest(app)
                    .get(`/api/calculator/${badOperator}`)
                    .expect(404)
            });
        });

        describe('when given a no operands', () => {
            it.each(smoothOperators)(
                `/api/calculator/%s with no operands should throw 400`,
                async (o) => {
                    await supertest(app)
                        .get(`/api/calculator/${o}`)
                        .expect(400)
                }
            );
        });

        describe('when given a single "operands" value', () => {
            it.each(smoothOperators)(
                `/api/calculator/%s?operands=${roman2021} should return the value ${roman2021}`,
                async (o) => {
                    await supertest(app)
                        .get(`/api/calculator/${o}`)
                        .query(`operands=${roman2021}`)
                        .expect(200)
                        .then((response) => {
                            expect(response.text).toEqual(roman2021);
                        })
                }
            );
        });
    });
});
