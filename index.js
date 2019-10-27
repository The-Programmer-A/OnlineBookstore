const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

const express = require('express')
var app = express();
const path = require('path')
var bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000


express()
  .use(express.static(path.join(__dirname)))
  .use(bodyParser.json()) //allow me to use the body parser.
  .get('/', (req, res) => res.render('index'))
  .get('/data', async (req, res) => { //this is obtaining the data - good
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM user_accounts');
      const results = { results: (result) ? result.rows : null};
      client.release();
      console.log(results);
      res.render('database');
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .post("/user", async function (req, res) {
    // var newTask = req.body.task;
    // var newName = req.body.name;
    var firstName = req.body.firstname;
    var lastName = req.body.lastname;
    var email = req.body.email;
    var zipCode = req.body.zip;
    var city = req.body.city;
    var address = req.body.address;
    var password = req.body.password;

    //i need to add a salt and hash that password.

    console.log("hello i am getting to the post method");
    try {
      const client = await pool.connect();
      const result = await client.query(`INSERT INTO user_accounts(firstname, lastname, email, city, address, zipcode, hashpassword, salt)
        VALUES('${firstName}','${lastName}','${email}','${city}','${address}','${zipCode}','${password}','salt') returning *`);
      const results = { results: result ? result.rows : null };
      //the query failed therefore format of newTask or newName is incorrect
      res.status(200).send(result);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })  
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
