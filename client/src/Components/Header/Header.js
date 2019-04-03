import React, { Component } from "react";
import { BrowserRouter, Route, Link } from "react-router-dom";

// import Header style
import "./Header.css";

// bootstrap imports
import "bootstrap/dist/css/bootstrap.min.css";
import $ from "jquery";
import Popper from "popper.js";
import "bootstrap/dist/js/bootstrap.bundle.min";

class Header extends Component {
  render() {
    return (
      <BrowserRouter>
        <header className="header-format">
        <center>
            <a
              className="btnformat btn btn-warning"
              href="http://localhost:3000/login"
              role="button"
            >
              Login
            </a>
            <text className="or">or</text>
            <a
              className="btnformat btn btn-warning"
              href="http://localhost:3000/signup"
              role="button"
            >
              Sign-Up
            </a>
          </center>
        </header>
      </BrowserRouter>
    );
  }
}

export default Header;
