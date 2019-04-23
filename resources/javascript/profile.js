function deleteUser() {
  axios
    .delete("https://cub-forum.herokuapp.com/user/delete")
    .then(data => console.log(data))
    .catch(err => console.log(err));
}
