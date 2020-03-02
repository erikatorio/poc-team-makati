async function addUser(){

    let user_name = $("input[name='username']").val();
    let user_password = $("input[name='password']").val();
    let user_department = $("input[name='department']").val();

    let size = 0;

    await db.collection("users")
        .where("userType", "==", 2)
        .get()
        .then(function (querySnapshot){
            size = querySnapshot.docs.length;
        });
    
    db.collection("users")
        .doc()
        .set({
            id: size,
            username: user_name,
            password: user_password,
            group: user_department,
            userPicture: "",
            userType: 2,
            enableAnonymousSending: false
        })
        .then(async function(){
            if(!alert('Successfully added!')){
                $('#addNewUserModal').modal('hide');
            }
        })
        .catch(function (error) {
            console.error("Error adding user: ", error);
        });
    
}