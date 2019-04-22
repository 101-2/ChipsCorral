function getPosts() {
  var posts = "";
  axios
    .get("https://cub-forum.herokuapp.com/posts")
    .then(obj => {
      console.log(obj.data);
      for (var i = 0; i < obj.data.length; i++) {
        posts += `
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">${obj.data[i].title}</h5>
            <h6 class="card-subtitle mb-2 text-muted">${
              getUser(obj.data[i].user_id).displayName
            }</h6>
            <p class="card-text">${obj.data[i].content}</p>
          </div>
        </div>
        `;
      }
      console.log(posts);
      document.getElementById("post-container").innerHTML = posts;
    })
    .catch(err => {
      console.error(err);
    });
}

function getUser(user_id) {
  axios
    .get(`https://cub-forum.herokuapp.com/user?user_id=${user_id}`)
    .then(data => {
      console.log(data);
      return data;
    })
    .catch(err => {
      console.error(err);
    });
}
