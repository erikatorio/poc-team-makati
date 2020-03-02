// import { decodeBase64 } from "bcryptjs";

// var latestReportsTable

window.addEventListener("load", async () => {
    isloaded = true;
    await getReports();
    await reportSummary();
    getWeeklyReport();
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
        "<th style='width:20%;'>User</th>" +
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


    $("#categoryCount").text(cat["key"]);
    $("#groupCount").text(group["key"]);
    $("#reportCount").text(reports.length);
    showLatest()
}

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

Date.prototype.subtractDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() - days);
    return date;
}

function getDates(startDate, stopDate) {
    
    let options = { month: '2-digit', day: '2-digit', year: 'numeric'};
    var dateArray = new Array();
    var currentDate = startDate;
    while (currentDate <= stopDate) {
        dateArray.push((new Date (currentDate)).toLocaleString("en-US", options));
        currentDate = currentDate.addDays(1);
    }
    return dateArray;
}

function generateColor() {

    let r = Math.floor(Math.random() * 255);
    let g = Math.floor(Math.random() * 255);
    let b = Math.floor(Math.random() * 255);
    let color = "rgba(" + r + "," + g + "," + b + ", 1)";

    return color;
}

let countReportsByGroup = [];
let countReportsByCategories = [];

function initArray() {
    
    for (let i = 0; i < groups.length; i++) {
        countReportsByGroup[i] = [];
    }

    for (let i = 0; i < categories.length; i++) {
        countReportsByCategories[i] = [];
    }

    for (let i = 0; i < groups.length; i++) {
        for (let j = 0; j < 6; j++) {
            countReportsByGroup[i][j] = 0;
        }
    }

    for (let i = 0; i < categories.length; i++) {
        for (let j = 0; j < 6; j++) {
            countReportsByCategories[i][j] = 0;
        }
    }
}

function generateDataSet(){
    let date = new Date();
    let options = { month: '2-digit', day: '2-digit', year: 'numeric'};
    let dates = getDates(date.subtractDays(6), date);
    let dataSet = [];

    for(let i = 0; i < reports.length; i++){
        for(let j = 0; j < groups.length; j++){
            for(let k = 0; k < dates.length; k++){
                let reportDate = reports[i].created.toDate().toLocaleString("en-US", options);
                if (reports[i].group === groups[j] && reportDate === dates[k]){
                    countReportsByGroup[j][k] += 1;
                }
            }
        }
    }

    for(let i = 0; i < groups.length; i++){
        let color = generateColor();
        dataSet.push({
            label: groups[i] + " Group", // Name the series
            data: countReportsByGroup[i], // Specify the data values array
            fill: false,
            borderColor: color, // Add custom color border (Line)
            backgroundColor: color, // Add custom color background (Points and Fill)
            borderWidth: 1.5 // Specify bar border width
        });
    }
    
    return dataSet;
}

function getWeeklyReport(){
    let ctx = document.getElementById("weeklyReports").getContext('2d');
    let dateLabels = [];
    let date = new Date();
    let dataSet = [];
    
    initArray();
    dataSet = generateDataSet();

    dateLabels = getDates(date.subtractDays(6), date);
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dateLabels,
            datasets: dataSet,
        },
        options: {
            responsive: true, // Instruct chart js to respond nicely.
            maintainAspectRatio: false, // Add to prevent default behaviour of full-width/height
            title: {
                display: false,
                text: 'Number of Reports per Day',
                position: 'top',
                fontSize: 16,
                fontStyle: 'bold',
                fontFamily: 'helvetica neue'
            },
            legend: {
                position: 'top',
                labels: {
                    fontSize: 12,
                    fontStyle: 'bold',
                    fontFamily: 'arial',
                    boxWidth: 15
                }
            },
            scales: {
                yAxes: [{
                    display: true,
                    ticks: {
                        beginAtZero: true,
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Number of Reports',
                        fontSize: 14,
                        ticks: {
                            beginAtZero: true,
                        },
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        fontSize: 14,
                        display: true,
                        labelString: 'Day'
                    }
                }]
            }
        }
    });

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