let ctx = [];
let barG = [];
let categoryLength = 0;
let groupLength = 0;
let maxZvalue = 0;
let data = null;

window.addEventListener("load", async () => {
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
    });

    isloaded = true;
    await getGroupsAndCategories();
    categoryLength = categories.length;
    groupLength = groups.length;
    initSearchValue();
    initArray();
    byCategory();
    byGroup();
    findMax();
    generateColors(1);

    renderGraphs();

    $('#category').change(function () {
        $('#next').show();
        $('#search').show();
        $('#prev').show();
        generateColors(1);
        search = 1;
        document.getElementById("search").value = search.toString();
        buttonEnabler(search);
        $('#searchBoxLabel').text("Search by Category: ");
        
        renderGraphs();
    });
  
    $('#group').change(function () {
        $('#next').show();
        $('#search').show();
        $('#prev').show();
        generateColors(2);
        search = 1;
        document.getElementById("search").value = search.toString();
        buttonEnabler(search);
        $('#searchBoxLabel').text("Search by Group: ");
        
        renderGraphs();
    });

    $('#3dgraph').change(function () {
        $('#next').hide();
        $('#search').hide();
        $('#prev').hide();
        loadData(1).then(function () {
            drawVisualization(data);
        });
    }); 
});

function graphDestroy(graphD){
    if (graphD != null) {
        graphD.destroy();
    }
}

function renderGraphs(){
    let sortBy = document.getElementById('category').checked ? 1 : 2;
    let len = sortBy == 1 ? categoryLength : groupLength;
    let body = '';

    $('#graphCollection').html("");

    for (let i = 0 ; i < 4 ; i++){
        body += "<div class='col-6'><canvas id='graph"+ i + "'></canvas></div>";
    }

    $("#graphCollection").append(body);
    
    for (let i = 0 ; i < 4 ; i++){
        ctx[i] = document.getElementById('graph' + i).getContext('2d');
        graphDestroy(barG[i]);
        let index = search * 4 - (3-i);
        if(index <= len){
            barG[i] = new Chart(ctx[i], drawVisualization2d(index, sortBy));
        }
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
                duration: 500,
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

function findLongestString() {
    let longest = categories.reduce(function (a, b) { return a.length > b.length ? a : b; });
    return longest.length;
}

function getData(x, y) {
    let count = 0;
    for (let i = 0; i < reports.length; i++) {
      if (reports[i].category == categories[x] && (reports[i].group == y + 1 || reports[i].group == groups[y]))
        count += 1;
    }
    return count;
}

async function loadData(colorBy) {
    var steps = categories.length;
    var axisMax = steps;
    var yAxisMax = groups.length;
    var axisStep = axisMax / steps;
    var z = 0;
    maxZvalue = 0;
  
    dataArray = [];
    for (let i = 0; i < axisMax; i += axisStep) {
      for (let j = 0; j < yAxisMax; j += axisStep) {
        z = getData(i, j);
  
        maxZvalue = z > maxZvalue ? z : maxZvalue;
  
        color = colorBy == 1 ? colors[i] : colors[j];
        dataArray.push({
          x: i,
          y: j,
          z: z,
          style: {
            fill: color,
            stroke: "#999"
          }
        });
      }
    }
  
    // Create and populate a data table.
    data = new vis.DataSet();
  
    for (let i = 0; i < dataArray.length; i++) {
      data.add(dataArray[i]);
    }
  
    return dataArray;
}

async function drawVisualization(data) {
    $('#graphCollection').html("");
    let body = "<div class='card-body h-100 w-80 py-0'><div id='graph3d' class='container px-0 h-100'><div id='mygraph' style='height: 60vh'></div></div></div>";
    $("#graphCollection").append(body);
    // specify options
    maxZvalue = Math.ceil((maxZvalue + 1) / 10) * 10
    let xL = "";
    let yL = "";
    let strlen = findLongestString();
    if (strlen < 7) {
      xL = "Category";
      yL = "Group";
    }
    var options = {
      height: "100%",
      width: "100%",
      style: "bar-color",
      showPerspective: true,
      showGrid: true,
      showShadow: true,
      axisFontType: "arial",
      axisFontSize: 26,
      xLabel: xL, //Categories
      yLabel: yL, //Groups
      zLabel: "Number", //Number
      xBarWidth: 0.78,
      yBarWidth: 0.78,
      rotateAxisLabels: true,
      xCenter: "50%",
      yCenter: "40%",
      xStep: 1,
      yStep: 1,
      zMin: 0,
      zMax: maxZvalue,
      keepAspectRatio: true,
  
      tooltip: function (point) {
        // parameter point contains properties x, y, z
        return (
          "Category: <b>" +
          categories[point.x] +
          "</b> " +
          "Group: <b>" +
          groups[point.y] +
          "</b> " +
          "Number: <b>" +
          point.z +
          "</b>"
        );
      },
  
      xValueLabel: function (value) {
        if (value % 1 == 0) {
          return "  " + categories[value];
        }
        return "";
      },
  
      yValueLabel: function (value) {
        if (value % 1 == 0) {
          return "  " + groups[value];
        }
        return "";
      },
  
      zValueLabel: function (value) {
        return value;
      },
    };
  
    // create our graph
    var container = document.getElementById("mygraph");
    graph = new vis.Graph3d(container, data, options);
  
    graph.setCameraPosition({ horizontal: -0.5, vertical: 0.5, distance: 2.3 }); // restore camera position
}

function printGraphs(value) {
    let docText = '';
    if(document.getElementById('category').checked){
        docText = 'Category Reports';
    } else if(document.getElementById('group').checked){
        docText = 'Group Reports';
    } else {
        docText = '3D Graph';
    }

    switch(value){
        case 0:
            html2canvas($("#graphCollection"), {
                onrendered: function(canvas) {         
                    var imgData = canvas.toDataURL(
                        'image/png');              
                    var doc = new jsPDF('l', 'mm', 'letter');
                    doc.text(docText, 140, 25, null, null, "center");
                    doc.addImage(imgData, 'PNG', 10, 40);
                    doc.save(docText);
                }
            });
            break;
        case 1:
            html2canvas($("#graphCollection"), {
                onrendered: function(canvas) {         
                    var imgData = canvas.toDataURL('image/jpg').replace("image/jpg", "image/octet-stream");
                    let link  = document.createElement('a');
                    link.download = "Reports.jpg";
                    link.href = imgData;
                    link.click();
                }
            });
            break;
        case 2:
            html2canvas($("#graphCollection"), {
                onrendered: function(canvas) {         
                    var imgData = canvas.toDataURL('image/png').replace("image/png", "image/octet-stream");
                    let link  = document.createElement('a');
                    link.download = "Reports.png";
                    link.href = imgData;
                    link.click();
                }
            });
            break;
    }
}

function buttonEnabler(value){
    let sortBy = document.getElementById('category').checked ? 1 : 2;
    let len = sortBy == 1 ? Math.ceil(categoryLength/4) : Math.ceil(groupLength/4);

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
    
    renderGraphs();
}

function nextButton(){
    search += 1;
    buttonEnabler(search);

    document.getElementById("search").value = search.toString();
    
    renderGraphs();
}