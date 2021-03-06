let rela;
let rela_r;
let rela_all;
let city;

let lines;
let connect_lines = [];

let points_click = [];
let points;
let disp;
let n;
let k;
let tempera;
let iter;
let transition_time = 200;

let factorK;

let xScale;
let yScale;

// 定义宽高
let margin = {top: 100, right: 150, bottom: 150, left: 150};
let width = window.innerWidth - margin.left - margin.right ; // Use the window's width 
let height = window.innerHeight - margin.top - margin.bottom ;

// 把svg添加到页面并使用
let svg = d3.select("body").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.selection.prototype.bringElementAsTopLayer = function() {
    return this.each(function(){
    this.parentNode.appendChild(this);
    });
};

d3.selection.prototype.pushElementAsBackLayer = function() { 
    return this.each(function() { 
        var firstChild = this.parentNode.firstChild; 
        if (firstChild) { 
            this.parentNode.insertBefore(this, firstChild); 
        } 
    }); 
};

function is_high_light_line(node, flag){
    let u = node.id;
    let lines_change = [];
    let idx = 0;
    if (!rela.hasOwnProperty(u) && !rela_r.hasOwnProperty(u)){
        return;
    }
    if (rela.hasOwnProperty(u)){
        for (let i = 0;i < rela[u].length;i++){
            lines_change[idx] = [u, rela[u][i]];
            idx++;
        }
    }
    if (rela_r.hasOwnProperty(u)){
        for (let i = 0;i < rela_r[u].length;i++){
            lines_change[idx] = [u, rela_r[u][i]];
            idx++;
        }
    }

    if (flag){
        svg.selectAll("line")
            .data(lines_change)
                .attr("class", "line_style_highlight") // 为样式分配类
                .attr("x1", function(d) { return points[d[0]][0] })
                .attr("y1", function(d) { return points[d[0]][1] })
                .attr("x2", function(d) { return points[d[1]][0] })
                .attr("y2", function(d) { return points[d[1]][1] })
                .bringElementAsTopLayer();

        // 可尝试将该处节点放大

    }else{
        D3_update_high_light();
    }
}

function update_connect_line(visited, start, end, res){
    console.log("update_connect_line begin", start, end, res);
    connect_lines = [];
    let idx = 0;
    connect_lines[idx++] = [res, end];
    while (res != start){
        connect_lines[idx++] = [visited[res], res];
        res = visited[res];
    }
    document.getElementById("connect_line").innerHTML = "最短路径长度：" + connect_lines.length; 
    D3_update_high_light();
}

function bfs(start, end){
    if (start == end){
        return false;
    }
    let visited = [];
    let q = [];
    let idx = 0;
    let cur = 0;
    let tmp = 0;
    let v = 0;
    q[idx++] = start;
    for (let i = 0;i < n;i++){
        visited[i] = -1;
    }
    visited[start] = start;
    while (cur < q.length){
        let size = q.length;
        while (cur < size){
            tmp = q[cur++];
            if (!rela_all.hasOwnProperty(tmp)){
                continue;
            }
            for (let i = 0;i < rela_all[tmp].length;i++){
                v = rela_all[tmp][i];
                if (v == end){
                    update_connect_line(visited, start, end, tmp);
                    return true;
                }
                if (visited[v] == -1){
                    visited[v] = tmp;
                    q[idx++] = v;
                }
            }
        }
    }
    for (let i = 0;i < n;i++){
        if (visited[i] != -1){
        }
    }
    return false;
}

function update_click_node(node){
    let size = points_click.length;
    let id = node.id;
    if (size == 0){
        points_click.push(id);
        document.getElementById("select_point").innerHTML = "已选定1个点"; 
        return;
    }
    if (size == 1){
        if (points_click[0] == id){
            return;
        }else{
            points_click.push(id);
            document.getElementById("select_point").innerHTML = "已选定2个点"; 
            if (!bfs(points_click[0], points_click[1])){
                window.alert("没有最短路径！");
            }
            return;
        }
    }
    points_click = [];
    points_click.push(id);
    document.getElementById("select_point").innerHTML = "已选定1个点"; 
}

function appear_text(node, name){
    var x = node.getBoundingClientRect().left;
    var y = node.getBoundingClientRect().top;
    node.style.r = 10;
    document.getElementById("div_city_name").style.left = x + 8 + 'px'; 
    document.getElementById("div_city_name").style.top = y + 8 + 'px'; 
    document.getElementById("div_city_name").innerHTML = name; 
    document.getElementById("div_city_name").style.display = ""; 

    is_high_light_line(node, true);
}

function hide_text(node){
    node.style.r = 4;
    document.getElementById("div_city_name").innerHTML = ""; 
    document.getElementById("div_city_name").style.display = "none"; 

    is_high_light_line(node, false);
}

function D3_enter(){
    // 添加连线
    svg.selectAll("line")
        .data(lines)
        .enter()
        .append("line")
            .attr("class", "line_style") // 为样式分配类
            .attr("x1", function(d) { return points[d[0]][0] })
            .attr("y1", function(d) { return points[d[0]][1] })
            .attr("x2", function(d) { return points[d[1]][0] })
            .attr("y2", function(d) { return points[d[1]][1] });

    // 添加节点
    svg.selectAll("circle")
        .data(points)
        .enter()
        .append("circle") 
            .attr("class", function(d, i) { return ("dot" + city[i]["city_type"]) }) // 为样式分配类
            .attr("onmouseover", function(d, i) { return ("appear_text(this, \"" + city[i]["name"] + "\")") })
            .attr("onmouseout", "hide_text(this)")
            .attr("onclick", "update_click_node(this)")
            .attr("id", function(d, i) { return i })
            .attr("cx", function(d) { return d[0] })
            .attr("cy", function(d) { return d[1] })
            .attr("r", 4);

    // svg.selectAll("circle")
    //     .on("mouseover", function(d) {
    //         d3.select(this).classed('line_style_highlight', true);
    //         this.parentNode.appendChild(this);
    //     })
    //     .on("mouseout", function(d) {
    //         d3.select(this).classed('line_style_highlight', false);
    //     });
}

function D3_update_high_light(){
    // 添加连线
    svg.selectAll("line")
    .data(lines)
        .attr("class", "line_style") // 为样式分配类
        .attr("x1", function(d) { return points[d[0]][0] })
        .attr("y1", function(d) { return points[d[0]][1] })
        .attr("x2", function(d) { return points[d[1]][0] })
        .attr("y2", function(d) { return points[d[1]][1] })
        .bringElementAsTopLayer();

    if (connect_lines.length != 0){
        svg.selectAll("line")
        .data(connect_lines)
            .attr("class", "line_connect_highlight") // 为样式分配类
            .attr("x1", function(d) { return points[d[0]][0] })
            .attr("y1", function(d) { return points[d[0]][1] })
            .attr("x2", function(d) { return points[d[1]][0] })
            .attr("y2", function(d) { return points[d[1]][1] })
            .bringElementAsTopLayer();
    }

    // 添加节点
    svg.selectAll("circle")
        .data(points)
            .attr("id", function(d, i) { return i })
            .attr("cx", function(d) { return d[0] })
            .attr("cy", function(d) { return d[1] })
            .attr("r", 4)
            .bringElementAsTopLayer();
}

function D3_update(){
    // 更新连线
    svg.selectAll("line")
        .data(lines)
            .transition()
            .duration(transition_time)
            .attr("x1", function(d) { return points[d[0]][0] })
            .attr("y1", function(d) { return points[d[0]][1] })
            .attr("x2", function(d) { return points[d[1]][0] })
            .attr("y2", function(d) { return points[d[1]][1] });

    // 更新节点
    svg.selectAll("circle")
        .data(points)
            .transition()
            .duration(transition_time)
            .attr("id", function(d, i) { return i })
            .attr("cx", function(d) { return d[0] })
            .attr("cy", function(d) { return d[1] });
}

function D3_exit(){
    // Exit
    d3.select("body")
        .selectAll("line")
        .data(lines)
        .exit()
        .remove();
    
    d3.select("body")
        .selectAll("circle")
        .data(points)
        .exit()
        .remove();
}

// get distance of two points
function dist(x, y){
    return Math.max(Math.sqrt(x * x + y * y), 1);
}

// attractive force
function attractive(z){
    return z * z / k;
}

// repulsive force
function repulsive(z){
    return k * k / z;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function updata_replulsive_forces(){
    // calculate replulsive forces
    let x, y, d, r;
    for (let i = 0;i < n;i++){
        disp[i][0] = 0;
        disp[i][1] = 0;
        for (let j = 0;j < n;j++){
            if (i == j){
                continue;
            }
            x = points[i][0] - points[j][0];
            y = points[i][1] - points[j][1];
            d = dist(x, y);
            r = repulsive(d);
            disp[i][0] += x / d * r;
            disp[i][1] += y / d * r;
        }
    }
}

function update_attractive_forces(){
    // calculate attractive forces
    let x, y, d, a;
    for (u in rela){
        for (let i = 0;i < rela[u].length; i++){
            v = rela[u][i];
            x = points[u][0] - points[v][0];
            y = points[u][1] - points[v][1];
            d = dist(x, y);
            a = attractive(d);
            disp[u][0] -= x / d * a;
            disp[u][1] -= y / d * a;
            disp[v][0] += x / d * a;
            disp[v][1] += y / d * a;
        }
    }
}

function update_point_position(t_width, t_height){
    // update point position
    let d;
    // 迭代提前终止标记
    flag = true;
    let x_min = width * 2;
    let y_min = height * 2;
    let x_max = 0;
    let y_max = 0;
    let x_update = 0;
    let y_update = 0;
    for (let i = 0;i < n;i++){
        d = dist(disp[i][0], disp[i][1]);
        x_update = (disp[i][0]) / d * Math.min(d, t_width);
        y_update = (disp[i][1]) / d * Math.min(d, t_height);
        if (x_update > 0.25 || y_update > 0.25){
            flag = false;
        }
        points[i][0] += x_update;
        points[i][1] += y_update;
        // points[i][0] += (disp[i][0]) / d * Math.min(d, t_width);
        // points[i][1] += (disp[i][1]) / d * Math.min(d, t_height);
        x_max = Math.max(x_max, points[i][0]);
        y_max = Math.max(y_max, points[i][1]);
        x_min = Math.min(x_min, points[i][0]);
        y_min = Math.min(y_min, points[i][1]);
    }
    if(flag){
        return true;
    }

    xScale = d3.scale.linear()
                .domain([x_min, x_max]) 
                .range([0, width]); 
                // .range([margin.left, width]); 
    yScale = d3.scale.linear()
                .domain([y_min, y_max]) 
                .range([0, height]); 
                // .range([margin.top, height]); 

    for (let i = 0;i < n;i++){
        points[i][0] = xScale(points[i][0]);
        points[i][1] = yScale(points[i][1]);
    }
    return false;
}

function init_point(){
    // 随机数产生器（固定种子）
    let seed_num = 2;
    function get_seed(){
        seed_num = (seed_num * 9301 + 49297) % 233280;
        return seed_num / 233280.0;
    }

    points = new Array(n);
    disp = new Array(n);
    for(let i = 0;i < n;i++){
        points[i] = [];
        points[i][0] = get_seed() * width;
        points[i][1] = get_seed() * height;
        disp[i] = [0, 0];
    }
}

async function Fruchterman_Rheingold(){
    let it = 0;
    let t_width = width;
    let t_height = height;
    k = factorK * Math.sqrt(width * height / n);

    init_point();
    
    while (it < iter){
        updata_replulsive_forces();

        update_attractive_forces();
        
        if (update_point_position(t_width, t_height)){
            window.alert("迭代提前终止！迭代次数：" + it);
            break;
        }
        
        D3_update();
        
        it++;
        document.getElementById("iter_time").innerHTML = "已迭代 : " + it + "次"; 
        t_width *= tempera;
        t_height *= tempera;

        await sleep(transition_time - 100);
    }
    D3_exit();

    await sleep(transition_time - 100);

    D3_update_high_light();
}

function map2matrtix(){
    lines = [];
    let idx = 0;
    for(key in rela){
        for(j in rela[key]){
            lines[idx] = [key, rela[key][j]];
            idx++;
        }
    }
}

function update_point_num(){
    n = 0;
    for (u in rela){
        n = Math.max(n, u);
        for (i in rela[u]){
            v = rela[u][i];
            n = Math.max(n, v);
        }
    }
    n++;
    console.log("points length", n);
}

function revert_matrix(){
    rela_r = [];
    rela_all = [];
    for (u in rela){
        for (i in rela[u]){
            v = rela[u][i];
            if (!rela_r.hasOwnProperty(v)){
                rela_r[v] = new Array();
            }
            rela_r[v].push(u);
            if (!rela_all.hasOwnProperty(u)){
                rela_all[u] = new Array();
            }
            rela_all[u].push(v);
            if(!rela_all.hasOwnProperty(v)){
                rela_all[v] = new Array();
            }
            rela_all[v].push(u);
        }
    }
}

function init(){
    update_point_num();

    // 获取点之间的连接信息
    map2matrtix();
    revert_matrix();

    reset_para();
    
    init_point();
    
    D3_enter();

    // Fruchterman-Rheingold算法，计算出点的坐标
    // Fruchterman_Rheingold();
}

function changeK(){
    factorK = document.getElementById("rangeK-slider").value;
    document.getElementById("rangeK-div").innerHTML = "设置系数K：" + factorK;
}

function changeDecay(){
    tempera = document.getElementById("rangeDecay-slider").value;
    document.getElementById("rangeDecay-div").innerHTML = "衰减因子：" + tempera;
}

function changeIter(){
    iter = document.getElementById("rangeIter-slider").value;
    document.getElementById("rangeIter-div").innerHTML = "迭代次数：" + iter;
}

function reset_para(){
    factorK = 0.95;
    document.getElementById("rangeK-slider").value = factorK;
    document.getElementById("rangeK-div").innerHTML = "设置系数K：" + factorK;
    tempera = 0.8;
    document.getElementById("rangeDecay-slider").value = tempera;
    document.getElementById("rangeDecay-div").innerHTML = "衰减因子：" + tempera;
    iter = 50;
    document.getElementById("rangeIter-slider").value = iter = 50;
    document.getElementById("rangeIter-div").innerHTML = "迭代次数：" + iter;
}

// 读取json文件
d3.json("./data/info.json", function(info){
    // 获取节点最大计数
    rela = info[1];
    city = info[0];

    init();
});