$(document).ready(function(e) {
  var userEmail = "";
  var userEmailState = "";
  var userLogged = false;
  var authenticate = null;
  //hide the navigation bar that should only be shown to logged in users.
  $("#navbar2").hide();
  $("#header1").hide();
  $("#loadingcard2").hide();
  //$("#loadingModal").modal("hide");

  /* this is the implmentation of the Timout Funciton
  if the user does NOTHING on the page for 3 Minutes. They are logged out
  and greated with a message that informs them whats occured. */
  var idleSeconds = 180;

  $(function(){
    var idleTimer;
    function resetTimer(){
      clearTimeout(idleTimer);
      idleTimer = setTimeout(whenUserIdle,idleSeconds*1000);
    }
    $(document.body).bind('mousemove keydown click',resetTimer); //space separated events list that we want to monitor
    resetTimer(); // Start the timer when the page loads
  });

  function whenUserIdle(){
    console.log("Period of inactivity");
    if(userEmail.length > 1){
      $("#inactivity").modal("show");
    }
    $("#navbar2").hide();
    $("#navbar1").show();
    resetLoginFields();
  }


  $("#searchBar").click(function() {
    //$(location).attr("href", "http://localhost:5000/?#");
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
        $(location).attr("href", "https://afternoon-crag-26447.herokuapp.com/search"); // this is working
      },
      type: "GET"
    });
  });

  $("#Wishlist").click(function() {
    console.log("Should take you to the Wishlist page");
    //call to get information from the wishlist database.
    var userID = 0;
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
      complete: function() {
        //use the id of active user and the isbn to populate database.
        $.ajax({
          url: "/wishlistInfo",
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify({ userid: userID }),
          success: function(response) {
            console.log("RESPONSE" + JSON.stringify(response));
            var wishlistInfo = [];

            wishlistInfo = response.results;

            wishlistInfo.forEach(element => {
              console.log(element);
            });

            //this is how to obtain the information of the wishlist info.
            console.log(wishlistInfo[0].id + " " + wishlistInfo[0].isbn);

            //store all this information locally in an array - send it to another page.
            wishlistInfo = JSON.stringify(wishlistInfo);
            wishlistInfo = btoa(unescape(encodeURIComponent(wishlistInfo)));
            localStorage.setItem("_wishlist", wishlistInfo);
          },
          complete: function() {
            console.log("wishlist info gained");
            //move the the new page.
            $(location).attr("href", "http://localhost:5000/wishlistPage");
          }
        });
      }
    });
  });

  $("#Cart").click(function() {
    displayCartInfo();
  });

  function displayCartInfo() {
    console.log("Should take you to the Cart page");
    var userID = 0;
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
      complete: function() {
        //use the id of active user and the isbn to populate database.
        $.ajax({
          url: "/cartInfo",
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify({ userid: userID }),
          success: function(response) {
            console.log("RESPONSE" + JSON.stringify(response));
            var cartInfo = [];

            cartInfo = response.results;

            cartInfo.forEach(element => {
              console.log("something " + element);

            });

            //this is how to obtain the information of the wishlist info.
            console.log(cartInfo[0].id + " " + cartInfo[0].isbn);
            //store all this information locally in an array - send it to another page.
            cartInfo = JSON.stringify(cartInfo);
            cartInfo = btoa(unescape(encodeURIComponent(cartInfo)));
            localStorage.setItem("_cartInfo", cartInfo);
          },
          complete: function() {
            console.log("cart info gained");
            //move to the next page
            $(location).attr("href", "http://localhost:5000/cartPage");
          }
        });
      }
    });
  }

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
          $("#loginModal").modal("hide");
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
          $("#header2").hide();
          $("#header1").show();
          userLogged = true;
          authenticate = loginsPassword;
          updateUserService(userLogged);
          updateUserAuth();
          displaySuggested();
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
    //load the cart page
    displayCartInfo();
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

  function displaySuggested() {
    var cList = $("div.horizontalList1");
    var title = $("<h3/>")
          .text("Based On What You Like")
          .appendTo(cList);
    $("#loadingcard2").show();

    var things = ['Rock', 'Paper', 'Scissor'];
    var thing = things[Math.floor(Math.random()*things.length)];
    console.log(thing);
    var errorFlag1 = false;
    var suggestData = null;
    $.ajax({
      url: "https://www.googleapis.com/books/v1/volumes?q=" + thing, //i changed this
      dataType: "json",
      success: function(data) {
        console.log(data);
        suggestData = data;
      },
      error: function(errorThrown) {
        console.log("Error" + JSON.stringify(errorThrown));
        errorFlag1 = true;
        displayNoData();
        return;
      },
      complete: function() {
        if (errorFlag1) {
          console.log("something went wrong");
          $("#loadingcard2").hide();
          return;
        }

        $("#loadingcard2").hide();
        var ul = $("<ul/>")
          .addClass("list-group list-group-horizontal")
          .appendTo(cList);

        for (let i = 0; i < suggestData.items.length / 2; i++) {
          var li = $("<li/>")
            .addClass("list-group-item")
            .attr("id", [i])
            .appendTo(ul);

          var image = $("<img/>")
            .attr("src", suggestData.items[i].volumeInfo.imageLinks.thumbnail)
            .attr("style", "justify-content: center")
            .attr("id", "bookImage")
            .appendTo(li);

          var p = $("<p/>")
            .text(suggestData.items[i].volumeInfo.title.substring(0, 36))
            .attr("style", "margin:0px auto; text-align:center")
            .appendTo(li);

          var btn2 = $("<button/>")
            .addClass("btn btn-light btn-sm btn-block")
            .attr("id", "wishlist" + [i])
            .appendTo(li);

          var btn3 = $("<button/>")
            .addClass("btn btn-light btn-sm btn-block")
            .attr("id", "cart" + [i])
            .appendTo(li);

          var watchlist = $("<i/>")
            .addClass("fas fa-heart")
            .appendTo(btn2);

          var cart = $("<i/>")
            .addClass("fas fa-cart-plus")
            .appendTo(btn3);
        }
      },
      type: "GET"
    });
  }

  //inner functions of the selected items buttons.
  $(".horizontalList").click(function() {
    console.log(userEmail);
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

  var cList = $("div.horizontalList");
  function displayNewest(data) {
    $("#loadingcard").hide();
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
        .text(data.items[i].volumeInfo.title.substring(0, 36))
        .attr("style", "margin:0px auto; text-align:center")
        .appendTo(li);

      var btn2 = $("<button/>")
        .addClass("btn btn-light btn-sm btn-block")
        .attr("id", "wishlist" + [i])
        .appendTo(li);

      var btn3 = $("<button/>")
        .addClass("btn btn-light btn-sm btn-block")
        .attr("id", "cart" + [i])
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
  $(".horizontalList").click(function() {
    console.log(userEmail);
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

  function addToCart(bookID) {
    if (userEmail.length < 1) {
      //show popup that tells the user to login before they add to cart
      console.log("You must be signed in to purchase books");
      $("#mustbesignedin").modal("show");
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
      complete: function() {
        //use the id of active user and the isbn to populate database.
        $.ajax({
          url: "/cart",
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify({ userid: userID, isbn: bookISBN }),
          success: function(response) {
            console.log("RESPONSE" + JSON.stringify(response));
            if (response === false) {
              $("#wishlistcartNot").modal("show");
            } else {
              //response was not false = successful
              $("#additionsuccess").modal("show");
            }
          }
        });
      }
    });
  }

  function addToWishlist(bookID) {
    if (userEmail.length < 1) {
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
      complete: function() {
        //use the id of active user and the isbn to populate database.
        $.ajax({
          url: "/wishlist",
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify({ userid: userID, isbn: bookISBN }),
          success: function(response) {
            console.log("RESPONSE" + JSON.stringify(response));
            //if successfull - show user message to say it was added to cart. Give them the option to view there cart, or keep shopping
            if (response === false) {
              $("#wishlistcartNot").modal("show");
            } else {
              //response was not false = successful
              $("#additionsuccesswishlist").modal("show");
            }
          }
        });
      }
    });
  }

  function displayNoData() {
    $("#loadingcard").hide();
    //create a div that holds no data.
    var top = $("div.col-sm-12");

    var div1 = $("<div/>")
      .addClass("card mb-4")
      .appendTo(top);

    var div2 = $("<div/>")
      .addClass("card-body text-center")
      .appendTo(div1);

    var h5 = $("<h5/>")
      .addClass("card-title")
      .text("Newest Releases")
      .appendTo(div2);

    var p = $("<p/>")
      .addClass("card-text")
      .text("Opps, Cannot display. Refresh the page.")
      .appendTo(div2);
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

  $("#registerLink2").click(function() {
    $("#mustbesignedin").modal("hide");
  });

  $("#back2Login3").click(function() {
    $("#mustbesignedin").modal("hide");
    $("#loginModal").modal("show");
  });

  $("#viewCartLink").click(function() {
    $("#additionsuccess").modal("hide");
    console.log("send the user to their cart");
  });

  $("#viewwishlistLink").click(function() {
    $("#additionsuccesswishlist").modal("hide");
    console.log("send the user to their wishlist");
  });

  function updateUserAuth() {
    if (authenticate != null) {
      authenticate = JSON.stringify(authenticate);
      authenticate = btoa(unescape(encodeURIComponent(authenticate)));
      localStorage.setItem("_authenticate", authenticate);
    }
  }
});
