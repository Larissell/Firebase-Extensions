
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

// Referências para o armazenamento e para o Firestore
const storage = firebase.storage();
const firestore = firebase.firestore();

 //Seleciona o elemento HTML com a classe "img", que será usado para exibir a imagem após o upload.
const progressbar = document.querySelector(".progress");
let progress;
function atualizaStatus(snapshot){
  console.log("Snapshot", snapshot.ref.name);
  progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
  progress = Math.round(progress);
  progressbar.style.width = progress + "%";
  progressbar.innerHTML = progress + "%";
  uploadedFileName = snapshot.ref.name;
}


// Função para enviar a imagem para o Firebase Storage e salvar os dados no Firestore
function uploadImage() {
  const fileInput = document.getElementById('image-upload');
  const file = fileInput.files[0];

  if (!file) {
    console.error('Nenhuma imagem selecionada.');
    return;
  }

  // Referência ao armazenamento da imagem
  const imageRef = storage.ref(`/images/${file.name}`);

  // Realiza o upload da imagem
  imageRef.put(file).then((snapshot) => {
    console.log('Imagem enviada com sucesso para o Firebase Storage.');

    // Obtém a URL da imagem no armazenamento
    imageRef.getDownloadURL().then((imageUrl) => {
      console.log('URL da imagem:', imageUrl);

      // Chama a função para obter os rótulos da imagem
      getLabels(imageUrl).then((labels) => {
        // Salva os dados no Firestore, incluindo os rótulos obtidos
        firestore.collection('imageLabels').add({
          file: imageUrl,
          labels: labels
        }).then((docRef) => {
          console.log('Dados salvos no Firestore com o ID:', docRef.id);

          // Exibe a imagem e os rótulos na tela
          const labelsContainer = document.getElementById('labelsContainer');
          labelsContainer.innerHTML = `
            <img src="${imageUrl}" alt="Imagem">
            <p>Rótulos da imagem: ${labels.join(', ')}</p>
          `;
        }).catch((error) => {
          console.error('Erro ao salvar dados no Firestore:', error);
        });
      }).catch((error) => {
        console.error('Erro ao obter rótulos da imagem:', error);
      });
    }).catch((error) => {
      console.error('Erro ao obter URL da imagem:', error);
    });
  }).catch((error) => {
    console.error('Erro ao enviar imagem para o Firebase Storage:', error);
  });
}

// Função para obter os rótulos da imagem usando o Cloud Vision API
async function getLabels(imageUrl) {
  // Crie uma solicitação para a API Cloud Vision
  const response = await fetch('https://vision.googleapis.com/v1/images:annotate?key=AIzaSyDPzU2WE44jrV8cbplMFsCv1y-5LFeO3qU', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          image: {
            source: {
              imageUri: imageUrl
            }
          },
          features: [
            {
              type: 'LABEL_DETECTION',
              maxResults: 5
            }
          ]
        }
      ]
    })
  });

  // Verifique se a solicitação foi bem-sucedida
  if (!response.ok) {
    throw new Error('Erro ao obter rótulos da imagem.');
  }

  // Parse a resposta JSON
  const data = await response.json();

  // Extrai os rótulos da resposta
  const labels = data.responses[0].labelAnnotations.map(annotation => annotation.description);

  return labels;
}
