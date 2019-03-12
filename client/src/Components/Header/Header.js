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
          <Link to="/login">
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
