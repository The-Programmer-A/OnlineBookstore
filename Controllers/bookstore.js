$(document).ready(function(e) {
  var userEmail = "";

  //hide any content that should not be displayed to an unlogged in user.
  $("#navbar2").hide(); 
  $("#header1").hide(); 
  $("#loadingcard2").hide();

  /* Implmentation of the Timout Funciton
  if the user does NOTHING on the page for 3 Minutes. They are logged out
  and greated with a message that informs them whats occured / why. */
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

  /*Implementation of the JQuery Commands that associate with the Index.HTML  */
  $("#searchBar").click(function() {
    $(location).attr("href", "https://afternoon-crag-26447.herokuapp.com/?#");
  });

  /* This is the functionality of the searchBar.
  take the inputs of the search box and query Google Books API for results
  Send user to the page that displays search results*/
  $("#searchBtn").click(function() {
    var searchInput = $("#searchBar").val(); //obtain value of search
    $("#loadingModal").modal("show"); //UX to show users somethings happening
    var errorFlag = false;
    var apiData = null;
    //AJAX call to Google Books API
    $.ajax({
      url: "https://www.googleapis.com/books/v1/volumes?q=" + searchInput,
      dataType: "json",
      success: function(data) { //obtained JSON data from API
        //store this information locally - make it useable by other JS classes.
        apiData = JSON.stringify(data);
        apiData = btoa(unescape(encodeURIComponent(apiData)));
        localStorage.setItem("_account", apiData);

        //store email locally.
        userEmail = JSON.stringify(userEmail);
        userEmail = btoa(unescape(encodeURIComponent(userEmail)));
        localStorage.setItem("_email", userEmail);
      },
      error: function(errorThrown) {
        console.log("Error" + JSON.stringify(errorThrown));
        errorFlag = true;
        //Load an error PopUp
        $("#loadingModal").modal("hide");
        $("#noSearch").modal("show");
        return;
      },
      complete: function() {
        if (errorFlag) { //if the Error Occured.
          console.log("something went wrong");
          $("#noSearch").modal("show");
          $("#searchBar").val("");
          return;
        }
        $("#loadingModal").modal("hide");
        $("#searchBar").val("");
        //move the user to the search page
        $(location).attr("href", "https://afternoon-crag-26447.herokuapp.com/search"); 
      },
      type: "GET"
    });
  });

  /* Implementation of when the user clicks the Wishlist link in the header.
  This will utilize the Wishlist database. */
  $("#Wishlist").click(function() {
    console.log("Should take you to the Wishlist page");
    var userID = 0;
    // First obtain the ID of the user
    $.ajax({
      url: "/getID",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ email: userEmail }),
      success: function(response) {
        response.results.forEach(element => {
          userID = element.id;
        });
      },
      complete: function() {
        // when the .get is completed use the id of active user and the isbn to populate wishlist database.
        $.ajax({
          url: "/wishlistInfo",
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify({ userid: userID }),
          success: function(response) {
            console.log("RESPONSE" + JSON.stringify(response));
            var wishlistInfo = [];
            wishlistInfo = response.results;
            //store all this information locally in an array - send it to another page.
            wishlistInfo = JSON.stringify(wishlistInfo);
            wishlistInfo = btoa(unescape(encodeURIComponent(wishlistInfo)));
            localStorage.setItem("_wishlist", wishlistInfo);
          },
          complete: function() {
            //move the the wishlist page.
            $(location).attr("href", "https://afternoon-crag-26447.herokuapp.com/wishlistPage");
          }
        });
      }
    });
  });

  /*implementation of the Cart link in the nav bar header*/
  $("#Cart").click(function() {
    displayCartInfo();
  });

  /* Helper method used by the Cart link. Obtains the required information from the cart database
  from the associcated user. Redirects the user to the Cart page.  */
  function displayCartInfo() {
    var userID = 0;
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
        // when the .get is completed use the id of active user and the isbn to populate database.
        $.ajax({
          url: "/cartInfo",
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify({ userid: userID }),
          success: function(response) {
            console.log("RESPONSE" + JSON.stringify(response));
            var cartInfo = [];
            cartInfo = response.results;
            //store all this information locally in an array - send it to another page.
            cartInfo = JSON.stringify(cartInfo);
            cartInfo = btoa(unescape(encodeURIComponent(cartInfo)));
            localStorage.setItem("_cartInfo", cartInfo);
          },
          complete: function() {
            //move to the cart page
            $(location).attr("href", "https://afternoon-crag-26447.herokuapp.com/cartPage");
          }
        });
      }
    });
  }
  /* Implementation of the forgot password link. Users are able to reset their password.
  This links the frontend with the work done by @suhang.  */
  $("#forgotPasswordLink").click(function() {
    console.log("Intergrate Hang's Code");
    resetLoginFields();
  });

  /* Functionality related to a user trying to login
  PRE CONDITION: User email must be registered to account in Database
  PRE CONDITION: User password must match password hash stored in Database
  POST CONDITION: User is authenticated as account member. 

  All validation - checking information in the database is handled @ server side.
  response obtained from the database will result in different information display on View*/
  $("#loginSubmit").click(function() {
    var loginsEmail = $("#inputEmail4").val();
    var loginsPassword = $("#inputPassword").val();
    //validate the inputs with the records within the database.
    $.ajax({
      url: "/login",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ email: loginsEmail, pass: loginsPassword }),
      success: function(response) {
        if (response === false) {
          console.log("Email or Password incorrect");
          //show that username / password is incorrect
          $("#failedLogin").modal("show");
          $("#loginModal").modal("hide");
        } else {  //the password is correct
          userEmail = loginsEmail;
          var firstName = null;
          response.results.forEach(element => {
            firstName = element.firstname;
          });
          //manipulate the HTML to give the logged in users display.
          $("#successLogin").modal("show");
          $("#loginModal").modal("hide");
          $("#uservalue").html("Welcome " + firstName);
          $("#navbar1").hide();
          $("#navbar2").show();
          $("#header2").hide();
          $("#header1").show();
          displaySuggested();
          resetLoginFields();
        }
      }
    });
  });

  /* This is the link from the Login screen to take 
  you to the Create Account screen */
  $("#registerLink").click(function() {
    //hide the login popup screen, show the create account screen.
    resetLoginFields();
    $("#loginModal").modal("hide");
    resetCreateAccount();
  });

  /* This is the link to take you from the Create Account screen
  back to the Login Page. */
  $("#back2Login").click(function() {
    $("#registerModal").modal("hide");
    resetCreateAccount();
    resetLoginFields();
    $("#loginModal").modal("show");
  });

  /* Implementation handles the information in the Create Account screen.
  PRE CONDITION: Users email must not already be in the database
  POST CONDITION: Users account details are successfully stored in user_accounts database
  + password is stored and hashed. - all validation functionality is handled in Server service. */
  $("#createAccount").click(function() {
    //obtain all the fields for required for posting to database.
    var fName = $("#validationDefault01").val();
    var lName = $("#validationDefault02").val();
    var createEmail = $("#validationDefaultEmail").val();
    var zipCode = $("#validationDefault05").val();
    var city = $("#validationDefault03").val();
    var address = $("#validationDefault04").val();

    var pass1 = $("#inputPassword2").val();
    var pass2 = $("#inputPassword3").val();

    $("#inputPassword2").css("border-color", "##ff000006");
    $("#inputPassword3").css("border-color", "##ff000006");

    //if the passwords don't match let them try again. Show feedback with changing border color
    if (pass1 != pass2) { 
      $("#inputPassword2").css("border-color", "#ff0000");
      $("#inputPassword3").css("border-color", "#ff0000");
      return;
    }

    //if ANY field is left empty - result in error message.
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
      //feedback that user cannot have empty fields
      $("#failedCreateAccount").modal("show");
    } else {//all the fields are filled
      // Calling to post data to server.
      $.ajax({
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

  /* Implementation to take you back the login page
  from one of the invalid request modals. */
  $("#back2Login2").click(function() {
    $("#emailInUse").modal("hide");
    $("#registerModal").modal("hide");
    resetCreateAccount();
    resetLoginFields();
    $("#loginModal").modal("show");
  });

  /* Implementation to show the order history of the user */
  $("#opHistory").click(function() {
    displayCartInfo();
  });

  /* Logs the user out */
  $("#logout").click(function() {
    console.log("Logging user out");
    $("#navbar2").hide();
    $("#navbar1").show();
    resetLoginFields();
  });

  /* Implementaion of user feedback that shows the user the strength of their password */
  $("#inputPassword2").on("keyup", function() {
    strength(); //call helper method
  });

  /* implementation of helper method. */
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

  /* implementation of user feedback to show if user passwords match */
  $("#inputPassword3").on("keyup", function() {
    checkMatch(); //helper method
  });

  /* implementation of helper method */
  function checkMatch() {
    var pw1 = $("#inputPassword2").val();
    var pw2 = $("#inputPassword3").val();
    //Update HTML to show user information.
    if (pw1 === pw2) {
      $("#match").html("Passwords: Match");
    } else {
      $("#match").html("Passwords: Don't Match");
    }
  }

  /* reset the login fields when user closes a modal. 
  This is security feature to never leave information stored on broswer. */
  $("#failedLoginClose").click(function() {
    $("#inputPassword").val("");
  });


  /* Implementation of Google Books API call to retrieve book information
  This allows for users logged in or not to see the newest books. */
  var newData = null;
  $.ajax({
    url: "https://www.googleapis.com/books/v1/volumes?q=the&orderBy=newest", 
    dataType: "json",
    success: function(data) { //obtained the data
      console.log(data);
      newData = data;
    },
    error: function(errorThrown) { //did not obtain the data + handel error
      console.log("Error" + JSON.stringify(errorThrown));
      displayNoData();
      return;
    },
    complete: function() { //after data recieved. display with helper method
      displayNewest(newData);
    },
    type: "GET"
  });

  /* implentation builds a Div using JQuery dynamically to be displayed in the 
  HTML. This has to be dynamically built as size and information differ from user to user. */
  function displaySuggested() {
    var cList = $("div.horizontalList1"); //obtain an item from HTML

    var title = $("<h3/>") //add title to div
          .text("Based On What You Like")
          .appendTo(cList);
              
    $("#loadingcard2").show();

    var things = ['Rock', 'Paper', 'Scissor', 'Chicken', 'Harry Potter', 'Water'];
    var thing = things[Math.floor(Math.random()*things.length)];

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
        displayNoData();
        return;
      },
      complete: function() {
        //Dynamically build HTML to house the information recieved from Google Books
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

  /* Obtain the contents of the div. This allows for 
  the handeling of user actions on the dynamically built 
  HTML Components. Handels the Cart or Wishlist functionality
  of the books in the dynamically built view */
  $(".horizontalList").click(function() {
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

  /* Implementation is the helper method used to dynamically built a
  list of newest books from the information obtained from Google Books API
  @param: Data = JSON Data from google Books API */
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

  /* Obtain the contents of the div. This allows for 
  the handeling of user actions on the dynamically built 
  HTML Components. Handels the Cart or Wishlist functionality
  of the books in the dynamically built view */
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

  /* Implementaion handles adding the selected book into the cart database. */
  function addToCart(bookID) {
    if (userEmail.length < 1) { //validation - you must be signed in to purchase a book
      $("#mustbesignedin").modal("show");
      return;
    }
    var userID = 0;
    var bookISBN = bookID;
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

   /* Implementaion handles adding the selected book into the wishlist database. */
  function addToWishlist(bookID) {
    if (userEmail.length < 1) {
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
          url: "/wishlist",
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify({ userid: userID, isbn: bookISBN }),
          success: function(response) {
            if (response === false) {
              $("#wishlistcartNot").modal("show");
            } else { //successfull - show user message to say it was added to wishlist.
              $("#additionsuccesswishlist").modal("show");
            }
          }
        });
      }
    });
  }

  /* Helper method used by the Google Book API Calls. If there was no data
  recieved from the API. Display a static HTML Div to show this information. 
  This helper method is the creation of such a static div. */
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

  /* this is a helper method used to reset the fields on the Create Account / Login forms. */
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

  /* this is a helper method used to reset the fields on the Create Account / Login forms. */
  function resetLoginFields() {
    $("#inputEmail4").val("");
    $("#inputPassword").val("");
  }
});
