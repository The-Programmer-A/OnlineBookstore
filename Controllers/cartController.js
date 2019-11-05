$(document).ready(function (e) {
    loadData();

    var cartData;
    function loadData() {
        $("#loadingModal").modal("show");
        cartData = localStorage.getItem("_cartInfo");
        if (!cartData) {
            console.log("no cart data");
            return false;
        }
        localStorage.removeItem("_cartInfo");
        cartData = atob(cartData);
        cartData = JSON.parse(cartData);

        console.log(cartData);
        displayData(cartData);
    }

    function displayData(cartData) {
        console.log("displaying the data");
        var cList = $("div.list-group");
        for (let i = 0; i < cartData.length; i++) {
            var currentBook = cartData[i].isbn;
            console.log(currentBook);
            var currentBookData;

            $.ajax({
                url: "https://www.googleapis.com/books/v1/volumes?q=" + currentBook,
                dataType: "json",
                success: function (data) {
                    //send the JSON data from API
                    currentBookData = data;
                    console.log(currentBookData);
                },
                error: function (errorThrown) {
                    $("#loadingModal").modal("hide");
                    console.log("hey were in an error" + JSON.stringify(errorThrown));
                    //modal to say that something went wrong.
                    $("#modal1").modal("show");
                },
                complete: function () {
                    $("#loadingModal").modal("hide");
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
                        .appendTo(div);

                    var small = $("<small/>")
                        .text(currentBookData.items[0].volumeInfo.authors)
                        .appendTo(div);


                    var small1 = $("<small/>")
                        .text(currentBookData.items[0].volumeInfo.publishedDate)
                        .appendTo(div);


                    var cart = $("<i/>")
                        .addClass("fas fa-cart-plus")
                        .appendTo(div);

                },
                type: "GET"
            });

        }
    }

    $("#Home1")
        .click(function () {
            $(location).attr("href", "https://afternoon-crag-26447.herokuapp.com/?#");
        })
});