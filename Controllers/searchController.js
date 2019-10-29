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
    }
    
});