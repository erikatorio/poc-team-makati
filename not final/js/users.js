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
        "<th scope='col' class='table-header th-sm'>Username</th>" +
        "<th scope='col' class='table-header th-sm'>Department</th>" +
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