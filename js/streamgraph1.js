var n = 10;
var interval = 2;
var m = 200;
var half_height = 200;
var color=["#f00","#00f","#0f0","#f0f","#0ff","#ff0","#000","#d9d919","#ff7f00","#93c"];
var Point = {
	x: 0,
	y: 0,
	newObject: function(x, y) {
		var temp = Object.create(Point);
		temp.x = x;
		temp.y = y;
		return temp;
	},
	add: function (v) {
		return Point.newObject(this.x + v.x, this.y + v.y);
	},
	sub: function (v) {
		return Point.newObject(this.x - v.x, this.y - v.y);
	},
	negate: function (v) {
		return Point.newObject(-v.x, -v.y);
	},
	mult : function (p) {
		return Point.newObject(this.x * p, this.y * p);
	}
}
var layer = {
	start: 0,
	end:0,
	newObject: function() {
		var temp = Object.create(layer);
		temp.pointarr=new Array();
		temp.dat= new Array();
		temp.ord= new Array();
		return temp;
	},
	get_dat: function (id){
		return this.dat[id - this.start];
	},
	set_ord: function(x, id){
		this.ord[id - this.start] = x;
	},
	get_ord: function(id){
		return this.ord[id - this.start];
	}
};
var lay = [];
var ordering =[];
var hasExist = 0;
var T = 20;
var temp=[];
function bumpLayer(n) {
	function bump(a) {
		var x = 1 / (.1 + Math.random()),
			y = 2 * Math.random() - .5,
			z = 10 / (.1 + Math.random());
		for (var i = 0; i < n; i++) {
			var w = (i / n - y) * z;
			a[i] += x * Math.exp(-w * w);
		}
	}
    var a = [], i;
    for (i = 0; i < n; ++i) a[i] = 0;
    for (i = 0; i < 5; ++i) bump(a);
    return a.map(function(d, i) { return Math.min(d*T, 5*T); });
}
window.addEventListener("load", function () {
    main_canvas = document.getElementById('can_main');
	main_ctx = main_canvas.getContext('2d');
	
	lay.push(layer.newObject()); 
	lay[0].start = 0;
	lay[0].end = m - 1;
	lay[0].ord = new Array(m);
	for (var i = 0; i < m; i++) 
		lay[0].dat.push(0);
	main_ctx.moveTo(0,200);
	main_ctx.lineTo(400,200);
	main_ctx.stroke();
	
	for (var i = 1; i <= n; i++){
		var re = bumpLayer(m);
		//console.log(re);
		lay.push(layer.newObject());
		lay[i].dat.push(0);
		for (var j = 1; j < m - 1; j++)
			lay[i].dat.push(re[j] + 5);
		lay[i].dat.push(0);
		lay[i].start = 0;
		lay[i].end = m - 1;
	}
	lay.sort(function(a, b){if (a.start != b.start)return a.start - b.start;
						    return b.end - a.end;
						   });
	for (var i = 1; i <= n; i++)
		 console.log("######",i,lay[i].start,lay[i].end);	
	for (var i = 0;i < m; i++){
		 drawTime(i);
		 //console.log(i);
	}
});

function calc_dat(tx){
	var ans1 = 0, ans2 = 0;
	var nn = ordering.length;
	for (var i = 0; i < nn; i++){
		ans1 += (nn - i) * lay[ordering[i]].get_dat(tx);
		ans2 += lay[ordering[i]].get_dat(tx);
	}
	ans1 = ans1 * -1.0 /(nn + 1);
	return {g0:ans1, sum:ans2};
}

function fill_(id){
	//console.log("ss");
	main_ctx.beginPath();
	var oldp = Point.newObject();
	var newp = Point.newObject();
	oldp.x = Math.floor(lay[id].start*interval+1e-5);
	oldp.y = lay[id].get_ord(lay[id].start)+half_height; 
	
	main_ctx.moveTo(oldp.x, oldp.y);
	for (var i = lay[id].start + 1; i <= lay[id].end; i++){
		newp.x = Math.floor(i*interval+1e-5);
		newp.y = lay[id].get_ord(i)+half_height;
		
		//console.log("~~~~~",id,newp.x,newp.y);
		main_ctx.lineTo(newp.x, newp.y);
		oldp = newp;
	}
	for (var i = lay[id].end - 1; i >lay[id].start; i--){
		newp.x = Math.floor(i*interval+1e-5);
		newp.y = lay[id].get_ord(i)+half_height-lay[id].get_dat(i);
		
		//console.log("~~~~~",id,newp.x,newp.y);
		main_ctx.lineTo(newp.x, newp.y);
		oldp = newp;
	}
	main_ctx.closePath();
	main_ctx.fillStyle=color[id - 1];
	main_ctx.fill();
}
function drawTime(tx){
	var obj = calc_dat(tx);
	var g0 = obj.g0;
	var sum = obj.sum;
	while ((hasExist!=lay.length) && (lay[hasExist].start == tx)){
		//console.log("::",g0, sum);
		if (sum > g0 * -2) 
			ordering.push(hasExist);
		else
			ordering.unshift(hasExist);
		hasExist++;
	}
	
	lay[0].set_ord(g0, tx);	
	var temp = g0;
	
	for (var i = 1; i <= ordering.length; i++){
		
		var id = ordering[i - 1];
		temp += lay[id].get_dat(tx);
		lay[id].set_ord(temp, tx);
	}
	for (var i = 1; i <= ordering.length; i++){
		var id = ordering[i - 1];
		if (lay[id].end == tx)  {
			fill_(id);
			ordering.splice(i - 1, 1);
			i--;
		}
	}	

	
}
	
	
