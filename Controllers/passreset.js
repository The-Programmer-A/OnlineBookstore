
$(document).ready(function(e) {

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
           //console.log(response);
         },
      });
 	 });

});
