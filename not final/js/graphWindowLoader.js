window.addEventListener("resize", async () => {
    graph.redraw();
});

window.addEventListener("load", async () => {
    isloaded = true;
    await getGroupsAndCategories();
    
    initArray();
    initializeCounts();
    initSearchValue();
    generateColors(1);

    getCategoryGroupCounts();
    byGroup();
    byCategory();
    findMax();
    
    loadData(2).then(async function () {
        drawVisualization(data);
        drawVisualization2d(search, 2);
        drawPie(2);
        drawVisualizationTrend(0);
        showPage3D();
    });
    
    $('#category').change(function () {
        generateColors(1);
        search = 1;
        document.getElementById("search").value = search.toString();
        buttonEnabler(search);
        drawVisualization2d(search, 1);
    });
    
    $('#group').change(function () {
        generateColors(2);
        search = 1;
        document.getElementById("search").value = search.toString();
        buttonEnabler(search);
        drawVisualization2d(search, 2);
    });

    $('#incident').change(function () {
        drawPie(1);
    });

    $('#dept').change(function () {
        drawPie(2);
    });

    if(window.location.hash === '#trend'){
        var tabtrend = document.getElementById("trendgraphtab").click();
    }
});

function showPage3D() {
    document.getElementById("loader").style.display = "none";
}

