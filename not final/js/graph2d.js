async function drawPie(groupBy) {
    let displayData = [];
    let displayLabel = [];

    if (groupBy == 1) {
        displayData = groupsCount;
        displayLabel = groups;
    } else {
        displayData = categoriesCount;
        displayLabel = categories;
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

    let labelStr = sortBy == 1 ? 'Incident' : 'Department';

    arrayLabel = sortBy == 1 ? groups : categories;
    displayLabel = sortBy == 1 ? categories : groups;
    displayData = sortBy == 1 ? byGroupCount[index] : byCategoryCount[index];
    displayMax = sortBy == 1 ? maxGroupCount : maxCategoryCount;
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