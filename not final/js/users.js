var tempUsers = [];
var pubnub = new PubNub({
    publishKey: 'pub-c-8266b3af-df4a-4508-91de-0a06b9634a69',
    subscribeKey: 'sub-c-b20376b2-5215-11ea-80a4-42690e175160',
    uuid: "admin"
});
window.addEventListener("load", async () => {
    let isloaded = false;
    await getUsersData();
    tempUsers = users;
    userDepartments = [];
    await db.collection("groups")
        .get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                userDepartments.push(doc.data().name);
            });
        });
    userDepartments.sort()
        .forEach((dep) => $("#department").append('<option value="' + dep + '">' + dep + '</option>'));
    var pubnub = new PubNub({
        publishKey: 'pub-c-8266b3af-df4a-4508-91de-0a06b9634a69',
        subscribeKey: 'sub-c-b20376b2-5215-11ea-80a4-42690e175160',
        uuid: "admin"
    });
    pubnub.getUsers(
        {
            include: {
                customFields: true
            }
        },
        function (status, response) {
        });
    populateUserTable();
    showPageUser();
});

async function populateUserTable() {
    $('#userTable div').html("");

    let head =
        "<table id='example' class='table'>" +
        "<thead>" +
        "<tr id='flat-row'>" +
        "<th width='20%' scope='col' class='table-header th-sm'>#</th>" +
        "<th width='30%' scope='col' class='table-header th-sm'>ユーザー名</th>" +
        "<th width='40%' scope='col' class='table-header th-sm'>デパートメント</th>" +
        "<th width='10%' class='table-header th-sm'>設定</th>" +
        "</tr>" +
        "</thead>";

    let body = "<tbody>";

    tempUsers.forEach(function (user) {
        body +=
            "<tr class='report-row' id='flat-row'>" +
            "<th scope='row' class='table-id'>" + user.id + "</th>" +
            "<td class='table-content'>" + user.username + "</td>" +
            "<td class='table-content'>" + user.group + "</td>" +
            "<td><button class='btn btn-row' onclick='deleteUser(" + user.id + ")'><i class='fas fa-trash-alt'></i></button></td>" +
            "</tr>";
    });

    $('#userTable').append(head + body + "</tbody></table>");
    $('#example').DataTable({
        scrollY: '40vh',
        responsive: true,
        columnDefs: [{ orderable: false, targets: 3 }]
    });
}

async function addUser() {

    let user_name = $("input[name='username']").val();
    let user_password = $("input[name='password']").val();
    let user_department = $("#department option:selected").val();

    let newID = 0;

    await db.collection("ids")
        .get()
        .then(function (querySnapshot) {
            newID = querySnapshot.docs[0].data().userId + 1;
            querySnapshot.forEach(function (doc) {
                let newID = doc.data().userId + 1;
                db.collection("ids").doc(doc.id).update({
                    userId: newID
                });
            });
        });

    db.collection("users")
        .add({
            id: newID,
            username: user_name,
            password: user_password,
            group: user_department,
            userPicture: "",
            userType: 2,
            enableAnonymousSending: false
        })
        .then(async function (doc) {
            var pubnub = new PubNub({
                publishKey: 'pub-c-8266b3af-df4a-4508-91de-0a06b9634a69',
                subscribeKey: 'sub-c-b20376b2-5215-11ea-80a4-42690e175160',
            });

            pubnub.createUser({ id: doc.id.toString(), name: user_name.toString() }, function (status, response) {
                console.log(response);
                if (!alert('追加成功!')) {
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

async function deleteUser(user_id) {
    if (confirm('このユーザーを削除しますか?')) {
        db.collection("users")
            .where("id", "==", user_id)
            .get()
            .then(async function (querySnapshot) {
                var pubnub = new PubNub({
                    publishKey: 'pub-c-8266b3af-df4a-4508-91de-0a06b9634a69',
                    subscribeKey: 'sub-c-b20376b2-5215-11ea-80a4-42690e175160',
                    uuid: "admin"
                });
                querySnapshot.forEach(function (doc) {
                    doc.ref.delete();
                });
                pubnub.deleteUser(user_id.toString(), function (status, response) {
                    console.log(response);
                    if (!alert('ユーザー削除成功!')) {
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

//function to hide loader after Content has successfully loaded 
function showPageUser() {
    console.log("test");
    document.getElementById("loader").style.display = "none";
}