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
    
    loadData(2).then(function () {
        drawVisualization(data);
        drawVisualization2d(search, 2);
        drawPie(2);
        drawVisualizationTrend(0);
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
        console.log("test");
        var tab3d = document.getElementById("3dgraphtab");
        var tab3ddiv = document.getElementById("firstgraph");
        var tabtrend = document.getElementById("trendgraphtab");
        var tabtrenddiv = document.getElementById("trend");
        tab3d.classList.remove("active");
        tab3ddiv.classList.remove("active");
        tabtrend.className += " active";
        tabtrenddiv.className += " active";
        drawVisualizationTrend(0);
    }
});

