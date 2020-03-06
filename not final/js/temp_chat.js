var reader = new FileReader();
var user = getUserType();
var name;
var isChatOpen = false;
var countListener = null;
var readListener = null;
var readReceipts = null

var searchCache = "";
var totalCount = 0;

function getUserType() {
  var type = document.cookie.split(';');
  try {
    //console.log(type[3])
    return type[3].split('=')[1];
  } catch{
    return "admin";
  }
}
var user_list_cache;
var global_user_list = [];
var glpubnub;
var myLatestMessage, theirLatestMessage;
var inboxState = false;
window.addEventListener('load',
  function () {    
    $('#totalCount').css('display', 'none');
    countUpdate();
    showChat();
  }, false);

var messageCountingListener = {
  message: function (m) {
    // handle message
    var channelName = m.channel; // The channel for which the message belongs
    var channelGroup = m.subscription; // The channel group or wildcard subscription match (if exists)
    var pubTT = m.timetoken; // Publish timetoken
    var msg = m.message; // The Payload
    var publisher = m.publisher; //The Publisher
    //console.log(channelName)
    //console.log(channelGroup)
    //console.log(msg)
    //console.log(publisher)
  }
}


function hideChat() {
  //console.log(isChatOpen)
  isChatOpen = false;
  $('#chat-toast').toast('hide');
  exit();
  back();
  inboxState = false;
  glpubnub.addListener(messageCountingListener);
  //console.log("added")
}

function back() {
  $('#user-list').html('');
  $('#message-container').html('<div class="announcement"><span>Start messaging.</span></div><br>');
  $('#message-container').css('display', 'none');
  $('#send-message').css('display', 'none');
  $('#back-btn').css('display', 'none');

  $('#admin-search').css('display', 'inline');
  $('#chat-footer').css('display', 'inline');
  $('#user-chat').css('display', 'inline');
  $('#chat-title').html('&nbsp;Chat');
  inboxState = true;
  //console.log("backed")
  $('#searcharea-message').val(searchCache);
  exit();
  if($('#searcharea-message').val() == ""){
    displayMessagePreviews();
  }
}
function viewMessage(u_name) {
  $('#admin-search').css('display', 'none');
  $('#chat-footer').css('display', 'none');
  $('#user-chat').css('display', 'none');

  $('#message-container').css('display', 'block');
  $('#send-message').css('display', '');
  $('#back-btn').css('display', 'inline');
  name = u_name;
  $('#chat-title').html('&nbsp;' + u_name);
  searchCache =   $('#searcharea-message').val();
  $('#searcharea-message').val('');
  //console.log(totalCount)
  enter();
  displayMessages();

}
//for admin only
var unread = 0;
function displayMessagePreviews() {
  var pubnub = new PubNub({
    publishKey: 'pub-c-8266b3af-df4a-4508-91de-0a06b9634a69',
    subscribeKey: 'sub-c-b20376b2-5215-11ea-80a4-42690e175160',
    uuid: name
  });


  if (global_user_list.length == 0) {
    //fetch the users
    pubnub.getUsers({
      include: {
        customFields: true
      }
    },
      function (status, response) {
        ////console.log(response)
        var users = response.data; //store array of users in users
        global_user_list = response.data;
        //console.log(users)
        //temporary data
        var is_read = false; //or true, for UI purposes
        var unread_list = [];

        var user_channels = [];

        for (var i = 0; i < users.length; i++) {
          var temp = users[i].name + '_receipts';
          user_channels.push(temp)
        }
        ////console.log(user_channels)

        //get message counts
        pubnub.fetchMessages({
          channels: [user_channels, users],
          count: 100
        }, function (status, response) {
          ////console.log(response)
          // //console.log(user_channels)

          //loop through the channels and count the unread msgs
          var tts = [];
          var chnl = [];

          //this loop retrieves all the channels with unread messages
          //and their timetokens
          for (channel in response.channels) {
            var channel_receipts = response.channels[channel];
            //console.log(response)
            var len = channel_receipts.length - 1;
            //console.log(len)
            //console.log(channel_receipts[len])
            tt = channel_receipts[len].timetoken;
            //console.log(tt)


            if (tt == undefined || tt == 0) {
              tt = 1000000000000000
              /*parseInt(response.messages[len].timetoken) -*/
            }
            //console.log(tt)
            //if latest reader is not admin
            //get the timestamp of the first instance before previous read
            for (var b = len - 1; b >= 0; b--) {
              var first_unread = channel_receipts[b];
              //console.log(first_unread)
              //console.log(first_unread.message.user)
              if (first_unread.message.user == "admin") {
                //console.log(channel_receipts[b + 1].timetoken)
                tt = channel_receipts[b + 1].timetoken;
                break;
              }
              tt = channel_receipts[0].timetoken;
            }
            //console.log(tt)
            if (channel_receipts[len].message.user != user) {
              chnl.push(channel_receipts[len].message.user);
              tt = parseInt(tt) - 20000000;
              tts.push(tt);
              //console.log("is not same")
            } else {
              var subbed = (channel_receipts[len].channel).replace(/%20/gi, " ");
              subbed = subbed.replace("_receipts", "");
              chnl.push(subbed);
              tt = Math.round(new Date().getTime() * 10000);
              tts.push(tt);
            }
            //console.log(chnl)
            //console.log(tts)
          }
          //end of loop
          //this counts the number of messages left unread by
          //the user
          pubnub.messageCounts({
            channels: chnl,
            channelTimetokens: tts
          }, function (status, results) {
            ////console.log(results.channels);
            unread_list = results.channels;
            // start, end, count are optional
            pubnub.fetchMessages(
              {
                channels: [chnl],
                count: 1
              },
              (status, preview) => {
                // handle response
                //console.log(preview)
                //console.log(results)
                for (c in results.channels) {
                  count = results.channels[c]

                  var restring = c.replace(/ /gi, "%20");
                  //console.log(restring)
                  //console.log(len);
                  //console.log(preview.channels[0])
                  recent_message = "";

                  var possible_file = preview.channels[restring][0].message.imageURL;

                  recent_message = ""
                  if (possible_file != undefined) {
                    recent_message = "File attached. ";
                  }
                  recent_message += preview.channels[restring][0].message.content;
                  recent_message = recent_message.substr(0, 15) + (recent_message.length > 15 ? '&hellip;' : '');
                  var recent_datestamp = preview.channels[restring][0].message.timestamp;

                  const gmtDate = new Date(recent_datestamp * 1000);
                  recent_datestamp = gmtDate.toLocaleString("default", { month: "short", day: 'numeric' });
                  var recent_timestamp = gmtDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
                  //console.log(totalCount + " + " + count)
                  adjustTotalCount(true, count)
                  if (count == 0) {
                    count = "";
                    $('#user_list').append('<div onclick="viewMessage(\'' + c + '\')" class="col-message chat-preview"><div class="row no-gutters"><div class="col-auto pad-5 d-flex align-items-center justify-content-center"><center><img src="css/user.png"></center></div><div class="col-8 pad-10"><br><div class="w-100"></div><div class="d-flex justify-content-between" ><strong><span style="font-size:medium;">' + c + '</span></strong></div><div class="w-100"></div><small id="' + c + '_recentMsg" class="text-muted text-truncate">[' + recent_timestamp + '] ' + recent_message + '</small><div class="w-100"></div></div><div class="col-auto" ><br><div class="w-100"></div><div class="d-flex justify-content-end"><small id="' + c + '_datestamp" class="text-muted">' + recent_datestamp + '</small></div><div class="w-100"></div><div class="d-flex justify-content-right"><span id="' + c + '" class="badge badge-pill badge-info"></span></div></div></div></div>');
                  } else {
                    if (count > 99) {
                      count = "99+";
                    }
                    $('#user_list').append('<div onclick="viewMessage(\'' + c + '\')" class="col-message chat-preview"><div class="row no-gutters"><div class="col-auto pad-5 d-flex align-items-center justify-content-center"><center><img src="css/user.png"></center></div><div class="col-8 pad-10"><br><div class="w-100"></div><div class="d-flex justify-content-between" ><strong><span style="font-size:medium;">' + c + '</span></strong></div><div class="w-100"></div><small id="' + c + '_recentMsg" class="text-muted text-truncate">[' + recent_timestamp + '] ' + recent_message + '</small><div class="w-100"></div></div><div class="col-auto" ><br><div class="w-100"></div><div class="d-flex justify-content-end"><small id="' + c + '_datestamp" class="text-muted">' + recent_datestamp + '</small></div><div class="w-100"></div><div class="d-flex justify-content-right"><span id="' + c + '" class="badge badge-pill badge-info">' + count + '</span></div></div></div></div>');
                  }
                }
                user_list_cache = $('#user_list').html();
              }
            );

          });
        });
      });
  } else {
    totalCount = 0;
    //this is to make sure that loading time is not long
    //if a new user is made, append them to the list
    var users = global_user_list;
    var is_read = false; //or true, for UI purposes

    var unread_list = [];
    var user_channels = [];

    for (var i = 0; i < users.length; i++) {
      var temp = users[i].name + '_receipts';
      user_channels.push(temp)
    }
    ////console.log(user_channels)

    //get message counts
    pubnub.fetchMessages({
      channels: [user_channels],
      count: 100
    }, function (status, response) {
      //console.log(response)
      ////console.log(user_channels)

      //loop through the channels and count the unread msgs
      var tts = [];
      var chnl = [];

      //this loop retrieves all the channels with unread messages
      //and their timetokens
      for (channel in response.channels) {
        var channel_receipts = response.channels[channel];
        //console.log(response)
        var len = channel_receipts.length - 1;
        //console.log(len)
        //console.log(channel_receipts[len])
        tt = channel_receipts[len].timetoken;
        //console.log(tt)


        if (tt == undefined || tt == 0) {
          tt = 1000000000000000
          /*parseInt(response.messages[len].timetoken) -*/
        }
        ////console.log(channel_receipts)
        chnl.push(channel_receipts[len].message.user);
        tts.push(tt);
      }
      //end of loop

      //this counts the number of messages left unread by
      //the user
      pubnub.messageCounts({
        channels: [chnl],
        channelTimetokens: [tts]
      }, function (status, results) {
        pubnub.fetchMessages({
          channels: [chnl],
          count: 1
        }, (status, preview) => {
          // handle response
          //console.log(preview)
          //console.log(results.channels)
          for (c in results.channels) {
            count = results.channels[c]
            if (count == 0) {
              break;
            }
            var restring = c.replace(/ /gi, "%20");
            recent_message = "";
            var possible_file = preview.channels[restring][0].message.imageURL;

            recent_message = ""
            if (possible_file != undefined) {
              recent_message = "File attached. ";
            }
            recent_message += preview.channels[restring][len].message.content;
            recent_message = recent_message.substr(0, 15) + (recent_message.length > 15 ? '&hellip;' : '');
            var recent_datestamp = preview.channels[restring][len].message.timestamp;

            const gmtDate = new Date(recent_datestamp * 1000);
            recent_datestamp = gmtDate.toLocaleString("default", { month: "short", day: 'numeric' });
            var recent_timestamp = gmtDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
            adjustTotalCount(true, count)
            if (count == 0) {
              count = "";
              $('#user_list').append('<div onclick="viewMessage(\'' + c + '\')" class="col-message chat-preview"><div class="row no-gutters"><div class="col-auto pad-5 d-flex align-items-center justify-content-center"><center><img src="css/user.png"></center></div><div class="col-8 pad-10"><br><div class="w-100"></div><div class="d-flex justify-content-between" ><strong><span style="font-size:medium;">' + c + '</span></strong></div><div class="w-100"></div><small class="text-muted text-truncate">[' + recent_timestamp + '] ' + recent_message + '</small><div class="w-100"></div></div><div class="col-auto" ><br><div class="w-100"></div><div class="d-flex justify-content-end"><small class="text-muted">' + recent_datestamp + '</small></div><div class="w-100"></div><div class="d-flex justify-content-right"><span id="' + c + '" class="badge badge-pill badge-info"></span></div></div></div></div>');
            } else {
              if (count > 99) {
                count = "99+";
              }
            }
            $('#user_list').append('<div onclick="viewMessage(\'' + c + '\')" class="col-message chat-preview"><div class="row no-gutters"><div class="col-auto pad-5 d-flex align-items-center justify-content-center"><center><img src="css/user.png"></center></div><div class="col-8 pad-10"><br><div class="w-100"></div><div class="d-flex justify-content-between" ><strong><span style="font-size:medium;">' + c + '</span></strong></div><div class="w-100"></div><small class="text-muted text-truncate">[' + recent_timestamp + '] ' + recent_message + '</small><div class="w-100"></div></div><div class="col-auto" ><br><div class="w-100"></div><div class="d-flex justify-content-end"><small class="text-muted">' + recent_datestamp + '</small></div><div class="w-100"></div><div class="d-flex justify-content-right"><span id="' + c + '" class="badge badge-pill badge-info">' + count + '</span></div></div></div></div>');
          }
          user_list_cache = $('#user_list').html();
        });
      });
    });
  }


}
var msgCount = 0;
function getLatestExit(log) {
  //console.log(log);
  if (log.message.user == user) {
    msgCount = log.timetoken;
  }
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
      //console.log(response.data[response.data.length-1]['uuid'])
    
  });*/
  pubnub.hereNow({
    channels: ['test_area4', 'test_area4_receipts'],
    includeUUIDs: true,
    includeState: true,
  }, (status, response) => {
    // handle status, response
    //console.log(response);
    if (response.channels.test_area4.occupants[0].uuid != user) {
      //check if in or out
      if (response.channels.test_area4.occupants[0].state.mood == "in") {
        //all is read
        return "READ"
      } else {
        //check if msg token is greater than exit;
        if (response.channels.test_area4.occupants[0].state.time > msgtoken) {
          //read all
          return "READ";
        } else {
          //not read
          return "SENT";
        }
      }
    }

  });
}
var tt = 0;
function getCount(obj) {
  if (obj.entry.user == user) {
    tt = obj.timetoken;
  }
  //console.log(tt + " user: " + obj.entry.user)
}
function displayMessages() {

  //listener
  readReceipts = {
    status: function (statusEvent) {
      if (statusEvent.category === "PNConnectedCategory") {
        //console.log("connected");
        //console.log(statusEvent)
        // publishMsg();
      }
    },
    message: function (msg) {
      //console.log(msg)
      //console.log(msg.timetoken)
      if (msg.subscribedChannel == name + "_receipts") {
        //console.log("RAD")
        if (msg.message.user != user) {
          //if new receipt is not from current user,
          //update read
          // $('#'+msg.message.lastSeen).html("read ");
        }
      } else {
        if (msg.message.sender != user) {

          otherMsg(msg.publisher, msg.message.timestamp, msg.message);
          onMessageRead(msg.message.id);
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
      //console.log(uuid + " is " + action + " and " + state)
      if (uuid != user) {
        //other user has performed smth
        if (state.mood == "in") {
          //user opened chat
          //check if latest message action is messaged_delivered
          //if delivered, update to read
          //console.log("this is where u set the delivered to read")
          //$('#msg_status').html("read");
          var timetoken = p.timetoken;
          //console.log(timetoken)
          pubnub.messageCounts({
            channels: [name],
            channelTimetokens: [timetoken],
          }, (status, results) => {
            // handle status, response
            //console.log(status);
            //console.log(results);
          });
        } else {
          //user closed chat
        }
      }
    }
  };
  //listener end
  glpubnub.addListener(readReceipts);
  glpubnub.subscribe({
    channels: [name, name + '_receipts'],
  });
  glpubnub.history({
    channel: name + '_receipts',
    count: 100// how many items to fetch
  },
    function (status, response) {
      //console.log("AAAAA");
      //console.log(response.messages);
      for (var i = 0; i < response.messages.length - 1; i++) {
        if (response.messages[i].entry.user == user) {
          tt = response.messages[i].timetoken;
        }
      }
      //console.log(tt)
      glpubnub.messageCounts({
        channels: [name],
        channelTimetokens: [tt]
      }, function (status, results) {
        //console.log(results);
      });
      //console.log(tt)
    });

  glpubnub.history({
    channel: name,
    count: 5, // how many items to fetch
    includeMessageActions: true,
    stringifiedTimeToken: true // false is the default
  },
    function (status, response) {
      response.messages.forEach((msg) => postMsg(msg, true));
      //console.log("mine: " + myLatestMessage);
      //console.log("their: " + theirLatestMessage)
      if (myLatestMessage == undefined && theirLatestMessage == undefined) {
        $('#message-container').html('<div class="announcement"><span>Start messaging.</span></div><br>');
      }
      addRead();
      autoScrollToBottom();
    });
  // start, end, count are optional
  glpubnub.fetchMessages({
    channels: [name + '_receipts'],
    includeMessageActions: true,
    count: 100
  },
    (status, response) => {
      // handle response
      //console.log(response)
    });


}



function addRead() {

  var pubnub = new PubNub({
    publishKey: 'pub-c-8266b3af-df4a-4508-91de-0a06b9634a69',
    subscribeKey: 'sub-c-b20376b2-5215-11ea-80a4-42690e175160',
    uuid: user
  });

  pubnub.history({
    channel: name + '_receipts',
    count: 100// how many items to fetch
  },
    function (status, response) {
      for (var i = 0; i < response.messages.length - 1; i++) {
        //console.log(response.messages[i]);
        var div = document.getElementById(response.messages[i].entry.lastSeen)
        if (div) {
          read = div.querySelector('.read');
          read.textContent = 'read ';
        }
      }
      readAll();
      //console.log(tt)
      pubnub.messageCounts({
        channels: [name],
        channelTimetokens: [tt]
      }, function (status, results) {
        //console.log(results);
      });
      //console.log(tt)
    });
}

function postMsg(msg, isAppend) {
  var sender = 'You';
  //console.log(msg);
  var message = msg.entry.content;
  var id = msg.entry.id;
  if(document.getElementById(id))
    return;
  //const unixTimestamp = msg.entry.timestamp / 10000000;
  const gmtDate = new Date(msg.entry.timestamp * 1000);
  const timestamp = gmtDate.toLocaleString();
  const container = document.createElement('div');
  var MESSAGE_TEMPLATE =
    '<div class="msg d-none" ><div class="d-flex justify-content-between"><span class="badge badge-pill sender" ><br></span><span class="text-muted"><span class="read"></span> <span class="timestamp"></span></span></div><div class="card mb-3"><div class="row no-gutters"><div class="col d-flex"><div id="message_display" class="p-2 text-wrap d-flex"><p class="messageDisplay pl-2 m-0"></p></div></div></div></div></div>';
  if (message !== '' && msg.entry.imageURL === undefined) {
    MESSAGE_TEMPLATE =
      '<div class="msg" ><div class="d-flex justify-content-between"><span class="badge badge-pill sender" ><br></span><span class="text-muted"><span class="read"></span> <span class="timestamp"></span></span></div><div class="card mb-3"><div class="row no-gutters"><div class="col d-flex"><div id="message_display" class="p-2 text-wrap d-flex"><p class="messageDisplay pl-2 m-0"></p></div></div></div></div></div>';
  } else if (msg.entry.imageURL !== undefined && message === '') {
    MESSAGE_TEMPLATE =
      '<div class="msg" ><div class="d-flex justify-content-between"><span class="badge badge-pill sender" ><br></span><span class="text-muted"><span class="read"></span> <span class="timestamp"></span></span></div><div class="card mb-3"><div class="row no-gutters"><div class="col d-flex"><div id="message_display" class="p-2 text-wrap d-flex"><a href="' +
      msg.entry.imageURL +
      '" target="_blank"><img class="attach" src="' +
      msg.entry.imageURL +
      '" height="100px" width="100px"></a><p class="messageDisplay pl-2 m-0 d-none"></p></div></div></div></div></div>';
  } else if (msg.entry.imageURL !== undefined && message !== '') {
    MESSAGE_TEMPLATE =
      '<div class="msg" ><div class="d-flex justify-content-between"><span class="badge badge-pill sender" ><br></span><span class="text-muted"><span class="read"></span> <span class="timestamp"></span></span></div><div class="card mb-3"><div class="row no-gutters"><div class="col d-flex"><div id="message_display" class="p-2 text-wrap d-flex"><a href="' +
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
      '<div class="msg d-none" ><div class="d-flex justify-content-between"><span class="badge badge-pill sender" ><br></span><span class="text-muted"><span class="read"></span> <span class="timestamp"></span></span></div><div class="card mb-3"><div class="row no-gutters"><div class="col d-flex"><div id="message_display" class="p-2 text-wrap d-flex"><p class="messageDisplay pl-2 m-0"></p></div></div></div></div></div>';
  }
  container.innerHTML = MESSAGE_TEMPLATE;
  const div = container.firstElementChild;
  //console.log(id);
  div.setAttribute('id', id);
  //console.log(timestamp);
  div.setAttribute('timestamp', msg.timetoken);
  sender = msg.entry.sender == user ? sender : name;
  var timestamp1 = div.querySelector('.timestamp');
  var senderDiv = div.querySelector('.sender');
  var messageElement = div.querySelector('.messageDisplay');
  var read = div.querySelector('.read');
  timestamp1.textContent = timestamp;
  messageElement.textContent = message;
  senderDiv.textContent = sender;
  var nameAttribute = msg.entry.sender == user ? 'admin-name' : 'user-name';
  senderDiv.setAttribute('id', nameAttribute);

  //isRead()
  if (msg.entry.sender == user) {
    myLatestMessage = msg.entry.id;
    // $('#message-container').append('<div class="d-flex justify-content-between"><span class="badge badge-pill" id="admin-name">'+sender+'<br></span><span class="timestamp text-muted"><span id="'+myLatestMessage+'"></span>'+timestamp+'</span></div><div class="card mb-3"><div class="row no-gutters"><div class="col"><div id="message_display" class="text-wrap"><p>'+message.replace( /[<>]/g, '' )+'</p></div></div></div></div>');
    if(isAppend){
      $('#message-container').append(div);
    }else{
      //console.log('hello 12312');
      let parentElement = document.getElementById('message-container');
      let theFirstChild = parentElement.firstChild;
      parentElement.insertBefore(div, theFirstChild)
    }
    //console.log(myLatestMessage);
  } else {
    theirLatestMessage = msg.entry.id;
    //console.log(theirLatestMessage);
    sender = name;
    // $('#message-container').append('<div class="d-flex justify-content-between"><span class="badge badge-pill" id="user-name">'+sender+'<br></span><span class="timestamp text-muted">'+timestamp+'</span></div><div class="card mb-3"><div class="row no-gutters"><div class="col"><div id="message_display" class="text-wrap"><p>'+message.replace( /[<>]/g, '' )+'</p></div></div></div></div>');
    if(isAppend){
      $('#message-container').append(div);
    }else{
      //console.log('hello 1231');
      let parentElement = document.getElementById('message-container');
      let theFirstChild = parentElement.firstChild;
      parentElement.insertBefore(div, theFirstChild);
    }
  }
  //console.log(sender);

  message = message.substr(0, 15) + (message.length > 15 ? '&hellip;' : '');
  var date = gmtDate.toLocaleString('default', {
    month: 'short',
    day: 'numeric'
  });
  var recent_timestamp = gmtDate.toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
  $('#' + name + '_recentMsg').html('[' + recent_timestamp + '] ' + message);
  $('#' + name + '_datestamp').html(date);
  $('#' + name).html('');
}
function otherMsg(sender, timestamp, msg) {
  //console.log(msg);
  if (document.getElementById(msg.id)) return;
  var message = msg.content;
  theirLatestMessage = msg.id;
  //const unixTimestamp = msg.entry.timestamp / 10000000;
  const gmtDate = new Date(timestamp * 1000);
  timestamp = gmtDate.toLocaleString();
  const container = document.createElement('div');
  var MESSAGE_TEMPLATE =
    '<div class="msg d-none" ><div class="d-flex justify-content-between"><span class="badge badge-pill sender" ><br></span><span class="text-muted"><span class="read"></span> <span class="timestamp"></span></span></div><div class="card mb-3"><div class="row no-gutters"><div class="col d-flex"><div id="message_display" class="p-2 text-wrap d-flex"><p class="messageDisplay pl-2 m-0"></p></div></div></div></div></div>';
  if (message !== '' && msg.imageURL === undefined) {
    MESSAGE_TEMPLATE =
      '<div class="msg" ><div class="d-flex justify-content-between"><span class="badge badge-pill sender" ><br></span><span class="text-muted"><span class="read"></span> <span class="timestamp"></span></span></div><div class="card mb-3"><div class="row no-gutters"><div class="col d-flex"><div id="message_display" class="p-2 text-wrap d-flex"><p class="messageDisplay pl-2 m-0"></p></div></div></div></div></div>';
  } else if (msg.imageURL !== undefined && message === '') {
    MESSAGE_TEMPLATE =
      '<div class="msg" ><div class="d-flex justify-content-between"><span class="badge badge-pill sender" ><br></span><span class="text-muted"><span class="read"></span> <span class="timestamp"></span></span></div><div class="card mb-3"><div class="row no-gutters"><div class="col d-flex"><div id="message_display" class="p-2 text-wrap d-flex"><a href="' +
      msg.imageURL +
      '" target="_blank"><img class="attach" src="' +
      msg.imageURL +
      '" height="100px" width="100px"></a><p class="messageDisplay pl-2 m-0 d-none"></p></div></div></div></div></div>';
  } else if (msg.imageURL !== undefined && message !== '') {
    MESSAGE_TEMPLATE =
      '<div class="msg" ><div class="d-flex justify-content-between"><span class="badge badge-pill sender" ><br></span><span class="text-muted"><span class="read"></span> <span class="timestamp"></span></span></div><div class="card mb-3"><div class="row no-gutters"><div class="col d-flex"><div id="message_display" class="p-2 text-wrap d-flex"><a href="' +
      msg.imageURL +
      '" target="_blank"><img class="attach" src="' +
      msg.imageURL +
      '" height="100px" width="100px"></a><p class="messageDisplay pl-2 m-0"></p></div></div></div></div></div>';
  } else if (
    (msg.imageURL === '' && message === '') ||
    (msg.imageURL === undefined && message === '') ||
    msg.imageURL === Object
  ) {
    MESSAGE_TEMPLATE =
      '<div class="msg d-none" ><div class="d-flex justify-content-between"><span class="badge badge-pill sender" ><br></span><span class="text-muted"><span class="read"></span> <span class="timestamp"></span></span></div><div class="card mb-3"><div class="row no-gutters"><div class="col d-flex"><div id="message_display" class="p-2 text-wrap d-flex"><p class="messageDisplay pl-2 m-0"></p></div></div></div></div></div>';
  }
  container.innerHTML = MESSAGE_TEMPLATE;
  const div = container.firstElementChild;
  //console.log(div);
  div.setAttribute('id', msg.id);
  //console.log(timestamp);
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

  message = message.substr(0, 15) + (message.length > 15 ? '&hellip;' : '');
  var date = gmtDate.toLocaleString('default', {
    month: 'short',
    day: 'numeric'
  });
  var recent_timestamp = gmtDate.toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
  $('#' + sender + '_recentMsg').html('[' + recent_timestamp + '] ' + message);
  $('#' + sender + '_datestamp').html(date);
  //console.log(totalCount + ' - ' + $('#' + sender).html());
  //totalCount -= parseInt($('#' + sender).html());
  adjustTotalCount(false, $('#' + sender).html());
  //$('#totalCount').html(totalCount);
  $('#' + sender).html('');
  autoScrollToBottom();
}

function enter() {

  glpubnub = new PubNub({
    publishKey: 'pub-c-8266b3af-df4a-4508-91de-0a06b9634a69',
    subscribeKey: 'sub-c-b20376b2-5215-11ea-80a4-42690e175160',
    uuid: user
  });
  glpubnub.setState({
    state: {
      mood: 'in',
    },
    channels: [name],
  }, (status, response) => {
    // handle state setting response
    //console.log(response)
  });
  //enter chat

  //remove msg count 
  //console.log(totalCount + " - " + parseInt($('#' + name).html()))

  adjustTotalCount(false, $('#' + name).html())
  $('#' + name).html("")

  //listen to receipts channel
  readListener = {
    status: function (statusEvent) { },
    message: function (msg) {
      console.log(msg);
      if (msg.message.user != user) {
        //if new receipt is not from current user,
        //update read
        if (msg.message.lastSeen) {
          var div = document.getElementById(msg.message.lastSeen)
          read = div.querySelector('.read');
          read.textContent = 'read ';
        }
      }
      if (msg.message.sender != "admin") {
        //if new receipt is not from current user,
        //update read
        if (msg.message.lastSeen) {
          var div = document.getElementById(msg.message.lastSeen)
          read = div.querySelector('.read');
          read.textContent = 'read ';
        }


      }
    },
    presence: function (p) {
      var action = p.action; // Can be join, leave, state-change or timeout
      // var channelName = p.channel; // The channel for which the message belongs
      //var occupancy = p.occupancy; // No. of users connected with the channel
      var state = p.state; // User State
      var uuid = p.uuid;
      //console.log(uuid + " is " + action + " and " + state)
      if (uuid != user) {
        //other user has performed smth
        if (state.mood == "in") {
          //user opened chat
          //check if latest message action is messaged_delivered
          //if delivered, update to read
          //console.log("this is where u set the delivered to read")
          //$('#msg_status').html("read");
          var timetoken = p.timetoken;
          //console.log(timetoken)

        } else {
          //user closed chat
        }
      }
    }
  };
  glpubnub.addListener(readListener);
  glpubnub.subscribe({
    channels: [name + "_receipts"],
  });
}
function exit() {
  // var pubnub = new PubNub({
  //   publishKey : 'pub-c-8266b3af-df4a-4508-91de-0a06b9634a69',
  //   subscribeKey : 'sub-c-b20376b2-5215-11ea-80a4-42690e175160',
  //   uuid: user
  // });
  var user = user
  glpubnub.setState({
    state: {
      mood: 'out',
      time: Math.round(new Date().getTime() / 1000) * 10000000
    },
    channels: [name],
  }, (status, response) => {
    // handle state setting response
    //console.log(response)
  });
  readListener = null;
  glpubnub.removeListener(readListener)
  glpubnub.removeListener(readReceipts)
  glpubnub.unsubscribe({
    channels: [name + "_receipts"]
  })
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
  var user = user;

  /*  pubnub.subscribe({
      channels: ["test_area4","test_area4_receipts"],
    });
    */
  //start publishmsg
  function publishMsg() {
    var message = $('textarea#textarea-message')
      .val()
      .trim();
    if (message !== '' || $('#attachment').val() !== '') {
      $('#textarea-message').val('');
      myLatestMessage = PubNub.generateUUID();
      if (getUserType() == 'admin') {
        user = 'admin';
      } else {
        user = user;
      }
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
            //console.log('Uploaded a blob or file!');
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
                  //console.log(response);
                  //console.log(myLatestMessage);
                  appendMessage(message, url, response.timetoken, 'You');
                  pubnub.publish(
                    {
                      channel: name + '_receipts',
                      message: {
                        user: sessionStorage.getItem('username')
                      }
                    },
                    (status, response) => {
                      //console.log(response);
                    }
                  );
                });
              });
          });
      } else {
        pubnub.publish(publishConfig, function (status, response) {
          //console.log(response);
          //console.log(myLatestMessage);
          appendMessage(message, attachURL, response.timetoken, 'You');
          pubnub.publish(
            {
              channel: name + '_receipts',
              message: {
                user: sessionStorage.getItem('username')
              }
            },
            (status, response) => {
              //console.log(response);
            }
          );
        });
      }
    }
  }
  //end publish msg


  //addaction start
  function addaction(msgtoken, type) {
    pubnub.addMessageAction({
      channel: name,
      messageTimetoken: msgtoken,
      action: {
        type: 'receipt',
        value: type,
      },
      uuid: user
    },
      function (status, response) {
        //console.log(status);
        //console.log(response);
      });
    pubnub.getMessageActions({
      channel: name
    },
      function (status, response) {
        //console.log(status)
        //console.log(response)
      });
  }
  //end addaction

  //listener
  pubnub.addListener({
    status: function (statusEvent) {
      if (statusEvent.category === "PNConnectedCategory") {
        //console.log("connected");
        //console.log(statusEvent)
        publishMsg();
      }
    },
    message: function (msg) {


    },
    presence: function (p) {


    }
  });
  //listener end

  //console.log("subbing");
  pubnub.subscribe({
    channels: [name, name + "_receipts"],
    withPresence: true
  });
  // autoScrollToBottom();
  //add to database
};

function addSeen() {

}

function appendMessage(message, attachment, timetoken, sender) {
  const unixTimestamp = timetoken / 10000000;
  const gmtDate = new Date(unixTimestamp * 1000);
  const timestamp = gmtDate.toLocaleString();
  const container = document.createElement('div');
  if (message !== '' && attachment === undefined) {
    MESSAGE_TEMPLATE =
      '<div class="msg" ><div class="d-flex justify-content-between"><span class="badge badge-pill sender" ><br></span><span class="text-muted"><span class="read"></span> <span class="timestamp"></span></span></div><div class="card mb-3"><div class="row no-gutters"><div class="col d-flex"><div id="message_display" class="p-2 text-wrap d-flex"><p class="messageDisplay pl-2 m-0"></p></div></div></div></div></div>';
  } else if (attachment !== undefined && message === '') {
    MESSAGE_TEMPLATE =
      '<div class="msg" ><div class="d-flex justify-content-between"><span class="badge badge-pill sender" ><br></span><span class="text-muted"><span class="read"></span> <span class="timestamp"></span></span></div><div class="card mb-3"><div class="row no-gutters"><div class="col d-flex"><div id="message_display" class="p-2 text-wrap d-flex"><img class="attach" src="' +
      attachment +
      '" height="100px" width="100px"><p class="messageDisplay pl-2 m-0 d-none"></p></div></div></div></div></div>';
  } else if (attachment !== undefined && message !== '') {
    MESSAGE_TEMPLATE =
      '<div class="msg" ><div class="d-flex justify-content-between"><span class="badge badge-pill sender" ><br></span><span class="text-muted"><span class="read"></span> <span class="timestamp"></span></span></div><div class="card mb-3"><div class="row no-gutters"><div class="col d-flex"><div id="message_display" class="p-2 text-wrap d-flex"><img class="attach" src="' +
      attachment +
      '" height="100px" width="100px"><p class="messageDisplay pl-2 m-0"></p></div></div></div></div></div>';
  }
  container.innerHTML = MESSAGE_TEMPLATE;
  const div = container.firstElementChild;
  //console.log(div);
  div.setAttribute('id', myLatestMessage);
  div.setAttribute('timestamp', timetoken);
  sender = sender == 'You' ? 'You' : sender;
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
  //   $('#message-container').append('<div class="d-flex justify-content-between"><span class="badge badge-pill" id="admin-name">'+sender+'<br></span><span class="timestamp text-muted"><span id="'+myLatestMessage+'"></span>'+timestamp+'</span></div><div class="card mb-3"><div class="row no-gutters"><div class="col"><div id="message_display" class="text-wrap"><p>'+message.replace( /[<>]/g, '' )+'</p></div></div></div></div>');
  // }else{
  //   sender = msg.entry.sender;
  //   $('#message-container').append('<div class="d-flex justify-content-between"><span class="badge badge-pill" id="user-name">'+sender+'<br></span><span class="timestamp text-muted">'+timestamp+'</span></div><div class="card mb-3"><div class="row no-gutters"><div class="col"><div id="message_display" class="text-wrap"><p>'+message.replace( /[<>]/g, '' )+'</p></div></div></div></div>');
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
      userId: "user-1",
      include: {
        customFields: true
      }
    },
    function (status, response) {
      //console.log(response)
      //console.log(status)
    }
  );
  pubnub.getState({
    channels: ['test_area4', 'test_area4_receipts'],
  }, (status, response) => {
    // handle state getting response
    //console.log(response)
  });
  /*    pubnub.messageCounts({
        channels: ['test_area4'],
        channelTimetokens: [msgtoken],
      }, (status, results) => {
        // handle status, response
        //console.log(status);
        //console.log(results);
      });*/
}
function showChat() {
  isChatOpen = true;
  $('#chat-toast').toast('show');
  displayMessagePreviews();
  inboxState = true;
  if (glpubnub == null) {
    //console.log("removed")
    glpubnub.removeListener(messageCountingListener);
  }
}

function showOrHide() {
  if (isChatOpen == false) {
    showChat()
  } else {
    hideChat()
  }
}

function autoScrollToBottom() {
  // $("#message-container").animate({ 
  //   scrollTop: $('#message-container').get(0).scrollHeight 
  // }, 1000); 
  var messageListElement = document.getElementById('message-container');
  messageListElement.scrollTop = messageListElement.scrollHeight;
  //console.log(messageListElement.scrollTop);
}


function onMessageRead(messageId) {
  var pubnub = new PubNub({
    publishKey: 'pub-c-8266b3af-df4a-4508-91de-0a06b9634a69',
    subscribeKey: 'sub-c-b20376b2-5215-11ea-80a4-42690e175160',
    uuid: user
  });
  pubnub.publish({
    channel: name + '_receipts',
    message: {
      lastSeen: messageId,
      user: user
    }
  }, (status, response) => {
    // handle state setting response
    //console.log(response)
  });
}

function checkRead(div) {
  if (div.style.display == "inline")
    div.style.display = 'none';
  else
    div.style.display = 'inline';
}

function readAll() {
  var msgs = $(".msg");
  for (let i = 0; i < msgs.length; i++) {
    let div = msgs[i];
    // //console.log(msgs[i]);
    if (div.querySelector('.sender').textContent != "You") {
      if (div.querySelector('.read').textContent == "")
        onMessageRead(div.id);
      //console.log(msgs[i]);
    }
  }
}

function searchUser() {
  $('#user_list').html("");
  var query = $("#searcharea-message").val().trim().toUpperCase();
  if (query == "") {
    $('#user_list').html(user_list_cache);
    //console.log(user_list_cache)
  } else {

    for (member in global_user_list) {
      if (global_user_list[member].name.toUpperCase().indexOf(query) > -1) {
        $('#user_list').append('<div onclick="viewMessage(\'' + global_user_list[member].name + '\')" class="col-message chat-preview"><div class="row no-gutters"><div class="col-auto pad-5 d-flex align-items-center justify-content-center"><center><img src="css/user.png"></center></div><div class="col-8 pad-10"><br><div class="w-100"></div><div class="d-flex justify-content-between" ><strong><span style="font-size:medium;">' + global_user_list[member].name + '</span></strong></div><div class="w-100"></div><small class="text-muted text-truncate"></small><div class="w-100"></div></div><div class="col-auto" ><br><div class="w-100"></div><div class="d-flex justify-content-end"><small class="text-muted"></small></div><div class="w-100"></div><br><div class="d-flex justify-content-center"><span id='+global_user_list[member].id+' class="badge badge-pill badge-info"></span></div></div></div></div>');
      }
    }
    if ($('#user_list').html() == "") {
      $('#user_list').html("No such user exists... Sorry.");
    }
    //$('#user_list').append('<div class="col-message chat-preview"><div class="row no-gutters"><div class="col-auto pad-5 d-flex align-items-center justify-content-center"><center></center></div><div class="col-8 pad-10"><br><div class="w-100"></div><div class="d-flex justify-content-between" ><strong><span style="font-size:medium;"></span></strong></div><div class="w-100"></div><small class="text-muted text-truncate"></small><div class="w-100"></div></div><div class="col-auto" ><br><div class="w-100"></div><div class="d-flex justify-content-end"><small class="text-muted"></small></div><div class="w-100"></div><br><div class="d-flex justify-content-center"><span class="badge badge-pill badge-info"></span></div></div></div></div>'); 
  }
}

$("#textarea-message").keydown(function (e) {
  if (event.keyCode == 13) {
    if (!event.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }
});


function countUpdate() {
  var pubnub = new PubNub({
    publishKey: 'pub-c-8266b3af-df4a-4508-91de-0a06b9634a69',
    subscribeKey: 'sub-c-b20376b2-5215-11ea-80a4-42690e175160',
    uuid: name
  });

  //listen to receipts channel
  countListener = {
    status: function (statusEvent) { },
    message: function (msg) {
      //console.log(msg)
      if (msg.publisher == "admin") {
        var target_user = msg.channel;
        pubnub.fetchMessages({
          channels: [target_user],
          count: 1
        }, function (status, response) {
          //get the latest msg
          //console.log(response);
          var date = response.channels[target_user][0].message.timestamp;
          var recent_message = "";

          var possible_file = response.channels[target_user][0].message.imageURL;

          recent_message = ""
          if (possible_file != undefined) {
            recent_message = "File attached. ";
          }
          recent_message += response.channels[target_user][0].message.content;
          recent_message = recent_message.substr(0, 15) + (recent_message.length > 15 ? '&hellip;' : '');

          const gmtDate = new Date(date * 1000);
          date = gmtDate.toLocaleString("default", { month: "short", day: 'numeric' });
          var recent_timestamp = gmtDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
          $('#' + target_user + '_recentMsg').html("[" + recent_timestamp + "] " + recent_message);
          $('#' + target_user + '_datestamp').html(date)
          $('#' + target_user).html("");
        });
      }
      if (msg.message.sender != "admin") {
        //if new receipt is not from current user,
        //update read
        if (msg.message.lastSeen) {
          var div = document.getElementById(msg.message.lastSeen)
          read = div.querySelector('.read');
          read.textContent = 'read ';
        }

        //update message count
        //if inboxState == true;
        //console.log(msg.channel != (target_user + "_receipts"))
        var target_user = msg.publisher;

        if ((inboxState == true) && (msg.channel != (target_user + "_receipts"))) {
          //console.log(msg.publisher)
          var existing_count = $('#' + target_user).html();
          if (existing_count == "") {
            $('#' + target_user).html("1");
            adjustTotalCount(true, 1)
          }
          else if(existing_count == undefined){
            //append
            var c = msg.publisher;
            var recent_message = "";
            var possible_file = msg.message.imageURL;

                  recent_message = ""
            if (possible_file != undefined) {
              recent_message = "File attached. ";
            }
            recent_message += msg.message.content;

            recent_message = recent_message.substr(0, 15) + (recent_message.length > 15 ? '&hellip;' : '');
            var recent_datestamp = msg.timetoken;

            const gmtDate = new Date(recent_datestamp * 1000);
            recent_datestamp = gmtDate.toLocaleString("default", { month: "short", day: 'numeric' });
            var recent_timestamp = gmtDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
            var temp_list = $('#user_list').html();
            $('#user_list').html('<div onclick="viewMessage(\'' + c + '\')" class="col-message chat-preview"><div class="row no-gutters"><div class="col-auto pad-5 d-flex align-items-center justify-content-center"><center><img src="css/user.png"></center></div><div class="col-8 pad-10"><br><div class="w-100"></div><div class="d-flex justify-content-between" ><strong><span style="font-size:medium;">' + c + '</span></strong></div><div class="w-100"></div><small id="' + c + '_recentMsg" class="text-muted text-truncate">[' + recent_timestamp + '] ' + recent_message + '</small><div class="w-100"></div></div><div class="col-auto" ><br><div class="w-100"></div><div class="d-flex justify-content-end"><small id="' + c + '_datestamp" class="text-muted">' + recent_datestamp + '</small></div><div class="w-100"></div><div class="d-flex justify-content-right"><span id="' + c + '" class="badge badge-pill badge-info">1</span></div></div></div></div>');
            $('#user_list').append(temp_list);
            user_list_cache = $('#user_list').html();      
            adjustTotalCount(true,1);
          }
          else {
            existing_count = parseInt(existing_count) + 1
            //console.log(totalCount + " + " + existing_count)
            adjustTotalCount(true, 1)
            $('#' + target_user).html(existing_count);
          }
          pubnub.fetchMessages({
            channels: [target_user],
            count: 1
          }, function (status, response) {
            //get the latest msg
            //console.log(response);
            var date = response.channels[target_user][0].message.timestamp;
            var recent_message = "";

            var possible_file = response.channels[target_user][0].message.imageURL;

            if (possible_file != undefined) {
              recent_message = "File attached. ";
            }
            recent_message += response.channels[target_user][0].message.content;
            recent_message = recent_message.substr(0, 15) + (recent_message.length > 15 ? '&hellip;' : '');

            const gmtDate = new Date(date * 1000);
            date = gmtDate.toLocaleString("default", { month: "short", day: 'numeric' });
            var recent_timestamp = gmtDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
            $('#' + target_user + '_recentMsg').html("[" + recent_timestamp + "] " + recent_message);
            $('#' + target_user + '_datestamp').html(date)
          });
        }
      }
    },
    presence: function (p) { }
  };


  pubnub.addListener(countListener);
  pubnub.getUsers({
    include: {
      customFields: true
    }
  },
    function (status, response) {
      //console.log("AAAAA ")
      //console.log(response)
      for(u in response.data){
        pubnub.subscribe({
          channels: [response.data[u].name],
        },function(status,res){
          //console.log(status)
        //console.log(response.data[u].name)
        });

      }
    });

}

function adjustTotalCount(operation, number) {
  //console.log(number)
  if (number == "" || number == undefined) {
    number = 0;
  }
  totalCount = $('#totalCount').html()
  //console.log($('#totalCount').html())
  if(totalCount == "" || totalCount == undefined){
    totalCount = 0;
  }else{
    totalCount = parseInt(totalCount)
  }

  //true is add
  if (operation) {
    totalCount += parseInt(number)
  } else {
    totalCount -= parseInt(number)
  }
  //console.log(totalCount)
  if(totalCount == NaN){     
    $('#totalCount').css('display', 'none');
  }else{
    if (totalCount == 0) {
      $('#totalCount').html("");
      $('#totalCount').css('display', 'none');
    } else if (totalCount > 99) {
      $('#totalCount').html("99+");
    } 
    else {
      $('#totalCount').html("" + totalCount);
    }
  }
  $('#totalCount').css('display', '');
}


$('#message-container').scroll(function() {
  if($('#message-container').scrollTop() ==  0) {
         // ajax call get data from server and append to the div
    
      var div = document.getElementById('message-container');
      
      //console.log(div.querySelector('.msg').getAttribute('timestamp'));
      $('#message-container').prepend('<div id="chatloader" class="chat-loader"></div>');
      glpubnub.history({
        channel: name + '_receipts',
        count: 100, // how many items to fetch
        reverse: false,
        start: div.querySelector('.msg').getAttribute('timestamp')
      },
        function (status, response) {
          //console.log("AAAAA");
          //console.log(response.messages);
          for (var i = 0; i < response.messages.length - 1; i++) {
            if (response.messages[i].entry.user == user) {
              tt = response.messages[i].timetoken;
            }
          }
          //console.log(tt)
          glpubnub.messageCounts({
            channels: [name],
            channelTimetokens: [tt]
          }, function (status, results) {

          });
        });
    
      glpubnub.history({
        channel: name,
        count: 5, // how many items to fetch
        includeMessageActions: true,
        stringifiedTimeToken: true ,// false is the default
        start: div.querySelector('.msg').getAttribute('timestamp')
      },
        function (status, response) {
          //console.log(response)
          div.removeChild(div.firstElementChild);
          response.messages.reverse().forEach((msg) => postMsg(msg, false));
          if (myLatestMessage == undefined && theirLatestMessage == undefined) {
            $('#message-container').html('<div class="announcement"><span>Start messaging.</span></div><br>');
          }
          addRead();
          // autoScrollToBottom();
        });
  }
});
