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

const bcrypt = require('bcryptjs');


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
  //call to read from the database.
  .get("/user", async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query("SELECT * FROM user_accounts");
      const results = { results: result ? result.rows : null };
      console.log(results); //are we going to get null?
      res.send(results);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })

  /* This POST function will first check to see if the given email is already in the database. */
  .post("/user", async function (req, res) { //this call is successfully adding to the database.
    var firstName = req.body.firstname;
    var lastName = req.body.lastname;
    var email = req.body.email;
    var zipCode = req.body.zip;
    var city = req.body.city;
    var address = req.body.address;
    var password = req.body.password;

    var existsFlag = false;

    var dbSalt = "";
    var dbHash = "";

    //I NEED TO SALT AND HASH THE PASSWORD
    /* HOW TO HASH CREATING ACCOUNT :
      1: generate random string as long as the password.
      2: prepend the salt to the password 
      3: hash the pw+salt
      4: save the salt and the hash
       */

    //HASHING + SALTING THE PASSWORD:
    bcrypt.genSalt(10, (err, salt) => { //this is the generation of SALT
      if(err){
        console.error(err);
      }else{ //we obtained the salt
        dbSalt = salt;
        bcrypt.hash(password, salt, (err, hash) => { //this is generation of HASH
          if(err){
            console.error(err);
          }else{ //we obtained the hash
            dbHash = hash;
          }
        });
      }
    });

    /* HOW TO HASH LOGIN
      1: get the salt and hash from the password
      2: add the salt to the given password and hash it
      3: compare hash in DB and hash output of given pw
      */

    try {
      const client = await pool.connect();
      const ensureResult = await client.query(`SELECT EXISTS(SELECT 1 FROM user_accounts where email='${email}') AS "exists"`);
      const ensureResults = ensureResult.rows;

      ensureResults.forEach(element => {
        existsFlag = element.exists;
      })

      if(existsFlag){
        res.send(existsFlag);
        client.release();
        return;
      }
      //else the email entered is not in the database. - therefore proceed to insert.
      const result = await client.query(`INSERT INTO user_accounts(firstname, lastname, email, city, address, zipcode, hashpassword, salt)
        VALUES('${firstName}','${lastName}','${email}','${city}','${address}','${zipCode}','${dbHash}','${dbSalt}') returning *`);
      const results = { results: result ? result.rows : null };
      res.status(200).send(result);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })  
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
