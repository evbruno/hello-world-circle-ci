const ft = require('./faunadb_work');

beforeAll(() => {
  return ft.faunadb_setup();
});

afterAll(() => {
  return ft.faunadb_teardown();
});

test('can count 256^2 new entries', async () => {
  const resp = await ft.faunadb_work(256);
    expect(resp).toBe(65536); 
}, 300000);

test('can count 10k new entries', async () => {
  const resp = await ft.faunadb_work(100);
  expect(resp).toBe(10000); 
}, 300000);

test('can count 40k new entries', async () => {
  const resp = await ft.faunadb_work(200);
  expect(resp).toBe(40000); 
}, 300000);

test('can access /ping graphql', async () => {
  const resp = await ft.graphql_ping();
  expect(resp).toBe('Up and running!'); 
});

test('can import/query graphql', async () => {
  const resp = await ft.graphql_work();
  expect(resp.data.allTodos.data.length).toBe(2); 
  expect(resp.data.allTodos.data[0].title).toBe('Howdy'); 
  expect(resp.data.allTodos.data[1].title).toBe('Partner'); 
}, 300000);