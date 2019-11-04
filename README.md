## How to use the system:  
Our application is an E-Commerce bookstore website hosted on a Heroku server which is connected to a Postgresql Database. Our application uses a RESTful server and the Google Books API to obtain service and book information, enabling the website to achieve its functionality. Users are able to register/signup with either a local system account, or be authenticated through their google accounts using OAuth. To use the system users are able to view the link: https://afternoon-crag-26447.herokuapp.com.
The functionality offered by the RESTful Interface is as follows:  

* Create account  
* Login  
* Search Books  
* View Newest Releases  
* View Suggestions  
* Add Books to Cart   
* Add Books to Watchlist  
* Logout

## What error handling has been implemented into the system:
Validation and error handling has been implemented through every area of the system that in which ambiguity to the user can occur. Functions that result in multiple execution branches - such as logging; can either be a fail or success - are handled in such a way that the user is not unaware of what is occurring. Shown below is an example of login error handling - all cases are defined in the use cases (1.5).

Example of Success:  ![](./DocumentationImages/screenshot1.png)  
Example of Failure - wrong password:  ![](./DocumentationImages/screenshot2.png)  
Each of these errors are handled through the evaluation of the response obtained by the RESTFul service. This means that the processing of errors is done at the server side it , dependant on the outcome of the response received by the server different information is shown to the client browser. For example, following the same logging in example discussed above, we can see how the different outcomes are a result of server side evaluations: We are able to see that the outcomes of evaluating the hashed passwords, results in different information being sent to the RESTful resource thus resulting in different information being displayed to the user. Evaluating information at the server side increases the security of the application as the additional abstraction results in information being harder to obtain by potential attackers. These error handling principles outlined in this example of the login functionality is followed by each major function within the application. For more details - refer to git or 1.5 use cases.  ![](./DocumentationImages/screenshot3.png)


  
  


