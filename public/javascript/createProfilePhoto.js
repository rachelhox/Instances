// require("dotenv").config();

// const photo = document.getElementById("profilePhoto");
//const uploadDisplay = document.getElementById("uploadPhoto");
// const uploadPhotoModal = document.getElementById("profilePictureModal");

// uploadPhotoModal.addEventListener("blur", function () {
//   console.log(`hi`);
//   document.location.reload();
//   console.log("leave");
// });

$("document").ready(function () {
  // const html_string = document.documentElement.outerHTML;
  // console.log(html_string);
  // const urlParams = new URLSearchParams(window.location.search);
  // const myParam = urlParams.get("myParam");
  // console.log(myParam);
  console.log(window.location.href);
  const href = window.location.href.toString();
  const userID = href[href.length - 1];
  console.log(href[href.length - 1]);
  // console.log(window.location.href.toString().length - 1);
  // let params = new URL(document.location).searchParams;
  // console.log(params);
  // console.log(params.toString());
  $("input[type=file]").on("change", function () {
    var $files = $(this).get(0).files;
    console.log($files);

    if ($files.length) {
      // Reject big files
      if ($files[0].size > $(this).data("max-size") * 1024) {
        console.log("Please select a smaller file");
        return false;
      }

      // Begin file upload
      $("#uploadPhoto").html("<h3>Uploading file to Imgur...</h3>!");
      console.log("Uploading file to Imgur..");
      // Replace ctrlq with your own API key
      var apiUrl = "https://api.imgur.com/3/image";
      var apiKey = "be6d41c0bf38f84";

      var settings = {
        async: false,
        crossDomain: true,
        processData: false,
        contentType: false,
        type: "POST",
        url: apiUrl,
        headers: {
          Authorization: "Client-ID " + apiKey,
          Accept: "application/json",
        },
        mimeType: "multipart/form-data",
      };

      var formData = new FormData();
      formData.append("image", $files[0]);
      settings.data = formData;

      // Response contains stringified JSON
      // Image URL available at response.data.link
      $.ajax(settings)
        .done(function (response) {
          console.log(`uploaded`);
          console.log(JSON.parse(response));
          const imgURL = JSON.parse(response).data.link;
          console.log(typeof imgURL);
          const userIDNumber = parseInt(userID);
          $.post(`/api/img/${userIDNumber}`, {
            id: userIDNumber,
            image: imgURL,
          })
            .then(
              $("#uploadPhoto").html(
                "<h5>Your profile picture is successfully updated!</h5>"
              )
            )
            .then(window.location.reload());
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });
  // uploadButton.addEventListener("click", () => {
  //   //e.preventDefault();
  //   //console.log(uploadButton.input);
  //   // var file = e.target.file;
  //   // console.log(file);
  // });

  // document.getElementById("fileInput").click();
});
