async function drawPie(groupBy) {
    let displayData = [];
    let displayLabel = [];

    if (groupBy == 1) {
        displayData = categoriesCount;
        displayLabel = categories;
    } else {
        displayData = groupsCount;
        displayLabel = groups;
    }
    if (pieChart != null) {
        pieChart.destroy();
    }

    pieChart = new Chart(ctx, {
        type: "doughnut",
        options: {
            maintainAspectRatio: true
        },
        data: {
            labels: displayLabel,
            datasets: [
                {
                    data: displayData,
                    backgroundColor: pieColors,
                    borderColor: colors,
                    borderWidth: 1
                }
            ]
        }
    });
}

async function drawVisualization2d(search, sortBy) {
    let displayLabel = [];
    let displayData = [];
    let arrayLabel = [];
    let displayMax = 0;
    let index = search - 1;

    let labelStr = sortBy == 1 ? 'Department' : 'Incident';

    arrayLabel = sortBy == 1 ? categories : groups;
    displayLabel = sortBy == 1 ? groups : categories;
    displayData = sortBy == 1 ? byCategoryCount[index] : byGroupCount[index];
    displayMax = sortBy == 1 ? maxCategoryCount : maxGroupCount;
    displayMax = Math.ceil((displayMax + 1) / 10) * 10;

    if (barGraph != null) {
        barGraph.destroy();
    }

    barGraph = new Chart(ctx2d, {
        type: 'bar',
        data: {
            labels: displayLabel,
            datasets: [{
                label: arrayLabel[index],
                data: displayData,
                backgroundColor: pieColors,
                borderColor: colors,
                borderWidth: 1,
            }]
        },
        options: {
            maintainAspectRatio: true,
            legend: {
                position: 'top',
                labels: {
                    fontSize: 16,
                    fontStyle: 'bold',
                    fontFamily: 'times',
                    boxWidth: 0
                }
            },
            scales: {
                yAxes: [{
                    display: true,
                    ticks: {
                        beginAtZero: true,
                        max: displayMax
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Number',
                        fontSize: 14,
                        ticks: {
                            beginAtZero: true,
                            max: displayMax
                        },
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        fontSize: 14,
                        display: true,
                        labelString: labelStr
                    }
                }]
            },
            events: false,
            tooltips: {
                enabled: false
            },
            hover: {
                animationDuration: 0
            },
            animation: {
                duration: 700,
                onComplete: function () {
                    var chartInstance = this.chart,
                    ctx = chartInstance.ctx;
                    ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';

                    this.data.datasets.forEach(function (dataset, i) {
                        var meta = chartInstance.controller.getDatasetMeta(i);
                        meta.data.forEach(function (bar, index) {
                            var data = dataset.data[index];                            
                            ctx.fillText(data, bar._model.x, bar._model.y - 5);
                        });
                    });
                }
            }
        }
    });
}

var search = 0;
function initSearchValue() {
    search = parseInt(document.getElementById("search").value);
}

function findString(value){
    let sortBy = document.getElementById('category').checked ? 1 : 2;
    let displayData = [];
    
    displayData = sortBy == 1 ? categories.slice() : groups.slice();
    
    for(i = 0; i < displayData.length ;i++){
        displayData[i] = displayData[i].toLowerCase();
    }

    displayData.forEach(function(a){

        if (typeof(a) === 'string' && a.indexOf(value)>-1) {
            let index = displayData.indexOf(value) + 1;
            
            if (index != 0){
                document.getElementById("search").value = index.toString();
                search = index;
                buttonEnabler(index);
                drawVisualization2d(index, sortBy);
            }
        }
    });
}

function buttonEnabler(value){
    let sortBy = document.getElementById('category').checked ? 1 : 2;
    let len = sortBy == 1 ? categories.length : groups.length;

    if (value == len) {
        $('#next').attr('disabled', true);
        $('#prev').attr('disabled', false);
    } else if (value == 1) {
        $('#prev').attr('disabled', true);
        $('#next').attr('disabled', false);
    } else {
        $('#prev').attr('disabled', false);
        $('#next').attr('disabled', false);
    }
}

function prevButton(){
    search -= 1;
    buttonEnabler(search);

    document.getElementById("search").value = search.toString();
    
    let sortBy = document.getElementById('category').checked ? 1 : 2;
    
    drawVisualization2d(search, sortBy);
}

function nextButton(){
    search += 1;
    buttonEnabler(search);

    document.getElementById("search").value = search.toString();

    let sortBy = document.getElementById('category').checked ? 1 : 2;
    
    drawVisualization2d(search, sortBy);
}

function searchBoxField(){
    let sortBy = document.getElementById('category').checked ? 1 : 2;
    let displayData = [];
    let searchString = document.getElementById('searchBox').value;
    
    displayData = sortBy == 1 ? categories : groups;

    $('#searchBox').autocomplete({
        source: displayData
    });
    
    if((event.key === 'Enter' || event.type === 'click') && searchString != ''){
        findString(searchString.toLowerCase());
    }
}

// -----Trend Graph-----
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

Date.prototype.addMonths = function(months) {
    var date = new Date(this.valueOf());
    date.setMonth(date.getMonth() + months);
    return date;
}

Date.prototype.subtractMonths = function(months) {
    var date = new Date(this.valueOf());
    date.setMonth(date.getMonth() - months);
    return date;
}

Date.prototype.addYears = function(years) {
    var date = new Date(this.valueOf());
    date.setFullYear(date.getFullYear() + years);
    return date;
}

Date.prototype.subtractYears = function(years) {
    var date = new Date(this.valueOf());
    date.setFullYear(date.getFullYear() - years);
    return date;
}

function getDates(startDate, stopDate) {
    
    var dateArray = new Array();
    var currentDate = startDate;
    while (currentDate <= stopDate) {
        dateArray.push((new Date (currentDate)).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }));
        currentDate = currentDate.addDays(1);
    }
    return dateArray;
}

function getMonths(startDate, stopDate) {
    
    var dateArray = new Array();
    var currentDate = startDate;
    while (currentDate <= stopDate) {
        dateArray.push((new Date (currentDate)).toLocaleString('en-US', { month: 'short', year: 'numeric' }));
        currentDate = currentDate.addMonths(1);
    }
    return dateArray;
}

function getYears(startDate, stopDate) {
    
    var dateArray = new Array();
    var currentDate = startDate;
    while (currentDate <= stopDate) {
        dateArray.push((new Date (currentDate)).toLocaleString('en-US', { year: 'numeric' }));
        currentDate = currentDate.addYears(1);
    }
    return dateArray;
}

function generateColor() {

    let r = Math.floor(Math.random() * 255);
    let g = Math.floor(Math.random() * 255);
    let b = Math.floor(Math.random() * 255);
    let color = "rgba(" + r + "," + g + "," + b + ", 2)";

    return color;
}

let countReportsByGroup = [];
let countReportsByCategories = [];

function initTrendArray() {
    
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

function generateDataSet(sortBy){
    let date = new Date();
    let options = {};
    let dates = [];
    let dataSet = [];

    switch(sortBy){
        case 0: 
            dates = getDates(date.subtractDays(6), date);
            options = { day: 'numeric', month: 'short', year: 'numeric' };
            break;
        case 1: 
            dates = getMonths(date.subtractMonths(6), date);
            options = { month: 'short', year: 'numeric' };
            break;
        case 2: 
            dates = getYears(date.subtractYears(5), date);
            options = { year: 'numeric' };
            break;
    }

    //set sortby category or group here

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
            label: groups[i] + " Department", // Name the series
            data: countReportsByGroup[i], // Specify the data values array
            fill: false,
            borderColor: color, // Add custom color border (Line)
            backgroundColor: color, // Add custom color background (Points and Fill)
            borderWidth: 1.5 // Specify bar border width
        });
    }
    
    return dataSet;
}

function drawVisualizationTrend(displayBy){
    let dateLabels = [];
    let date = new Date();
    let dataSet = [];
    let titleText = "";
    let xAxisText = "";
    
    initTrendArray();
    dataSet = generateDataSet(displayBy);

    switch(displayBy){
        case 0: 
            dateLabels = getDates(date.subtractDays(5), date);
            titleText = 'Weekly Trend';
            xAxisText = 'Day';
            break;
        case 1: 
            dateLabels = getMonths(date.subtractMonths(5), date);
            titleText = 'Monthly Trend';
            xAxisText = 'Month';
            break;
        case 2: 
            dateLabels = getYears(date.subtractYears(5), date);
            titleText = 'Yearly Trend';
            xAxisText = 'Year';
            break;
    }

    var myChart = new Chart(ctxTrend, {
        type: 'line',
        data: {
            labels: dateLabels,
            datasets: dataSet,
        },
        options: {
            responsive: true, // Instruct chart js to respond nicely.
            maintainAspectRatio: true, // Add to prevent default behaviour of full-width/height
            title: {
                display: true,
                text: titleText,
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
                        stepSize: 1,
                        max: maxGroupCount + 5,
                        beginAtZero: true,
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Number of Reports',
                        fontSize: 14
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        fontSize: 14,
                        display: true,
                        labelString: xAxisText
                    }
                }]
            }
        }
    });

}

// function downloadPNG(){
//     html2canvas($("#weeklyReports"), {
//         onrendered: function(canvas) {         
//             var imgData = canvas.toDataURL('image/png').replace("image/png", "image/octet-stream");
//             let link  = document.createElement('a');
//             link.download = "Weekly Report.png";
//             link.href = imgData;
//             link.click();
//         }
//     });
// }

function changeDropdownLabel(value){
    switch(value){
        case 0:
            document.getElementById('dropdownMenuLink').innerHTML = "Weekly";
            drawVisualizationTrend(0);
            break;
        case 1:
            document.getElementById('dropdownMenuLink').innerHTML = "Monthly";
            drawVisualizationTrend(1);
            break;
        case 2:
            document.getElementById('dropdownMenuLink').innerHTML = "Yearly";
            drawVisualizationTrend(2);
            break;
    }
}