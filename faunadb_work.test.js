const { faunadb_work, faunadb_setup, faunadb_teardown } = require('./faunadb_work');

beforeAll(() => {
  return faunadb_setup();
});

afterAll(() => {
  return faunadb_teardown();
});

test('can count the indexes', async () => {
  const resp = await faunadb_work();
  expect(resp).toBe(65536); 
}, 300000);
