// import { decodeBase64 } from "bcryptjs";

// var latestReportsTable
var tempUsers = [];
var tempLogs = [];
window.addEventListener("load", async () => {
    isloaded = true;
    //await getGroupsAndCategories();
    await showNotif();
    await reportSummary();
    await getLogs();
    tempLogs = logs;
    await showLogs();
    generateColors(1);
    initArray();
    byGroup();
    findMax();

    loadData(1).then(function () {
        drawVisualization(data);
        drawVisualizationTrend(0);
        showPage("trendloader");
    });

    $('#latestReportsTable').DataTable({
        paging: false,
        info: false,
        scrollY: 210,
        responsive: true,
        searching: false,
        lengthChange: false,
        ordering: false,
        paging: false,
        info: false
    });

    $('#logsTable').DataTable({
        paging: false,
        info: false,
        scrollY: 210,
        responsive: true,
        searching: false,
        lengthChange: false,
        ordering: false,
        paging: false,
        info: false
    });

    showPage("reportloader");
});



async function showLogs(){
    // BUILD THE TABLE
    $("#allLogs").html("");
    let options = { hour12:false, month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    let head = "<table id='logsTable' class='display'>" +
        "<thead>" +
        "<tr>" +
        "<th style='width:70%;'>Action</th>" +
        "<th style='width:30%;'>Date/Time</th>" +
        // "<th style='width:30%;'>Category</th>" +
        // "<th style='width:40%;'>Date</th>" +
        "</tr></thead>";
    let body = "<tbody class='scroll-secondary'>";
    tempLogs.forEach(function (userLog) {
        let date = userLog && userLog.timeStamp && userLog.timeStamp.toDate().toLocaleString("en-US", options);
        body += "<tr>";
        switch(userLog.actionId){
            case 1:
                body += "<td style='width:70%;'>New Report Submitted</td>"; 
                break;
            case 2:
                body += "<td style='width:70%;'>Report Details Updated</td>";
                break;
            case 3:
                body += "<td style='width:70%;'>Report Deleted</td>";
                break;
            default:
                body += "<td style='width:70%;'>Unspecified</td>";
        }
        body +=
            "<td style='text-align: right; width:30%;'>" +
            date +
            "</td>" +
            "</tr>";
    });

    $("#allLogs").append(head + body + "</tbody></table>");
}

function showLatest() {
    let options = { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    let cat = {};
    let group = {};
    let cCtr = {};
    let gCtr = {};
    let ctr = 0;

    //Add Head
    let head =
        "<table id='latestReportsTable' class='display'>" +
        "<thead>" +
        "<tr>" +
        "<th style='width:20%;'>ユーザー名</th>" +
        "<th style='width:10%;'>Group</th>" +
        "<th style='width:30%;'>Category</th>" +
        "<th style='width:40%;'>Date" +

        "</th></tr></thead>";

    //Add body
    let body = '<tbody class="scroll-secondary">';
    loop: reports.forEach(function (report) {
        if (ctr++ < 5) {
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
            
            body +=
                "<tr ondblclick= selectReport(" + report.id + ")>" +
                "<td>" +
                report.username +
                "</td>" +
                "<td>" +
                report.group +
                "</td>" +
                "<td>" +
                report.category +
                "</td>" +
                "<td>" +
                report.created.toDate().toLocaleString("en-US", options) +
                "</td>" +
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

    $("#latestReport").append(head + body + "</tbody></table>");
    $('#card5 > div').append('<div class="card-footer mx-auto py-1"><a href="/table.html"> All Reports</a></div>')
}


async function reportSummary() {

    let cat = {};
    let group = {};
    let cCtr = {};
    let gCtr = {};

    reports.forEach(function (report) {
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


    $("#categoryCount").text(categories[cat["key"]]);
    $("#groupCount").text(group["key"]);
    $("#reportCount").text(reports.length);
    showLatest();
}

function downloadPNG(){
    html2canvas($("#weeklyReports"), {
        onrendered: function(canvas) {         
            var imgData = canvas.toDataURL('image/png').replace("image/png", "image/octet-stream");
            let link  = document.createElement('a');
            link.download = "Weekly Report.png";
            link.href = imgData;
            link.click();
        }
    });
    
}

// ----- Notifications -----

async function showNotif() {
    await getGroupsAndCategories();

    let options = { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };

    let ctr = 0;

    reports.forEach(async function (report) {
        if (report.read === false) {
            notif = true;
            if (ctr === 0) {
                $('#notifItem').html('<div class="px-4 py-0"><hr class="m-2 mb-3"></div>');
            }
            
            ctr += 1;

            if (ctr > 99){
                $('#notifDropdown').html('<i class="material-icons text-danger">notifications_active</i><span id="notif_badge" class="badge badge-pill badge-danger p-1">99+</span>');
            } else {
                $('#notifDropdown').html('<i class="material-icons text-danger">notifications_active</i><span id="notif_badge" class="badge badge-pill badge-danger p-1">' + ctr + '</span>');
            }

            $('#indiv_notifs').append('<div class="toast-body-notif"><p class="p-0 m-0">' + categories[report.category] + '" incident was reported.</p><p class="row text-info p-0 m-0 justify-content-between"> (' + report.created.toDate().toLocaleString("en-US", options) + ')</p></div>');
            //<a class="ml-auto py-0" href="#" onClick= selectReport(' + report.id + ')>more details...</a>
            await selectReport(report.id);
        }
    });
    
    if (ctr === 0) {
        $('#notifDropdown').html('<i class="fa fa-bell fa-fw mr-3 nav_icon"></i>');
        $('#notif-toast').append('<div class="toast-body">No new reports.</div>');
    }
}

var isPaneOpen = false;
async function showNotifs() {
    if (!isPaneOpen) {
        await appendNotifPane();
        $('#notif-toast').toast('show');
        console.log("here");
        await showNotif();
        isPaneOpen = true;
    } else {
        $('#notif-toast').toast('hide');
        await removeNotifPane();
        isPaneOpen = false;
    }
}

async function appendNotifPane() {
    $('#chat-container').after('<div class="notifications-container"><div id="notif-toast" class="toast" role="alert" data-autohide="false" aria-live="assertive" aria-atomic="true"><div id="notif-header" class="toast-header"><img src="./img/flower.png" class="rounded mr-2" alt="..."><strong class="mr-auto">Notifications</strong></div><div id="indiv_notifs"></div></div></div>');
}

async function removeNotifPane() {
    $('.notifications-container').remove()
}

async function selectReport(reportID) {
    reports.forEach(async function (report) {
        if (report.id === reportID) {
            await db.collection("reports").where('id', '==', report.id).get().then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    db.collection("reports").doc(doc.id).update({
                        read: true
                    });
                });
            });
        }
    })
}

async function loadReportDetails(reportSelected) {
    $("#reportTitle").html("<h1>" + reportSelected.username + "<h1><h3> " + reportSelected.created.toDate().toLocaleString("en-PH") + "</h3>");
    $("#sgroup").text("Group: " + reportSelected.group);
    $("#scategory").text("Category: " + reportSelected.category);
    $("#sdateInfo").text("Occurence: " + reportSelected.datInfo);
    $("#sotherDetails").text("Other Details: " + reportSelected.otherDetails);
    $("#spersonInfo").text("Subject: " + reportSelected.personInfo);
    if (reportSelected.attachFile === "") {
        $("#sattachment").html('Link to attachment: No attachment');
    } else {
        $("#sattachment").html('Link to attachment: <a target=_blank href= ' + reportSelected.attachFile + '>Link</a>');
    }
}

//function to hide loader after Content has successfully loaded 
function showPage(divid) {
    console.log("test");
    document.getElementById(divid).style.display = "none";
}

