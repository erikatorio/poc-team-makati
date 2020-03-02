//3D Graph Globals
var data = null;
var graph = null;
var reports = [];
var notif = false;
var categoriesCount = [];
var groupsCount = [];
var myPieChart = null;
var categories = [];
var groups = [];
var colors = [];
var pieColors = [];
var loaded = false;
var csvData = [];
var reportSelected = {};
var maxZvalue = 0;
let temp = [];

function clearValues() {
    categoriesCount = [];
    groupsCount = [];
    categories = [];
    groups = [];
    reports = [];
    groupsCount = [];
    colors = [];
    pieColors = [];
    notif = false;
    return;
}

//Array initializations
function initializeCounts() {
    for (let i = 0; i < categories.length; i++) {
        categoriesCount[i] = 0;
    }

    for (let i = 0; i < groups.length; i++) {
        groupsCount[i] = 0;
    }
}

function generateColors(sortBy) {
    colors = [];
    let sortLength = sortBy == 1 ? categories.length : groups.length;

    for (let i = 0; i < sortLength; i++) {
        var r = Math.floor(Math.random() * 255);
        var g = Math.floor(Math.random() * 255);
        var b = Math.floor(Math.random() * 255);
        stringColor = "rgba(" + r + "," + g + "," + b;
        colors[i] = stringColor + ",0.7)";
        pieColors[i] = stringColor + ",0.4)";
    }
}

function getData(x, y) {
    let count = 0;
    for (let i = 0; i < reports.length; i++) {
      if (reports[i].category == categories[x] && (reports[i].group == y + 1 || reports[i].group == groups[y]))
        count += 1;
    }
    return count;
}

function findLongestString() {
    let longest = categories.reduce(function (a, b) { return a.length > b.length ? a : b; });
    return longest.length;
}
  
async function loadData(colorBy) {
    let xAxis = categories.length;
    let zAxis = groups.length;
    let y = 0;
    
    maxZvalue = 0;
  
    dataArray = [];

    for(let i = 0 ; i < zAxis ; i++){
        let tempData = [];
        for(let j = 0 ; j < xAxis ; j++){
            y = getData(j, i);
            maxZvalue = y > maxZvalue ? y : maxZvalue;
            tempData.push({
                x: j,
                y: y
            });
        }
        dataArray.push({
            stack: i,
            data: tempData
        });
    }

    temp = dataArray;

    return dataArray;
}

async function getGroupsAndCategories() {
    clearValues();
    getReports();
    let locCat = [];
    let locGrps = [];

    await db
        .collection("categories")
        .orderBy("id")
        .get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                locCat.push(doc.data().name);
            });
        });

    await db
        .collection("groups")
        .orderBy("id")
        .get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                locGrps.push(doc.data().name);
            });
        });
    categories = locCat;
    groups = locGrps;
    initializeCounts();

    for (let i = 0; i < reports.length; i++) {
        for (let j = 0; j < categories.length; j++) {
            if (reports[i].category == categories[j]) {
                categoriesCount[j] += 1;
            }
        }

        for (let k = 0; k < groups.length; k++) {
            if (reports[i].group - 1 == k) {
                groupsCount[k] += 1;
            }
        }
    }

    return;
}

window.addEventListener("resize", async () => {
    graph.redraw();
});

window.addEventListener("load", async () => {
    isloaded = true;
    await getGroupsAndCategories();
    generateColors(1);

    loadData(1).then(function () {
        drawVisualization(data);
        drawPie(1);
    });

    $("#reportCount").text(reports.length);

    $('#category').change(function () {
        generateColors(1);
        loadData(1).then(function () {
            drawVisualization(data);
            drawPie(1);
        });
    });

    $('#group').change(function () {
        generateColors(2);
        loadData(2).then(function () {
            drawVisualization(data);
            drawPie(2);
        });
    });


    await db.collection("reports").orderBy("created", "desc").onSnapshot(async function (querySnapshot) {
        if (loaded) {
            querySnapshot.docChanges().forEach(async function (change) {
                if (change.type === "added") {
                    let displayBy = $('input[name="inlineRadioOptions"]:checked').val();
                    await getGroupsAndCategories();
                    generateColors(displayBy);

                    $("#reportCount").text(reports.length);
                    loadData(displayBy).then(function () {
                        notifyReport(querySnapshot.docs[0]);
                        drawVisualization(data);
                        drawPie(displayBy);
                    });
                    return;
                }
            });

        } else {
            loaded = true;
        }
    });

});

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
    if (myPieChart != null) {
        myPieChart.destroy();
    }
    myPieChart = new Chart(ctx, {
        type: "doughnut",
        options: {
            maintainAspectRatio: false
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

// Called when the Visualization API is loaded.
async function drawVisualization(data) {
    // specify options
    maxZvalue = Math.ceil((maxZvalue + 1) / 10) * 10;

    $(function() {
        const rand = function (from, to) {
          return Math.round(from + Math.random() * (to - from));
       };
       const chart = Highcharts.chart('mygraph', {
         chart: {
           type: 'column',
           options3d: {
             enabled: true,
             alpha: 20,
             beta: 30,
             depth: 400, // Set depth
             viewDistance: 5,
             frame: {
               bottom: {
                 size: 1,
                 color: 'rgba(0,0,0,0.05)'
               }
             }
           }
         },
         title: {
           text: ''
         },
         subtitle: {
           text: ''
         },
         yAxis: {
           min: 0,
           tickInterval: 10,
           max: maxZvalue
         },
         xAxis: {
           min: 0, // Set min on xAxis
           max: categories.length - 1,
           tickInterval: 1,
           categories: categories,
           gridLineWidth: 1
         },
         zAxis: {
           min: 0,
           max: groups.length - 1,
           tickInterval: 1,
           categories: groups,
           gridLineWidth: 1,
           labels: {
               align: 'center'
           }
         },
         plotOptions: {
           series: {
             groupZPadding: 10,
             depth: 75,
             groupPadding: 0,
             grouping: false,
           }
         },
          series: temp
        //   [{
        //    stack: 0,
        //    data: [...Array(4)].map((v, i) => ({ x: i, y: rand(0, 10) }))
        //  }, {
        //    stack: 1,
        //    data: [...Array(4)].map((v, i) => ({ x: i, y: rand(0, 10) }))
        //  }, {
        //    stack: 2,
        //    data: [...Array(4)].map((v, i) => ({ x: i, y: rand(0, 10) }))
        //  },{
        //    stack: 3,
        //    data: [...Array(4)].map((v, i) => ({ x: i, y: rand(0, 10) }))
        //  }],
       });
     
     
       // Add mouse events for rotation
       $(chart.container).on('mousedown.hc touchstart.hc', function(eStart) {
         eStart = chart.pointer.normalize(eStart);
     
         var posX = eStart.pageX,
           posY = eStart.pageY,
           alpha = chart.options.chart.options3d.alpha,
           beta = chart.options.chart.options3d.beta,
           newAlpha,
           newBeta,
           sensitivity = 5; // lower is more sensitive
     
         $(document).on({
           'mousemove.hc touchdrag.hc': function(e) {
             // Run beta
             newBeta = beta + (posX - e.pageX) / sensitivity;
             chart.options.chart.options3d.beta = newBeta;
     
             // Run alpha
             newAlpha = alpha + (e.pageY - posY) / sensitivity;
             if(newAlpha < 0){
                newAlpha = 0;
             }
             chart.options.chart.options3d.alpha = newAlpha;
     
             chart.redraw(false);
           },
           'mouseup touchend': function() {
             $(document).off('.hc');
           }
         });
       });
     
     });
}