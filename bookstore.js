$(document).ready(function(e) {
    // Author: Armaan Chandra 

    /*
    This is the functionality of the searchBar
    */
    $("#searchBtn")
        .click(function() {
            //take the input from the searchBar and use it
            var searchInput = $("#searchBar").val(); //query the database and display the results
            console.log(searchInput)
        });

    /* This is the functionality of the links in the header.
    MyAccount, Wishlist, Cart */
    $("#MyAccount")
        .click(function() {
            console.log("Should take you to the MyAccount page");
        });

    $("#Wishlist")
        .click(function() {
            console.log("Should take you to the Wishlist page");
        });

    $("#Cart")
        .click(function() {
            console.log("Should take you to the Cart page");
        });

    /* This is dealing with the inputs of the login popup modal. handles the 
    functionality of the googlesignin and the createaccount links.
    also handles the functionality of the login - need to be checked against the database */
    $("#GoogleSignIn")
        .click(function(){
            console.log("Take you the the OAuth Page");
        });

    $("#forgotPasswordLink")
        .click(function(){
            console.log("take you to the forgot password page")
        })

    //need to ensure that all fields are reset on exit
    $("#loginSubmit")
        .click(function() {
            //take the inputs from the fields. Check whether they are stored in the database.
            var loginsEmail = $("#inputEmail4").val();
            var loginsPassword =$("#inputPassword").val();

            console.log("User email: " + loginsEmail);
            console.log("User Password " + loginsPassword);

            //after verification is success or fail. Response accordingly
            $("#loginModal").modal('hide'); //this is just here temporaraly 
        });

        
    $("#registerLink")
        .click(function(){
            //hide the login popup screen, show the create account screen.
            $("#loginModal").modal('hide'); //working
            console.log("hiding the login popup");
        });
    
    /* dealing with the functionalities within the CreateAccount popup modal. */
    $("#GoogleSignIn2")
        .click(function(){
            console.log("Take you the the OAuth Page 2");
        });

    //hide the create account form and show the login form again
    $("#back2Login")
        .click(function(){
            $("#registerModal").modal('hide');
            $("#loginModal").modal('show'); 
        })

    $("#createAccount")
        .click(function(){
            //and store all the fields from the form & store them into the database.
            //First ensure that the user has checked the boxes.
            //need to ensure that all fields are rest on exit
            var fName = $("#validationDefault01").val();
            var lName = $("#validationDefault02").val();
            var createEmail = $("#validationDefaultEmail").val();
            var zipCode = $("#validationDefault05").val();
            var city = $("#validationDefault03").val();
            var address = $("#validationDefault04").val();

            var pass1 = $("#inputPassword2").val();
            var pass2 = $("#inputPassword3").val();

            console.log(fName);
            console.log(lName);
            console.log(createEmail);
            console.log(zipCode);
            console.log(city);
            console.log(address);
            console.log(pass1);
            console.log(pass2);

            //if the passwords don't match..
            //if the email is already in the database
        })

    
});