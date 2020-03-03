var tempReports = [];

window.addEventListener("load", async () => {
    let isloaded = false;
    await getGroupsAndCategories();
    tempReports = reports;
    populateReportTable();
});

async function populateReportTable(){
    $('#table-container').html("");

    let head =
        "<h2 id='header-title'> レポートマネジメント <small class='text-muted'>レポートステータスを表示または更新する</small></h2>" +
        "<table id='example' class='table'>" +
        "<thead>" +
        "<tr id='flat-row'>" +
        "<th scope='col' class='table-header th-sm'>#</th>" +
        "<th scope='col' class='table-header th-sm'>カテゴリー</th>" +
        "<th scope='col' class='table-header th-sm'>デパートメント</th>" +
        "<th scope='col' class='table-header th-sm'>日付</th>" +
        "<th scope='col' class='table-header th-sm'>提出した人</th>" +
        "<th scope='col' class='table-header th-sm'>状態</th>" +
        "<th class='table-header th-sm'>設定</th>" +
        "</tr>" +
        "</thead>";

    let body = "<tbody>";

    tempReports.forEach(function(report){
        let options = { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        var category = "";
        switch(report.category){
            case "0":
                category = "会社内での暴力";
                break;
            case "1":
                category = "パーソナルハラスメント";
                break;
            case "2":
                category = "差別";
                break;
            case "3":
                category = "モラルハラスメント";
                break;
            case "4":
                category = "パワーハラスメント";
                break;
            case "5":
                category = "セクシャルハラスメント";
                break;
            case "6":
                category = "第三者ハラスメント";
                break;
            case "7":
                category = "その他";
                break;
        }

        let date = report.created.toDate().toLocaleString("en-US", options);
        body += 
            "<tr id='flat-row'>" + 
            "<th scope='row' class='table-id'>" + report.id + "</th>" +
            "<td class='table-content'>" + category + "</td>" +
            "<td class='table-content'>" + report.group + "</td>" +
            "<td class='table-content'>" + date + "</td>" +
            "<td class='table-content'>" + report.username + "</td>";
        
        if(report.status == "pending" || report.status == "Pending"){
            body += "<td class='table-content text-warning'>Pending</td>";
        } else if(report.status == "verified" || report.status == "Verified"){
            body += "<td class='table-content text-primary'>Verified</td>";
        } else if(report.status == "completed" || report.status == "Completed"){
            body += "<td class='table-content text-success'>Completed</td>";
        } else if(report.status == "rejected" || report.status == "Rejected"){
            body += "<td class='table-content text-danger'>Rejected</td>";
        } else if(report.status == "hidden" || report.status == "Hidden"){
            body += "<td class='table-content'>Hidden</td>";
        }

        body += 
            "<td><button class='btn btn-row' data-toggle='modal' onclick='viewReport(" + report.id + ")'><i class='fa fa-eye' aria-hidden='true'></i></button></td>" +
            "</tr>";
    });

    $('#table-container').append(head + body + "</tbody></table>");
    $('#example').DataTable();
}

async function viewReport(reportID){
    tempReports.forEach(async function (report) {
        if (report.id == reportID) {
            showReport(report).then(() => {
                $('#reportInfo').modal('show');
            });
        }
    });
}

async function showReport(details){
        var category = "";
        switch(details.category){
            case "0":
                category = "会社内での暴力";
                break;
            case "1":
                category = "パーソナルハラスメント";
                break;
            case "2":
                category = "差別";
                break;
            case "3":
                category = "モラルハラスメント";
                break;
            case "4":
                category = "パワーハラスメント";
                break;
            case "5":
                category = "セクシャルハラスメント";
                break;
            case "6":
                category = "第三者ハラスメント";
                break;
            case "7":
                category = "その他";
                break;
        }

        $("#exampleModalLabel").html(category);
        $("#submittor").html(details.username);
        $("#who").html(details.who);
        $("#when").html(details.when);
        $("#where").html(details.where);
        $("#how").html(details.how);
        $("#evidence").html("<a href=" + details.attachFile + ">Link</a>");
        switch(details.status){
            case "pending":
            case "Pending":
                $("#status").html("<select id='statusDD' onchange='changed()'><option selected>Pending</option><option>Rejected</option><option>Verified</option><option>Completed</option></select>");
                $("#action").html("<button type='button' class='btn btn-secondary' data-dismiss='modal'>Close</button><button type='button' class='btn btn-main' onclick='updateStatus(" + details.id + ")'>Save changes</button>")
                break;
            case "rejected":
            case "Rejected":
                $("#status").html("<select id='statusDD' onchange='changed()'><option>Pending</option><option selected>Rejected</option><option>Verified</option><option>Completed</option></select>");
                $("#action").html("<button type='button' class='btn btn-secondary' data-dismiss='modal'>Close</button><button type='button' class='btn btn-main' onclick='updateStatus(" + details.id + ")'>Save changes</button>")
                break;
            case "verified":
            case "Verified":
                $("#status").html("<select id='statusDD' onchange='changed()'><option>Pending</option><option>Rejected</option><option selected>Verified</option><option>Completed</option></select>");
                $("#action").html("<button type='button' class='btn btn-secondary' data-dismiss='modal'>Close</button><button type='button' class='btn btn-main' onclick='updateStatus(" + details.id + ")'>Save changes</button>")
                break;
            case "completed":
            case "Completed":
                $("#status").html("<select id='statusDD' onchange='changed()'><option>Pending</option><option>Rejected</option><option>Verified</option><option selected>Completed</option></select>");
                $("#action").html("<button type='button' class='btn btn-secondary' data-dismiss='modal'>Close</button><button type='button' class='btn btn-main' onclick='updateStatus(" + details.id + ")'>Save changes</button>")
                break;
            case "hidden":
            case "Hidden":
                $("#status").html("Hidden");
                $("#action").html("<button type='button' class='btn btn-secondary' data-dismiss='modal'>Close</button>")
                break;
        }
        $("#evidence").html("<a href=" + details.attachFile + ">Link</a>");
}

async function changed(){
    console.log("Value changed");
    if ($("#statusDD").val() == "Rejected"){
        $("#reason").removeAttr("hidden");
    } else {
        $("#reason").attr("hidden", "hidden");
    }
}

async function updateStatus(reportID){
    if ($("#statusDD").val() == "Rejected"){
        tempReports.forEach(async function (report) {
            if (report.id === reportID) {
                await db.collection("reports").where('id', '==', report.id)
                .get()
                .then(function (querySnapshot) {
                    querySnapshot.forEach(function (doc) {
                        db.collection("reports").doc(doc.id).update({
                            status: $("#statusDD").val(),
                            reason: $("#reasonVal").val()
                        });
                    });
                });

                if(!alert('Success!')){
                    $('#reportInfo').modal('hide');
                    setTimeout(location.reload.bind(location), 500);
                }
            }
        });
    }
    else {
        tempReports.forEach(async function (report) {
            if (report.id === reportID) {
                await db.collection("reports").where('id', '==', report.id)
                .get()
                .then(function (querySnapshot) {
                    querySnapshot.forEach(function (doc) {
                        db.collection("reports").doc(doc.id).update({
                            status: $("#statusDD").val()
                        });
                    });
                });

                if(!alert('Success!')){
                    $('#reportInfo').modal('hide');
                    setTimeout(location.reload.bind(location), 500);
                }
            }
        });
    }
}