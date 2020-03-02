
window.addEventListener("load", async () => {
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
    });

    isloaded = true;
    await getGroupsAndCategories();
    initSearchValue();
    initArray();
    byCategory();
    byGroup();
    findMax();
    generateColors(1);

    drawVisualization2d(search, 1);

    $('#category').change(function () {
        generateColors(1);
        search = 1;
        document.getElementById("search").value = search.toString();
        buttonEnabler(search);
        $('#searchBoxLabel').text("Search by Category: ");
        drawVisualization2d(search, 1);
    });
  
    $('#group').change(function () {
        generateColors(2);
        search = 1;
        document.getElementById("search").value = search.toString();
        buttonEnabler(search);
        $('#searchBoxLabel').text("Search by Group: ");
        drawVisualization2d(search, 2);
    });  
});

async function drawVisualization2d(search, sortBy) {
    let displayLabel = [];
    let displayData = [];
    let arrayLabel = [];
    let displayMax = 0;
    let index = search - 1;

    let stringLabel = sortBy == 1 ? ' カテゴリー ' : ' グループ ';
    let labelStr = sortBy == 1 ? 'グループ' : 'カテゴリー';

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
                label: arrayLabel[index] + stringLabel,
                data: displayData,
                backgroundColor: pieColors,
                borderColor: colors,
                borderWidth: 1,
            }]
        },
        options: {
            maintainAspectRatio: false,
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
                        labelString: '数',
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
            
            document.getElementById("search").value = index.toString();
            search = index;
            buttonEnabler(index);
            drawVisualization2d(index, sortBy);
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
    
    if(event.key === 'Enter' || event.type === 'click'){
        findString(searchString.toLowerCase());
    }
}