


//p_data is the papers data 
var p_data
var group_info=[]
var rank_info=[]

$.getJSON("./data_process/data/super_data_4.json", function(data_in) {

    p_data=data_in['papers'];

    rank_info.push(data_in['bayes_ranks']);
    rank_info.push(data_in['c_ranks']);

    group_info.push(data_in['ppm_group'])
    group_info.push(data_in['louvain_group'])

    start_graph();

});












//make sure graph build after data load in
function start_graph(){





  // set up search engine
  var options = {
    keys: ['title'],
    id:'index'
  }
  var engine = new Fuse(p_data, options);
  var result
  function chnageResult(get){
     result = engine.search(get);
    var i;
    for(i=0; i<10; i++){
      if(result[i]!=undefined)
        document.getElementById("search_result_"+String(i)).innerHTML=p_data[result[i]]['title'];
      else
        document.getElementById("search_result_"+String(i)).innerHTML='';
    }
  }
  $("#search").keypress(function(e) {
      var get = document.getElementById("search_text").value;
      if(event.keyCode == 13){
        chnageResult(get)
        document.getElementById("search_text").value='';
        return false;
      }
      else if(get.length > 1 && get.length < 16){
        chnageResult(get) 
      }

  });
  $("#search_result_0").click(function(e) {SetInfo(result[0]);});
  $("#search_result_1").click(function(e) {SetInfo(result[1]);});
  $("#search_result_2").click(function(e) {SetInfo(result[2]);});
  $("#search_result_3").click(function(e) {SetInfo(result[3]);});
  $("#search_result_4").click(function(e) {SetInfo(result[4]);});
  $("#search_result_5").click(function(e) {SetInfo(result[5]);});
  $("#search_result_6").click(function(e) {SetInfo(result[6]);});
  $("#search_result_7").click(function(e) {SetInfo(result[7]);});
  $("#search_result_8").click(function(e) {SetInfo(result[8]);});
  $("#search_result_9").click(function(e) {SetInfo(result[9]);});






  function list_to_string(list){
    var output=list[0];
    var i;
    for(i=1;i<list.length;i++){
      output += ", ";
      output += list[i];
    }
    return output;
  }
  function groups_to_string(groups, ports){
    //console.log(groups);
    var output = "";
    var group = group_info[cluster_curr_opt];
    for(i in groups){
      var tup=groups[i];
      if(tup[1]!=0){
        output+=(group[tup[0]]['name']+" ("+tup[1]+")<br/>");
        if(ports!=undefined){
          var port = ports[tup[0]]
          for (j in port){
            output+=("(*)&nbsp "+p_data[port[j]]['title']+"<br/>");
          }
          if(i < (groups.length-1))
            output+="<br/>";
        }
      }
    }
    return output;
  }

  $("#group_detail").click(function(e) {
    document.getElementById("group_panel").style.display = "block";
    var gid = p_data[curr_select][cluster_opt[cluster_curr_opt]];
    var group = group_info[cluster_curr_opt][gid];
    document.getElementById("group_index").innerHTML = gid + "&nbsp (size: "+ group['size']+")";
    document.getElementById("group_name").innerHTML = group['name'];
    document.getElementById("group_topics").innerHTML = list_to_string(group['top_phrase'].slice(0,15));
    document.getElementById("import_group").innerHTML = groups_to_string(group['import_list'].slice(0,3),group['importer'])
    document.getElementById("export_group").innerHTML = groups_to_string(group['export_list'].slice(0,3),group['exporter'])
    document.getElementById("exchange_group").innerHTML = groups_to_string(group['exchange_list'].slice(0,3),undefined)
  });
  $("#group_window_close").click(function(e) {
    document.getElementById("group_panel").style.display = "none";
  });







  //cluster option control
  var backbone_name=["PageRank", "Centrality"]
  var cluster_name=["Proprogation Mergence", "Louvain Method"]
  var cluster_opt=["ppm_index", "louvain_index"]
  var cluster_curr_opt=0;
  var backbone_curr_opt=0;
  $("#cluster_option").click(function(e) {
      cluster_curr_opt+=1;
      if(cluster_curr_opt==cluster_opt.length){
        cluster_curr_opt=0;
      }
      reset_graph();
      SetInfo(curr_select);
      refresh();
      document.getElementById("cluster_option").innerHTML=cluster_name[cluster_curr_opt];
    });
  $("#backbone_option").click(function(e) {
      backbone_curr_opt+=1;
      if(backbone_curr_opt==backbone_name.length){
        backbone_curr_opt=0;
      }
      reset_graph();
      rank_high_light();
      refresh();
      document.getElementById("backbone_option").innerHTML=backbone_name[backbone_curr_opt];
    });
  $("#change_color").click(function(e) {
    shuffle(colors_collection)
    refresh();
  });


  $("#development_info").click(function(e) {
    document.getElementById("log_panel").style.display = "block";
  });
  $("#log_window_close").click(function(e) {
    document.getElementById("log_panel").style.display = "none";
  });









  function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }
  //default color
  var colors={"orange":"#FFA500", "white":"#ffffff", "black":"#000000", "base":"#2C3539", "purple":"#800080"};
  var colors_collection=["#F0A3FF","#0075DC","#993F00","#4C005C","#005C31","#2BCE48","#FFCC99","#808080","#94FFB5",
  "#8F7C00","#9DCC00","#C20088","#003380","#FFA405","#FFA8BB","#426600","#FF0010","#5EF1F2","#00998F","#E0FF66","#740AFF",
  "#990000"," #FFFF80","#FFFF00","#FF5005"]
  shuffle(colors_collection)







  var income_edges=[]
  // Read Data and build graph
  var network = {nodes: [], links: []},
      width = window.innerWidth,
      height = window.innerHeight,
      numNodes = p_data.length,
      i;
  for (i = 0; i < numNodes; i++) {
    network.nodes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 3+p_data[i]['bayes_rank']*1.1,
      color:colors["base"],
      mode:0
    });
    income_edges.push([])
  }
  for(i=0; i<numNodes;i++){
      var citations = p_data[i]['citations'];
      var from = i;
      for(j in citations){
        var to = parseInt(citations[j]);
        var edge={
          from: from,
          to: to,
          source: network.nodes[from],
          target: network.nodes[to],
          color:colors["base"]
        }
        income_edges[to].push(edge);
        network.links.push(edge);
      }
  }
  // Create a grapher instance (width, height, options)
  var grapher = new Grapher({
    data: network,
  });
  // D3 Setup
  // Variable to keep track of the node we're dragging and the current offset
  var dragging = null,
      offset = null;
  // onTick gets called on each tick of D3's force
  function onTick() {
    if (dragging && offset) {
      // update the node's position here so it's sticky
      dragging.node.x = offset.x;
      dragging.node.y = offset.y;
    }
    grapher.update(); // update the grapher
  };
  // Setup D3's force layout
  var force = d3.layout.force()
      .nodes(network.nodes)
      .links(network.links)
      .size([width, height])
      .on('tick', onTick)
      .charge(-550)
      .gravity(0.3)
      .linkDistance(20)
      .start();








  //click event highlight
  var curr_select = 0;
  function rank_high_light(){
    var nodes = rank_info[backbone_curr_opt].slice(0,50);
    for(i in nodes)
      network.nodes[nodes[i]].mode=4;
  }
  function group_high_light(gid, mode){
    if(gid < 0)
      return;
    var nodes = group_info[cluster_curr_opt][gid]['nodes'];
    //nodes[i] get index 
    for (i in nodes)
      network.nodes[nodes[i]].mode = mode;
  }
  function select_high_light(id){
    reset_graph();
    graph_high_light();
    group_high_light(p_data[id][cluster_opt[cluster_curr_opt]], 2);
    network.nodes[id].mode = 3;
    refresh()
    curr_select = id; 
  }
  function graph_high_light(){
    for(i in network.nodes){
      network.nodes[i].mode=1
    }
  }
  function reset_graph(){
    for(i in network.nodes)
      network.nodes[i].mode=0
  }
  function color_edges(edges, col){
    for(e in edges)
      edges[e].color = col;
  }
  function group_color(gid){
    return gid % (colors_collection.length);
  }
  function refresh(){
    // 0 unactive
    // 1 group_color
    // 2 group_color with edge highlight
    // 3 select_color
    // 4 rank_color

    //cluster_opt[cluster_curr_opt] return the current group color scheme
    var curr_group = cluster_opt[cluster_curr_opt];
    for(i in network.nodes){
      var node = network.nodes[i]
      var mode = node.mode;
      var edges = income_edges[i];

      if(mode==0){
        node.color = colors["base"];
        color_edges(edges,colors["base"]);
      }
      else if(mode==1){
        var gid = p_data[i][curr_group];
        if(gid==-1)
          node.color = colors["base"];
        else
          node.color =colors_collection[group_color(gid)];
        color_edges(edges,colors["base"]);
      }
      else if(mode==2){
        var gid = p_data[i][curr_group];
        if(gid==-1)
          node.color = colors["base"];
        else
          node.color =colors_collection[group_color(gid)];
        color_edges(edges,node.color);
      }
      else if(mode==3){
        node.color = colors["white"];
        color_edges(edges,colors["white"]);
      }
      else if(mode==4){
        node.color = colors["orange"];
        color_edges(edges,colors["base"]);
      }
    }
    grapher.update();
    return;
  }




  function SetInfo(id){

      if(id == -1)
        return;

      var gid = p_data[id][cluster_opt[cluster_curr_opt]];

      document.getElementById("index_holder").innerHTML=id;
      document.getElementById("title_holder").innerHTML=p_data[id]['title'];
      document.getElementById("authors_holder").innerHTML=list_to_string(p_data[id]['authors']);
      document.getElementById("url_holder").innerHTML='[read this paper]';
      document.getElementById("url_holder").href=p_data[id]['url'];
      document.getElementById("group_holder").innerHTML=gid;
      //fix it for louvain group

      if(gid!=-1){
        var phrases=group_info[cluster_curr_opt][gid]['top_phrase'].slice(0,7);
        document.getElementById("phrase_holder").innerHTML = list_to_string(phrases);
      }

      select_high_light(id);
  }
  






  //rank_highLight(60)
  SetInfo(0);
  graph_high_light();










  // two helper function
  // We create a function that determines whether a click event falls on a node.
  var getNodeIdAt = function (point) {
    var node = -1,
        x = point.x, y = point.y;
    network.nodes.every(function (n, i) {
      var inX = x <= n.x + n.r && x >= n.x - n.r,
          inY = y <= n.y + n.r && y >= n.y - n.r,
          found = inX && inY;
      if (found) node = i;
      return !found;
    });
    return node;
  };
  // Helper function for offsets.
  function getOffset (e) {
    if (e.offsetX) return {x: e.offsetX, y: e.offsetY};
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left,
        y = e.clientY - rect.top;
    return {x: x, y: y};
  };
  //control function and event handler 
  function onMouseDown (e) {
    // Set the starting point
    startPoint = getOffset(e);
    var point = grapher.getDataPosition(startPoint);
    var nodeId = getNodeIdAt(point);

    SetInfo(nodeId)

    // Start listening to other mouse events.
    grapher.on('mousemove', onMouseMove);
    grapher.on('mouseup', onMouseUp);
  };
  function onMouseMove (e) {
    // Adjust the translate based on the change in mouse location.
    if (startPoint) {
      var translate = grapher.translate(),
          offset = getOffset(e);

      translate[0] += (offset.x - startPoint.x);
      translate[1] += (offset.y - startPoint.y);

      startPoint = offset;
      grapher.translate(translate);
    }
  };
  function onMouseUp (e) {
    // Stop listening to mouse events, and cleanup startPoint
    startPoint = undefined;
    grapher.off('mousemove');
    grapher.off('mouseup');
  };
  grapher.on('mousedown', onMouseDown);
  // Setup transforms with the mousewheel event
  grapher.on('wheel', function (e) {

    var transform = grapher.transform(),
        delta = e.deltaY / 800,
        fromCenterX = width/2;
        fromCenterY = height/2;

    transform.scale = transform.scale + delta;
    transform.translate = [
      transform.translate[0] + fromCenterX * delta,
      transform.translate[1] + fromCenterY * delta,
    ];

    if(transform.scale < 0.4){ return; }
    // Set the new transform
    grapher.transform(transform);
    // Render the graph
    grapher.render();
  });





  // Append the grapher's view onto the page
  document.body.appendChild(grapher.canvas);
  // Render the graph using play. This will call render in a requestAnimationFrame loop.
  grapher.play();

  


}
