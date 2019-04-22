function getPosts() {
  axios
    .get("https://cub-forum.herokuapp.com")
    .then(data => {
      console.log(data);
    })
    .catch(err => {
      console.error(err);
    });
}
