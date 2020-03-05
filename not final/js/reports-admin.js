var tempReports = [];

window.addEventListener("load", async () => {
    let isloaded = false;
    await getGroupsAndCategories();
    tempReports = reports;
    populateReportTable();
    showPage();
});

async function populateReportTable() {
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

    tempReports.forEach(function (report) {
        let options = { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        var category = "";
        switch (report.category) {
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

        if (report.status == "検討中") {
            body += "<td class='table-content text-warning'>検討中</td>";
        } else if (report.status == "検証済み") {
            body += "<td class='table-content text-primary'>検証済み</td>";
        } else if (report.status == "解決した") {
            body += "<td class='table-content text-success'>解決した</td>";
        } else if (report.status == "拒否された") {
            body += "<td class='table-content text-danger'>拒否された</td>";
        } else if (report.status == "隠された") {
            body += "<td class='table-content'>隠された</td>";
        }

        body +=
            "<td><button class='btn btn-row' data-toggle='modal' onclick='viewReport(" + report.id + ")'><i class='fa fa-eye' aria-hidden='true'></i></button></td>" +
            "</tr>";
    });

    $('#table-container').append(head + body + "</tbody></table>");
    $('#example').DataTable({
        scrollY: '40vh',
        responsive: true,
        columnDefs: [{ orderable: false, targets: 6 }]
    });
}

async function viewReport(reportID) {
    tempReports.forEach(async function (report) {
        if (report.id == reportID) {
            showReport(report).then(() => {
                $('#reportInfo').modal('show');
            });
        }
    });
}

async function showReport(details) {
    var category = "";
    switch (details.category) {
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
    if (details.username == "") {
        $("#submittor").html("詳細なし");
    } else {
        $("#submittor").html(details.username);
    }
    if (details.who == "") {
        $("#who").html("詳細なし");
    } else {
        $("#who").html(details.who);
    }
    if (details.when == "") {
        $("#when").html("詳細なし");
    } else {
        $("#when").html(details.when);
    }
    if (details.where == "") {
        $("#where").html("詳細なし");
    } else {
        $("#where").html(details.where);
    }
    if (details.how == "") {
        $("#how").html("詳細なし");
    } else {
        $("#how").html(details.how);
    }
    if (details.attachFile == "") {
        $("#evidence").html("ファイルなし");
    } else {
        $("#evidence").html("<a target=_blank href= '" + details.attachFile + "'>Link</a>");
    }
    switch (details.status) {
        case "検討中":
            $("#status").html("<select id='statusDD' onchange='changed()'><option selected>検討中</option><option>拒否された</option><option>検証済み</option><option>解決した</option></select>");
            $("#action").html("<button type='button' class='btn btn-secondary' data-dismiss='modal'>Close</button><button type='button' class='btn btn-main' onclick='updateStatus(" + details.id + ")'>Save changes</button>")
            $("#reason").attr("hidden", "hidden");
            $("#reasonVal").val("");
            break;
        case "拒否された":
            $("#status").html("<select id='statusDD' onchange='changed()'><option>検討中</option><option selected>拒否された</option><option>検証済み</option><option>解決した</option></select>");
            $("#action").html("<button type='button' class='btn btn-secondary' data-dismiss='modal'>Close</button><button type='button' class='btn btn-main' onclick='updateStatus(" + details.id + ")'>Save changes</button>")
            $("#reason").removeAttr("hidden");
            $("#reasonVal").val(details.reason);
            break;
        case "検証済み":
            $("#status").html("<select id='statusDD' onchange='changed()'><option>検討中</option><option>拒否された</option><option selected>検証済み</option><option>解決した</option></select>");
            $("#action").html("<button type='button' class='btn btn-secondary' data-dismiss='modal'>Close</button><button type='button' class='btn btn-main' onclick='updateStatus(" + details.id + ")'>Save changes</button>")
            $("#reason").attr("hidden", "hidden");
            $("#reasonVal").val("");
            break;
        case "解決した":
            $("#status").html("<select id='statusDD' onchange='changed()'><option>検討中</option><option>拒否された</option><option>検証済み</option><option selected>解決した</option></select>");
            $("#action").html("<button type='button' class='btn btn-secondary' data-dismiss='modal'>Close</button><button type='button' class='btn btn-main' onclick='updateStatus(" + details.id + ")'>Save changes</button>")
            $("#reason").attr("hidden", "hidden");
            $("#reasonVal").val("");
            break;
        case "隠された":
            $("#status").html("隠された");
            $("#action").html("<button type='button' class='btn btn-secondary' data-dismiss='modal'>Close</button>")
            $("#reason").attr("hidden", "hidden");
            $("#reasonVal").val("");
            break;
    }
}

async function changed() {
    if ($("#statusDD").val() == "拒否された") {
        $("#reason").removeAttr("hidden");
    } else {
        $("#reason").attr("hidden", "hidden");
        $("#reasonVal").val("");
    }
}

async function updateStatus(reportID) {
    if ($("#statusDD").val() == "拒否された") {
        if ($("#reasonVal").val() != "") {
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

                    if (!alert('Success!')) {
                        $('#reportInfo').modal('hide');
                        setTimeout(location.reload.bind(location), 500);
                    }
                }
            });
        } else {
            alert("Please provide a reason for rejection.");
        }
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

                if (!alert('Success!')) {
                    $('#reportInfo').modal('hide');
                    setTimeout(location.reload.bind(location), 500);
                }
            }
        });
    }
}

//function to hide loader after Content has successfully loaded 
function showPage() {
    console.log("test");
    document.getElementById("loader").style.display = "none";
}