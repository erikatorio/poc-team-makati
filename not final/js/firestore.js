// Initialize Firebase
let config = {
    //MyFirebaseProject
    apiKey: "AIzaSyDEtbinbscaxVKpa6GAyrOxh9moQsXO9-U",
    authDomain: "myfirstfirebaseproject-7cd16.firebaseapp.com",
    databaseURL: "https://myfirstfirebaseproject-7cd16.firebaseio.com",
    projectId: "myfirstfirebaseproject-7cd16",
    storageBucket: "myfirstfirebaseproject-7cd16.appspot.com",
    messagingSenderId: "970304867141",
    appId: "1:970304867141:web:e8d354070d615e91504c2c"

    //chat21
    // apiKey: "AIzaSyDSTHA4XXfIygdcqR0CBtChgWsm9G9Hxjk",
    // authDomain: "chat21-91cc4.firebaseapp.com",
    // databaseURL: "https://chat21-91cc4.firebaseio.com",
    // projectId: "chat21-91cc4",
    // storageBucket: "gs://chat21-91cc4.appspot.com",
    // messagingSenderId: "347375929066",
    // appId: "1:347375929066:web:2b6101a98bbd8bd926b993",
    // measurementId: "G-Y0QTHM5PGN"
};

firebase.initializeApp(config);
let db = firebase.firestore();
let storage = firebase.storage();
console.log("Cloud Firestores Loaded");

var details = false
// Enable offline capabilities

// function randomDate(start, end) {
//     return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
// }

async function fileUpload(file_data, reportData, action) {
    var timestamp = Number(new Date());
    if (isImage(file_data.name)) {
        var storageRef = firebase.storage().ref("images/" + timestamp.toString() + file_data.name);
    } else if (isVideo(file_data.name)) {
        var storageRef = firebase.storage().ref("videos/" + timestamp.toString() + file_data.name);
    } else if (isAudio(file_data.name)) {
        var storageRef = firebase.storage().ref("audios/" + timestamp.toString() + file_data.name);
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
    }, 
    function (error) {
        console.log(error.message);
    }, 
    function () {
        task.snapshot.ref.getDownloadURL().then(async function (downloadURL) {
            reportData.attachFile = downloadURL;
            if(action == 0){
                sendReport(reportData);
            } else {
                doUpdate(reportData);
            }
        });
    });

}

async function storeData(e) {
    e.preventDefault();

    category = sessionStorage.getItem("category");
    
    if(JSON.parse(sessionStorage.getItem("enableAnonymous"))){
        username = "Anonymous";
    } else {
        username = sessionStorage.getItem("username");
    }
    
    group = sessionStorage.getItem("group");
    
    var dateInfo = "NA";
    var personInfo = "NA";
    var otherDetails = "";
    var attachFile = "";
    var created = "";
    var read = false;
    var status = "検討中"
    var who = $("input[name='who']").val();
    var when = $("input[name='when']").val();
    var where = $("input[name='where']").val();
    var how = $("input[name='how']").val();
    
    var reportData = { 
        category, 
        username, 
        group, 
        created, 
        dateInfo, 
        personInfo, 
        otherDetails, 
        attachFile, 
        read, 
        status,
        who,
        when,
        where,
        how  
    }
    
    reportData.dateInfo = when;//$("input[name='date']").is(':checked') ? $("input[name='date']:checked").val() : "NA";
    reportData.personInfo = "N/A";//$("input[name='person']").is(':checked') ? $("input[name='person']:checked").val() : "NA";
    reportData.otherDetails = "N/A";//$.trim($("#comment").val());
    
    if ($("#inputGroupFile01").val() != "") {
        file_data = $("#inputGroupFile01").prop("files")[0];
        fileUpload(file_data, reportData, 0);

    }else{
        sendReport(reportData);
        $('#submit_btn2').attr('disabled', true);
    }
}

async function sendReport(reportData) {
    reportData.created = firebase.firestore.FieldValue.serverTimestamp();

    await db.collection("ids").get().then(function (querySnapshot) {
        reportData.id = querySnapshot.docs[0].data().reportID + 1;
        querySnapshot.forEach(function (doc) {
            let newID = doc.data().reportID + 1;
            db.collection("ids").doc(doc.id).update({
                reportID: newID
            });
        });
    });
   
    db.collection("reports").doc().set(reportData)
        .then(async function () {
            console.log("Document successfully written!");
            $('#submit_modal').modal('toggle');
            sessionStorage.removeItem("category");
            $("input[name='who']").val("");
            $("input[name='when']").val("");
            $("input[name='where']").val("");
            $("input[name='how']").val("");
            $('#submit_btn2').attr('disabled', false);
            
            logAction(1);
        })
        .catch(function (error) {
            console.error("Error writing document: ", error);
        });
}

// function sentReportNotify(){
//     PNotify.success({
//         title: "Report Sent Successfully",
//         delay: 3000,
//         modules: {
//             Buttons: {
//                 closer: true,
//                 closerHover: true,
//                 sticker: false
//             },
//             Desktop: {
//                 desktop: true,
//                 fallback: true,
//                 icon: null
//             },
//             Mobile: {
//                 swipeDismiss: true,
//                 styling: true
//             }
//         }
//     });
// }

function getCategory(id) {
    sessionStorage.setItem("category",id);
}

async function logIn(e) {
    var anon = false;
    if (e == 0) {
        var username = document.getElementById("usernameanon").value.trim();
        var password = document.getElementById("passwordanon").value;
        anon = true;
    } else {
        e.preventDefault();
        var username = document.getElementById("username").value.trim();
        var password = document.getElementById("password").value;
    }
    docs = []
    await db.collection("users").where("username", "==", username).where("password", "==", password).get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
            docs.push(doc.data());
            console.log(doc.id, " => ", doc.data());
        });
    });
    if (docs.length == 1) {
        if (docs[0].userType == 1) {
            sessionStorage.setItem("username", docs[0].username);
            sessionStorage.setItem("group", docs[0].group);
            sessionStorage.setItem("userType", docs[0].userType);
           location.href = "reportsummary.html";
        } else {
            sessionStorage.setItem("username", docs[0].username);
            sessionStorage.setItem("group", docs[0].group);
            sessionStorage.setItem("userType", docs[0].userType);
            sessionStorage.setItem("userId", docs[0].id);
            sessionStorage.setItem("enableAnonymous", docs[0].enableAnonymousSending);
            if (anon)
                sessionStorage.setItem("isAnonymous", true);
            location.href = "home.html";
        }
    } else
        alert("Incorrect username or password")

}

// JP Version of Login Function
async function logInJp(e) {
    var anon = false;
    if (e == 0) {
        var username = document.getElementById("usernameanon").value.trim();
        var password = document.getElementById("passwordanon").value;
        anon = true;
    } else {
        e.preventDefault();
        var username = document.getElementById("username").value.trim();
        var password = document.getElementById("password").value;
    }
    docs = []
    await db.collection("users").where("username", "==", username).where("password", "==", password).get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
            docs.push(doc.data());
            console.log(doc.id, " => ", doc.data());
        });
    });
    if (docs.length == 1) {
        if (docs[0].userType == 1) {
            sessionStorage.setItem("username", docs[0].username);
            sessionStorage.setItem("group", docs[0].group);
            sessionStorage.setItem("userType", docs[0].userType);
           location.href = "/JP/reportsummary.html";
        } else {
            sessionStorage.setItem("username", docs[0].username);
            sessionStorage.setItem("group", docs[0].group);
            sessionStorage.setItem("userType", docs[0].userType);
            sessionStorage.setItem("userId", docs[0].id);
            sessionStorage.setItem("enableAnonymous", docs[0].enableAnonymousSending);
            if (anon)
                sessionStorage.setItem("isAnonymous", true);
            location.href = "/JP/home.html";
        }
    } else
        alert("Incorrect username or password")

}

function logOut() {
    sessionStorage.clear(); 
    location.href = "index.html";   
}

// JP version of log out function
function logOutJp() {
    location.href = "/JP/index.html";
    sessionStorage.clear();
}
