let ctx1;
let ctx2;
let ctx3;
let ctx4;

window.addEventListener("load", async () => {
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
    });

    ctx1 = document.getElementById('graph1').getContext('2d');
    ctx2 = document.getElementById('graph2').getContext('2d');
    ctx3 = document.getElementById('graph3').getContext('2d');
    ctx4 = document.getElementById('graph4').getContext('2d');

    isloaded = true;
    await getGroupsAndCategories();
    initSearchValue();
    initArray();
    byCategory();
    byGroup();
    findMax();
    generateColors(1);
    
    graphDestroy(barGraph);
    graphDestroy(barGraph2);
    graphDestroy(barGraph3);
    graphDestroy(barGraph4);

    barGraph = new Chart(ctx1, drawVisualization2d(search*4 - 3, 1));
    barGraph2 = new Chart(ctx2, drawVisualization2d(search*4 - 2, 1));
    barGraph3 = new Chart(ctx3, drawVisualization2d(search *4 -1, 1));
    barGraph4 = new Chart(ctx4, drawVisualization2d(search*4, 1));

    $('#category').change(function () {
        generateColors(1);
        search = 1;
        document.getElementById("search").value = search.toString();
        buttonEnabler(search);
        $('#searchBoxLabel').text("Search by Category: ");
        
        graphDestroy(barGraph);
        graphDestroy(barGraph2);
        graphDestroy(barGraph3);
        graphDestroy(barGraph4);

        barGraph = new Chart(ctx1, drawVisualization2d(search*4 - 3, 1));
        barGraph2 = new Chart(ctx2, drawVisualization2d(search*4 - 2, 1));
        barGraph3 = new Chart(ctx3, drawVisualization2d(search *4 -1, 1));
        barGraph4 = new Chart(ctx4, drawVisualization2d(search*4, 1));
    });
  
    $('#group').change(function () {
        generateColors(2);
        search = 1;
        document.getElementById("search").value = search.toString();
        buttonEnabler(search);
        $('#searchBoxLabel').text("Search by Group: ");
        
        graphDestroy(barGraph);
        graphDestroy(barGraph2);
        graphDestroy(barGraph3);
        graphDestroy(barGraph4);

        barGraph = new Chart(ctx1, drawVisualization2d(search*4 - 3, 2));
        barGraph2 = new Chart(ctx2, drawVisualization2d(search*4 - 2, 2));
        barGraph3 = new Chart(ctx3, drawVisualization2d(search *4 -1, 2));
        barGraph4 = new Chart(ctx4, drawVisualization2d(search*4, 2));
    });  
});

function graphDestroy(graphD){
    if (graphD != null) {
        graphD.destroy();
    }
}

function drawVisualization2d(search, sortBy) {
    let displayLabel = [];
    let displayData = [];
    let arrayLabel = [];
    let displayMax = 0;
    let index = search - 1;

    let stringLabel = sortBy == 1 ? ' Category ' : ' Group ';
    let labelStr = sortBy == 1 ? 'Group' : 'Category';

    arrayLabel = sortBy == 1 ? categories : groups;
    displayLabel = sortBy == 1 ? groups : categories;
    displayData = sortBy == 1 ? byCategoryCount[index] : byGroupCount[index];
    displayMax = sortBy == 1 ? maxCategoryCount : maxGroupCount;
    displayMax = Math.ceil((displayMax + 1) / 10) * 10;
    if(index >= arrayLabel.length)
        return
    let graphData = {
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
                duration: 1,
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
    }

    return graphData;
}

function printGraphs() {
    let docText = document.getElementById('category').checked ? 'Category ' : 'Group ';
    html2canvas($("#graphCollection"), {
        onrendered: function(canvas) {         
            var imgData = canvas.toDataURL(
                'image/png');              
            var doc = new jsPDF('l', 'mm', 'legal');
            doc.text(docText + "Reports", 180, 15, null, null, "center");
            doc.addImage(imgData, 'PNG', 40, 40);
            doc.save(docText + "Graphs");
        }
    });
}

// function findString(value){
//     let sortBy = document.getElementById('category').checked ? 1 : 2;
//     let displayData = [];
    
//     displayData = sortBy == 1 ? categories.slice() : groups.slice();
    
//     for(i = 0; i < displayData.length ;i++){
//         displayData[i] = displayData[i].toLowerCase();
//     }

//     displayData.forEach(function(a){

//         if (typeof(a) === 'string' && a.indexOf(value)>-1) {
//             let index = displayData.indexOf(value) + 1;
            
//             document.getElementById("search").value = index.toString();
//             search = index;
//             buttonEnabler(index);
//             drawVisualization2d(ctx1, index, sortBy);
//         }
//     });
// }

// function searchBoxField(){
//     let sortBy = document.getElementById('category').checked ? 1 : 2;
//     let displayData = [];
//     let searchString = document.getElementById('searchBox').value;
    
//     displayData = sortBy == 1 ? categories : groups;

//     $('#searchBox').autocomplete({
//         source: displayData
//     });
    
//     if(event.key === 'Enter' || event.type === 'click'){
//         findString(searchString.toLowerCase());
//     }
// }

function buttonEnabler(value){
    let sortBy = document.getElementById('category').checked ? 1 : 2;
    let len = sortBy == 1 ? Math.ceil(categories.length/4) : Math.ceil(groups.length/4);

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
    
    graphDestroy(barGraph);
    graphDestroy(barGraph2);
    graphDestroy(barGraph3);
    graphDestroy(barGraph4);

    barGraph = new Chart(ctx1, drawVisualization2d(search*4 - 3, sortBy));
    barGraph2 = new Chart(ctx2, drawVisualization2d(search*4 - 2, sortBy));
    barGraph3 = new Chart(ctx3, drawVisualization2d(search *4 -1,sortBy));
    barGraph4 = new Chart(ctx4, drawVisualization2d(search*4, sortBy));
}

function nextButton(){
    search += 1;
    buttonEnabler(search);

    document.getElementById("search").value = search.toString();

    let sortBy = document.getElementById('category').checked ? 1 : 2;
    
    graphDestroy(barGraph);
    graphDestroy(barGraph2);
    graphDestroy(barGraph3);
    graphDestroy(barGraph4);

    barGraph = new Chart(ctx1, drawVisualization2d(search*4 - 3, sortBy));
    barGraph2 = new Chart(ctx2, drawVisualization2d(search*4 - 2, sortBy));
    barGraph3 = new Chart(ctx3, drawVisualization2d(search *4 -1,sortBy));
    barGraph4 = new Chart(ctx4, drawVisualization2d(search*4, sortBy));
}