// import { decodeBase64 } from "bcryptjs";

// var latestReportsTable

window.addEventListener("load", async () => {
    isloaded = true;
    await getReports();
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