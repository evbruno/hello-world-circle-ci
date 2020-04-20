const fetch = require('node-fetch');

const faunadb = require('faunadb');
const q = faunadb.query;

const client = new faunadb.Client({ 
  secret: 'secret', 
  domain: 'localhost', 
  port: 8443, 
  scheme: 'http' 
});

function random_string(prefix) {
  return `${prefix || 'my_coll'}_${Math.floor(Math.random() * 1024)}`
}

async function faunadb_work(size, coll_name) {
  size = size || 256
  coll_name = coll_name || random_string()

  console.log(`size = ${size} coll_name = ${coll_name}`)

  await client.query(q.CreateCollection({name: coll_name}));
  
  for(i = 0; i < size; i++) {
    var exprs = [];

    for(j = 0; j < size; j++)
      exprs.push(
        q.Create(
          q.Collection(coll_name), 
          {data: { name: 'foo', i: i, sum: q.Add(i, j) }}
        )
      );

    await client.query(q.Do(exprs));
  }

  return await client.query(q.Count(q.Documents(q.Collection(coll_name))));
}

async function graphql_ping() {
  return await fetch('http://localhost:8084/ping', { method: 'GET' }).then(c => c.text())
}

async function graphql_work() {
  const db_name = random_string('db')
  await client.query(q.CreateDatabase({name: db_name}))
  const secret = await client.query(
    q.Select(
      'secret', 
      q.CreateKey({role: 'server', database: q.Database(db_name) })
  ));

  console.log(`secret: ${secret} db: ${db_name}`)

  await _run_graphql('import', 
                      secret, 
                      'type Todo { title: String! }, type Query { allTodos: [Todo!] }')
  
  do {
    active = await client.query(q.Select("active", q.Get(q.Index("allTodos", q.Database(db_name)))))
  } while(!active)

  await _run_graphql('graphql', secret, '{"query": "mutation {createTodo(data: {title: \\"Howdy\\"}) { _id }}"}')
  await _run_graphql('graphql', secret, '{"query": "mutation {createTodo(data: {title: \\"Partner\\"}) { _id }}"}')
  
  return await 
    _run_graphql('graphql', secret, '{"query": "query {allTodos { data { title }}}"}')
    .then(r => JSON.parse(r))
}

async function _run_graphql(endpoint, secret, payload) {
  return await fetch(
    `http://localhost:8084/${endpoint}`, 
    { 
      method: 'POST' ,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${secret}`
      }, 
      body: payload
  }).then(c => c.text())
}


async function faunadb_setup() {
  console.log('setup...');
}

async function faunadb_teardown() {
  console.log('teardown...');
}

module.exports = { 
  faunadb_setup, 
  faunadb_teardown,
  faunadb_work, 
  graphql_ping, 
  graphql_work,
  random_string
};