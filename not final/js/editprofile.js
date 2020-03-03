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

    let newName = $('#materialFormCardEmailEx').val();
    let newPass = $('#materialFormCardPasswordEx').val();
    let enableAnonymous = $('#customSwitches').prop('checked');

    // console.log(newName);
    // console.log(newPass);
    // console.log(enableAnonymous);
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

    if(newName != "" && newPass != ""){
        db.collection("users")
            .where("id", "==", parseInt(sessionUserID))
            .get()
            .then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    doc.ref.update({
                        username: newName,
                        password: newPass,
                        enableAnonymousSending: enableAnonymous
                    });
                });

                if(!alert('Success!')){
                    sessionStorage.setItem("username", newName);
                    sessionStorage.setItem("enableAnonymous", enableAnonymous);
                    setTimeout(location.reload.bind(location), 1000);
                }
            })
            .catch(function (error) {
                console.error("Error user update: ", error);
            });
    
    } else if (newName != ""){
        db.collection("users")
            .where("id", "==", parseInt(sessionUserID))
            .get()
            .then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    doc.ref.update({
                        username: newName,
                        enableAnonymousSending: enableAnonymous
                    });
                });

                if(!alert('Success!')){
                    sessionStorage.setItem("username", newName);
                    sessionStorage.setItem("enableAnonymous", enableAnonymous);
                    setTimeout(location.reload.bind(location), 1000);
                }

            })
            .catch(function (error) {
                console.error("Error user update: ", error);
            });

    } else if(newPass != ""){
        db.collection("users")
            .where("id", "==", parseInt(sessionUserID))
            .get()
            .then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    doc.ref.update({
                        password: newPass,
                        enableAnonymousSending: enableAnonymous
                    });
                });

                if(!alert('Success!')){
                    sessionStorage.setItem("enableAnonymous", enableAnonymous);
                    setTimeout(location.reload.bind(location), 1000);
                }
            })
            .catch(function (error) {
                console.error("Error user update: ", error);
            });
    } else {
        db.collection("users")
            .where("id", "==", parseInt(sessionUserID))
            .get()
            .then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    doc.ref.update({
                        enableAnonymousSending: enableAnonymous
                    });
                });

                if(!alert('Success!')){
                    sessionStorage.setItem("enableAnonymous", enableAnonymous);
                    setTimeout(location.reload.bind(location), 1000);
                }
            })
            .catch(function (error) {
                console.error("Error user update: ", error);
            });
    }
}