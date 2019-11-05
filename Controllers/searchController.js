$(document).ready(function(e) {

  $("#navbar1").hide();
  $("#navbar2").hide();
  loadData();
  loadEmail();
  var data;
  var selectedItem;
  var email;

  function loadEmail(){
    email = localStorage.getItem("_email");
    localStorage.removeItem("_email");
    email = atob(email);

    console.log(email);
    if(!email.includes('@')){
      console.log("no email for this user")
      $("#navbar1").show();
      $("#navbar2").hide();
      return false;
    }

    formatEmail(email); 
    
  }

  function formatEmail(email1){
    email = email1.replace(/['"]+/g, '');
    var firstName = null;
    $.ajax({
      url: "/getName",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ email: email }),
      success: function(response) {
          response.results.forEach(element => {
            console.log(element);
            firstName = element.firstname;
          });
        console.log(firstName);
        $("#uservalue").html("Welcome " + firstName);
        $("#navbar2").show();
      }
    });
  }

  function loadData() {
    data = localStorage.getItem("_account");
    if (!data) {
      console.log("there is not results");
      noResultFlag = true;
      return false;
    }
    localStorage.removeItem("_account");
    data = atob(data);
    data = JSON.parse(data);

    console.log(data);
    displayData(data);
  }

  //helper function used to display the information to the user. - builtds a form
  function displayData(data) {
    console.log(data);
    var cList = $("div.list-group");
    for (let i = 0; i < data.items.length; i++) {
      var aaa = $("<a/>")
        .addClass("list-group-item list-group-item-action")
        .attr("href", "#")
        .attr("id", [i])
        .appendTo(cList);

      var div = $("<div/>")
        .addClass("d-flex w-100 justify-content-between")
        .appendTo(aaa);

      var h3 = $("<h5/>")
        .addClass("mb-1")
        .text(data.items[i].volumeInfo.title)
        .appendTo(div);

      var small = $("<small/>")
        .text(data.items[i].volumeInfo.authors)
        .appendTo(aaa);

      var para = $("<p/>")
        .text(data.items[i].volumeInfo.description)
        .appendTo(aaa);

      var small1 = $("<small/>")
        .text(data.items[i].volumeInfo.publishedDate)
        .appendTo(div);

      var watchlist = $("<i/>")
        .addClass("fas fa-heart")
        .appendTo(div);

      var cart = $("<i/>")
        .addClass("fas fa-cart-plus")
        .appendTo(div);
    }
  }

  //herlper variable to obtain the items within the modal.
  var modal = $("div.modal");
  $(".list-group-item").click(function() {
    selectedItem = $(this).attr("id");

    var div = $("<div/>")
      .addClass("modal-dialog")
      .attr("role", "document")
      .appendTo(modal);

    var div1 = $("<div/>")
      .addClass("modal-content")
      .appendTo(div);

    var div2 = $("<div/>")
      .addClass("modal-header")
      .appendTo(div1);

    var h4 = $("<h4/>")
      .addClass("modal-title")
      .text(data.items[selectedItem].volumeInfo.title)
      .appendTo(div2);

    var div3 = $("<div/>")
      .addClass("modal-body")
      .appendTo(div1);

    var division = $("<div/>")
      .attr("style", "margin:0px auto; text-align:center")
      .appendTo(div3);

    var modalBody = $("<p/>")
      .text("Authors: " + data.items[selectedItem].volumeInfo.authors)
      .appendTo(division);

    var image = $("<img/>")
      .attr("src", data.items[selectedItem].volumeInfo.imageLinks.thumbnail)
      .attr("style", "justify-content: center")
      .appendTo(division);

    var modalBody = $("<p/>")
      .text(
        "Publish Date: " + data.items[selectedItem].volumeInfo.publishedDate
      )
      .appendTo(division);

    var modalBody2 = $("<p/>")
      .text("Rating: " + data.items[selectedItem].volumeInfo.ratingsCount)
      .appendTo(division);

    var btn2 = $("<button/>")
      .addClass("btn btn-dark btn-lg btn-block")
      .attr("id", "wishlist")
      .text("Add to Wishlist")
      .appendTo(division);

    var btn3 = $("<button/>")
      .addClass("btn btn-dark btn-lg btn-block")
      .attr("id", "cart")
      .text("Add to Cart")
      .appendTo(division);

    var div4 = $("<div/>")
      .addClass("modal-footer")
      .appendTo(div1);

    var btn1 = $("<button/>")
      .addClass("btn btn-secondary")
      .attr("data-dismiss", "modal")
      .text("Close")
      .appendTo(div4);

    $("#details").modal("show");
    console.log("you clicked: " + $(this).attr("id"));
    
    //inner functions of the selected items buttons.
    $("#cart").click(function() {
      console.log("cart clicked");
      if(email === null){
        console.log("need to be logged in");
        return;
      }
      var userEmail = email;
      var clickedISBN = data.items[selectedItem].id;
      var userID = -1;
      $.ajax({
        url: "/getID",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ email: userEmail }),
        success: function(response){
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
            data: JSON.stringify({ userid: userID, isbn: clickedISBN }),
            success: function(response) {
             if(response === false){
               //do nothing
             }else{
              $("#details").modal("hide");
             }
            },
          });
        },
      });
    });

    $("#wishlist").click(function() {
      console.log("wishlist clicked");
      var userEmail = email;
      var clickedISBN = data.items[selectedItem].id;
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
        complete: function(){
          //use the id of active user and the isbn to populate database. 
          $.ajax({
            url: "/wishlist",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({ userid: userID, isbn: clickedISBN }),
            success: function(response) {
             console.log("RESPONSE" + JSON.stringify(response));
             if(response === false){
              //do nothing
             }else{
              $("#details").modal("hide");
             }
            },
            error: function(errorThrown) {
              console.log("hey were in an error" + JSON.stringify(errorThrown));
              return;
            },
          });
        },
      });
    });
  });

  //this is required to rest the modal list
  $(".modal").on("hidden.bs.modal", function() {
    $(".modal").html("");
  });

  $("#Home1")
    .click(function(){
      $(location).attr("href", "https://afternoon-crag-26447.herokuapp.com/?#");
  })

  $("#opHistory").click(function() {
    console.log("take you to the order/purchase history page");
    //load the cart page
    displayCartInfo();
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
            var wishlistInfo = [];

            wishlistInfo = response.results;

            //store all this information locally in an array - send it to another page.
            wishlistInfo = JSON.stringify(wishlistInfo);
            wishlistInfo = btoa(unescape(encodeURIComponent(wishlistInfo)));
            localStorage.setItem("_wishlist", wishlistInfo);
          },
          complete: function() {
            console.log("wishlist info gained");
            //move the the new page.
            $(location).attr("href", "https://afternoon-crag-26447.herokuapp.com/wishlistPage");
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
            //store all this information locally in an array - send it to another page.
            cartInfo = JSON.stringify(cartInfo);
            cartInfo = btoa(unescape(encodeURIComponent(cartInfo)));
            localStorage.setItem("_cartInfo", cartInfo);
          },
          complete: function() {
            console.log("cart info gained");
            //move to the next page
            $(location).attr("href", "https://afternoon-crag-26447.herokuapp.com/cartPage");
          }
        });
      }
    });
  }

  $("#logout").click(function() {
    console.log("Logging user out");
    $("#navbar2").hide();
    $("#navbar1").show();
    resetLoginFields();
  });

});
