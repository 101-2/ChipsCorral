function createUser() {
  const username = document.getElementById("usernameInput").nodeValue;
  if (!checkUsername(username)) {
    document.getElementById("usernameError").innerHTML = "Username taken";
    return;
  }
  axios
    .post("/user", { username: username })
    .then(data => {
      console.log(data);
    })
    .catch(err => console.log(err));
}

function checkUsername(username) {
  axios
    .get(`/user?username=${username}`)
    .then(data => {
      console.log(data);
      return false;
    })
    .catch(err => {
      console.log(err);
      return true;
    });
}
