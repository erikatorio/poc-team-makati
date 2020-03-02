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

window.addEventListener("load", async () => {
    isloaded = true;
    newUserTable = $('#addUsersTable').DataTable({
      paging: false,
      info: false,
      sorting: false,
      searching: false,
      language: {
        emptyTable: 'No new user'
      }
    });

    $('#addUsersTable').parent().append(addUserElement(1))
    showUsers().then(() => {
        $('#usersTable').DataTable({
          dom: 'Bfrtip',
          scrollY: '40vh',
          buttons: ['csv', 'excel', 'pdf'],
          responsive: true,
          columnDefs: [{ orderable: false, targets: 3 }]
        });
    })

    await db
        .collection("groups")
        .orderBy("id")
        .get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                locGrps.push(doc.data().name);
            });
        });


    $('#userModalButton').click(() => {
        if (!$('#userModalButton').hasClass('disabled'))
            addusers()
    })
    $('#addNewUser').click(() => {
        $('#newUserDetails').remove()
        $('#addUsersTable').parent().append(addUserElement(1))

    })
    $('.popover-dismiss').popover({
        trigger: 'focus'
    })
});

async function addusers() {

    $('#userName').prop('required', false)
    $('#userGroup').prop('required', false)
    var users = []
    let size = 0
    let userDetails = newUserTable.cells().data();
    for (let i = 0; i < userDetails.length; i += 2) {
        users.push(new User(userDetails[i], userDetails[i + 1]))
    }
    console.log(userDetails)
    console.log(users)
    await db.collection("ids").get().then(function (querySnapshot) {
        size = querySnapshot.docs[0].data().userId;
    })
    users.forEach(async (user) => {
        size += 1;
        db.collection("users").doc().set({
            id: size,
            dateCreated: firebase.firestore.FieldValue.serverTimestamp(),
            username: user.name,
            group: user.group,
            userType: user.type,
            defaultPassword: user.password,
            password: user.password
        });
    })
    // .then(async function () {
    console.log("Document successfully written!");
    sessionStorage.removeItem("category");

    PNotify.success({
        title: "Successfully added Users",
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
            responsive: true
        });
    });

    newUserTable.clear().draw();
    $('#userModal').modal('hide')
    // })
    // .catch(function (error) {
    //     console.error("Error adding users: ", error);
    // });

    db.collection("ids").get().then(function (querySnapshot) {
        querySnapshot.forEach(async function (doc) {
            await db.collection("ids").doc(doc.id).update({
                userId: size
            });
        });
    })
}

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
        '<input type="text" placeholder="username" id="userName" required></input>' +
        '<input type="text" placeholder="group" id="userGroup" required></input>' +
        '<button class="material-icons rounded-circle text-success border-0 align-middle ml-2" data-toggle="tooltip" data-placement="top" title="new user" id="addNewUser" onclick=newUser()>add</button></div > '
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
        "<th style='width:20%;'>ユーザーＩＤ</th>" +
        "<th style='width:40%;'>ユーザー名</th>" +
        "<th style='width:30%;'>グループ</th>" +
        "<th style='width:10%;'>変化</th>" +
        "</tr>" +
        "</thead>";

    let body = '<tbody class="scroll-secondary">';

    tempUsers.forEach(function (user) {
        body +=
            "<tr>" +
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
            "<div class='p-1 m-1 cursor-pointer'><a href='#' data-toggle='modal' data-target='#updateUserModal' class='cursor-pointer' title='Edit' id='editUser'" + user.id + " onclick='$(\"#userID\").text(`User ID: " + user.id + "`); $(\"#userName\").text(`Username: " + user.username + "`); $(\"#userGroup\").val(`" + user.group + "`); $(\"#userModalButton\").attr(\"onclick\", \"updateUser(" + user.id + ")\");'><i class='fas fa-edit'></i></a></div>" +
            "<div class='p-1 m-1 cursor-pointer'><a href='#' class='cursor-pointer' title='Delete' id='deleteUser'" + user.id + " onClick='removeUser(" + user.id + ")'><i class='fas fa-trash-alt'></i></a></div>" +
            "<div class='p-1 m-1 cursor-pointer'><a href='#' tabindex='0' class='cursor-pointer' data-toggle='tooltip' data-placement='top' title='Default Password' id='viewPassword" + user.id + "' onClick='viewPassword(" + user.id + ")'><i class='fas fa-eye'></i></a></div>" +
            "</td>" +
            "</tr>";
    });

    $("#showUsersTable").append(head + body + "</tbody></table>");
}
async function viewPassword(userId) {
    if (clipboard) {
        clipboard.destroy();
    }
    await db
        .collection("users")
        .where("id", "==", userId)
        .get()
        .then(function (qs) {
            qs.forEach(function (doc) {
                $('#viewPassword' + userId).popover({ html: true, title: "", trigger: 'focus', content: '<button class="btn password" id="pass' + userId + '" data-clipboard-target="#pass' + userId + '" data-clipboard-text=' + doc.data().defaultPassword + '>' + doc.data().defaultPassword + '</button>', placement: 'top' })
            });
        }).then(() => {
            $('#viewPassword' + userId).popover('show')
        })
    clipboard = new ClipboardJS('#pass' + userId);
    clipboard.on('success', function (e) {
        PNotify.success({
            text: "Copied!",
            delay: 1000
        });
    });
}

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

async function removeUser(value) {
    const notice = PNotify.notice({
        title: "Delete User",
        text: "Confirm Delete?",
        icon: "fas fa-question-circle",
        hide: false,
        modules: {
            Confirm: {
                confirm: true,
            },
            Buttons: {
                closer: true,
                closerHover: true,
                sticker: false
            },
            Desktop: {
                desktop: true,
                fallback: true,
                icon: null
            },
            Mobile: {
                swipeDismiss: true,
                styling: true
            }
        }
    });

    notice.on('pnotify.confirm', () => {
        db.collection("users")
            .where("id", "==", value)
            .get()
            .then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    doc.ref.delete();
                });

                PNotify.success({
                    title: "Delete Successful!",
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
            })
            .catch(function (error) {
                console.error("Error user deletion: ", error);
            });
    });
}

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