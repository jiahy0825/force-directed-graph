let rela;
let city;
let lines;
let points;
let disp;
let n;
let k;
let tempera;
let iter;
let transition_time = 200;

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
    if (!rela.hasOwnProperty(u)){
        return;
    }
    for (let i = 0;i < rela[u].length;i++){
        lines_change[idx] = [u, rela[u][i]];
        idx++;
    }
    // console.log(idx, lines_change);
    // d3.select("body")
    //     .selectAll("line")
    //     .data(lines_change)
    //     .exit()
    //     .remove();
    if (flag){
        svg.selectAll("line")
        .data(lines_change)
            .attr("class", "line_style_highlight") // 为样式分配类
            .attr("x1", function(d) { return points[d[0]][0] })
            .attr("y1", function(d) { return points[d[0]][1] })
            .attr("x2", function(d) { return points[d[1]][0] })
            .attr("y2", function(d) { return points[d[1]][1] })
            .bringElementAsTopLayer();
    }else{
        svg.selectAll("line")
        .data(lines_change)
            .attr("class", "line_style") // 为样式分配类
            .attr("x1", function(d) { return points[d[0]][0] })
            .attr("y1", function(d) { return points[d[0]][1] })
            .attr("x2", function(d) { return points[d[1]][0] })
            .attr("y2", function(d) { return points[d[1]][1] })
            .pushElementAsBackLayer();
    }
    // svg.selectAll("line")
    //     .data(lines_change)
    //     // .enter()
    //     // .append("line")
    //         .attr("class", function() {
    //             if (flag){
    //                 return "line_style_highlight";
    //             }else{
    //                 return "line_style";
    //             }
    //         } ) // 为样式分配类
    //         .attr("x1", function(d) { return points[d[0]][0] })
    //         .attr("y1", function(d) { return points[d[0]][1] })
    //         .attr("x2", function(d) { return points[d[1]][0] })
    //         .attr("y2", function(d) { return points[d[1]][1] })
    //         .bringElementAsTopLayer();
}


function appear_text(node, name){
    var x = node.getBoundingClientRect().left;
    var y = node.getBoundingClientRect().top;
    node.style.r = 8;
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
            .attr("id", function(d, i) { return i })
            .attr("cx", function(d) { return d[0] })
            .attr("cy", function(d) { return d[1] })
            .attr("r", 4);
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
    for (let i = 0;i < n;i++){
        d = dist(disp[i][0], disp[i][1]);
        if (d > 10){
            flag = false;
        }
        points[i][0] += (disp[i][0]) / d * Math.min(d, t_width);
        points[i][1] += (disp[i][1]) / d * Math.min(d, t_height);
        x_max = Math.max(x_max, points[i][0]);
        y_max = Math.max(y_max, points[i][1]);
        x_min = Math.min(x_min, points[i][0]);
        y_min = Math.min(y_min, points[i][1]);
        // points[i][0] = Math.min(width, Math.max(0, points[i][0]));
        // points[i][1] = Math.min(height, Math.max(0, points[i][1]));
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
    k = 0.95 * Math.sqrt(width * height / n);
    
    D3_enter();

    while (it < iter){
        updata_replulsive_forces();

        update_attractive_forces();
        
        if (update_point_position(t_width, t_height)){
            break;
        }
        
        D3_update();

        await sleep(transition_time - 100);

        it++;
        document.getElementById("iter_time").innerHTML = "迭代次数: " + it; 
        t_width *= tempera;
        t_height *= tempera;
    }

    D3_exit();
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

function update(){
    update_point_num();

    // 获取点之间的连接信息
    map2matrtix();

    // Fruchterman-Rheingold算法，计算出点的坐标
    tempera = 0.8;
    iter = 50;
    init_point();
    Fruchterman_Rheingold();
}

// 读取json文件
d3.json("./data/info.json", function(info){
    // 获取节点最大计数
    rela = info[1];
    city = info[0];
    // console.log(city);
    // rela = {0:[1], 1:[2]};

    update();
});