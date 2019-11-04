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

global.loggedinFlag = false;


express()
  .use(express.static(path.join(__dirname)))
  .use(bodyParser.json()) //allow me to use the body parser.
  .get('/?', (req, res) => res.render('index'))
  //this is the call to a second webpage.
  .get('/search', (req, res) => res.sendFile('./Pages/searchBooks.html', {root: __dirname}))
  //this is a call to the wishlist page
  .get('/wishlistPage', (req, res) => res.sendFile('./Pages/wishlist.html', {root: __dirname}))
  //this is a call to the cart page
  .get('/cartPage', (req, res) => res.sendFile('./Pages/cart.html', {root: __dirname}))
  //call to get the ID primary key within the user_accounts - allowing forign key us in other tables
  .post('/getID', async function (req, res) {
    var loginEmail = req.body.email;
    try {
      const client = await pool.connect();
      const result = await client.query(
        `SELECT id FROM user_accounts where email='${loginEmail}'`
      );
      const results = { results: result ? result.rows : null };
      res.status(200).send(results);
      client.release();
    } catch (err) {
      console.error(err);
      res.send(err);
    }
  })
  //call to get the users firstname
  .post('/getName', async function (req, res) {
    var loginEmail = req.body.email;
    try {
      const client = await pool.connect();
      const result = await client.query(
        `SELECT firstname FROM user_accounts where email='${loginEmail}'`
      );
      const results = { results: result ? result.rows : null };
      if(results === null){
        //bad request - the email is not within the database
        res.sendStatus(400); 
        client.release();
      }
      res.status(200).send(results);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  //call to authenticate from the database. Use POST as its more secure
  .post("/login", async function (req, res) {
      //obtain the email and the password.
      var loginEmail = req.body.email;
      var loginPassword = req.body.pass;
      var hashPassword = "";
     

    try {
      const client = await pool.connect();
      const result = await client.query(`SELECT firstname, hashpassword FROM user_accounts where email='${loginEmail}'`);
      const results = { results: result ? result.rows : null }; 

      if(results.results.length == 0){
        res.status(200).send(false);
        client.release();
        return;
      }

      results.results.forEach(element => {
        hashPassword = element.hashpassword;
      })

      //obtained the hash
      const match = await bcrypt.compareSync(loginPassword, hashPassword, (err, equal) => { //this is not returning what i need. should be able to evaluate the right and wrong passwords
        if(err){
          console.error(err);
        } else {
          if(equal){
            console.log("correct password");
            loggedinFlag = true;
          }else{
            console.log("wrong password");
          } 
        }
      });

      if(match){ //if the password was correct
        res.status(200).send(results);
        client.release();
        return;
      }else{ //the password was incorrect
        res.status(200).send(false);
        client.release();
      }
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  /* This is the post request used for accoutn creation. It verifies that an email is not already
  exisiting within the database. It Creates a salt and hashes the users password - and stores all user information
  into the user_accounts database.*/
  .post("/create", async function (req, res) { //this call is successfully adding to the database.
    var firstName = req.body.firstname;
    var lastName = req.body.lastname;
    var email = req.body.email;
    var zipCode = req.body.zip;
    var city = req.body.city;
    var address = req.body.address;
    var password = req.body.password;
    var dbSalt = "";
    var dbHash = "";
    var existsFlag = false;
    
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
  /* This is the POST request that updates the wishlist database. This stores the ID of the 
  user_account associated to the books they have entered into their wishlist */
  .post('/wishlist', async function (req, res) {
    var userID = req.body.userid;
    var wishlistISBN = req.body.isbn;

    try {
      const client = await pool.connect();
      const result = await client.query(
        `INSERT INTO wishlist (id, isbn) VALUES('${userID}', '${wishlistISBN}')returning *`
      );
      const results = { results: result ? result.rows : null };
      if(results === null){
        res.status(200).send(false);
        client.release();
      }
      res.status(200).send(results);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })

  /* This is the POST request that updates the cart database. This stores the ID of the 
  user_account associated to the books they have entered into their cart */
  .post('/cart', async function (req, res) {
    var userID = req.body.userid;
    var wishlistISBN = req.body.isbn;
    
    try {
      const client = await pool.connect();
      const result = await client.query(
        `INSERT INTO cart (id, isbn) VALUES('${userID}', '${wishlistISBN}') returning *`
      );
      const results = { results: result ? result.rows : null };
      if(results === null){
        res.status(200).send(false);
        client.release();
      }
      res.status(200).send(results);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  //call to get all information from the wishlist database
  .post('/wishlistInfo', async function (req, res) {
    var userID = req.body.userid;

    try {
      const client = await pool.connect();
      const result = await client.query(
        `SELECT * FROM wishlist WHERE id='${userID}'`
      );
      const results = { results: result ? result.rows : null };
      if(results === null){
        res.status(200).send(false);
        client.release();
      }
      res.status(200).send(results);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  //call to get all information from the cart database
  .post('/cartInfo', async function (req, res) {
    var userID = req.body.userid;

    try {
      const client = await pool.connect();
      const result = await client.query(
        `SELECT * FROM cart WHERE id='${userID}'`
      );
      const results = { results: result ? result.rows : null };
      if(results === null){
        res.status(200).send(false);
        client.release();
      }
      res.status(200).send(results);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })

  

  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
