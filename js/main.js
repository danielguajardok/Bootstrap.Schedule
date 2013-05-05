var data = [
	{date: '2013-04-29', start_time: '07:00:00', end_time: '08:30:00'},
	{date: '2013-04-29', start_time: '07:30:00', end_time: '15:30:00'},
	{date: '2013-04-29', start_time: '08:00:00', end_time: '08:30:00'},
	{date: '2013-04-29', start_time: '08:00:00', end_time: '09:00:00'},
	{date: '2013-04-29', start_time: '08:30:00', end_time: '09:00:00'},
	{date: '2013-04-29', start_time: '09:30:00', end_time: '10:30:00'},
	{date: '2013-04-29', start_time: '09:30:00', end_time: '10:30:00'},
	{date: '2013-04-29', start_time: '16:30:00', end_time: '17:30:00'}
];

var Schedule = function(options) {
	this.data = options.data || {};
	this.$calendar = $(options.calendar);
	this.origin = moment('00:00:00','hh:mm:ss');
	this.minute_size = 1;
	// this.data = _.sortBy(this.data,function(model){
	// 	return moment(model.date+" "+model.start_time,'YYYY-MM-DD hh:mm:ss').toDate()+moment(model.date+" "+model.end_time,'YYYY-MM-DD hh:mm:ss');
	// });
	var today = moment().toDate();
	
	$('.day',this.$calendar).css({height:this.minute_size*60*24+'px'});
	$('.day-hours',this.$calendar).css({height:this.minute_size*60*24+'px'});
	this.renderHeaders();
	this.renderDayHours();
}

Schedule.prototype.renderHeaders = function() {
	var self = this;
	$('.day', this.$calendar).each(function(index,element){
		var current_day = moment(self.today).startOf('week').add('days',index);
		$(element).prepend("<div class='day-header'>"+current_day.format('dddd DD/MM')+"</div>");
	});
}
Schedule.prototype.renderDayHours = function() {
	var self = this;
	var i;
	for (i=0;i<48;i++) {
		var current_time = moment('00:00:00','hh:mm:ss').add('minutes',i*30);
		var content = $("<div class='time-block'><div class='time-block-inner'>"+current_time.format('hh:mm')+"</div></div>");
		$('.days-hours-left .day-inner').append($("<div class='time-block'><div class='time-block-inner'>"+current_time.format('hh:mm')+"</div></div>"));
		$('.days-hours-right .day-inner').append($("<div class='time-block'><div class='time-block-inner'>"+current_time.format('hh:mm')+"</div></div>"));
	}
}

Schedule.prototype.render = function() {
	var self = this;
	_.each(this.data,function(model,index){
		var day = self.getDay(model);
		var blockView = new Block(model);
		$('.day:eq('+day+') .day-inner').append(blockView.render().$el);
	});
	$('.day .day-inner').each(function(i,el){
		self.overlap($(el));	
	})
	
}

Schedule.prototype.getDay = function(block) {
	return Number(moment(block.date,'YYYY-MM-DD').format('d'));
}

Schedule.prototype.overlap = function(day_column) {
	// Algorithm expect data to be sorted asc by start_time,end_time
	var self = this;
	var columns = [];
	var last_block = false;
	var blocks = $('.block', day_column);
	_.each(blocks,function(block,index){
		var positioned = false;
		if (!last_block) {
			columns.push([block]);
			last_block = block;
			positioned = true;
		} else {
			var last_block_bottom = $(last_block).position().top+$(last_block).height();
			if ($(block).position().top >= last_block_bottom) {
				
				self.fixPositions(columns);
				columns = [];
			} else {
				_.each(columns,function(column,column_index){
					// Ver si cabe en esta columna
					var current_column_bottom = $(column[column.length-1]).position().top+$(column[column.length-1]).height();
					
					if ($(block).position().top >= current_column_bottom && !positioned) {
						positioned = true;
						columns[column_index].push(block);
					}
				});
				
				if (!positioned) {
					
					columns.push([block]);
				}
			}
		}
		
		if (last_block && last_block_bottom <= $(block).position().top+$(block).height()) {
			last_block = block;
		}
	});
	if (columns.length != 0) {
		this.fixPositions(columns);
		columns = [];
	}
}

Schedule.prototype.fixPositions = function(columns) {
	_.each(columns,function(column,column_index){
		_.each(column,function(block,block_index){
			var width = 100/columns.length;
			var left = width*column_index;
			$(block).css({width: width+'%', left: left+'%'});
		})
	})
}








var Block = function(model) {
	this.model = model;
	this.minute_size = 1;
	this.origin = moment('00:00:00','hh:mm:ss');
	this.options = {
		top: '0',
		left: '0',
		width: '100%',
		height: '5px',
		className: 'block'
	}
	var pixels = this.getPixels();
	this.options.top = pixels.top+'px';
	this.options.height = pixels.height+'px';
	this.$el = $('<div></div>');
	
}

Block.prototype.render = function() {
	this.$el.addClass(this.options.className);
	this.$el.css({top: this.options.top, left: this.options.left, width: this.options.width,height:this.options.height});
	this.$el.append($('<div class="block-inner"></div>'));
	return this;
}

Block.prototype.getPixels = function() {
	var block = this.model;
	var start_time = moment(block.start_time,'hh:mm:ss');
	var end_time = moment(block.end_time,'hh:mm:ss');
	var start_time_pixels = start_time.diff(this.origin,'minutes')*this.minute_size;
	var end_time_pixels = end_time.diff(this.origin,'minutes')*this.minute_size;
	return {
		top: start_time_pixels,
		height: end_time_pixels-start_time_pixels
	}
}

var calendar = new Schedule({data: data, calendar: '.weekly-schedule'}).render();








