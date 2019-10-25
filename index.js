const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: "postgres://oryzomobpohgzz:a103104857c587015cf3389470f9cb436c8d652d0dc5fc20b759cb7ff94c133b@ec2-54-83-33-14.compute-1.amazonaws.com:5432/ddee184a8ugadt",
  ssl: true
});

express()
  .use(express.static(path.join(__dirname)))
  // .set('views', path.join(__dirname, 'views'))
  // .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('index'))
  .get('/db', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM test_table');
      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/db', results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
