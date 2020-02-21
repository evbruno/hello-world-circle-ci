const faunadb = require('faunadb');
const q = faunadb.query;

const client = new faunadb.Client({ 
  secret: 'secret', 
  domain: 'localhost', 
  port: 8443, 
  scheme: 'http' 
});

const coll_name = `my_coll_${Math.floor(Math.random() * 1024)}`

async function faunadb_work() {
  await client.query(q.CreateCollection({name: coll_name}));
  
  for(i = 0; i < 256; i++) {
    var exprs = [];

    for(j = 0; j < 256; j++)
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

async function faunadb_setup() {
  console.log('setup...');
}

async function faunadb_teardown() {
  console.log('teardown...');
}

module.exports = { faunadb_work, faunadb_setup, faunadb_teardown };