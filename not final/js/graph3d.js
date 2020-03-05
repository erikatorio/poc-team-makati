
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
      zLabel: "レポートの数", //Number
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


//print 3d graph
function print3DGraphs(value) {
  let docText = '3D Graph Report';

  switch(value){
      case 0:
          html2canvas($("#graph3d"), {
              onrendered: function(canvas) {         
                  var imgData = canvas.toDataURL(
                      'image/png');              
                  var doc = new jsPDF('l', 'mm', 'letter');
                  doc.text(docText, 140, 25, null, null, "center");
                  doc.addImage(imgData, 'PNG', 10, 40, 260, 150);
                  doc.save(docText);
              }
          });
          break;
      case 1:
          html2canvas($("#graph3d"), {
              onrendered: function(canvas) {         
                  var imgData = canvas.toDataURL('image/jpg').replace("image/jpg", "image/octet-stream");
                  let link  = document.createElement('a');
                  link.download = docText + ".jpg";
                  link.href = imgData;
                  link.click();
              }
          });
          break;
      case 2:
          html2canvas($("#graph3d"), {
              onrendered: function(canvas) {         
                  var imgData = canvas.toDataURL('image/png').replace("image/png", "image/octet-stream");
                  let link  = document.createElement('a');
                  link.download = docText + ".png";
                  link.href = imgData;
                  link.click();
              }
          });
          break;
  }
}