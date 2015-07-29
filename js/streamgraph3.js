var n = 10;
var interval = 4;
var m = 101;
var half_height = 200;
var width = 400;
var lastColor = 1;
var lastColora = 0;
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
	length: function (){
		return Math.sqrt(this.x*this.x + this.y*this.y);
	},
	normalize: function(){
		var len=this.length();
		return this.mult(1/6.0);
	},
	mult : function (p) {
		return Point.newObject(this.x * p, this.y * p);
	}
}

var layer = {
	start: 0,
	end: 0,
	tot: 0,
	newObject: function() {
		var temp = Object.create(layer);
		temp.pointarr=new Array();
		temp.dat= new Array();
		temp.ord= new Array();
		return temp;
	},
	get_ord: function (id){
		return this.ord[id - this.start];
	}
};
var lay = [];
var ordering =[];
var hasExist;
var T = 20;
var rr=[];
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
	lay[0].end = m;
	for (var i = 0; i < m; i++) 
		lay[0].dat.push(0);
	main_ctx.moveTo(0,200);
	main_ctx.lineTo(400,200);
	main_ctx.stroke();
	for (var i = 1; i <= n; i++){
		var re = bumpLayer(m);
		lay.push(layer.newObject());
		lay[i].dat.push(0);
		for (var j = 1; j < m - 1; j++){
			var x= Math.floor(re[j] + 2 );
			lay[i].dat.push(x);
			lay[i].tot += x;
		}
		lay[i].dat.push(0);
		for (var j = 1; j < m ; j++)
		if (lay[i].dat[j] > 2){
			lay[i].realstart = j - 1; 
			break;
		}
		//console.log("i=",i,":",lay[i].dat[0],lay[i].dat[1],lay[i].dat[2]);
		//console.log("~~~~~~",lay[i].start);
		lay[i].end = m - 1;
	}
	lay.sort(function(a, b){return a.start - b.start;
	});
	
	for (var i = 1; i <= n; i++){
		console.log("######",i,lay[i].start,lay[i].end);
		//console.log("i=",i,":",lay[i].ord[0],lay[i].ord[1],lay[i].ord[2],lay[i].ord[3],lay[i].ord[4],lay[i].ord[5]);
	}
	hasExist = 1;
	for (var i = 0;i < m; i++)
		PredrawTime(i);
	hasExist = 1;
	for (var i = 0; i <= n; i++)
		lay[i].lastvector = Point.newObject(0,0);
	for (var i = 0; i < m; i++){
		drawTime(i);
	}
});

function calc_dat(tx){
	var ans1 = 0, ans2 = 0;
	var nn = ordering.length;
	for (var i = 0; i < nn; i++){
		ans1 += (nn - i) * lay[ordering[i]].dat[tx];
		ans2 += lay[ordering[i]].dat[tx];
	}
	ans1 = ans1 * -1.0 /(nn + 1);
	return {g0:ans1, sum:ans2};
}

function  calculateCubicBezier(cp, t) { 
	var c = (cp[1].sub(cp[0])).mult(3.0); 
	var b = (cp[2].sub(cp[1])).mult(3.0).sub(c); 
	var a = cp[3].sub(cp[0]).sub(c).sub(b); 
	
	var tSquared = t * t; 
	var tCubed = tSquared * t; 
	var result = a.mult(tCubed).add(b.mult(tSquared)).add(c.mult(t)).add(cp[0]); 
	return result;
}
 
function Bezier(oldp, p1, p2, newp)
{ 	var cp = [];
	var rr=[];
	cp.push(oldp);
	cp.push(p1);
	cp.push(p2);
	cp.push(newp);
	var numberOfPoints = interval+1;
	var dt = 1.0 / ( numberOfPoints - 1 ); 
	for(var i = 0; i < numberOfPoints; i++) {
		temp = calculateCubicBezier( cp, i*dt );
		rr.push(temp);
	}
	return rr;
}
function calcColor(amount, start){
	console.log(amount,start);
	
	var x=128;
	x=Math.floor(-(1-amount/20./T)*128+128);
	lastColora = (lastColora + 1)%5;
	x += (5-lastColora)*10;
	x= Math.min(x,255);
	var y = (lastColora + 1)* 0.2;
	if (start*interval>=width/2.) return {r:x,g:0,b:0,a:y};
	if (start*interval>=width/4.) return {r:0,g:x,b:0,a:y};
	return {r:0,g:0,b:x,a:y};
}

function fill_(id){
	//console.log("~~~~~~~",id,lay[id].pointarr.length);
	if (lay[id].pointarr.length==0)return;
	main_ctx.beginPath();
	main_ctx.moveTo(Math.floor(lay[id].pointarr[0].x+1e-5), Math.floor(lay[id].pointarr[0].y + half_height+1e-5));
	var len = lay[id].pointarr.length;
	for (var i = 1; i < len; i++)
		main_ctx.lineTo(Math.floor(lay[id].pointarr[i].x+1e-5), Math.floor(lay[id].pointarr[i].y + half_height+1e-5));
	main_ctx.closePath();
	var col=calcColor(lay[id].tot,lay[id].realstart);

	main_ctx.fillStyle="rgba(" + col.r + "," + col.g + "," + col.b + "," + col.a +")";
	//main_ctx.fillStyle=color[id-1];
	main_ctx.fill();
}
function PredrawTime(tx){
	var obj = calc_dat(tx);
	var g0 = obj.g0;
	var sum = obj.sum;
	while ((hasExist!=lay.length) && (lay[hasExist].start == tx)){
		if (sum > g0 * (-2) +1e-5) 
			ordering.push(hasExist);
		else
			ordering.unshift(hasExist);
		hasExist++;
	}
	var temp = g0;
	var oldp = Point.newObject();
	var newp = Point.newObject();
	var ret = [];
	lay[0].ord.push(temp);
	for (var i = 1; i <= ordering.length; i++){
		var id = ordering[i - 1];
		temp += lay[id].dat[tx];
	    lay[id].ord.push(temp);
	}
	for (var i = 1; i <= ordering.length; i++){
		var id = ordering[i - 1];
		if (lay[id].end == tx)  {
			ordering.splice(i - 1, 1);
			i--;
		}
	}	
}


function drawTime(tx){
	var obj = calc_dat(tx);
	var g0 = obj.g0;
	var sum = obj.sum;
	while ((hasExist!=lay.length) && (lay[hasExist].start == tx)){
		if (sum > g0 * (-2) +1e-5) 
			ordering.push(hasExist);
		else
			ordering.unshift(hasExist);
		hasExist++;
	}
	
	if (tx == 0) return;	
	var oldp = Point.newObject();
	var newp = Point.newObject();
	var p1 = Point.newObject();
	var p2 = Point.newObject();
	var vector = Point.newObject();
	var ret = [];
	
	newp = Point.newObject((tx  )*interval,lay[0].get_ord(tx));
	oldp = Point.newObject((tx-1)*interval,lay[0].get_ord(tx-1));
	nextp= Point.newObject((tx+1)*interval,lay[0].get_ord(tx+1));
	if (nextp.y!=null){
		vector = nextp.sub(oldp);
		vector = vector.normalize();
		ret = Bezier(oldp, oldp.add(lay[0].lastvector), newp.sub(vector), newp);
		lay[0].lastvector = vector;	
		}

	for (var i = 1; i <= ordering.length; i++){
		var id = ordering[i - 1];
		newp = Point.newObject((tx  )*interval,lay[id].get_ord(tx));
		oldp = Point.newObject((tx-1)*interval,lay[id].get_ord(tx-1));
		nextp= Point.newObject((tx+1)*interval,lay[id].get_ord(tx+1));
		if (nextp.y == null)continue;
		vector = nextp.sub(oldp);
		vector = vector.normalize();
	
		for (var j = 0;j < ret.length; j++)
			lay[id].pointarr.push(ret[j]);
		ret = Bezier(oldp, oldp.add(lay[id].lastvector), newp.sub(vector), newp);
		for (var j = 0;j < ret.length; j++)
			lay[id].pointarr.unshift(ret[j]);	
		
		lay[id].lastvector = vector;	
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
	
