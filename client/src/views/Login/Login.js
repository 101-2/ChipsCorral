import React, { Component } from "react";
const axios = require("axios");

var baseURL = "http://localhost:3000";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.test = this.test.bind(this);
  }

  test(event) {
    axios
      .get(baseURL + "/test")
      .then(data => console.log(data))
      .catch(err => console.log(err));
  }

  render() {
    return (
      <div>
        <button className="btn btn-success" type="button" onClick={this.test}>
          Test
        </button>
      </div>
    );
  }
}

export default Login;
