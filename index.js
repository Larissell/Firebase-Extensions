

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
  };
  
  // Inicializa o Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Referência para o armazenamento e para o Firestore
  const storage = firebase.storage();
  const firestore = firebase.firestore();

  // Chama a função para exibir os rótulos quando a página carregar
  displayLabels();
  
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
      snapshot.ref.getDownloadURL().then((imageUrl) => {
        console.log('URL da imagem:', imageUrl);
  
        // Salva os dados no Firestore, com rótulos vazios inicialmente
        firestore.collection('imageLabels').add({
          file: imageUrl,
          labels: [] // Inicialmente, os rótulos estão vazios
        }).then((docRef) => {
          console.log('Dados salvos no Firestore com o ID:', docRef.id);
  
          // Após o envio bem-sucedido da imagem, chama a função para exibir os rótulos
          displayLabels();
        }).catch((error) => {
          console.error('Erro ao salvar dados no Firestore:', error);
        });
      }).catch((error) => {
        console.error('Erro ao obter URL da imagem:', error);
      });
    }).catch((error) => {
      console.error('Erro ao enviar imagem para o Firebase Storage:', error);
    });
  }

// Função para exibir os rótulos das imagens na tela
function displayLabels() {
  // Referência para a coleção de imagens rotuladas no Firestore
  const imageLabelsRef = firestore.collection('imageLabels');

  // Consulta as imagens rotuladas
  imageLabelsRef.get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const imageData = doc.data();

      // Cria um elemento div para a imagem e seus rótulos associados
      const imageDiv = document.createElement('div');
      imageDiv.classList.add('image-with-labels');

      // Adiciona a imagem ao elemento div
      const imageElement = document.createElement('img');
      storage.refFromURL(imageData.file).getDownloadURL().then((imageUrl) => {
        imageElement.src = imageUrl;
        // Estilize a altura e a largura da imagem aqui
        imageElement.style.maxWidth = '80%'; // Define a largura máxima como 100%
        imageElement.style.maxHeight = '160px'; // Define a altura máxima como 300px
      }).catch((error) => {
        console.error('Erro ao obter URL da imagem no Firebase Storage:', error);
      });
      imageElement.alt = 'Imagem';
      imageDiv.appendChild(imageElement);

      // Adiciona os rótulos da imagem ao elemento div
      const labelsElement = document.createElement('p');
      labelsElement.textContent = `Rótulos da imagem: ${imageData.labels.join(', ')}`;
      imageDiv.appendChild(labelsElement);

      // Adiciona o elemento div ao contêiner de rótulos
      labelsContainer.appendChild(imageDiv);
    });
  }).catch((error) => {
    console.error('Erro ao obter imagens rotuladas do Firestore:', error);
  });
}
