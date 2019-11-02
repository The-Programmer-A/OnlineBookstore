$(document).ready(function(e) {
  var userEmail = "";
  var userEmailState = "";
  var userLogged = false;
  var authenticate = null;
  //hide the navigation bar that should only be shown to logged in users.
  $("#navbar2").hide();
  //$("#loadingModal").modal("hide");

  $("#searchBar").click(function() {
    $(location).attr("href", "http://localhost:5000/?#");
  });

  /*
    This is the functionality of the searchBar
    */
  $("#searchBtn").click(function() {
    //take the input from the searchBar and use it
    var searchInput = $("#searchBar").val(); //query the API and display the results
    $("#loadingModal").modal("show");
    console.log(searchInput);
    var errorFlag = false;
    var apiData = null;

    $.ajax({
      url: "https://www.googleapis.com/books/v1/volumes?q=" + searchInput,
      dataType: "json",
      success: function(data) {
        //send the JSON data from API

      
        console.log(data);
        apiData = JSON.stringify(data);
        apiData = btoa(unescape(encodeURIComponent(apiData)));
        localStorage.setItem("_account", apiData);

        //send the email.
        console.log(userEmail);
        userEmail = JSON.stringify(userEmail);
        userEmail = btoa(unescape(encodeURIComponent(userEmail)));
        localStorage.setItem("_email", userEmail);
      },
      error: function(errorThrown) {
        console.log("hey were in an error" + JSON.stringify(errorThrown));
        errorFlag = true;
        //load a error pop up
        $("#loadingModal").modal("hide");
        $("#noSearch").modal("show");
        return;
      },
      complete: function() {
        if (errorFlag) {
          console.log("something went wrong");
          $("#noSearch").modal("show");
          $("#searchBar").val("");
          return;
        }
        $("#loadingModal").modal("hide");
        $("#searchBar").val("");
        $(location).attr("href", "http://localhost:5000/search"); // this is working
      },
      type: "GET"
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
        if (response === false) {
          console.log("Email or Password incorrect");
          $("#failedLogin").modal("show");
        } else {
          //the password is correct
          userEmailState = loginsEmail;
          userEmail = loginsEmail;
          console.log(response);
          var firstName = null;
          response.results.forEach(element => {
            firstName = element.firstname;
          });
          $("#successLogin").modal("show");
          $("#loginModal").modal("hide");
          $("#uservalue").html("Welcome " + firstName); //injects the firstName into the HTML
          $("#navbar1").hide();
          $("#navbar2").show();
          userLogged = true;
          authenticate = loginsPassword;
          updateUserService(userLogged);
          updateUserAuth();
          resetLoginFields();
        }
      }
    });
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

    if (pass1 != pass2) {
      //if the passwords don't match let them try again
      $("#inputPassword2").css("border-color", "#ff0000");
      $("#inputPassword3").css("border-color", "#ff0000");
      return;
    }

    //if ANY field is left empty
    if (
      fName == "" ||
      lName == "" ||
      createEmail == "" ||
      zipCode == "" ||
      city == "" ||
      address == "" ||
      pass1 == "" ||
      pass2 == ""
    ) {
      console.log("creation failed");
      $("#failedCreateAccount").modal("show");
    } else {
      //all the fields are filled
      $.ajax({
        //requesting to post the data
        url: "/create",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({
          firstname: fName,
          lastname: lName,
          email: createEmail,
          zip: zipCode,
          city: city,
          address: address,
          password: pass1
        }), //send the data to the service
        success: function(response) {
          //if the email is already in the database
          if (response === true) {
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

  $("#back2Login2").click(function() {
    $("#emailInUse").modal("hide");
    $("#registerModal").modal("hide");
    resetCreateAccount();
    resetLoginFields();
    $("#loginModal").modal("show");
  });

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
  function checkMatch() {
    var pw1 = $("#inputPassword2").val();
    var pw2 = $("#inputPassword3").val();

    console.log(pw1);
    console.log(pw2);

    if (pw1 === pw2) {
      $("#match").html("Passwords: Match");
    } else {
      $("#match").html("Passwords: Don't Match");
    }
  }

  $("#failedLoginClose").click(function() {
    $("#inputPassword").val("");
  });

  //IDEA - make this a carosole?
  var errorFlag = false;
  var newData = null;
  $.ajax({
    url: "https://www.googleapis.com/books/v1/volumes?q=the&orderBy=newest", //i changed this
    dataType: "json",
    success: function(data) {
      console.log(data);
      newData = data;
    },
    error: function(errorThrown) {
      console.log("hey were in an error" + JSON.stringify(errorThrown));
      errorFlag = true;
      displayNoData();
      return;
    },
    complete: function() {
      if (errorFlag) {
        console.log("something went wrong");
        return;
      }
      displayNewest(newData);
    },
    type: "GET"
  });

  var cList = $("div.horizontalList");
  function displayNewest(data) {
    var ul = $("<ul/>")
      .addClass("list-group list-group-horizontal")
      .appendTo(cList);

    for (let i = 0; i < data.items.length / 2; i++) {
      var li = $("<li/>")
        .addClass("list-group-item")
        .attr("id", [i])
        .appendTo(ul);  

      var image = $("<img/>")
        .attr("src", data.items[i].volumeInfo.imageLinks.thumbnail)
        .attr("style", "justify-content: center")
        .attr("id", "bookImage")
        .appendTo(li);

      var p = $("<p/>")
        .text((data.items[i].volumeInfo.title).substring(0,36))
        .attr("style", "margin:0px auto; text-align:center")
        .appendTo(li)

      var btn2 = $("<button/>")
        .addClass("btn btn-light btn-sm btn-block")
        .attr("id", "wishlist"+[i])
        .appendTo(li);
  
      var btn3 = $("<button/>")
        .addClass("btn btn-light btn-sm btn-block")
        .attr("id", "cart" +[i])
        .appendTo(li);

      var watchlist = $("<i/>")
        .addClass("fas fa-heart")
        .appendTo(btn2);

      var cart = $("<i/>")
        .addClass("fas fa-cart-plus")
        .appendTo(btn3);
    }
  }
 

  //inner functions of the selected items buttons.
  $(".horizontalList").click( function() {
    console.log(userEmail)
    /* this will be adding isbn into the cart database */
    $("#cart0").click(function() {
      addToCart(newData.items[0].id);
      return;
    });

    $("#cart1").click(function() {
      addToCart(newData.items[1].id);
      return;
    });

    $("#cart2").click(function() {
      addToCart(newData.items[2].id);
      return;
    });

    $("#cart3").click(function() {
      addToCart(newData.items[3].id);
      return;
    });

    $("#cart4").click(function() {
      addToCart(newData.items[4].id);
      return;
    });

    /* This is adding the selected books ISBN into the wishlist database */

    $("#wishlist0").click(function() {
      addToWishlist(newData.items[0].id);
      return;
    });

    $("#wishlist1").click(function() {
      addToWishlist(newData.items[1].id);
      return;
    });

    $("#wishlist2").click(function() {
      addToWishlist(newData.items[2].id);
      return;
    });

    $("#wishlist3").click(function() {
      addToWishlist(newData.items[3].id);
      return;
    });

    $("#wishlist4").click(function() {
      addToWishlist(newData.items[4].id);
      return;
    });
    return;
  });

  function addToCart(bookID){
    if(userEmail.length < 1){
      //show popup that tells the user to login before they add to cart
      console.log("You must be signed in to purchase books");
      return;
    }
    var userID = 0;
    var bookISBN = bookID;
    //get the id
    $.ajax({
      url: "/getID",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ email: userEmail }),
      success: function(response) {
          response.results.forEach(element => {
            console.log(typeof element);
            userID = element.id;
          });
      }, 
      complete: function(){
        //use the id of active user and the isbn to populate database. 
        $.ajax({
          url: "/cart",
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify({ userid: userID, isbn: bookISBN }),
          success: function(response) {
           console.log("RESPONSE" + JSON.stringify(response));
           //if successfull - show user message to say it was added to cart. Give them the option to view there cart, or keep shopping
           //else return to the user that something went wrong.
          },
        });
      },
    });
  }
    

  function addToWishlist(bookID){
    if(userEmail.length < 1){
      //show popup that tells the user to login before they add to cart
      console.log("You must be signed in to purchase books");
      return;
    }
    var userID = 0;
    var bookISBN = bookID;
    //get the id
    $.ajax({
      url: "/getID",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ email: userEmail }),
      success: function(response) {
          response.results.forEach(element => {
            console.log(typeof element);
            userID = element.id;
          });
      }, 
      complete: function(){
        //use the id of active user and the isbn to populate database. 
        $.ajax({
          url: "/wishlist",
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify({ userid: userID, isbn: bookISBN }),
          success: function(response) {
           console.log("RESPONSE" + JSON.stringify(response));
           //if successfull - show user message to say it was added to cart. Give them the option to view there cart, or keep shopping
           //else return to the user that something went wrong.
          },
        });
      },
    });
  }


  function displayNoData(){
    //create a div that holds no data.
    var top = $("div.col-sm-12");

    var div1 = $("<div/>")
    .addClass("card mb-4")
    .appendTo(top)

    var div2 = $("<div/>")
    .addClass("card-body text-center")
    .appendTo(div1)

    var h5 = $("<h5/>")
    .addClass("card-title")
    .text("Newest Releases")
    .appendTo(div2)

    var p = $("<p/>")
    .addClass("card-text")
    .text("Opps, Cannot display. Refresh the page.")
    .appendTo(div2)
  }

  $("#card2").click(function() {
    console.log("in this 2");
  });

  //this is a helper method used to reset the fields on the Create Account form.
  function resetCreateAccount() {
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

  function resetLoginFields() {
    $("#inputEmail4").val("");
    $("#inputPassword").val("");
  }

  function updateUserService(status) {
    //this will send information to the service
    if (status) {
      userEmailState = JSON.stringify(userEmailState);
      userEmailState = btoa(unescape(encodeURIComponent(userEmailState)));
      localStorage.setItem("_emailState", userEmailState);
    } else {
      localStorage.setItem("_emailState", null);
    }
  }

  function updateUserAuth() {
    if (authenticate != null) {
      authenticate = JSON.stringify(authenticate);
      authenticate = btoa(unescape(encodeURIComponent(authenticate)));
      localStorage.setItem("_authenticate", authenticate);
    }
  }
});
