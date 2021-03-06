$(document).ready(function (e) {
  loadData();
  var wishlistData;
  
  /* Helper method to load that data that was stored 
    when the user clicked the link to enter this page from home. */
  function loadData() {
    $("#loadingModal").modal("show");
    wishlistData = localStorage.getItem("_wishlist");
    if (!wishlistData) { //if no data
      console.log("no wishlist data");
      return false;
    }
    localStorage.removeItem("_wishlist");
    wishlistData = atob(wishlistData);
    wishlistData = JSON.parse(wishlistData);

    displayData(wishlistData); //call helper method to display data if there was any
  }

  /* helper method to display the data. All data recieved is only an ISBN Number, 
  therefore we must query the Google Books API to obtain the JSON Data of the book
  we can then use this JSON to display the entire book information */
  function displayData(wishlistData) {
    var cList = $("div.list-group");
    for (let i = 0; i < wishlistData.length; i++) {
      var currentBook = wishlistData[i].isbn;
      console.log(currentBook);
      var currentBookData;
       //AJAX to obtain the JSON of book ISBN
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
          console.log("Error" + JSON.stringify(errorThrown));
        },
        complete: function () {
           /* on successful completion of obtain book JSON. Dynamically display the cart information to HTML (view) */
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
        },
        type: "GET"
      });
    }
  }

    /* Implementaion of the link that send you back to the home page. */
  $("#Home1")
    .click(function () {
      $(location).attr("href", "https://afternoon-crag-26447.herokuapp.com/?#");
    })

});