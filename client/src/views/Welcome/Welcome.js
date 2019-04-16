import React, { Component } from "react";

// import Header style
import "./Welcome.css";

// bootstrap imports
import "bootstrap/dist/css/bootstrap.min.css";
import $ from "jquery";
import Popper from "popper.js";
import "bootstrap/dist/js/bootstrap.bundle.min";

class Welcome extends Component {
  render() {
    return (
      <div>
        <img
          className="bg"
          src="http://www.desktopimages.org/pictures/2015/0502/1/flatirons-wallpaper-84736.jpg"
        />
        <img
          className="centered"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Colorado_Buffaloes_wordmark.svg/1200px-Colorado_Buffaloes_wordmark.svg.png"
        />
      </div>
    );
  }
}

export default Welcome;
