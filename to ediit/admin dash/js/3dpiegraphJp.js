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
var csvData = [];
var reportSelected = {};
var maxZvalue = 0;

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
        colors[i] = stringColor + ",0.5)";
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
      showGrid: false,
      showShadow: true,
      axisFontType: "arial",
      axisFontSize: 26,
      xLabel: xL, //Categories
      yLabel: yL, //Groups
      zLabel: "数", //Number
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
  
    graph.setCameraPosition({ horizontal: 0, vertical: 0.5, distance: 1.5 }); // restore camera position
}