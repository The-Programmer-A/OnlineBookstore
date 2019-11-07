
$(document).ready(function(e) {

  //$("#dialog").hide();

  $('#confirm').button().click(
 	 function(){
   	 	var email= $('#email').val();
      if(email===""){
  				alert("Email can not be empty. Please try again.");
  				return false;
  		}
      console.log("This is the email: " + email);
      $.ajax({
         url: "/forgot",
         method: 'PUT',
         contentType: "application/json",
         data: JSON.stringify({
           email:email
         }),
         success: function(response) {
           console.log(response);

           if(response === false){
             console.log("The email you have entered is not within out database");
             $("#emailError").modal("show"); //show the error modal
           }
         },
      });
 	 });

});
