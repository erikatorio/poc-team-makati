var notif = false;
var reports = [];
var categories = [];
var groups = [];
var loaded = false;

window.addEventListener("load", async () => {
    let isloaded = false;
    await getReports();
    await showTables();
    await reportDetails();
    $('#userName').html(sessionStorage.getItem('username'));
    reportsTable = $('#reportsTable').DataTable({
        dom: 'Bfrtip',
        scrollY: '60vh',
        buttons: [],
        responsive: true
    });

    await db
        .collection('reports')
        .orderBy('created', 'desc')
        .onSnapshot(async function(querySnapshot) {
        if (isloaded) {
            querySnapshot.docChanges().forEach(async function(change) {
                if (change.type === 'added') {  
                    // showNotif()
                    $('#reportCount').text(reports.length);
                    notifyReport(querySnapshot.docs[0]);
                }
            });
        } else {
            isloaded = true;
        }
    });
});

//GET REPORTS

async function getReports() {
    let locCat = [];
    let locReps = [];
    let locGrps = [];
    db.collection("reports")
        .orderBy("created", "desc")
        .get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                locReps.push(doc.data());
            });
        });
    
    await db
        .collection("categories")
        .orderBy("id")
        .get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                locCat.push(doc.data().name);
            });
        });

    await db
        .collection("groups")
        .orderBy("id")
        .get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                locGrps.push(doc.data().name);
            });
        });

    reports = locReps;
    categories = locCat;
    groups = locGrps;
}

// MARK A REPORT AS HIDDEN

async function deleteReport(reportID) {
    if(confirm('レポートを削除しますか?')){
        reports.forEach(async function (report) {
            if (report.id === reportID) {
                await db.collection("reports").where('id', '==', report.id)
                .get()
                .then(function (querySnapshot) {
                    querySnapshot.forEach(function (doc) {
                        db.collection("reports").doc(doc.id).update({
                            status: '隠された'
                        });
                    });
                    if(!alert('削除成功!')){
                        setTimeout(location.reload(), 1500);
                    }
                });
            }
        });
    }
}

// SAVE EDITS AND UPDATES

async function saveChanges(reportID) {
    storeFile(reportID);

    // Update Basic Info
    reports.forEach(async function (report) {
        if (report.id === reportID) {
            await db.collection("reports").where('id', '==', report.id)
            .get()
            .then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    db.collection("reports").doc(doc.id).update({
                        who: document.getElementById("spersoninfo").value,
                        where: document.getElementById("swhere").value,
                        when: document.getElementById("sdateInfo").value,
                        how: document.getElementById("show").value
                    });
                });
            });

            if(!alert('Success!')){
                $('#reportDetails').modal('hide');
                setTimeout(location.reload.bind(location), 500);
            }
        }
    })
}

// MARK A REPORT AS HIDDEN

async function removeFile(reportID) {
    reports.forEach(async function (report) {
        if (report.id === reportID) {
            await db.collection("reports").where('id', '==', report.id)
            .get()
            .then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    db.collection("reports").doc(doc.id).update({
                        attachFile: ''
                    });
                });
            });
        }
    })
}

//GET REPORT DETAILS AND VIEW IN A MODAL

async function selectReport(reportID) {
    reports.forEach(async function (report) {
        if (report.id === reportID) {
            await db.collection("reports").where('id', '==', report.id)
            .get()
            .then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    db.collection("reports").doc(doc.id).update({
                        read: true
                    });
                });
            });
            loadReportDetails(report).then(() => {
                $('#reportDetails').modal('show');
            }).then(()=>{
                // showNotif()
            })
        }
    })
}

async function loadReportDetails(reportSelected) {
    // console.log(reportSelected);
    $("#exampleModalLabel").html("Report ID #" + reportSelected.id);
    $("#reportDate").val(reportSelected.created.toDate().toLocaleString("en-PH"));
    // $("#sgroup").val(reportSelected.group);
    if (reportSelected.when === "" || reportSelected.when == undefined) {
        $("#sdateInfo").val('Info not given.');
    } else {
        $("#sdateInfo").val(reportSelected.when);
    }
    if (reportSelected.otherDetails === "") {
        $("#sotherDetails").val('No other details given.');
    } else {
        $("#sotherDetails").val(reportSelected.otherDetails);
    }
    if (reportSelected.who === "" || reportSelected.who == undefined) {
        $("#spersoninfo").val('Info not given.');
    } else {
        $("#spersoninfo").val(reportSelected.who);
    }
    if (reportSelected.where === "") {
        $("#swhere").val('Info not given.');
    } else {
        $("#swhere").val(reportSelected.where);
    }
    if (reportSelected.how === "") {
        $("#show").val('Info not given.');
    } else {
        $("#show").val(reportSelected.how);
    }
    if (reportSelected.attachFile === "") {
        $("#sattachment").html('<div class="input-group"><div class="input-group-prepend"><span class="input-group-text" id="inputGroupFileAddon01">アップロードする</span></div><div class="custom-file"><input type="file" class="custom-file-input" id="inputGroupFile01" aria-describedby="inputGroupFileAddon01"><label class="custom-file-label" for="inputGroupFile01">ファイルを選択</label></div></div>');
    } else {
        $("#sattachment").html('<label for="exampleFormControlTextarea1">ファイルを選択</label><span class="form-control" id="sattachment"><a target=_blank href= ' + reportSelected.attachFile + '>Link</a><button type="button" class="close" data-dismiss="alert" aria-label="Close" onclick="removeFile(' + reportSelected.id + ')"><span aria-hidden="true">&times;</span></button></span>');
    }
    $("#sfooter").html('<button type="button" class="btn btn-light" data-dismiss="modal">閉じる</button><button type="button" class="btn btn-primary" onclick="saveChanges(' + reportSelected.id + ')">送信する</button>');
}

async function reportDetails() {
    $('body').append('<div class= "modal fade" id = "reportDetails" tabindex = "-1" role = "dialog" aria-labelledby="exampleModalLabel" aria-hidden="true" > ' +
        '<div class= "modal-dialog" role = "document" > ' +
        '<div class= "modal-content" > ' +
        '<div class= "modal-header" > ' +
        '<h5 class="modal-title" id="exampleModalLabel"></h5>' +
        '<button type="button" class="close" data-dismiss="modal" aria-label="Close"> ' +
        '<span aria-hidden="true">&times;</span> ' +
        '</button> ' +
        '</div> ' +
        '<form action="">' +
        ' <div class="modal-body"> ' +
        '   <div class="form-group"> ' +
        '    <label for="exampleFormControlInput1">どちらが関与しましたか？</label> ' +
        '    <input type="text" class="form-control" name="who" placeholder="" id="spersoninfo">' +
        '   </div> ' +
        '   <div class="form-group"> ' +
        '    <label for="exampleFormControlInput1">それはいつ起きましたか?</label> ' +
        '    <input type="text" class="form-control" name="when" placeholder="" id="sdateInfo">' +
        '   </div> ' +
        '   <div class="form-group"> ' +
        '    <label for="exampleFormControlInput1">それはどちらに起きましたか？</label>' +
        '    <input type="text" class="form-control" name="where" placeholder="" id="swhere">' +
        '   </div> ' +
        '   <div class="form-group"> ' +
        '    <label for="exampleFormControlTextarea1">それはどうやって起きましたか？</label>' +
        '    <input type="text" class="form-control" name="how" placeholder="" id="show">' +
        '   </div> ' +
        '   <div class="form-group" id="sattachment"> ' +
        '   </div>' +
        ' </div> ' +
        ' <div class="modal-footer" id="sfooter">' +
        ' </div> ' +
        ' </form> ' +
        ' </div> ' +
        ' </div> ' +
        ' </div> '
    )
}

// SHOW REPORTS TABLE

async function showTables() {
    $("#allReports").html("");
    let options = { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    $('#showCategoriesTable div').html("");

    let cat = {};
    let group = {};
    let cCtr = {};
    let gCtr = {};
    let ctr = 0;

    //Add Head
    let head =
        "<table id='reportsTable' class='table table-sm'>" +
        "<thead>" +
        "<th scope='col' class='th-sm'>#</th>" +
        "<th scope='col' class='th-sm'>カテゴリー</th>" +
        "<th scope='col' class='th-sm'>日付</th>" +
        "<th scope='col' class='th-sm'>状態</th>" + 
        "<th scope='col' class='th-sm'>設定</th>" + 
        "</thead>";

    //Add body
    let body = '<tbody>';
    reports.forEach(function (report) {
        console.log(report);
        console.log(sessionStorage.getItem('username'));
        if(report.status != "hidden" && report.username == sessionStorage.getItem('username') ){
            if (typeof cCtr[report.category] === "undefined") {
                cCtr[report.category] = 0;
            } else {
                cCtr[report.category] += 1;
            }
            if (typeof gCtr[report.group] === "undefined") {
                gCtr[report.group] = 0;
            } else {
                gCtr[report.group] += 1;
            }

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
                default:
                    category = "Info Not Given";
                    break;
            }

            let date = new Date(report.created["seconds"] * 1000);
            body +=
                "<tr id=\"reports-ds\">" +
                "<th scope='row'>" +
                report.id +
                "</th>" +
                "<td>" +
                category +
                "</td>" +
                "<td>" +
                report.created.toDate().toLocaleString("en-US", options) +
                "</td>" +
                "<td>" +
                report.status +
                "</td>" +
                "<td><button class='btn btn-danger' onclick='deleteReport(" + report.id + ")'>削除</button><button class='btn btn-primary' onclick='selectReport(" + report.id + ")'>変更</button>" +
                "</tr>";
        }
    });

    $.each(cCtr, function (key, value) {
        if (cat["value"] < value || typeof cat["value"] === "undefined") {
            cat = { key, value };
        }
    });

    $.each(gCtr, function (key, value) {
        if (group["value"] < value || typeof group["value"] === "undefined") {
            group = { key, value };
        }
    });

    $("#allReports").append(head + body + "</tbody></table>");    
}

async function getCategories(){
    let locReps = [];

    await db
        .collection("reports")
        .orderBy("created", "desc")
        .get()
        .then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
            locReps.push(doc.data());
        });
    });

    await db
        .collection("categories")
        .orderBy("id")
        .get()
        .then(function(querySnapshot){
        querySnapshot.forEach(function(doc){
             categories.push(doc.data().name)
        });
    });

    initializeCategoryArray();
    countReports(locReps);
}