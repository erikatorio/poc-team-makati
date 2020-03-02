var users = [];
var user = null;
function openForm(box) {
  if (box == 1) {
    document.getElementById("myForm").style.display = "block";
    initializeUsers();
  } else {
    document.getElementById("messageBox").style.display = "block";
    loadMessages();
  }
}

function searchUser() {
  // Declare variables
  var input, filter, ul, li, a, i, txtValue;
  input = document.getElementById('searchUser');
  filter = input.value.toUpperCase();
  ul = document.getElementById("users");
  li = ul.getElementsByTagName('li');

  // Loop through all list items, and hide those who don't match the search query
  for (i = 0; i < li.length; i++) {
    a = li[i].getElementsByTagName("span")[0];
    txtValue = a.textContent || a.innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }
  }
}

function closeForm(box) {
  if (box == 1) {
    document.getElementById("myForm").style.display = "none";
    document.getElementById("messageBox").style.display = "none";
  } else {
    document.getElementById("messageBox").style.display = "none";
  }
}

async function getUsers() {
  await db.collection("users").where("userType", "==", 2).get().then(function (querySnapshot) {
    querySnapshot.forEach(function (doc) {
      users.push(doc.data());
    });
  });
}

async function initializeUsers() {
  if (users.length != 0) {
    return;
  }
  await getUsers();
  var usersDiv = document.getElementById("users");
  for (let i = 0; i < users.length; i++) {
    usersDiv.innerHTML += '<li id="user' + i + '" class="active my-0" onclick=initializeMessages(this)>' +
      '<div class="d-flex bd-highlight cursor-pointer">' +
      '<div class="img_cont">' +
      '<img src="https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-ios7-contact-512.png" class="rounded-circle user_img">' +
      '</div>' +
      '<div class="user_info">' +
      '<span>' + users[i].username + '</span>' +
      '<p> Group: ' + users[i].group + '</p>' +
      '</div>' +
      '</div>' +
      '</li>' +
      '<hr class="mx-2 m-0">';
  }
}

function initializeMessages(e) {
  let index = parseInt(e.id.replace("user", ""), 10);
  user = users[index];
  document.getElementById("messagesList").innerHTML = "";
  document.getElementById("messageBox").style.display = "block";
  document.getElementById("myForm").style.display = "none";
  document.getElementById("user_name").innerHTML =  user.username;
  document.getElementById("user_group").innerHTML = "Group: " + user.group;
  loadMessages();
}

function backToContacts() {
  document.getElementById("messageBox").style.display = "none";
  document.getElementById("myForm").style.display = "block";
}


//firebase chat

function toggleButton() {
  if (messageInputElement.value) {
    submitButtonElement.removeAttribute('disabled');
  } else {
    submitButtonElement.setAttribute('disabled', 'true');
  }
}

// Triggered when the send new message form is submitted.
function onMessageFormSubmit(e) {
  e.preventDefault();
  // Check that the user entered a message and is signed in.
  let message = messageInputElement.value;
  messageInputElement.value = "";
  messageListElement.scrollTop = messageListElement.scrollHeight;
  if (message) {
    saveMessage(message).then(function () {
      // Clear message text field and re-enable the SEND button.
      
      resetMaterialTextfield();
      toggleButton();
    });
  }
}

// Saves a new message on the Cloud Firestore.
function saveMessage(messageText) {
    // Add a new message entry to the Firebase database.
    var to = -1;
    var admin = false;
    var from = -1;
    var sender = '';
    var receiver = ''
    if (sessionStorage.getItem("userType") == 1){
      admin = true;
      to = user.id;
      from = "admin";
      sender = "admin";
      receiver = user.username;
    }else{
        admin = false;
        to = "admin";
        from = parseInt(sessionStorage.getItem("userId"), 10);
        sender = sessionStorage.getItem("username");
        receiver = "admin";
    } 

    return firebase.firestore().collection('messages').add({
      to: to,
      text: messageText,
      from: from,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      admin: admin,
      sender: sender,
      receiver: receiver
    }).catch(function(error) {
      console.error('Error writing new message to Firebase Database', error);
    });
}

// Loads chat messages history and listens for upcoming ones.
function loadMessages() {
  // Create the query to load the last 12 messages and listen for new ones.
  var from = -1;
  var to = -1
  if (sessionStorage.getItem("userType") == 2) {
    from = "admin";
    to = parseInt(sessionStorage.getItem("userId"), 10);
  } else {
    from = user.id;
    to = "admin";
  }

  var query1 = firebase.firestore().collection('messages').where("to", "==", to)
    .where("from", "==", from).orderBy('timestamp', 'desc').limit(5);
  // Start listening to the query.
  query1.onSnapshot(function (snapshot) {
    snapshot.docChanges().forEach(function (change) {
      if (change.type === 'removed') {
        deleteMessage(change.doc.id);
      } else {
        var message = change.doc.data();
        displayMessage(change.doc.id, message.timestamp, message.text,
          message.text, false, message.imageUrl);
      }
    });
  });

  var query = firebase.firestore().collection('messages').where("to", "==", from)
    .where("from", "==", to).orderBy('timestamp', 'desc').limit(5);
  // Start listening to the query.
  query.onSnapshot(function (snapshot) {
    snapshot.docChanges().forEach(function (change) {
      if (change.type === 'removed') {
        deleteMessage(change.doc.id);
      } else {
        var message = change.doc.data();
        displayMessage(change.doc.id, message.timestamp, message.text,
          message.text, true, message.imageUrl);
      }
    });
  });
}

function deleteMessage(id) {
  var div = document.getElementById(id);
  // If an element for that message exists we delete it.
  if (div) {
    div.parentNode.removeChild(div);
  }
}

  var SENDER_MESSAGE_TEMPLATE = '<div class="chat_msg_item chat_msg_item_user"><span class="time"></span>' +
'<p class="messageDisplay rounded load">'+
'</p></div>';

  var RECEIVER_MESSAGE_TEMPLATE =
  '<span class="chat_msg_item chat_msg_item_admin">'+
  '<div class="chat_avatar">' +
     '<img src="https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-ios7-contact-512.png"/>' +
  '</div><span class="time"></span><p class="messageDisplay rounded"></p></span>' ;

function createAndInsertMessage(id, timestamp, sender) {
  const container = document.createElement('div');
  container.innerHTML = sender ? SENDER_MESSAGE_TEMPLATE : RECEIVER_MESSAGE_TEMPLATE;
  const div = container.firstElementChild;;
  div.setAttribute('id', id);

  // If timestamp is null, assume we've gotten a brand new message.
  // https://stackoverflow.com/a/47781432/4816918
  timestamp = timestamp ? timestamp.toMillis() : Date.now();
  div.setAttribute('timestamp', timestamp);

  // figure out where to insert new message
  const existingMessages = messageListElement.children;
  if (existingMessages.length === 0) {
    messageListElement.appendChild(div);
  } else {
    let messageListNode = existingMessages[0];

    while (messageListNode) {
      const messageListNodeTime = messageListNode.getAttribute('timestamp');

      if (!messageListNodeTime) {
        throw new Error(
          `Child ${messageListNode.id} has no 'timestamp' attribute`
        );
      }

      if (messageListNodeTime > timestamp) {
        break;
      }

      messageListNode = messageListNode.nextSibling;
    }

    messageListElement.insertBefore(div, messageListNode);
  }

  return div;
}

function displayMessage(id, timestamp, name, text, sender, imageUrl) {
  var div = document.getElementById(id) || createAndInsertMessage(id, timestamp, sender);

  // if (!sender)
  //   div.querySelector('.nameDisplay').textContent = name;
  var messageElement = div.querySelector('.messageDisplay');
  var time = div.querySelector('.time');
  if (text) { // If the message is text.
    messageElement.textContent = text;
    var messageDate = moment(timestamp.toDate());
    if(messageDate.isSame(moment(), 'd'))
      time.textContent = moment(timestamp.toDate()).format('HH:mm');
    else 
      time.textContent = moment(timestamp.toDate()).calendar(moment(  ));
    // Replace all line breaks by <br>.
    messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
  }else if(imageUrl){
    var image = document.createElement('img');
    image.addEventListener('load', function() {
      messageListElement.scrollTop = messageListElement.scrollHeight;
    });
    image.src = imageUrl + '&' + new Date().getTime();
    if(imageUrl != LOADING_IMAGE_URL)
      image.className = "imageMessage"
    messageElement.innerHTML = '';
    messageElement.appendChild(image);
    messageElement.style.background = "transparent";
    var messageDate = moment(timestamp.toDate());
    if(messageDate.isSame(moment(), 'd'))
      time.textContent = moment(timestamp.toDate()).format('HH:mm');
    else 
      time.textContent = moment(timestamp.toDate()).calendar(moment(  ));
  }
  // Show the card fading-in and scroll to view the new message.
  setTimeout(function () { div.classList.add('visible') }, 1);
  messageListElement.scrollTop = messageListElement.scrollHeight;
  messageInputElement.focus();
}

// Resets the given MaterialTextField.
function resetMaterialTextfield() {
  document.getElementById('messageInput').value = "";
}

// Triggered when a file is selected via the media picker.
function onMediaFileSelected(event) {
  event.preventDefault();
  var file = event.target.files[0];

  // Clear the selection in the file picker input.
  // imageFormElement.reset();
  mediaCaptureElement.value = ''

  // Check if the file is an image.
  if (!file.type.match('image.*')) {
    var data = {
      message: 'You can only share images',
      timeout: 2000
    };
    signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
    return;
  }
  // Check if the user is signed-in
  // if (checkSignedInWithMessage()) {
    saveImageMessage(file);
  // }
}

function saveImageMessage(file) {
    var to = -1;
    var admin = false;
    var from = -1;
    var sender = '';
    var receiver = ''
    if (sessionStorage.getItem("userType") == 1){
      admin = true;
      to = user.id;
      from = "admin";
      sender = "admin";
      receiver = user.username;
    }else{
        admin = false;
        to = "admin";
        from = parseInt(sessionStorage.getItem("userId"), 10);
        sender = sessionStorage.getItem("username");
        receiver = "admin";
    } 
  // 1 - We add a message with a loading icon that will get updated with the shared image.
  firebase.firestore().collection('messages').add({
    to: to,
    from: from,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    admin: admin,
    sender: sender,
    receiver: receiver,
    imageUrl: LOADING_IMAGE_URL,
  }).then(function(messageRef) {
    // 2 - Upload the image to Cloud Storage.
    var filePath = from + '/' + messageRef.id + '/' + file.name;
    return firebase.storage().ref(filePath).put(file).then(function(fileSnapshot) {
      // 3 - Generate a public URL for the file.
      return fileSnapshot.ref.getDownloadURL().then((url) => {
        // 4 - Update the chat message placeholder with the image's URL.
        return messageRef.update({
          imageUrl: url,
          storageUri: fileSnapshot.metadata.fullPath
        });
      });
    });
  }).catch(function(error) {
    console.error('There was an error uploading a file to Cloud Storage:', error);
  });
}


var LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif?a';
var messageListElement = document.getElementById('messagesList');
var messageFormElement = document.getElementById('message-form');
var messageInputElement = document.getElementById('messageInput');
var submitButtonElement = document.getElementById('submitMessage');
var imageButtonElement = document.getElementById('submitImage');
var mediaCaptureElement = document.getElementById('mediaCapture');

messageFormElement.addEventListener('submit', onMessageFormSubmit);
// Toggle for the button.
messageInputElement.addEventListener('keyup', toggleButton);
messageInputElement.addEventListener('change', toggleButton);

imageButtonElement.addEventListener('click', function(e) {
  e.preventDefault();
  console.log("enter");
  mediaCaptureElement.click();
});

mediaCaptureElement.addEventListener('change', onMediaFileSelected);