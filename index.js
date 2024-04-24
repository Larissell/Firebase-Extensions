

const firebaseConfig = {
  apiKey: "AIzaSyDPzU2WE44jrV8cbplMFsCv1y-5LFeO3qU",
  authDomain: "uploadimg-fc170.firebaseapp.com",
  projectId: "uploadimg-fc170",
  storageBucket: "uploadimg-fc170.appspot.com",
  messagingSenderId: "779865574756",
  appId: "1:779865574756:web:64f2e8833bd6a6d50bbe71",
  measurementId: "G-S2VR1JKHPY"
  };
  
// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();
const firestore = firebase.firestore();
const auth = firebase.auth();



// Função para lidar com o login do usuário
function loginUser() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Login bem-sucedido, redirecione o usuário para a página de rotular imagens
      window.location.href = 'index.html';
      checkAuthAndLoad();
      displayLabels();
    })
    .catch((error) => {
      // Se ocorrer um erro, exiba uma mensagem de erro para o usuário
      const errorCode = error.code;
      const errorMessage = error.message;
      alert('Usuário não permitido');
    });
}

function checkAuthAndLoad() {
  auth.onAuthStateChanged(function(user) {
    if (user) {
      // Se o usuário estiver autenticado, permita o upload de imagens
      console.log("Usuário autenticado:", user);
    } else {
      // Se o usuário não estiver autenticado, redirecione para a página de login
      console.log("Usuário não autenticado. Redirecionando para a página de login...");
      window.location.href = 'login.html';
    }
  });
}

// Quando o documento HTML é totalmente carregado
document.addEventListener('DOMContentLoaded', function () {
  // Adiciona um ouvinte de evento para o botão de login
  document.getElementById('loginButton').addEventListener('click', loginUser);

  // Chama a função para exibir os rótulos quando a página carregar
  displayLabels();
});

function showImage(){
  checkAuthAndLoad();
  displayLabels();  
}

function uploadImage() {
  checkAuthAndLoad();

  const fileInput = document.getElementById('image-upload');
  const file = fileInput.files[0];

  if (!file) {
    console.error('Nenhuma imagem selecionada.');
    return;
  }

  const imageRef = storage.ref(`/images/${file.name}`);

  imageRef.put(file).then((snapshot) => {
    console.log('Imagem enviada com sucesso para o Firebase Storage.');

    snapshot.ref.getDownloadURL().then((imageUrl) => {
      console.log('URL da imagem:', imageUrl);

      // Atualiza a imagem na tela com a URL pública
      const imageElement = document.getElementById('imageElementId'); // Substitua 'imageElementId' pelo ID do elemento da imagem
      imageElement.src = imageUrl;

      // Restante do seu código...
    }).catch((error) => {
      console.error('Erro ao obter URL da imagem:', error);
    });
  }).catch((error) => {
    console.error('Erro ao enviar imagem para o Firebase Storage:', error);
  });
}


  // Função para verificar se a imagem possui rótulos
function checkIfImageHasLabels(imageUrl) {
  // Você deve implementar a lógica para verificar se a imagem possui rótulos ou não
  // Por exemplo, você pode usar serviços de análise de imagem ou outros métodos para determinar se a imagem possui rótulos
  const imageHasLabels = true; // Defina isso como true se a imagem tiver rótulos ou false caso contrário
  if (imageHasLabels) {
    // Se a imagem tiver rótulos, chama a função para exibir os rótulos na tela
    displayLabels(imageUrl);
  } else {
    // Se a imagem não tiver rótulos, você pode omitir a exibição da imagem ou tomar outra ação, como notificar o usuário
    console.log('A imagem não possui rótulos.');
  }
}

function displayLabels() {
  const imageLabelsRef = firestore.collection('imageLabels');

  imageLabelsRef.get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const imageData = doc.data();

      // Cria um elemento div para a imagem e seus rótulos associados
      const imageDiv = document.createElement('div');
      imageDiv.classList.add('image-with-labels');

      // Adiciona a imagem ao elemento div
      const imageElement = document.createElement('img');
      imageElement.alt = 'Imagem';
      imageElement.style.maxWidth = '80%'; // Define a largura máxima como 100%
      imageElement.style.maxHeight = '160px'; // Define a altura máxima como 300px
      imageDiv.appendChild(imageElement);

      // Carrega a imagem de forma assíncrona e define o atributo 'src' dentro do callback
      storage.refFromURL(imageData.file).getDownloadURL().then((imageUrl) => {
        imageElement.src = imageUrl; // Define o atributo 'src' da imagem
      }).catch((error) => {
        console.error('Erro ao obter URL da imagem no Firebase Storage:', error);
        imageElement.alt = 'Erro ao carregar imagem';
      });

      // Adiciona os rótulos traduzidos da imagem ao elemento div
      const labelsElement = document.createElement('p');
      if (imageData.translatedLabels) {
        const translatedLabels = Object.values(imageData.translatedLabels).map(obj => obj.pt).join(', ');
        labelsElement.textContent = `Rótulos da imagem: ${translatedLabels}`;
      } else {
        labelsElement.textContent = 'Tradução pendente';
      }
      imageDiv.appendChild(labelsElement);

      // Adiciona o elemento div ao contêiner de rótulos
      document.getElementById('labelsContainer').appendChild(imageDiv);
    });
  }).catch((error) => {
    console.error('Erro ao obter imagens rotuladas do Firestore:', error);
  });
}
