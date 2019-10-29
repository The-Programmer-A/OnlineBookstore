$(document).ready(function(e) {

    loadData();

    function loadData(){
        var data = localStorage.getItem('_account');
        if(!data){
            return false;
        }
        localStorage.removeItem('_account');
        data = atob(data);
        data = JSON.parse(data);

        console.log(data);
        displayData(data);
    }
    
    function displayData(data){
        var cList = $("div.list-group");
        for(let i = 0; i < data.items.length; i++){
            var aaa = $("<a/>")
            .addClass("list-group-item list-group-item-action")
            .attr('href', "#")
            .attr('id', 'bookitem' + [i])
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


        }
    }
});