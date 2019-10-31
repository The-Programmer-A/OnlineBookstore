$(document).ready(function(e) {
  var emailState = "";
  var passwordState = "";
  loadEmail();

  function loadEmail() {
    emailState = localStorage.getItem("_emailState");
    localStorage.removeItem("_emailState");
    emailState = atob(emailState);

    if (emailState === null) {
      //no need to continue
      return;
    } else {
      emailState = emailState.replace(/['"]+/g, "");
      authenticate();
    }
  }

  function authenticate() {
    passwordState = localStorage.getItem("_authenticate");
    localStorage.removeItem("_authenticate");
    passwordState = atob(passwordState);

    passwordState = passwordState.replace(/['"]+/g, "");
    reLogin();
  }

  function reLogin() {
    if (emailState != "" && passwordState != "") {
      console.log("trying to autologin");
      $.ajax({
        url: "/login",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ email: emailState, pass: passwordState }),
        success: function(response) {
          if (response === false) {
          } else {
            //the password is correct
            console.log(response);
            var firstName = null;
            response.results.forEach(element => {
              firstName = element.firstname;
            });
            $("#loginModal").modal("hide");
            $("#uservalue").html("Welcome " + firstName); //injects the firstName into the HTML
            $("#navbar1").hide();
            $("#navbar2").show();
          }
        }
      });
    }
  }
});
