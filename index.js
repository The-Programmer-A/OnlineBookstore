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
const moment=require("moment");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

global.loggedinFlag = false;
var globaltoken='';
var globaltoken2='';


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
  //this calls to the forgotpass page
  .get('/forgotPage', (req, res) => res.sendFile('./Pages/index.html', {root: __dirname}))
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

  /* this is a Login for OAuth users */
  .post("/loginOAuth", async function (req, res) {
    //obtain the email and the password.
    var loginEmail = req.body.email;

  try {
    const client = await pool.connect();
    const result = await client.query(`SELECT firstname FROM user_accounts where email='${loginEmail}'`);
    const results = { results: result ? result.rows : null }; 

    if(results.results.length == 0){
      res.status(200).send(false);
      client.release();
      return;
    }
    res.status(200).send(results);
    client.release();
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
  //this is implementation of Hang's Password Reset Loop
  .get('/forgot', async (req, res) => {
    try {
      res.sendFile('./Pages/index.html', {root: __dirname});
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
 })

  //send email token of password reset part
 .put('/forgot', async (req, res) => {
   try {
     var email=req.body.email;
     const client = await pool.connect()
     var result = await client.query(`SELECT * FROM user_accounts WHERE email='${email}' LIMIT 1;`);
     console.log(result);
     if (typeof result.rows[0]=='undefined') {
      res.status(200).send(false);
       console.log('No '+email+ ' email be found in database');
       return res.send('No this email found');
     }else{
       //if user has the token then check the token expired time
       if(result.rows[0].resetpasswordtoken==null){
         //user has not a token then create a new one
         var token=crypto.randomBytes(16).toString('hex');
         //set 1 day expires time
         var expiresDateMoment=moment(new Date()).add(1,'d');
         expiresDateMoment=moment(expiresDateMoment).format('YYYY-MM-DD HH:mm:ss');
         var expiryDateTimeStamp=moment(expiresDateMoment).format("X");
         console.log("Token:"+token);
         globaltoken2=token;
         console.log("Expire Timestamp:"+expiryDateTimeStamp);
         //update database of this user
         var id=result.rows[0].id;
         var result2 = await client.query("UPDATE user_accounts SET resetpasswordtoken='"+token+"', resetpasswordexpires="+expiryDateTimeStamp+" WHERE id="+id+";");
         //nodemailer is a package from NPM that allows us to send mail
         const smtpTransport = nodemailer.createTransport({
           service: 'Gmail',
           auth: {
             user: 'suhang.steven@gmail.com',
             pass: process.env.GMAILPW
           }
         });
         //a email will be send from my email to user's email and user can click the email content
         //to jump to the new host page to reset their password and also verify the user email
         const mailOptions = {
           to: result.rows[0].email,
           from: 'suhang.steven@gmail.com',
           subject: 'Book Store Password Reset',
           text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
             'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
             'http://' + req.headers.host + '/reset/' + token + '\n\n' +
             'If you did not request this, please ignore this email and your password will remain unchanged.\n'
         };
         //pass the mail option created above and tell user the email has been sent successfully
         smtpTransport.sendMail(mailOptions, function(err, info) {
           if (err) {
             console.log(err);
           } else {
             console.log('Email sent: ' + info.response);
           }
           //'An e-mail has been sent to ' + result.rows[0].email + ' with further instructions.'
         });

       }else{

         //check whether pass the expires Date
         var currentMoment=moment(new Date());
         var currentTimeStamp=moment(currentMoment).format("X");
         //if pass the expires date, make a new one
         if(result.rows[0].resetpasswordexpires<currentTimeStamp){
           //user has not a token then create a new one
           var token=crypto.randomBytes(16).toString('hex');
           //set 1 day expires time
           var expiresDateMoment=moment(new Date()).add(1,'d');
           expiresDateMoment=moment(expiresDateMoment).format('YYYY-MM-DD HH:mm:ss');
           var expiryDateTimeStamp=moment(expiresDateMoment).format("X");
           console.log("Token:"+token);
           globaltoken2=token;
           console.log("Expire Timestamp:"+expiryDateTimeStamp);
           //update database of this user
           var id=result.rows[0].id;
           var result2 = await client.query("UPDATE user_accounts SET resetpasswordtoken='"+token+"', resetpasswordexpires="+expiryDateTimeStamp+" WHERE id="+id+";");
           //nodemailer is a package from NPM that allows us to send mail
           
           const smtpTransport = nodemailer.createTransport({
             service: 'Gmail',
             auth: {
               user: 'suhang.steven@gmail.com',
               pass: process.env.GMAILPW
             }
           });
           //a email will be send from my email to user's email and user can click the email content
           //to jump to the new host page to reset their password and also verify the user email
           const mailOptions = {
             to: result.rows[0].email,
             from: 'suhang.steven@gmail.com',
             subject: 'Node.js Password Reset',
             text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
               'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
               'http://' + req.headers.host + '/reset/' + token + '\n\n' +
               'If you did not request this, please ignore this email and your password will remain unchanged.\n'
           };
           //pass the mail option created above and tell user the email has been sent successfully
           smtpTransport.sendMail(mailOptions, function(err, info) {
             if (err) {
               console.log(err);
             } else {
               console.log('Email sent to '+result.rows[0].email+' :'  + info.response);
             }
             //'An e-mail has been sent to ' + result.rows[0].email + ' with further instructions.'
           });
         }else{
           console.log("Please check your email, a email sent to your account!");
         }
       }
       result.rows.forEach(row=>{
        // console.log(row);
       });
       var results1 = result.rows;
       console.log(results1)
       res.send(results1);
       client.release();
     }
   } catch (err) {
     console.error(err);
     res.send("Error " + err);
   }
 })

 .get('/reset/:token', async (req, res) => {
   try {
     //console.log("1111111:"+req.params.token);
     globaltoken=req.params.token;
     res.sendFile('./Pages/reset.html', {root: __dirname});
   } catch (err) {
     console.error(err);
     res.send("Error " + err);
   }
  })
 //confirm new password and Store into database
 .put('/reset/:token', async (req, res) => {
   var npassword=req.body.cnewpass;
   var resetpasswordtoken=globaltoken;
   var dbsalt="";
   var dbHash="";
   //salt and hash the password
   bcrypt.genSalt(10,(err, salt)=>{
     if(err){
       console.error(err);
     }else{
       dbsalt=salt;
       bcrypt.hash(npassword,salt,(err,hash)=>{
         if(err){
           console.error(err);
         }else{
           dbHash=hash;
         }
       });
     }
   });


   try {
     const client = await pool.connect()
     var result = await client.query(`SELECT * FROM user_accounts WHERE resetpasswordtoken='${resetpasswordtoken}' LIMIT 1;`);
     if (typeof result.rows[0]=='undefined') {
       var result3 = await client.query(`UPDATE user_accounts SET resetpasswordtoken=null, resetpasswordexpires=null WHERE resetpasswordtoken='${globaltoken2}'`);
       console.log("Your token is invaild. Cleared the invaild token!");
       return res.send('No token found');
       res.status(200).send(false);
     }else{
       var currentMoment=moment(new Date());
       var currentTimeStamp=moment(currentMoment).format("X");
       //if pass the expires date, so can not change password anymore
       if(result.rows[0].resetpasswordexpires<currentTimeStamp){
           console.log("Password change failed. Passed the expiration date.")
       }else{
         var id=result.rows[0].id;
         //update database of password and clear old token and token timestamp
         var result2 = await client.query(`UPDATE user_accounts SET hashpassword='${dbHash}', salt='${dbsalt}', resetpasswordtoken=null, resetpasswordexpires=null WHERE id=${id}`);
         if(!result2){
           return res.send("UPDATE Failure");
         } else {
            console.log("Password Reset Success");
            const smtpTransport = nodemailer.createTransport({
              service: 'Gmail',
              auth: {
                user: 'suhang.steven@gmail.com',
                pass: process.env.GMAILPW
              }
            });
            //a email will be send from my email to user's email and user can click the email content
            //to jump to the new host page to reset their password and also verify the user email
            const mailOptions = {
              to: result.rows[0].email,
              from: 'suhang.steven@gmail.com',
              subject: 'Your password has been changed',
              text: 'Hello,\n\n' +
                   'This is a confirmation that the password for your account ' + result.rows[0].email + ' has just been changed.\n'
            };
            //pass the mail option created above and tell user the email has been sent successfully
            smtpTransport.sendMail(mailOptions, function(err, info) {
              if (err) {
                console.log(err);
              } else {
                console.log('An Email has been sent to '+result.rows[0].email+': ' + info.response);
              }
              //'An e-mail has been sent to ' + result.rows[0].email + ' with further instructions.'
            });
           }
       }
       result.rows.forEach(row=>{
           //console.log(row);
       });
       var results1 = result.rows;
       //console.log(results1);
       res.send(results1);
       client.release();
     }
   } catch (err) {
     console.error(err);
     res.send("Error " + err);
   }
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
