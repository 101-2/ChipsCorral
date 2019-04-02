import React, { Component } from "react";
import "./Signup.css";

const axios = require("axios");

var baseURL = "http://localhost:3001";

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

class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.createUser = this.createUser.bind(this);
  }

  createUser(event) {
    var email = document.getElementById("inputEmail").value;
    var password = document.getElementById("inputPassword").value;
    var username = document.getElementById("inputUsername").value;

    console.log(email + " " + password + " " + username);

    var request = `/user/{"email":"${email}","password":"${password}","username":"${username}"}`;

    console.log(request);

    if (checkEmail(email)) {
      axios
        .put(request)
        .then(data => console.log(data))
        .catch(err => console.log(err));
    } else {
      window.alert("Must enter a @colorado.edu email");
    }
  }

  render() {
    return (
      <div className="container">
        <div className="col-4 col-centered">
          <form>
            <div className="form-group">
              <label htmlFor="inputEmail">Email Address</label>
              <input
                type="email"
                className="form-control"
                id="inputEmail"
                aria-describedby="emailField"
                placeholder="Enter email"
              />
              <small id="emailField" className="form-text text-muted">
                Must be an @colorado.edu email.
              </small>
            </div>
            <div className="form-group">
              <label htmlFor="inputPassword">Password</label>
              <input
                type="password"
                className="form-control"
                id="inputPassword"
                aria-describedby="passwordField"
                placeholder="Enter password"
              />
              <small id="passwordField" className="form-text text-muted">
                Enter a password.
              </small>
            </div>
            <div className="form-group">
              <label htmlFor="inputUsername">Username</label>
              <input
                type="text"
                className="form-control"
                id="inputUsername"
                aria-describedby="usernameField"
                placeholder="Enter username"
              />
              <small id="usernameField" className="form-text text-muted">
                Username is what other users will see you as.
              </small>
            </div>
            <button
              type="submit"
              className="btn btn-warning"
              onClick={this.createUser}
            >
              Create Account
            </button>
          </form>
        </div>
      </div>
    );
  }
}

export default Signup;
