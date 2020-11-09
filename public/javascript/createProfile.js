const photo = document.getDocumentById("profilePhoto");
const uploadButton = document.getDocumentById("uploadPhoto");

uploadButton.addEventListener("click", (e) => {
  e.preventDefault();
  var file = e.target.file;
  console.log(file);
});

document.getElementById("fileInput").click();
