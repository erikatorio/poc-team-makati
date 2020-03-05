var newUserTable
var locGrps = []
var clipboard
class User {
    constructor(name, group) {
        this.name = name;
        this.group = group;
        this.password = generatePassword();
        this.type = 2;
    }
}

// var tempUsers = [];
// var pubnub = new PubNub({
//           publishKey : 'pub-c-8266b3af-df4a-4508-91de-0a06b9634a69',
//           subscribeKey : 'sub-c-b20376b2-5215-11ea-80a4-42690e175160',
//           uuid: "admin"
//     });

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
    showPage("userloader");

});

async function populateUserTable() {
    $('#showUsersTable div').html("");

    let head =
        "<table id='example' class='table'>" +
        "<thead>" +
        "<tr id='flat-row'>" +
        "<th width='5' scope='col' class='table-header th-sm text-white' >#</th>" +
        "<th width='20' scope='col' class='table-header th-sm text-white' style='font-size:14px'>ユーザー名</th>" +
        "<th width='60' scope='col' class='table-header th-sm text-white' style='font-size:11px'>デパートメント</th>" +
        "<th width='15' class='table-header th-sm text-white' style='font-size:12px'>設定</th>" +
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

    $('#showUsersTable').append(head + body + "</tbody></table>");
    $('#example').DataTable({
        paging: false,
        info: false,
        dom: 'Bfrtip',
        scrollY: '20vh',
        buttons: ['csv', 'excel', 'pdf'],
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

// async function addusers() {

//     $('#userName').prop('required', false)
//     $('#userGroup').prop('required', false)
//     var users = []
//     let size = 0
//     let userDetails = newUserTable.cells().data();
//     for (let i = 0; i < userDetails.length; i += 2) {
//         users.push(new User(userDetails[i], userDetails[i + 1]))
//     }
//     console.log(userDetails)
//     console.log(users)
//     await db.collection("ids").get().then(function (querySnapshot) {
//         size = querySnapshot.docs[0].data().userId;
//     })
//     users.forEach(async (user) => {
//         size += 1;
//         db.collection("users").doc().set({
//             id: size,
//             dateCreated: firebase.firestore.FieldValue.serverTimestamp(),
//             username: user.name,
//             group: user.group,
//             userType: user.type,
//             defaultPassword: user.password,
//             password: user.password
//         });
//     })
//     // .then(async function () {
//     console.log("Document successfully written!");
//     sessionStorage.removeItem("category");

//     PNotify.success({
//         title: "Successfully added Users",
//         delay: 2000,
//         modules: {
//             Buttons: {
//                 closer: true,
//                 closerHover: true,
//                 sticker: false
//             },
//             Mobile: {
//                 swipeDismiss: true,
//                 styling: true
//             }
//         }
//     });

//     showUsers().then(() => {
//         $('#usersTable').DataTable({
//             dom: 'Bfrtip',
//             scrollY: '40vh',
//             buttons: ['csv', 'excel', 'pdf'],
//             responsive: true
//         });
//     });

//     newUserTable.clear().draw();
//     $('#userModal').modal('hide')
// })
// .catch(function (error) {
//     console.error("Error adding users: ", error);
// });

//     db.collection("ids").get().then(function (querySnapshot) {
//         querySnapshot.forEach(async function (doc) {
//             await db.collection("ids").doc(doc.id).update({
//                 userId: size
//             });
//         });
//     })
// }

function newUser() {
    $('#userName').prop('required', true)
    $('#userGroup').prop('required', true)

    if ($('#userName').val() !== "" && $('#userGroup').val() !== "") {
        newUserTable.row.add([$('#userName').val(), $('#userGroup').val()]).draw();
        $('#userModalButton').removeClass('disabled')
        $('#userName').prop('required', false)
        $('#userGroup').prop('required', false)
        $('#userName').val("")
        $('#userGroup').val("")
    }
}

function addUserElement(bol) {
    return '<div class="text-center pt-2" id="newUserDetails">' +
        '<input type="text" placeholder="Username" id="userName" style="padding-left: 3px; margin-right: 2%;background: none;border: 1px solid #3D3028; border-radius: 5px; width: 40%;" required></input>' +
        '<button id="userGroup" type="button" class="dropdown-toggle" data-toggle="dropdown" placeholder="Group" style="background: none;border: 1px solid #3D3028; color: gray; border-radius: 5px; width: 40%; text-align: left;">Group<i style="float: right;" class="fa fa-caret-down"></i></button>' +
        '<div class="dropdown-menu" style="width: 40%; border: 1px solid #3D3028; color: #3D3028; border-radius: 5px;">' +
        '<a class="dropdown-item" href="#">Group 1</a>' +
        '<a class="dropdown-item" href="#">Group 1</a>' +
        '<a class="dropdown-item" href="#">Group 2</a>' +
        '</div>' +
        // '<input type="text" placeholder="Group" id="userGroup" required></input>' +
        '<button class="material-icons rounded-circle border-0 align-middle ml-2" style="cursor: pointer;" data-toggle="tooltip" data-placement="top" title="Ad New User" id="addNewUser" onclick=newUser()>add</button>' +
        '</div > '
}

async function showUsers() {
    let tempUsers = [];

    await db
        .collection("users")
        .where("userType", "==", 2)
        .orderBy("id")
        .get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                tempUsers.push(doc.data());
            });
        });

    $('#showUsersTable div').html("");

    //Add body
    let head =
        "<table id='usersTable' class='display'>" +
        "<thead class='thead-inverse bg-custom text-custom'>" +
        "<tr>" +
        "<th style='width:10%;'>ＩＤ</th>" +
        "<th style='width:30%;'>名前</th>" +
        "<th style='width:40%;'>デパートメント</th>" +
        "<th style='width:20%;'>設定</th>" +
        "</tr>" +
        "</thead>";

    let body = '<tbody class="scroll-secondary">';

    tempUsers.forEach(function (user) {
        body +=
            "<tr id=\"reports-ds\">" +
            "<td>" +
            user.id +
            "</td>" +
            "<td>" +
            user.username +
            "</td>" +
            "<td style='line-height: 1em;'>" +
            user.group +
            "</td>" +
            "<td class='d-flex'>" +
            "<div class='p-1 m-1 cursor-pointer'><a href='#' data-toggle='modal' data-target='#updateUserModal' class='cursor-pointer' title='Edit' id='editUser'" + user.id + " onclick='$(\"#userID\").text(`User ID: " + user.id + "`); $(\"#userName\").text(`Username SIZT: " + "SAMPLE" + user.username + "`); $(\"#userGroup\").val(`" + user.group + "`); $(\"#userModalButton\").attr(\"onclick\", \"updateUser(" + user.id + ")\");'><i class='fas fa-edit'></i></a></div>" +
            "<div class='p-1 m-1 cursor-pointer'><a href='#' class='cursor-pointer' title='Delete' id='deleteUser'" + user.id + " onClick='removeUser(" + user.id + ")'><i class='fas fa-trash-alt'></i></a></div>" +
            // "<div class='p-1 m-1 cursor-pointer'><a href='#' tabindex='0' class='cursor-pointer' data-toggle='tooltip' data-placement='top' title='Default Password' id='viewPassword" + user.id + "' onClick='viewPassword(" + user.id + ")'><i class='fas fa-eye'></i></a></div>" +
            "</td>" +
            "</tr>";
    });

    $("#showUsersTable").append(head + body + "</tbody></table>");
}
// async function viewPassword(userId) {
//     if (clipboard) {
//         clipboard.destroy();
//     }
//     await db
//         .collection("users")
//         .where("id", "==", userId)
//         .get()
//         .then(function (qs) {
//             qs.forEach(function (doc) {
//                 $('#viewPassword' + userId).popover({ html: true, title: "", trigger: 'focus', content: '<button class="btn password" id="pass' + userId + '" data-clipboard-target="#pass' + userId + '" data-clipboard-text=' + doc.data().defaultPassword + '>' + doc.data().defaultPassword + '</button>', placement: 'top' })
//             });
//         }).then(() => {
//             $('#viewPassword' + userId).popover('show')
//         })
//     clipboard = new ClipboardJS('#pass' + userId);
//     clipboard.on('success', function (e) {
//         PNotify.success({
//             text: "Copied!",
//             delay: 1000
//         });
//     });
// }

async function updateUser(value) {

    let newGroup = document.getElementById("userGroup").value;

    if (newGroup == "")
        return

    if (locGrps.includes(newGroup)) {
        db.collection("users")
            .where("id", "==", value)
            .get()
            .then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    doc.ref.update({
                        group: newGroup
                    });
                });

                PNotify.success({
                    title: "Update Successful!",
                    delay: 2000,
                    modules: {
                        Buttons: {
                            closer: true,
                            closerHover: true,
                            sticker: false
                        },
                        Mobile: {
                            swipeDismiss: true,
                            styling: true
                        }
                    }
                });

                showUsers().then(() => {
                    $('#usersTable').DataTable({
                        dom: 'Bfrtip',
                        scrollY: '40vh',
                        buttons: ['csv', 'excel', 'pdf'],
                        responsive: true,
                        columnDefs: [{ orderable: false, targets: 3 }]
                    });
                });
                document.getElementById("userGroup").value = "";

            })
            .catch(function (error) {
                console.error("Error User update: ", error);
            });

        $('#userModal').modal('hide');
    } else {
        PNotify.error({
            title: "Update Error!",
            text: "Group does not exist!",
            delay: 2000,
            modules: {
                Buttons: {
                    closer: true,
                    closerHover: true,
                    sticker: false
                },
                Mobile: {
                    swipeDismiss: true,
                    styling: true
                }
            }
        });
        return
    }
}

// async function removeUser(value) {
//     const notice = PNotify.notice({
//         title: "Delete User",
//         text: "Confirm Delete?",
//         icon: "fas fa-question-circle",
//         hide: false,
//         modules: {
//             Confirm: {
//                 confirm: true,
//             },
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

//     notice.on('pnotify.confirm', () => {
//         db.collection("users")
//             .where("id", "==", value)
//             .get()
//             .then(function (querySnapshot) {
//                 querySnapshot.forEach(function (doc) {
//                     doc.ref.delete();
//                 });

//                 PNotify.success({
//                     title: "Delete Successful!",
//                     delay: 2000,
//                     modules: {
//                         Buttons: {
//                             closer: true,
//                             closerHover: true,
//                             sticker: false
//                         },
//                         Mobile: {
//                             swipeDismiss: true,
//                             styling: true
//                         }
//                     }
//                 });

//                 showUsers().then(() => {
//                     $('#usersTable').DataTable({
//                         dom: 'Bfrtip',
//                         scrollY: '40vh',
//                         buttons: ['csv', 'excel', 'pdf'],
//                         responsive: true,
//                         columnDefs: [{ orderable: false, targets: 3 }]
//                     });
//                 });
//             })
//             .catch(function (error) {
//                 console.error("Error user deletion: ", error);
//             });
//     });
// }

function duplicateHandling() {

}

function userGroupSearch() {
    $('#userGroup').autocomplete({
        source: locGrps,
        minLength: 0
    }).focus(function () {
        $(this).autocomplete("search");
    });
}

//function to hide loader after Content has successfully loaded 
function showPage(divid) {
    console.log("test");
    document.getElementById(divid).style.display = "none";
}
