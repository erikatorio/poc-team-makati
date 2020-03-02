async function changePassword(){
    var bcrypt = dcodeIO.bcrypt;
    var salt =genSaltSync(10);
    let username = sessionStorage.getItem("username");
    let user = null;
    await db.collection("users").where("username", "==", username).get().then(function (querySnapshot) {
        user = querySnapshot.docs[0].data();
    });
    console.log(user);
    
    if(user.password){
        let inputPassword = document.getElementById("password").value
        let passwordHash  = bcrypt.hashSync(inputPass, salt);
    }
}