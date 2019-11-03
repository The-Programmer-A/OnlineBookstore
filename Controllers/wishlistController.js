$(document).ready(function(e) {
    loadData();

    var wishlistData;
    function loadData(){
        wishlistData = localStorage.getItem("_wishlist");
        if(!wishlistData){
            console.log("no wishlist data");
            return false;
        }
        localStorage.removeItem("_wishlist");
        wishlistData = atob(wishlistData);
        wishlistData = JSON.parse(wishlistData);

        console.log(wishlistData);
        displayData(wishlistData);
    }

    function displayData(wishlistData){
        console.log("displaying the data");
        var cList = $("div.list-group");
        for (let i = 0; i < wishlistData.length; i++) {
            var currentBook = wishlistData[i].isbn;
            console.log(currentBook);
            var currentBookData;

            $.ajax({
                url: "https://www.googleapis.com/books/v1/volumes?q=" + currentBook,
                dataType: "json",
                success: function(data) {
                  //send the JSON data from API
                    currentBookData = data;
                    console.log(currentBookData);
                },
                error: function(errorThrown) {
                  console.log("hey were in an error" + JSON.stringify(errorThrown));
                  $("#modal1").modal("show");
                },
                complete: function() {
                    var aaa = $("<a/>")
                        .addClass("list-group-item list-group-item-action")
                        .attr("href", "#")
                        .attr("id", [i])
                        .attr("style", "margin:0px auto; align-items:center; justify-content: center")
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
                        .appendTo(aaa);

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

    $("#Home1")
    .click(function(){
      $(location).attr("href", "http://localhost:5000/?#");
  })
});