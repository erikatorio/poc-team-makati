var reportsTable

window.addEventListener("load", async () => {
    isloaded = true;
    await getReports();
    await showTables();
    reportsTable = $('#reportsTable').DataTable({
        paging: false,
        info: false,
        dom: 'Bfrtip',
        scrollY: '40vh',
        buttons: ['csv', 'excel', 'pdf'],
        responsive: true
    });




});

async function showTables() {
    let options = { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    $('#showCategoriesTable div').html("");

    let cat = {};
    let group = {};
    let cCtr = {};
    let gCtr = {};
    let ctr = 0;

    //Add Head
    let head =
        "<table id='reportsTable' class='display'>" +
        "<thead class='thead-inverse bg-custom text-custom'>" +
        "<tr>" +
        "<th style='width:20%;'>User</th>" +
        "<th style='width:20%;'>Group</th>" +
        "<th style='width:20%;'>Category</th>" +
        "<th style='width:40%;'>Date" +
        "<th style='width:40%;'>Status" + 
        "</th></tr></thead>";

    //Add body
    let body = '<tbody class="scroll-secondary">';
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

        let date = new Date(report.created["seconds"] * 1000);
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
            "<td>" +
            report.status +
            "</td>" +
            "</tr>";

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