// $("#customSwitches").change(function(){
//     if($(this).prop("checked") == true){
//         console.log($(this).prop("checked"));
//     }else{
//         console.log($(this).prop("checked"));
//     }
// });

window.addEventListener("load", async () => {
    $('#username').html(sessionStorage.getItem('username'));
    $('#userName').html(sessionStorage.getItem('username'));
    $('#department').html('Department ' + sessionStorage.getItem('group'));
    $('#customSwitches').prop('checked', JSON.parse(sessionStorage.getItem('enableAnonymous')));
});

async function uploadPicture(file_data) {

    let timestamp = Number(new Date());
    if ($("#fileid").val() != "") {
        file_data = $("#fileid").prop("files")[0];
    }

    if (isImage(file_data.name)) {
        var storageRef = firebase.storage().ref("images/" + timestamp.toString() + file_data.name);
    } else {
        return "";
    }

    var task = storageRef.put(file_data);
    var progress = 0;
    
    task.on('state_changed', function (snapshot) {
        progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        //document.getElementById('progress').innerHTML = Math.round(progress) + "\%";
        $('#submit_btn2').attr('disabled', true);
        console.log(progress);
    }, function (error) {
        console.log(error.message);
    }, function () {
        task.snapshot.ref.getDownloadURL().then(function (downloadURL) {
            reportData.attachFile = downloadURL;
        });
    });

}

function saveProfile(e) {
    e.preventDefault();
    
    let sessionUserID = sessionStorage.getItem('userId');
    var prev_enableAnon = sessionStorage.getItem('enableAnonymous');
    var anon_isChanged = true;

    let newName = $('#materialFormCardEmailEx').val();
    let newPass = $('#materialFormCardPasswordEx').val();
    let enableAnonymous = $('#customSwitches').prop('checked');

    //CHECK IF enable anon has changed
    if(prev_enableAnon.toString() == enableAnonymous.toString()){
        anon_isChanged = false;
    }

    console.log("New Name is " + newName);
    console.log("New Pass is " + newPass);
    console.log(anon_isChanged);
    // path = $("#fileid").val()
    // $('#user_picture').attr('src', 'img/flower.png');
    // console.log($("#fileid").val());
    //console.log(sessionUserID);

    // sessionStorage.setItem("enableAnonymous", enableAnonymous);

    // if(JSON.parse(sessionStorage.getItem("enableAnonymous"))){
    //     console.log(JSON.parse(sessionStorage.getItem("enableAnonymous")));
    // } else {
    //     console.log(typeof(JSON.parse(sessionStorage.getItem("enableAnonymous"))));
    // }

    var whatChanged = "";

    if(newName!="" || newPass !="" || anon_isChanged){
        console.log("Something changed");
        if(newName != ""){
            console.log("Name changed");
            if(whatChanged == ""){
                whatChanged = "Username";
            }
            db.collection("users")
                .where("id", "==", parseInt(sessionUserID))
                .get()
                .then(function (querySnapshot) {
                    querySnapshot.forEach(function (doc) {
                        doc.ref.update({
                            username: newName
                        });
                    });
                    sessionStorage.setItem("username", newName);
                    
                    var pubnub = new PubNub({
                        publishKey : 'pub-c-8266b3af-df4a-4508-91de-0a06b9634a69',
                        subscribeKey : 'sub-c-b20376b2-5215-11ea-80a4-42690e175160',
                    });  
                    pubnub.createUser({
                        id: Pubnub.generateUUID(),
                        name: newName
                    });
                })
                .catch(function (error) {
                    console.error("Error user update: ", error);
                });
        
        }
        
        if(newPass != ""){
            console.log("Pass changed");
            if(whatChanged == ""){
                whatChanged = "Password";
            } else {
                whatChanged += ", Password";
            }
            db.collection("users")
                .where("id", "==", parseInt(sessionUserID))
                .get()
                .then(function (querySnapshot) {
                    querySnapshot.forEach(function (doc) {
                        doc.ref.update({
                            password: newPass,
                        });
                    });
                })
                .catch(function (error) {
                    console.error("Error user update: ", error);
                });
        }
        
        if(anon_isChanged) {
            console.log("Anon changed");
            if(whatChanged == ""){
                whatChanged = "'Enable Anonymous' Setting";
            } else {
                whatChanged += ", 'Enable Anonymous' Setting";
            }
            db.collection("users")
                .where("id", "==", parseInt(sessionUserID))
                .get()
                .then(function (querySnapshot) {
                    querySnapshot.forEach(function (doc) {
                        doc.ref.update({
                            enableAnonymousSending: enableAnonymous
                        });
                    });
                    console.log("Here EA is " + enableAnonymous)
                    
                    sessionStorage.setItem("enableAnonymous", enableAnonymous);
                })
                .catch(function (error) {
                    console.error("Error user update: ", error);
                });
        }

        if(!alert(whatChanged + ' successfully updated!')){
            setTimeout(location.reload.bind(location), 1000);
        }

    } else {
        alert("No changes made");
    }
}