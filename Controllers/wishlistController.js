$(document).ready(function (e) {
  loadData();

  var wishlistData;
  function loadData() {
    $("#loadingModal").modal("show");
    wishlistData = localStorage.getItem("_wishlist");
    if (!wishlistData) {
      console.log("no wishlist data");
      return false;
    }
    localStorage.removeItem("_wishlist");
    wishlistData = atob(wishlistData);
    wishlistData = JSON.parse(wishlistData);

    console.log(wishlistData);
    displayData(wishlistData);
  }

  function displayData(wishlistData) {
    console.log("displaying the data");
    var cList = $("div.list-group");
    for (let i = 0; i < wishlistData.length; i++) {
      var currentBook = wishlistData[i].isbn;
      console.log(currentBook);
      var currentBookData;

      $.ajax({
        url: "https://www.googleapis.com/books/v1/volumes?q=" + currentBook,
        dataType: "json",
        success: function (data) {
          //send the JSON data from API
          currentBookData = data;
        },
        error: function (errorThrown) {
          $("#loadingModal").modal("hide");
          $("#serverError").modal("show");
          console.log("hey were in an error" + JSON.stringify(errorThrown));
        },
        complete: function () {
          $("#loadingModal").modal("hide");
          var aaa = $("<a/>")
            .addClass("list-group-item list-group-item-action")
            .attr("href", "#")
            .attr("id", [i])
            .attr("style", "margin:0px auto; align-items:center; justify-content")
            .appendTo(cList);

          var div = $("<div/>")
            .addClass("d-flex w-100 justify-content-between")
            .appendTo(aaa);

          var h3 = $("<h5/>")
            .addClass("mb-1")
            .text(currentBookData.items[0].volumeInfo.title)
            .appendTo(div);

          var para = $("<img/>")
            .attr("src", currentBookData.items[0].volumeInfo.imageLinks.thumbnail)
            .attr("id", "thumbnail")
            .attr("style", "float: right")
            .appendTo(div);

          var small = $("<small/>")
            .text(currentBookData.items[0].volumeInfo.authors)
            .appendTo(div);


          var small1 = $("<small/>")
            .text(currentBookData.items[0].volumeInfo.publishedDate)
            .appendTo(div);

          var watchlist = $("<i/>")
            .addClass("fas fa-heart")
            .appendTo(div);

            //getData(currentBookData);
        },
        type: "GET"
      });
    }

   
  }

  //herlper variable to obtain the items within the modal.
  function getData(data) {
    var modal = $("div.modal1");
    $(".list-group-item").click(function () {
      selectedItem = $(this).attr("id");
      console.log(selectedItem);

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
        .attr("id", "remove")
        .text("Remove from Wishlist")
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
      $("#cart").click(function () {
        console.log("cart clicked");
        if (email === null) {
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
          success: function (response) {
            response.results.forEach(element => {
              console.log(typeof element);
              userID = element.id;
            });
          },
          complete: function () {
            //use the id of active user and the isbn to populate database. 
            $.ajax({
              url: "/cart",
              method: "POST",
              contentType: "application/json",
              data: JSON.stringify({ userid: userID, isbn: clickedISBN }),
              success: function (response) {
                if (response === false) {
                  //do nothing
                } else {
                  $("#details").modal("hide");
                }
              },
            });
          },
        });
      });

      $("#remove").click(function () {
        console.log("remove clicked");
        var userEmail = email;
        var clickedISBN = data.items[selectedItem].id;
        var userID = 0;
        $.ajax({
          url: "/getID",
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify({ email: userEmail }),
          success: function (response) {
            response.results.forEach(element => {
              console.log(typeof element);
              userID = element.id;
            });
          },
          complete: function () {
            //use the id of active user and the isbn to populate database. 
            $.ajax({
              url: "/removefromwishlist", //create this.
              method: "POST",
              contentType: "application/json",
              data: JSON.stringify({ userid: userID, isbn: clickedISBN }),
              success: function (response) {
                console.log("RESPONSE" + JSON.stringify(response));
                if (response === false) {
                  //do nothing
                } else {
                  $("#details").modal("hide");
                }
              },
              error: function (errorThrown) {
                console.log("hey were in an error" + JSON.stringify(errorThrown));
                return;
              },
            });
          },
        });
      });
    });
  }

  //this is required to rest the modal list
  $(".modal").on("hidden.bs.modal", function () {
    $(".modal").html("");
  });


  $("#Home1")
    .click(function () {
      $(location).attr("href", "https://afternoon-crag-26447.herokuapp.com/?#");
    })

});