function getData(x, y) {
  let count = 0;
  for (let i = 0; i < reports.length; i++) {
    if (reports[i].category == categories[x] && reports[i].group == y + 1)
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

function generateColors(sortBy) {
  colors = [];
  let sortLength = sortBy == 1 ? categories.length : groups.length;

  for (let i = 0; i < sortLength; i++) {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    stringColor = "rgba(" + r + "," + g + "," + b;
    colors[i] = stringColor + ",1)";
    pieColors[i] = stringColor + ",0.4)";
  }
}

function findLongestString() {
  let longest = categories.reduce(function (a, b) { return a.length > b.length ? a : b; });
  return longest.length;
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
    showGrid: true,
    showShadow: true,
    animationPreload: true,
    axisFontType: "arial",
    axisFontSize: 26,
    xLabel: xL, //Categories
    yLabel: yL, //Groups
    zLabel: "Number", //Number
    xBarWidth: 0.5,
    yBarWidth: 0.5,
    rotateAxisLabels: true,
    xCenter: "50%",
    yCenter: "40%",
    xStep: 1,
    yStep: 1,
    zMin: 0,
    zMax: maxZvalue,

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

    keepAspectRatio: true
  };

  // create our graph
  var container = document.getElementById("mygraph");
  graph = new vis.Graph3d(container, data, options);

  graph.setCameraPosition({ horizontal: 0, vertical: 0.5, distance: 1.5 }); // restore camera position
}
