$(document).ready(function(e) {

  $('#update').button().click(
 	 function(){
   	 	var newpass= $('#newpass').val();
      var cnewpass=$('#cnewpass').val();
      if(newpass===""||cnewpass===""){
  				alert("Inputs can not be empty. Please try again.");
  				return false;
  		}
      if(newpass!==cnewpass){
        alert("Passwords are not same. Please try again.");
        return false;
      }
      console.log("This is the new pass: " + newpass);
      console.log("This is the confirm new pass: " + cnewpass);
      $.ajax({
         url: "/reset/:token",
         method: 'PUT',
         contentType: "application/json",
         data: JSON.stringify({
           newpass:newpass,
           cnewpass:cnewpass
         }),
         success: function(response) {
           //console.log(response);
         },
      });
 	 });

});
