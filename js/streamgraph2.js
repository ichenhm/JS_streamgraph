var n = 10;
var interval = 50;
var m = 8;
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
		temp.old=Point.newObject(0,0);
		return temp;
	},
	get_dat: function (id){
		return this.dat[id - this.start];
	}
};

var lay = [];
var ordering =[];
var hasExist = 1;
var xxx=0;
var rr=[];
window.addEventListener("load", function () {
    main_canvas = document.getElementById('can_main');
	main_ctx = main_canvas.getContext('2d');
	
	lay.push(layer.newObject()); 
	lay[0].start = 0;
	lay[0].end = m;
	lay[0].ord = new Array(m);
	for (var i = 0; i < m; i++) 
		lay[0].dat.push(0);
	main_ctx.moveTo(0,200);
	main_ctx.lineTo(400,200);
	main_ctx.stroke();
	
	
	
	for (var i = 1; i <= n; i++){
		lay.push(layer.newObject());
		var x = Math.floor(Math.random() * (m - 1) +1e-5);
		var y = Math.floor(Math.random() * (m - 1 - x) +1e-5);
		lay[i].start = x;
		lay[i].end = x + y + 1;
		lay[i].ord = new Array(m - x);
		
		lay[i].dat.push(0);
		for (var j = 0; j < y; j++)
			 lay[i].dat.push(Math.floor(Math.random() * 40 +1e-5));
		
		lay[i].dat.push(0);
		
		for (var j = y; j < m - x; j++)
			lay[i].dat.push(0);
			
	}
	lay.sort(function(a, b){return a.start - b.start;
	});
	
	for (var i = 1; i <= n; i++)
		{
			console.log("######",i,lay[i].start,lay[i].end);
			//console.log(lay[i].get_dat(0),lay[i].get_dat(1),lay[i].get_dat(2),lay[i].get_dat(3),lay[i].get_dat(4),lay[i].get_dat(5),lay[i].get_dat(6),lay[i].get_dat(7));
		}	
	for (var i = 0;i < m; i++){
		 drawTime(i);
		 console.log(i);
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
function  calculateCubicBezier(cp, t) { 
	var c = (cp[1].sub(cp[0])).mult(3.0); 
	var b = (cp[2].sub(cp[1])).mult(3.0).sub(c); 
	var a = cp[3].sub(cp[0]).sub(c).sub(b); 
	
	var tSquared = t * t; 
	var tCubed = tSquared * t; 
	var result = a.mult(tCubed).add(b.mult(tSquared)).add(c.mult(t)).add(cp[0]); 
	return result;
} 
function ComputeBezier(cp,numberOfPoints)
{ 	var rr=[];
	var dt = 1.0 / ( numberOfPoints - 1 ); 
	for(var i = 0; i < numberOfPoints; i++) {
		temp = calculateCubicBezier( cp, i*dt );
		rr.push(temp);
	}
	return rr;
}

function Bezier(oldp, newp){
	var cp = [];
	cp.push(oldp);
	cp.push(Point.newObject( 	(newp.x-oldp.x)/3.0  +oldp.x, 	Math.random()*(newp.y-oldp.y)+oldp.y 	));
	cp.push(Point.newObject( 	(newp.x-oldp.x)/3.0*2+oldp.x, 	Math.random()*(newp.y-oldp.y)+oldp.y 	));
	cp.push(newp);
	return ComputeBezier(cp, interval+1);
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
	main_ctx.fillStyle=color[id - 1];
	main_ctx.fill();
}
function drawTime(tx){
	var obj = calc_dat(tx);
	var g0 = obj.g0;
	var sum = obj.sum;
	while ((hasExist!=lay.length) && (lay[hasExist].start == tx)){
		if (sum > g0 * -2) 
			ordering.push(hasExist);
		else
			ordering.unshift(hasExist);
		hasExist++;
	}
	var temp = g0;
	var oldp = Point.newObject();
	var newp = Point.newObject();
	var ret = [];
	
	newp = Point.newObject(tx*interval, temp);
	if (tx){
		oldp = lay[0].old;
		ret = Bezier(oldp, newp);
	}
	lay[0].old = newp;
	if ( tx==0 ) return;
	for (var i = 1; i <= ordering.length; i++){
		var id = ordering[i - 1];
		temp += lay[id].get_dat(tx);
	    newp = Point.newObject(tx*interval, temp);
		
		if (lay[id].start != tx)
	    { 	
			for (var j = 0;j < ret.length; j++)
			lay[id].pointarr.push(ret[j]);
			oldp = lay[id].old;
			ret = Bezier(oldp, newp);
			for (var j = 0;j < ret.length; j++)
			lay[id].pointarr.unshift(ret[j]);	
		}
		lay[id].old = newp;
		/*console.log("2222222",tx,id,lay[id].pointarr.length);
		var ttt=lay[id].pointarr.length-1;
		console.log("(((((((",lay[id].pointarr[0].x,lay[id].pointarr[0].y);
		console.log(")))))))",lay[id].pointarr[ttt].x,lay[id].pointarr[ttt].y);*/
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
	
	
