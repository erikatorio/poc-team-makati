
var tempUsers = [];

window.addEventListener("load", async () => {
    let isloaded = false;
    await getUsersData();
    tempUsers = users;
    populateUserTable();
});

async function populateUserTable(){
    $('#userTable div').html("");

    let head = 
        "<table id='example' class='table'>" +
        "<thead>" +
        "<tr id='flat-row'>" +
        "<th scope='col' class='table-header th-sm'>#</th>" +
        "<th scope='col' class='table-header th-sm'>ユーザー名</th>" +
        "<th scope='col' class='table-header th-sm'>デパートメント</th>" +
        "<th class='table-header th-sm'>Actions</th>" +
        "</tr>" +
        "</thead>";

    let body = "<tbody>";

    tempUsers.forEach(function (user){
        body += 
            "<tr class='report-row' id='flat-row'>" + 
            "<th scope='row' class='table-id'>" + user.id + "</th>" +
            "<td class='table-content'>" + user.username + "</td>" +
            "<td class='table-content'>" + user.group + "</td>" +
            "<td><button class='btn btn-row'><i class='fas fa-trash-alt'></i></button></td>" +
            "</tr>";
    });

    $('#userTable').append(head + body + "</tbody></table>");
    $('#example').DataTable();
}

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

async function deleteUser(user_id){
    if(confirm('Delete user?')){
        db.collection("users")
            .where("id", "==", user_id)
            .get()
            .then(async function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    doc.ref.delete();
                });
                alert('User Deletion Successful!');
            })
            .catch(function (error) {
                console.error("Error category deletion: ", error);
            });
    }
}