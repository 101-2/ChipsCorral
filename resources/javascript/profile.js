function deleteUser() {
  axios
    .get("https://cub-forum.herokuapp.com/user/delete")
    .then(data => {
      console.log(data);
      window.location = "https://cub-forum.herokuapp.com";
      window.alert("User deleted");
    })
    .catch(err => console.log(err));
}
