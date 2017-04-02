	//utility functions
	function generateRgbValue(){
		function genVal() { return Math.round(Math.random()*255);}
		return "rgb("+genVal()+","+genVal()+","+genVal()+")";
	}

	function toDegree(rad) {
		return rad * Math.PI / 180
	}

	function getNumDaysInMonth(date) {
		var numDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30 ,31];
		var year = date.getFullYear();
		var month = date.getMonth();
		if(month == 1) {
			if((year % 4 == 0 && year%100 == 0) || (year % 400 == 0))
				numDays[month]+=1;
		}
		return numDays[month];
	}

	//creates a clockFace object 
	function ClockFace(type, size, radius, gap, bgColor,borderColor, color) {
		var canvas = document.createElement("canvas");
		canvas.width = (canvas.height = size);
		var ctx = canvas.getContext("2d");
		//placing 0,0 of the canvas at the center of it
		ctx.translate(size/2, size/2);
		this.canvas = canvas;
		this.radius = radius * 2 == size ? radius - 2 : radius;
		this.type = type;
		this.start = null;
		this.end = null;
		this.step = null;
		this.stepAngle = null;
		this.pace = type == "seconds" ? 100 : 1000;
		this.bgColor = bgColor;
		this.borderColor = borderColor;
		this.color = color;
		this.draw(gap);
		this.set();
		this.startCf(gap);
	}
	
	//to get the drawing context
	ClockFace.prototype.getCtx = function() {
		return this.canvas.getContext("2d");
	}

	//drawing a filled circle (background to clockFace)
	ClockFace.prototype.drawCircle = function() {
		var ctx = this.getCtx();
		ctx.beginPath();
		ctx.fillStyle = this.bgColor;
		ctx.strokeStyle = this.borderColor;
		ctx.arc(0,0,this.radius, 0, Math.PI*2);
		ctx.fill();
		ctx.stroke();
		ctx.closePath();
	}

	//drawing numbers on the canvas according to clocksFace's type
	//initializing start, end, step and stepAngle properties
	ClockFace.prototype.drawNumbers = function(gap) {
		var start, end, step;
		switch(this.type) {
			case "month":
				start = 1; end = 12; step = 1;
				break;
			case "day":
				start = 1; end = getNumDaysInMonth(new Date()); step = 1;
				break;
			case "hours":
				start = 0; end = 23; step = 1;
				break;
			case "minutes":
				start = 0; end = 59; step = 5;
				break;
			case "seconds":
				start = 0; end = 59; step = 5;
				break;
		}
		var ctx = this.getCtx();
		var stepAngle = 360 / (end - start + 1);
		var fontSize = this.radius*0.1;
		ctx.font = fontSize+"px Arial";
		ctx.textAlign = "center";
		ctx.fillStyle = this.color;
		for(var num = start; num <= end; num+=step) {
			ctx.rotate(toDegree(stepAngle)*num);
			ctx.fillText(num.toString(), 0, -this.radius+gap/2+fontSize/2);
			ctx.rotate(-toDegree(stepAngle)*num);
		}
		this.start = start;
		this.end = end;
		this.step = step;
		this.stepAngle = stepAngle;
	}

	ClockFace.prototype.drawGraduations = function() {
		var ctx = this.getCtx();	
		for(var i=this.start; i <= this.end; i++){
			var lineLength = i % this.step || this.step == 1 ? this.radius*0.04: this.radius*0.08;
			ctx.beginPath();
			ctx.rotate(toDegree(this.stepAngle)*i);
			ctx.moveTo(0,-this.radius+lineLength);
			ctx.lineTo(0,-this.radius);

			ctx.strokeStyle = this.color;
			ctx.stroke();
			ctx.rotate(-toDegree(this.stepAngle*i));
			ctx.closePath();
		}
	}

	//rotating it's canvas according to the time
	ClockFace.prototype.set = function() {
		var date = new Date();
		switch(this.type) {
			case "month":
				currentPos = date.getMonth()+1+date.getDate()/getNumDaysInMonth(date);
				break;
			case "day":
				currentPos = date.getDate()+date.getHours()/24;
				break;
			case "hours":
				currentPos = date.getHours()+date.getMinutes()/60;
				break;
			case "minutes":
				currentPos = date.getMinutes()+date.getSeconds()/60;
				break;
			case "seconds":
				currentPos = date.getSeconds()+date.getMilliseconds()/1000;
				break;
		}
		this.canvas.style.transform = "rotate("+-currentPos*this.stepAngle+"deg)";
	}

	//drawing the whole clockFace
	ClockFace.prototype.draw = function(gap) {
		this.drawCircle();
		this.drawNumbers(gap);
		this.drawGraduations();
	}

	//setting an interval to animate it according to its pace property
	ClockFace.prototype.startCf = function(gap){
		var cf = this;
		setInterval(function(){
			cf.draw(gap);
			cf.set();}, this.pace);
	}

	//creates a Clock object which will create 3 to 5 clockFaces according to it's
	// extended boolean parametere
	function Clock(radius, container, extended, config) {
		var size = radius * 2;
		var wrapper = document.createElement("div");
		var types = ["hours", "minutes", "seconds"];
		if(extended) {
			types.unshift("day");
			types.unshift("month");
		}
		wrapper.className = "cWrapper";
		wrapper.style.width = (wrapper.style.height = size+"px");
		var gap = (radius-radius/types.length) / types.length;
		for(var i=0; i < types.length; i++){
			var displayConfig = config[types[i]];
			var bgColor = displayConfig[0];
			var borderColor = displayConfig[1];
			var color = displayConfig[2];
			console.log();
			var clockFace = new ClockFace(types[i], size, radius-gap*i, gap, bgColor, borderColor, color);
			wrapper.appendChild(clockFace.canvas);
		}
		this.config = config;
		this.radius = radius;
		this.wrapper = wrapper;
		this.drawNeedle();
		container.appendChild(wrapper);
	}

	//draws the thin red line which will indicate time
	Clock.prototype.drawNeedle = function () {
		var canvas = document.createElement("canvas");
		canvas.height = (canvas.width = this.radius*2);
		var ctx = canvas.getContext("2d");
		ctx.beginPath();
		ctx.translate(this.radius, this.radius);
		ctx.strokeStyle = this.config['needle'][0];
		ctx.lineWidth = this.radius * this.config['needle'][1];
		ctx.moveTo(0,0);
		ctx.lineTo(0,-this.radius);
		ctx.stroke();
		ctx.closePath();	
		this.wrapper.appendChild(canvas);
	}