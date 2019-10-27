$(document).ready(function(e) {
  // Author: Armaan Chandra

  //hide the navigation bar that should only be shown to logged in users.
  $("#navbar2").hide();

  /*
    This is the functionality of the searchBar
    */
  $("#searchBtn").click(function() {
    //take the input from the searchBar and use it
    var searchInput = $("#searchBar").val(); //query the database and display the results
    console.log(searchInput);
    //reset the search bar after functionality.
    $("#searchBar").val("");
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

    //after verification is success or fail. Response accordingly
    $("#loginModal").modal("hide"); //this is just here temporaraly
    $("#navbar1").hide();
    $("#navbar2").show();
    // i would want to obtain the FirstName and LastName of this user instead
    $("#uservalue").html("Welcome " + loginsEmail); //injects the loginEmail into the HTML

    

    //if the login was successfull - the inputs are within the database.
    //$("#successLogin").modal("show");

    //else if the login failed - username/password was wrong
    //$("#failedLogin").modal("show");

    resetLoginFields();
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
    //and store all the fields from the form & store them into the database.
    //First ensure that the user has checked the boxes.
    //need to ensure that all fields are rest on exit
    var fName = $("#validationDefault01").val();
    var lName = $("#validationDefault02").val();
    var createEmail = $("#validationDefaultEmail").val();
    var zipCode = $("#validationDefault05").val();
    var city = $("#validationDefault03").val();
    var address = $("#validationDefault04").val();

    var pass1 = $("#inputPassword2").val();
    var pass2 = $("#inputPassword3").val();

    console.log(fName);
    console.log(lName);
    console.log(createEmail);
    console.log(zipCode);
    console.log(city);
    console.log(address);
    console.log(pass1);
    console.log(pass2);

    //i should have a check here
    // if(pass1 != pass2) - show a popup that tells the user to fill the form out properly.

    $.ajax({
        url: "/user",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ firstname: fName, lastname: lName, email: createEmail, zip: zipCode,
            city: city, address: address, password: pass1}),
        success: function(response) {
            console.log(response);
          }
        });

    //if the passwords don't match..
    //if the email is already in the database

    $("#registerModal").modal("hide");
    //if the account was successfully created. Show the successful popup

    //$("#createdAccountConfirmation").modal("show");
    
    //else if the account was unsuccessful - Show the unsucessful popup. 
     
    //$("#failedCreateAccount").modal("show");
    resetCreateAccount();
  });

  $("#opHistory").click(function() {
    console.log("take you to the order/purchase history page");
  });

  $("#logout").click(function() {
    console.log("Logging user out");

    //clear all the information about the user was gathered on the page

    $("#navbar2").hide();
    $("#navbar1").show();
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
        console.log(" not equal");
        $("#match").html("Password Match");
    }else{
        $("#match").html("Password Don't Match");
    }
  }

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
