var tempUsers = [];
var pubnub = new PubNub({
          publishKey : 'pub-c-8266b3af-df4a-4508-91de-0a06b9634a69',
          subscribeKey : 'sub-c-b20376b2-5215-11ea-80a4-42690e175160',
          uuid: "admin"
    });
window.addEventListener("load", async () => {
    let isloaded = false;
    await getUsersData();
    tempUsers = users;
    var pubnub = new PubNub({
        publishKey : 'pub-c-8266b3af-df4a-4508-91de-0a06b9634a69',
        subscribeKey : 'sub-c-b20376b2-5215-11ea-80a4-42690e175160',
        uuid: "admin"
     });
    pubnub.getUsers(
        {
          include: {
            customFields: true
          }
        },
        function(status, response) {
        });
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
        "<th class='table-header th-sm'>設定</th>" +
        "</tr>" +
        "</thead>";

    let body = "<tbody>";

    tempUsers.forEach(function (user){
        body += 
            "<tr class='report-row' id='flat-row'>" + 
            "<th scope='row' class='table-id'>" + user.id + "</th>" +
            "<td class='table-content'>" + user.username + "</td>" +
            "<td class='table-content'>" + user.group + "</td>" +
            "<td><button class='btn btn-row' onclick='deleteUser(" + user.id + ")'><i class='fas fa-trash-alt'></i></button></td>" +
            "</tr>";
    });

    $('#userTable').append(head + body + "</tbody></table>");
    $('#example').DataTable();
}

async function addUser(){
    
    let user_name = $("input[name='username']").val();
    let user_password = $("input[name='password']").val();
    let user_department = $("#department option:selected").val();

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
        .then(async function(doc){
            var pubnub = new PubNub({
                publishKey : 'pub-c-8266b3af-df4a-4508-91de-0a06b9634a69',
                subscribeKey : 'sub-c-b20376b2-5215-11ea-80a4-42690e175160',
             });
             console.log(size + user_name);
            pubnub.createUser({id: doc.id.toString(), name: user_name.toString()}, function(status, response) {
                console.log(response);
                if(!alert('追加成功!')){
                    $('#addNewUserModal').modal('hide');
                    populateUserTable();
                    location.reload();
                }
            });
        })
        .catch(function (error) {
            console.error("Error adding user: ", error);
        });
}

async function deleteUser(user_id){
    if(confirm('このユーザーを削除しますか?')){
        db.collection("users")
            .where("id", "==", user_id)
            .get()
            .then(async function (querySnapshot) {
                var pubnub = new PubNub({
                    publishKey : 'pub-c-8266b3af-df4a-4508-91de-0a06b9634a69',
                    subscribeKey : 'sub-c-b20376b2-5215-11ea-80a4-42690e175160',
                    uuid: "admin"
                });
                querySnapshot.forEach(function (doc) {
                    doc.ref.delete();
                });
                pubnub.deleteUser(user_id.toString(), function(status, response) {
                    console.log(response);
                    if(!alert('ユーザー削除成功!')){
                        populateUserTable();
                        location.reload();
                    }
                });
            })
            .catch(function (error) {
                console.error("Error category deletion: ", error);
            });
            
    }
}