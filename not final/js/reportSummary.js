// import { decodeBase64 } from "bcryptjs";

// var latestReportsTable

window.addEventListener("load", async () => {
    isloaded = true;
    //await getGroupsAndCategories();
    await showNotif();
    await reportSummary();
    generateColors(1);
    initArray();
    byGroup();
    findMax();

    loadData(1).then(function () {
        drawVisualization(data);
        drawVisualizationTrend(0);
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

});

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
    // let options = { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };

    let ctr = 0;

    reports.forEach(function (report) {
        if (report.read === false) {
            notif = true;
            if (ctr === 0) {
                $('#notifItem').html('<div class="px-4 py-0"><hr class="m-2 mb-3"></div>');
            }
            ctr += 1;
            $('#notifDropdown').html('<i class="material-icons text-danger">notifications_active</i><span class="badge badge-pill badge-danger p-1">' + ctr + '</span>')
            // $('#notifItem').append('<div class="dropdown-item py-0"><div><p class="p-0 text-danger m-0">New category "' + report.category + '" incident was reported.</p><p class="row text-danger p-0 m-0 justify-content-between"> (' + report.created.toDate().toLocaleString("en-US", options) + ')<a class="ml-auto py-0" href="#" onClick= selectReport(' + report.id + ')>more details...</a></p></div><hr class="mt-1"></div>')
        }
    });
    if (ctr === 0) {
      $('#notifDropdown').html('<i class="fas fa-bell"></i>');
      $('#notifItem').html(
        '<div class="dropdown-item py-0"><hr><div class="row"><p class="col-12 m-0 text-success p-0">All reports are read.</p></div><hr></div>'
      );
    }

    console.log(ctr);

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
            
            // loadReportDetails(report).then(() => {
            //     $('#reportDetails').modal('show');
            // }).then(()=>{
            //     showNotif()
            // });
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