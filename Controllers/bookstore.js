$(document).ready(function(e) {
  // Author: Armaan Chandra
  //hide the navigation bar that should only be shown to logged in users.
  $("#navbar2").hide();

  $("#searchBar").click(function(){
    $(location).attr('href', 'http://localhost:5000/?#');
  })

  /*
    This is the functionality of the searchBar
    */
  $("#searchBtn").click(function() {
    //take the input from the searchBar and use it
    var searchInput = $("#searchBar").val(); //query the API and display the results
    console.log(searchInput);
    var apiData = null;

    $.ajax({
        url: "https://www.googleapis.com/books/v1/volumes?q=" + searchInput,
        dataType: "json",
        success: function(data) {

            console.log(data);
            apiData = JSON.stringify(data);
            apiData = btoa(unescape(encodeURIComponent(apiData)));
            localStorage.setItem('_account', apiData);
        }, 
        error: function(errorThrown){
          console.log("hey were in an error" + JSON.stringify(errorThrown));
          return;
        },
        complete: function(){
          $("#searchBar").val("");
          $(location).attr('href', 'http://localhost:5000/search'); // this is working

        },
        type: 'GET'
    }); 

   
    
  });

  /* This is the functionality of the links in the header.
    MyAccount, Wishlist, Cart */
  $("#MyAccount").click(function() {
    console.log("Should take you to the MyAccount page");
  });

  $("#Wishlist").click(function() {
    console.log("Should take you to the Wishlist page");
  });

  $("#Cart").click(function() {
    console.log("Should take you to the Cart page");
  });

  /* This is dealing with the inputs of the login popup modal. handles the 
    functionality of the googlesignin and the createaccount links.
    also handles the functionality of the login - need to be checked against the database */
  $("#GoogleSignIn").click(function() {
    console.log("Take you the the OAuth Page");
    resetLoginFields();
  });

  $("#forgotPasswordLink").click(function() {
    console.log("take you to the forgot password page");
    resetLoginFields();
  });

  //need to ensure that all fields are reset on exit
  $("#loginSubmit").click(function() {
    //take the inputs from the fields. Check whether they are stored in the database.
    var loginsEmail = $("#inputEmail4").val();
    var loginsPassword = $("#inputPassword").val();

    console.log("User email: " + loginsEmail);
    console.log("User Password " + loginsPassword);


    //validate the inputs with the records within the database.
    $.ajax({
        url: "/login",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ email: loginsEmail, pass: loginsPassword }),
        success: function(response) {
            if(response === false){
                console.log("Email or Password incorrect");

                $("#failedLogin").modal("show");
            }else{ //the password is correct
                console.log(response);
                var firstName = null;
                response.results.forEach(element => {
                    firstName = element.firstname;
                  })
                $("#successLogin").modal("show");
                $("#loginModal").modal("hide");
                $("#uservalue").html("Welcome " + firstName); //injects the firstName into the HTML
                $("#navbar1").hide();
                $("#navbar2").show();
            }
        },
  
    });
    
    //else if the login failed - username/password was wrong
    //

    //resetLoginFields();
  });

  $("#registerLink").click(function() {
    //hide the login popup screen, show the create account screen.
    resetLoginFields();
    $("#loginModal").modal("hide"); //working
    console.log("hiding the login popup");
    resetCreateAccount();
  });

  /* dealing with the functionalities within the CreateAccount popup modal. */
  $("#GoogleSignIn2").click(function() {
    console.log("Take you the the OAuth Page 2");
    resetCreateAccount();
  });

  //hide the create account form and show the login form again
  $("#back2Login").click(function() {
    $("#registerModal").modal("hide");
    resetCreateAccount();
    resetLoginFields();
    $("#loginModal").modal("show");
  });

  $("#createAccount").click(function() {
    //obtain all the fields for POSTING to DB
    var fName = $("#validationDefault01").val();
    var lName = $("#validationDefault02").val();
    var createEmail = $("#validationDefaultEmail").val();
    var zipCode = $("#validationDefault05").val();
    var city = $("#validationDefault03").val();
    var address = $("#validationDefault04").val();

    var pass1 = $("#inputPassword2").val();
    var pass2 = $("#inputPassword3").val();

    $("#inputPassword2").css("border-color", "##ff0000");
    $("#inputPassword3").css("border-color", "##ff0000");

    if(pass1 != pass2){ //if the passwords don't match let them try again
        $("#inputPassword2").css("border-color", "#ff0000");
        $("#inputPassword3").css("border-color", "#ff0000");
        return;
    }

    //if ANY field is left empty
    if(fName=="" || lName=="" || createEmail=="" ||zipCode=="" || city=="" || address=="" || pass1=="" || pass2==""){
        console.log("creation failed");
        $("#failedCreateAccount").modal("show");
    }else{ //all the fields are filled
        $.ajax({ //requesting to post the data
            url: "/create",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({ firstname: fName, lastname: lName, email: createEmail, zip: zipCode,
                city: city, address: address, password: pass1}), //send the data to the service 
            success: function(response) {
                //if the email is already in the database
                if(response === true){
                    $("#emailInUse").modal("show");
                    return;
                }
                //else the account was created and inserted into the database.
                console.log("account created successfully");
                $("#registerModal").modal("hide");  
                $("#createdAccountConfirmation").modal("show");
                resetCreateAccount();
            }
        });
    }
    //reset the password fields always.
    $("#inputPassword2").val("");
    $("#inputPassword3").val("");
  });

  $("#back2Login2").click(function(){
    $("#emailInUse").modal("hide");
    $("#registerModal").modal("hide");
    resetCreateAccount();
    resetLoginFields();
    $("#loginModal").modal("show");
  })

  $("#opHistory").click(function() {
    console.log("take you to the order/purchase history page");
  });

  $("#logout").click(function() {
    console.log("Logging user out");

    //clear all the information about the user was gathered on the page

    $("#navbar2").hide();
    $("#navbar1").show();
    resetLoginFields();
  });

  $("#inputPassword2").on("keyup", function() {
    strength();
  });
  function strength() {
    var val = $("#inputPassword2").val();
    var counter = 0;

    if (val != "") {
      if (val.length <= 5) {
        counter = 1;
      }
      if (val.length > 5 && val.length <= 10) {
        counter = 2;
      }
      if (val.length > 10 && val.length <= 15) {
        counter = 3;
      }

      if (counter == 1) {
        $("#length").html("Password Strength: Too Weak");

      }

      if (counter == 2) {
        $("#length").html("Password Strength: Medium");
      }

      if (counter == 3) {
        $("#length").html("Password Strength: Good");
      }
    }
  }

  $("#inputPassword3").on("keyup", function() {
    checkMatch();
  });
  function checkMatch(){
    var pw1 = $("#inputPassword2").val();
    var pw2 = $("#inputPassword3").val();

    console.log(pw1);
    console.log(pw2);

    if(pw1 === pw2){
        $("#match").html("Passwords: Match");
    }else{
        $("#match").html("Passwords: Don't Match");
    }
  }

  $("#failedLoginClose").click(function(){
      $("#inputPassword").val("");
  })

  //this is a helper method used to reset the fields on the Create Account form.
  function resetCreateAccount(){
      //reset all fields to empty
      $("#validationDefault01").val("");
      $("#validationDefault02").val("");
      $("#validationDefaultEmail").val("");
      $("#validationDefault05").val("");
      $("#validationDefault03").val("");
      $("#validationDefault04").val("");
      $("#inputPassword2").val("");
      $("#inputPassword3").val("");
      $("#length").html("");
  }

  function resetLoginFields(){
    $("#inputEmail4").val("");
    $("#inputPassword").val("");
  }
});
