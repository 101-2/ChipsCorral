const baseUrl = "https://cub-forum.herokuapp.com";

function checkEmail(email) {
  var email_regex = RegExp("^[A-Za-z0-9._%+-]+@colorado.edu$");
  if (email_regex.test(email)) {
    console.log(`${email} is valid`);
    return true;
  } else {
    console.log("Must be a @colorado.edu email");
    return false;
  }
}

function createUser() {
  var new_email = document.getElementById("inputEmail").value;
  var new_password = document.getElementById("inputPassword").value;
  var new_username = document.getElementById("inputUsername").value;

  console.log(new_email + " " + new_password + " " + new_username);

  if (checkEmail(new_email)) {
    var params = {
      email: new_email,
      password: new_password,
      username: new_username
    };

    axios
      .post(`${baseUrl}/user`, params)
      .then(res => {
        console.log("Response: ", res);
        window.location.replace(baseUrl + "/home");
      })
      .catch(error => {
        if (error.response) {
          console.log("Error data : ", error.response.data);
          console.log("Error status : ", error.response.status);
          console.log("Error headers : ", error.response.headers);
        } else if (error.request) {
          console.log("Error request : ", error.request);
        } else {
          console.log("Error message : ", error.message);
        }
        console.log(error.config);
      });
  } else {
    window.alert("Must enter a @colorado.edu email");
  }
}
