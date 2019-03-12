import React, { Component } from "react";
import { BrowserRouter, Route, Link } from "react-router-dom";

// imports for views
import Home from "./views/Home/Home";
import Login from "./views/Login/Login";

import Header from "./Components/Header/Header";

// bootstrap imports
import "bootstrap/dist/css/bootstrap.min.css";
import $ from "jquery";
import Popper from "popper.js";
import "bootstrap/dist/js/bootstrap.bundle.min";

class App extends Component {
  componentDidMount() {
    document.body.style.background = "black";
  }
  render() {
    return (
      <BrowserRouter>
        <div>
          <Header />
          <Route path="/" exact component={Login} />
          <Route path="/home" component={Home} />
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
