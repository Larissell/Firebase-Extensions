const firebaseConfig = {
    apiKey: "AIzaSyDPzU2WE44jrV8cbplMFsCv1y-5LFeO3qU",
    authDomain: "uploadimg-fc170.firebaseapp.com",
    projectId: "uploadimg-fc170",
    storageBucket: "uploadimg-fc170.appspot.com",
    messagingSenderId: "779865574756",
    appId: "1:779865574756:web:64f2e8833bd6a6d50bbe71",
  };

  const app = firebase.initializeApp(firebaseConfig);

  const storage = firebase.storage(); //: Cria uma referência ao serviço de armazenamento do Firebase, que permite trabalhar com o armazenamento de arquivos.

  const inp = document.querySelector(".inp"); //: Seleciona o elemento HTML com a classe "inp", que é um campo de entrada de arquivo para o usuário selecionar uma imagem.
  const progressbar = document.querySelector(".progress"); //Seleciona o elemento HTML com a classe "img", que será usado para exibir a imagem após o upload.
  const img = document.querySelector(".img");
  const fileData = document.querySelector(".filedata");
  const loading = document.querySelector(".loading");
  let file;
  let fileName;
  let progress;
  let isLoading = false;
  let uploadedFileName;
  
  function selectImage() {
    inp.click();
  }
  
  function getImageData(e) {
    file = e.target.files[0];
    fileName = Math.round(Math.random() * 9999) + file.name;
    if (fileName) {
      fileData.style.display = "block";
    }
    fileData.innerHTML = fileName;
    console.log(file, fileName);
  }
  
  function atualizaStatus(snapshot){
    console.log("Snapshot", snapshot.ref.name);
    progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    progress = Math.round(progress);
    progressbar.style.width = progress + "%";
    progressbar.innerHTML = progress + "%";
    uploadedFileName = snapshot.ref.name;
  }

  function deuErro(erro){
    console.log(erro);
  }

  function deuCerto(){
    storage
          .ref("myimages")
          .child(uploadedFileName)
          .getDownloadURL()
          .then(function(url) {
            console.log("URL", url);
            // Exibe a imagem na página
            if (!url) {
              img.style.display = "none";
            } else {
              img.style.display = "block";
              loading.style.display = "none";
            }
            img.setAttribute("src", url);
          });
        console.log("File Uploaded Successfully");
  }

  function uploadImage() {
    // Exibe o elemento de carregamento para indicar que o upload está em andamento
    loading.style.display = "block";
  
    // Cria uma referência para o local no Firebase Storage onde a imagem será armazenada
    const storageRef = storage.ref().child("myimages");
  
    // Cria uma referência para o arquivo no Firebase Storage, usando o nome gerado aleatoriamente
    const folderRef = storageRef.child(fileName);
  
    // Inicia o processo de upload da imagem para o Firebase Storage
    const uploadtask = folderRef.put(file);
  
    // Adiciona um observador para monitorar o estado do upload
    uploadtask.on("state_changed",atualizaStatus,deuErro,deuCerto);
  }
  