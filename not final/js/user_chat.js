var reader = new FileReader();
var user = sessionStorage.getItem('username');
var name = sessionStorage.getItem('username');
var readListener = null;
var readReceipts = null;
var isChatOpen = false;
window.addEventListener(
  'load',
  function () {
    showChat();
  },
  false
);
function hideChat() {
  isChatOpen = false;
  $('#chat-toast').toast('hide');
  exit();
}

var myLatestMessage, theirLatestMessage;

var unread = 0;

function getLatestExit(log) {
  console.log(log);
  if (log.message.user == user) {
    msgCount = log.timetoken;
  }
}

function getMsgCount(userIds) {
  var pubnub = new PubNub({
    publishKey: 'pub-c-8266b3af-df4a-4508-91de-0a06b9634a69',
    subscribeKey: 'sub-c-b20376b2-5215-11ea-80a4-42690e175160',
    uuid: user
  });
  userId = 'test_area4';
  var c = userId + '_log';
  pubnub.fetchMessages(
    {
      channels: [c],
      count: 100
    },
    (status, response) => {
      // handle response
      console.log(response);
      response.channels[c].forEach(getLatestExit);
      console.log(msgCount);
      pubnub.messageCounts(
        {
          channels: [userId],
          channelTimetokens: [msgCount]
        },
        (status, results) => {
          // handle status, response
          console.log(results.channels);
          console.log(results.channels[userId]);
          unread = results.channels[userId];
          console.log(unread);
          if (unread > 0) {
            $('#' + userIds).html(unread);
          } else if (unread > 99) {
            $('#' + userIds).html('99+');
          } else {
            $('#' + userIds).html('');
          }
          console.log(userIds);
        }
      );
    }
  );
}

function isRead(msgtoken) {
  var pubnub = new PubNub({
    publishKey: 'pub-c-8266b3af-df4a-4508-91de-0a06b9634a69',
    subscribeKey: 'sub-c-b20376b2-5215-11ea-80a4-42690e175160',
    uuid: user
  });
  /*pubnub.getMessageActions({
      channel: 'test_area4'},
    function(status, response) {
      console.log(response.data[response.data.length-1]['uuid'])
    
  });*/
  pubnub.hereNow(
    {
      channels: ['test_area4', 'test_area4_receipts'],
      includeUUIDs: true,
      includeState: true
    },
    (status, response) => {
      // handle status, response
      console.log(response);
      if (response.channels.test_area4.occupants[0].uuid != user) {
        //check if in or out
        if (response.channels.test_area4.occupants[0].state.mood == 'in') {
          //all is read
          return 'READ';
        } else {
          //check if msg token is greater than exit;
          if (response.channels.test_area4.occupants[0].state.time > msgtoken) {
            //read all
            return 'READ';
          } else {
            //not read
            return 'SENT';
          }
        }
      }
    }
  );
}
var tt = 0;

function getCount(obj) {
  if (obj.entry.user == user) {
    tt = obj.timetoken;
  }
  console.log(tt + ' user: ' + obj.entry.user);
}

function displayMessages() {

  //listener
  readReceipts = {
    status: function (statusEvent) {
      if (statusEvent.category === 'PNConnectedCategory') {
        console.log('connected');
        console.log(statusEvent);
        // publishMsg();
      }
    },
    message: function (msg) {
      console.log(msg);
      console.log(msg.timetoken);
      if (msg.subscribedChannel == name + '_receipts') {
        console.log('RAD');
        if (msg.message.user != user) {
          //if new receipt is not from current user,
          //update read
          // $('#'+msg.message.lastSeen).html("read ");
        }
      } else {
        if (msg.message.sender != user) {
          onMessageRead(msg.message.id);
          otherMsg(msg.publisher, msg.message.timestamp, msg.message);
          //addaction(msg.timetoken, "message_deliver");
        } else {
          //addaction(msg.timetoken, "message_read");
        }
      }
    },
    presence: function (p) {
      // handle presence
      var action = p.action; // Can be join, leave, state-change or timeout
      // var channelName = p.channel; // The channel for which the message belongs
      //var occupancy = p.occupancy; // No. of users connected with the channel
      var state = p.state; // User State
      var uuid = p.uuid;
      console.log(uuid + ' is ' + action + ' and ' + state);
      if (uuid != user) {
        //other user has performed smth
        if (state.mood == 'in') {
          //user opened chat
          //check if latest message action is messaged_delivered
          //if delivered, update to read
          console.log('this is where u set the delivered to read');
          //$('#msg_status').html("read");
          var timetoken = p.timetoken;
          console.log(timetoken);
          pubnub.messageCounts(
            {
              channels: [name],
              channelTimetokens: [timetoken]
            },
            (status, results) => {
              // handle status, response
              console.log(status);
              console.log(results);
            }
          );
        } else {
          //user closed chat
        }
      }
    }
  };
  //listener end
  glpubnub.addListener(readReceipts);
  glpubnub.subscribe({
    channels: [name, name + '_receipts']
  });
  glpubnub.history(
    {
      channel: name + '_receipts',
      count: 100 // how many items to fetch
    },
    function (status, response) {
      console.log('AAAAA');
      console.log(response.messages);
      for (var i = 0; i < response.messages.length - 1; i++) {
        if (response.messages[i].entry.user == user) {
          tt = response.messages[i].timetoken;
        }
      }
      console.log(tt);
      glpubnub.messageCounts(
        {
          channels: [name],
          channelTimetokens: [tt]
        },
        function (status, results) {
          console.log(results);
        }
      );
      console.log(tt);
    }
  );

  glpubnub.history(
    {
      channel: name,
      count: 100, // how many items to fetch
      includeMessageActions: true,
      stringifiedTimeToken: true // false is the default
    },
    function (status, response) {
      response.messages.forEach(postMsg);
      console.log('mine: ' + myLatestMessage);
      console.log('their: ' + theirLatestMessage);
      if (myLatestMessage == undefined && theirLatestMessage == undefined) {
        $('#message-container').html(
          '<div class="announcement"><span>Start messaging.</span></div><br>'
        );
      }
      addRead();
      autoScrollToBottom();
    }
  );
  // start, end, count are optional
  glpubnub.fetchMessages(
    {
      channels: [name + '_receipts'],
      includeMessageActions: true,
      count: 100
    },
    (status, response) => {
      // handle response
      console.log(response);
    }
  );
}

function addRead() {
  var pubnub = new PubNub({
    publishKey: 'pub-c-8266b3af-df4a-4508-91de-0a06b9634a69',
    subscribeKey: 'sub-c-b20376b2-5215-11ea-80a4-42690e175160',
    uuid: user
  });

  pubnub.history(
    {
      channel: name + '_receipts',
      count: 100 // how many items to fetch
    },
    function (status, response) {
      for (var i = 0; i < response.messages.length; i++) {
        console.log(response.messages[i].entry.lastSeen);
        var div = document.getElementById(response.messages[i].entry.lastSeen);
        if (div) {
          read = div.querySelector('.read');
          read.textContent = '既読 ';
        }
      }
      readAll();
      console.log(tt);
      pubnub.messageCounts(
        {
          channels: [name],
          channelTimetokens: [tt]
        },
        function (status, results) {
          console.log(results);
        }
      );
      console.log(tt);
    }
  );
}

function postMsg(msg, lastRead) {
  var sender = 'You';
  console.log(msg);
  var message = msg.entry.content;
  var id = msg.entry.id;
  //const unixTimestamp = msg.entry.timestamp / 10000000;
  const gmtDate = new Date(msg.entry.timestamp * 1000);
  const timestamp = gmtDate.toLocaleString();
  //is read?
  var read = 'sent ';
  if (msg.entry.timestamp < lastRead) {
    read = '既読 ';
  }
  const container = document.createElement('div');
  var MESSAGE_TEMPLATE =
    '<div class="msg d-none" ><div class="d-flex justify-content-between"><span class="badge badge-pill sender" ><br></span><span class="text-muted"><span class="read"></span> <span class="timestamp"></span></span></div><div class="card mb-3" style="overflow:hidden"><div class="row no-gutters"><div class="col d-flex"><div id="message_display" style="word-wrap:break-word"  class="p-2 text-break d-flex"><p class="messageDisplay pl-2 m-0"></p></div></div></div></div></div>';
  if (message !== '' && msg.entry.imageURL === undefined) {
    MESSAGE_TEMPLATE =
      '<div class="msg" ><div class="d-flex justify-content-between"><span class="badge badge-pill sender" ><br></span><span class="text-muted"><span class="read"></span> <span class="timestamp"></span></span></div><div class="card mb-3" style="overflow:hidden"><div class="row no-gutters"><div class="col d-flex"><div id="message_display" style="word-wrap:break-word"  class="p-2 text-break d-flex"><p class="messageDisplay pl-2 m-0"></p></div></div></div></div></div>';
  } else if (msg.entry.imageURL !== undefined && message === '') {
    MESSAGE_TEMPLATE =
      '<div class="msg" ><div class="d-flex justify-content-between"><span class="badge badge-pill sender" ><br></span><span class="text-muted"><span class="read"></span> <span class="timestamp"></span></span></div><div class="card mb-3" style="overflow:hidden"><div class="row no-gutters"><div class="col d-flex"><div id="message_display" style="word-wrap:break-word"  class="p-2 text-break d-flex"><a href="' +
      msg.entry.imageURL +
      '" target="_blank"><img class="attach" src="' +
      msg.entry.imageURL +
      '" height="100px" width="100px"></a><p class="messageDisplay pl-2 m-0 d-none"></p></div></div></div></div></div>';
  } else if (msg.entry.imageURL !== undefined && message !== '') {
    MESSAGE_TEMPLATE =
      '<div class="msg" ><div class="d-flex justify-content-between"><span class="badge badge-pill sender" ><br></span><span class="text-muted"><span class="read"></span> <span class="timestamp"></span></span></div><div class="card mb-3" style="overflow:hidden"><div class="row no-gutters"><div class="col d-flex"><div id="message_display" style="word-wrap:break-word"  class="p-2 text-break d-flex"><a href="' +
      msg.entry.imageURL +
      '" target="_blank"><img class="attach" src="' +
      msg.entry.imageURL +
      '" height="100px" width="100px"></a><p class="messageDisplay pl-2 m-0"></p></div></div></div></div></div>';
  } else if (
    (msg.entry.imageURL === '' && message === '') ||
    (msg.entry.imageURL === undefined && message === '') ||
    msg.entry.imageURL === Object
  ) {
    MESSAGE_TEMPLATE =
      '<div class="msg d-none" ><div class="d-flex justify-content-between"><span class="badge badge-pill sender" ><br></span><span class="text-muted"><span class="read"></span> <span class="timestamp"></span></span></div><div class="card mb-3" style="overflow:hidden"><div class="row no-gutters"><div class="col d-flex"><div id="message_display" style="word-wrap:break-word"  class="p-2 text-break d-flex"><p class="messageDisplay pl-2 m-0"></p></div></div></div></div></div>';
  }
  container.innerHTML = MESSAGE_TEMPLATE;
  const div = container.firstElementChild;
  console.log(div);
  div.setAttribute('id', id);
  console.log(timestamp);
  div.setAttribute('timestamp', timestamp);
  console.log(msg.entry.sender);
  console.log(user);
  console.log(msg.entry.sender == user);
  sender =
    msg.entry.sender == sessionStorage.getItem('username')
      ? sender
      : msg.entry.sender;
  var timestamp1 = div.querySelector('.timestamp');
  var senderDiv = div.querySelector('.sender');
  var messageElement = div.querySelector('.messageDisplay');
  var read = div.querySelector('.read');
  console.log(sender);
  timestamp1.textContent = timestamp;
  messageElement.textContent = message;
  senderDiv.textContent = sender;
  var nameAttribute = msg.entry.sender == user ? 'admin-name' : 'user-name';
  senderDiv.setAttribute('id', nameAttribute);

  //isRead()
  console.log(msg.entry.sender);
  if (msg.entry.sender == user) {
    myLatestMessage = msg.entry.id;
    // $('#message-container').append('<div class="d-flex justify-content-between"><span class="badge badge-pill" id="admin-name">'+sender+'<br></span><span class="timestamp text-muted"><span id="'+myLatestMessage+'"></span>'+timestamp+'</span></div><div class="card mb-3" style="overflow:hidden"><div class="row no-gutters"><div class="col"><div id="message_display" class="text-wrap"><p>'+message.replace( /[<>]/g, '' )+'</p></div></div></div></div>');
    $('#message-container').append(div);
    console.log(myLatestMessage);
  } else {
    theirLatestMessage = msg.entry.id;
    console.log(theirLatestMessage);
    sender = name;
    // $('#message-container').append('<div class="d-flex justify-content-between"><span class="badge badge-pill" id="user-name">'+sender+'<br></span><span class="timestamp text-muted">'+timestamp+'</span></div><div class="card mb-3" style="overflow:hidden"><div class="row no-gutters"><div class="col"><div id="message_display" class="text-wrap"><p>'+message.replace( /[<>]/g, '' )+'</p></div></div></div></div>');
    $('#message-container').append(div);
  }
  console.log(sender);
}

function otherMsg(sender, timestamp, msg) {
  console.log(msg);
  if (document.getElementById(msg.id)) return;
  var message = msg.content;
  theirLatestMessage = msg.id;
  //const unixTimestamp = msg.entry.timestamp / 10000000;
  const gmtDate = new Date(timestamp * 1000);
  timestamp = gmtDate.toLocaleString();
  const container = document.createElement('div');
  var MESSAGE_TEMPLATE = '<div><div>';
  if (message !== '' && msg.imageURL === undefined) {
    MESSAGE_TEMPLATE =
      '<div class="msg" ><div class="d-flex justify-content-between"><span class="badge badge-pill sender" ><br></span><span class="text-muted"><span class="read"></span> <span class="timestamp"></span></span></div><div class="card mb-3" style="overflow:hidden"><div class="row no-gutters"><div class="col d-flex"><div id="message_display" style="word-wrap:break-word"  class="p-2 text-break d-flex"><p class="messageDisplay pl-2 m-0"></p></div></div></div></div></div>';
  } else if (msg.imageURL !== undefined && message === '') {
    MESSAGE_TEMPLATE =
      '<div class="msg" ><div class="d-flex justify-content-between"><span class="badge badge-pill sender" ><br></span><span class="text-muted"><span class="read"></span> <span class="timestamp"></span></span></div><div class="card mb-3" style="overflow:hidden"><div class="row no-gutters"><div class="col d-flex"><div id="message_display" style="word-wrap:break-word"  class="p-2 text-break d-flex"><a href="' +
      msg.imageURL +
      '" target="_blank"><img class="attach" src="' +
      msg.imageURL +
      '" height="50px" width="50px"></a><p class="messageDisplay pl-2 m-0 d-none"></p></div></div></div></div></div>';
  } else if (msg.imageURL !== undefined && message !== '') {
    MESSAGE_TEMPLATE =
      '<div class="msg" ><div class="d-flex justify-content-between"><span class="badge badge-pill sender" ><br></span><span class="text-muted"><span class="read"></span> <span class="timestamp"></span></span></div><div class="card mb-3" style="overflow:hidden"><div class="row no-gutters"><div class="col d-flex"><div id="message_display" style="word-wrap:break-word"  class="p-2 text-break d-flex"><a href="' +
      msg.imageURL +
      '" target="_blank"><img class="attach" src="' +
      msg.imageURL +
      '" height="50px" width="50px"></a><p class="messageDisplay pl-2 m-0"></p></div></div></div></div></div>';
  }
  container.innerHTML = MESSAGE_TEMPLATE;
  const div = container.firstElementChild;
  console.log(div);
  div.setAttribute('id', msg.id);
  console.log(timestamp);
  div.setAttribute('timestamp', timestamp);
  var timestamp1 = div.querySelector('.timestamp');
  var senderDiv = div.querySelector('.sender');
  var messageElement = div.querySelector('.messageDisplay');
  var read = div.querySelector('.read');
  timestamp1.textContent = timestamp;
  messageElement.textContent = message;
  senderDiv.textContent = sender;
  senderDiv.setAttribute('id', 'user-name');
  $('#message-container').append(div);
  autoScrollToBottom();
}

function onMessageRead(messageId) {
  var pubnub = new PubNub({
    publishKey: 'pub-c-8266b3af-df4a-4508-91de-0a06b9634a69',
    subscribeKey: 'sub-c-b20376b2-5215-11ea-80a4-42690e175160',
    uuid: user
  });
  pubnub.publish(
    {
      channel: name + '_receipts',
      message: {
        lastSeen: messageId,
        user: sessionStorage.getItem('username')
      }
    },
    (status, response) => {
      // handle state setting response
      console.log(response);
    }
  );
}

function enter() {

  glpubnub = new PubNub({
    publishKey: 'pub-c-8266b3af-df4a-4508-91de-0a06b9634a69',
    subscribeKey: 'sub-c-b20376b2-5215-11ea-80a4-42690e175160',
    uuid: user
  });

  glpubnub.setState(
    {
      state: {
        mood: 'in'
      },
      channels: [name]
    },
    (status, response) => {
      // handle state setting response
      console.log(response);
    }
  );
  //enter chat

  //listen to receipts channel
  readListener = {
    status: function (statusEvent) { },
    message: function (msg) {
      console.log(msg);
      console.log(msg.message);
      console.log(msg.message.user != user);
      if (msg.message.user) {
        //if new receipt is not from current user,
        //update rea
        if (msg.message.lastSeen) {
          var div = document.getElementById(msg.message.lastSeen);
          if (msg.message.user == user && div.querySelector('.sender').textContent == 'You') {
            return;
          } else {
            read = div.querySelector('.read');
            read.textContent = '既読 ';
          }
        }
      }
    },
    presence: function (p) {
      var action = p.action; // Can be join, leave, state-change or timeout
      // var channelName = p.channel; // The channel for which the message belongs
      //var occupancy = p.occupancy; // No. of users connected with the channel
      var state = p.state; // User State
      var uuid = p.uuid;
      console.log(uuid + ' is ' + action + ' and ' + state);
      if (uuid != user) {
        //other user has performed smth
        if (state.mood == 'in') {
          //user opened chat
          //check if latest message action is messaged_delivered
          //if delivered, update to read
          console.log('this is where u set the delivered to read');
          //$('#msg_status').html("read");
          var timetoken = p.timetoken;
          console.log(timetoken);
        } else {
          //user closed chat
        }
      }
    }
  };
  glpubnub.addListener(readListener);
  glpubnub.subscribe({
    channels: [name + '_receipts']
  });
}

function exit() {
  // var pubnub = new PubNub({
  //   publishKey : 'pub-c-8266b3af-df4a-4508-91de-0a06b9634a69',
  //   subscribeKey : 'sub-c-b20376b2-5215-11ea-80a4-42690e175160',
  //   uuid: user
  // });
  var publishConfig = {
    channel: name + '_log',
    message: {
      user: user
    }
  };
  glpubnub.publish(publishConfig, function (status, response) {
    console.log(response);
  });
  glpubnub.setState(
    {
      state: {
        mood: 'out',
        time: Math.round(new Date().getTime() / 1000) * 10000000
      },
      channels: [name]
    },
    (status, response) => {
      // handle state setting response
      console.log(response);
    }
  );

  glpubnub.removeListener(readListener);
  glpubnub.removeListener(readReceipts);
  glpubnub.unsubscribe({
    channels: [name + '_receipts']
  });
  glpubnub = null;
}

function removeAttachment() {
  $('#attach-prev').attr('src', '');
  $('#textarea-message').show();
  $('#textarea-message').val('');
  $('#attach-group').removeClass();
  $('#attachment').val('');
  $('#textarea-message').show();
  reader = new FileReader();
  attachURL = undefined;
}
var att;
function addAttachment(attach) {
  if (attach.files && attach.files[0]) {
    reader.onload = function (e) {
      $('#attach-prev').attr('src', e.target.result);
    };

    reader.readAsDataURL(attach.files[0]);
    att = attach.files[0].name;
    $('#attach-group').addClass('d-flex');
  }
}

function sendMessage() {
  var pubnub = new PubNub({
    publishKey: 'pub-c-8266b3af-df4a-4508-91de-0a06b9634a69',
    subscribeKey: 'sub-c-b20376b2-5215-11ea-80a4-42690e175160',
    uuid: user
  });

  //start publishmsg
  function publishMsg() {
    var message = $('textarea#textarea-message')
      .val()
      .trim();
    if (message !== '' || $('#attachment').val() !== '') {
      $('#textarea-message').val('');
      myLatestMessage = PubNub.generateUUID();
      var publishConfig = {
        channel: name,
        message: {
          id: myLatestMessage,
          content: message,
          sender: user,
          timestamp: Math.round(new Date().getTime() / 1000)
        }
      };
      if ($('#attachment').val() !== '') {
        // Create a root reference
        var storageRef = firebase.storage().ref('/chat/' + att);
        var attachURL = storageRef
          .putString(reader.result, 'data_url')
          .then(function (snapshot) {
            console.log('Uploaded a blob or file!');
          })
          .then(() => {
            storage
              .ref()
              .child('chat/' + att)
              .getDownloadURL()
              .then(function (url) {
                var publishConfig = {
                  channel: name,
                  message: {
                    id: myLatestMessage,
                    content: message,
                    sender: user,
                    imageURL: url,
                    timestamp: Math.round(new Date().getTime() / 1000)
                  }
                };

                pubnub.publish(publishConfig, function (status, response) {
                  console.log(response);
                  console.log(myLatestMessage);
                  appendMessage(message, url, response.timetoken, 'You');
                  pubnub.publish(
                    {
                      channel: name + '_receipts',
                      message: {
                        lastSeen: myLatestMessage,
                        user: sessionStorage.getItem('username')
                      }
                    },
                    (status, response) => {
                      console.log(response);
                    }
                  );
                });
              });
          });
      } else {
        pubnub.publish(publishConfig, function (status, response) {
          console.log(response);
          console.log(myLatestMessage);
          appendMessage(message, attachURL, response.timetoken, 'You');
          pubnub.publish(
            {
              channel: name + '_receipts',
              message: {
                lastSeen: myLatestMessage,
                user: sessionStorage.getItem('username')
              }
            },
            (status, response) => {
              console.log(response);
            }
          );
        });
      }
    }
  }
  //end publish msg

  //addaction start
  function addaction(msgtoken, type) {
    pubnub.addMessageAction(
      {
        channel: name,
        messageTimetoken: msgtoken,
        action: {
          type: 'receipt',
          value: type
        },
        uuid: user
      },
      function (status, response) {
        console.log(status);
        console.log(response);
      }
    );
    pubnub.getMessageActions(
      {
        channel: name
      },
      function (status, response) {
        console.log(status);
        console.log(response);
      }
    );
  }
  //end addaction

  //listener
  pubnub.addListener({
    status: function (statusEvent) {
      if (statusEvent.category === 'PNConnectedCategory') {
        console.log('connected');
        console.log(statusEvent);
        publishMsg();
      }
    },
    message: function (msg) { },
    presence: function (p) { }
  });
  //listener end

  console.log('subbing');
  pubnub.subscribe({
    channels: [name, name + '_receipts'],
    withPresence: true
  });
  // autoScrollToBottom();
  //add to database
}

function addSeen() { }

function appendMessage(message, attachment, timetoken, sender) {
  const unixTimestamp = timetoken / 10000000;
  const gmtDate = new Date(unixTimestamp * 1000);
  const timestamp = gmtDate.toLocaleString();
  const container = document.createElement('div');
  if (message !== '' && attachment === undefined) {
    MESSAGE_TEMPLATE =
      '<div class="msg" ><div class="d-flex justify-content-between"><span class="badge badge-pill sender" ><br></span><span class="text-muted"><span class="read"></span> <span class="timestamp"></span></span></div><div class="card mb-3" style="overflow:hidden"><div class="row no-gutters"><div class="col d-flex"><div id="message_display" style="word-wrap:break-word"  class="p-2 text-break d-flex"><p class="messageDisplay pl-2 m-0"></p></div></div></div></div></div>';
  } else if (attachment !== undefined && message === '') {
    MESSAGE_TEMPLATE =
      '<div class="msg" ><div class="d-flex justify-content-between"><span class="badge badge-pill sender" ><br></span><span class="text-muted"><span class="read"></span> <span class="timestamp"></span></span></div><div class="card mb-3" style="overflow:hidden"><div class="row no-gutters"><div class="col d-flex"><div id="message_display" style="word-wrap:break-word"  class="p-2 text-break d-flex"><img class="attach" src="' +
      attachment +
      '" height="100px" width="100px"><p class="messageDisplay pl-2 m-0 d-none"></p></div></div></div></div></div>';
  } else if (attachment !== undefined && message !== '') {
    MESSAGE_TEMPLATE =
      '<div class="msg" ><div class="d-flex justify-content-between"><span class="badge badge-pill sender" ><br></span><span class="text-muted"><span class="read"></span> <span class="timestamp"></span></span></div><div class="card mb-3" style="overflow:hidden"><div class="row no-gutters"><div class="col d-flex"><div id="message_display" style="word-wrap:break-word"  class="p-2 text-break d-flex"><img class="attach" src="' +
      attachment +
      '" height="100px" width="100px"><p class="messageDisplay pl-2 m-0"></p></div></div></div></div></div>';
  }
  container.innerHTML = MESSAGE_TEMPLATE;
  const div = container.firstElementChild;
  console.log(div);
  div.setAttribute('id', myLatestMessage);
  div.setAttribute('timestamp', timetoken);
  sender = sender == 'You' ? sender : msg.entry.sender;
  var timestamp1 = div.querySelector('.timestamp');
  var senderDiv = div.querySelector('.sender');
  var messageElement = div.querySelector('.messageDisplay');
  var read = div.querySelector('.read');
  timestamp1.textContent = timestamp;
  messageElement.textContent = message;
  senderDiv.textContent = sender;
  var nameAttribute = sender == 'You' ? 'admin-name' : 'user-name';
  senderDiv.setAttribute('id', nameAttribute);
  // if(sender == "You"){
  //   $('#message-container').append('<div class="d-flex justify-content-between"><span class="badge badge-pill" id="admin-name">'+sender+'<br></span><span class="timestamp text-muted"><span id="'+myLatestMessage+'"></span>'+timestamp+'</span></div><div class="card mb-3" style="overflow:hidden"><div class="row no-gutters"><div class="col"><div id="message_display" class="text-wrap"><p>'+message.replace( /[<>]/g, '' )+'</p></div></div></div></div>');
  // }else{
  //   sender = msg.entry.sender;
  //   $('#message-container').append('<div class="d-flex justify-content-between"><span class="badge badge-pill" id="user-name">'+sender+'<br></span><span class="timestamp text-muted">'+timestamp+'</span></div><div class="card mb-3" style="overflow:hidden"><div class="row no-gutters"><div class="col"><div id="message_display" class="text-wrap"><p>'+message.replace( /[<>]/g, '' )+'</p></div></div></div></div>');
  // }

  $('#message-container').append(div);
  autoScrollToBottom();
  removeAttachment();
}

function messageCounter() {
  var pubnub = new PubNub({
    publishKey: 'pub-c-8266b3af-df4a-4508-91de-0a06b9634a69',
    subscribeKey: 'sub-c-b20376b2-5215-11ea-80a4-42690e175160',
    uuid: name
  });

  pubnub.getUser(
    {
      userId: 'user-1',
      include: {
        customFields: true
      }
    },
    function (status, response) {
      console.log(response);
      console.log(status);
    }
  );
  pubnub.getState(
    {
      channels: ['test_area4', 'test_area4_receipts']
    },
    (status, response) => {
      // handle state getting response
      console.log(response);
    }
  );
  /*    pubnub.messageCounts({
  channels: ['test_area4'],
  channelTimetokens: [msgtoken],
  }, (status, results) => {
  // handle status, response
  console.log(status);
  console.log(results);
  });*/
}

function autoScrollToBottom() {
  //   $("#message-container").animate({
  //     scrollTop: $('#message-container').get(0).scrollHeight
  //   }, 1000);
  var messageListElement = document.getElementById('message-container');
  messageListElement.scrollTop = messageListElement.scrollHeight;
  console.log(messageListElement.scrollTop);
}

function checkRead(div) {
  if (div.style.display == 'inline') div.style.display = 'none';
  else div.style.display = 'inline';
}

function readAll() {
  var msgs = $('.msg');
  for (let i = msgs.length - 1; i >= 0; i--) {
    let div = msgs[i];
    // console.log(msgs[i]);
    if (div.querySelector('.sender').textContent != 'You') {
      console.log(div.querySelector('.read').textContent);
      if (div.querySelector('.read').textContent == '') onMessageRead(div.id);
    }

    // div.querySelector('  .col').onclick = function(){checkRead(div.querySelector('.read'))};;
  }
  // msgs[-1]
}

function showChat() {
  isChatOpen = true;
  $('#message-container').html('');
  $('#chat-toast').toast('show');
  //  messageCounter();
  console.log(user);
  enter();
  displayMessages();
}
function showOrHide() {
  if (isChatOpen == false) {
    showChat()
  } else {
    hideChat()
  }
}

$('#textarea-message').keydown(function (e) {
  if (event.keyCode == 13) {
    if (!event.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }
});
