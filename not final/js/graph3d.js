
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

// Called when the Visualization API is loaded.
async function drawVisualization(data) {
    // specify options
    maxZvalue = Math.ceil((maxZvalue + 1) / 10) * 10
    let xL = "";
    let yL = "";
    let strlen = findLongestString();
    if (strlen < 7) {
      xL = "カテゴリー";
      yL = "グループ";
    }
    var options = {
      height: "100%",
      width: "100%",
      style: "bar-color",
      showPerspective: true,
      showGrid: false,
      showShadow: true,
      axisFontType: "helvetica",
      axisFontSize: 26,
      xLabel: xL, //Categories
      yLabel: yL, //Groups
      zLabel: "Count", //Number
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
          "Department: <b>" +
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
    var container = document.getElementById("graph3d");
    graph = new vis.Graph3d(container, data, options);
  
    graph.setCameraPosition({ horizontal: 0, vertical: 0.5, distance: 1.5 }); // restore camera position
}