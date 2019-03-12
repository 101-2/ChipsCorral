import React, { Component } from "react";
import { BrowserRouter, Route, Link } from "react-router-dom";

import "./Header.css";

import Home from "../../views/Home/Home";
import Login from "../../views/Login/Login";

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
          <Link to="/home">
            <button
              type="button"
              className="btn btn-warning"
              onClick="location.href='/home'"
            >
              Login
            </button>
          </Link>
        </header>
      </BrowserRouter>
    );
  }
}

export default Header;
