// birds only have color, but they wil keep track of their HTML element also
var Bird = function (color) {
	this.color = color;
	this.$bird = $('<div class="bird ' + this.color + '"></div>');
	this.$bird.data('bird', this);

	// bind necessary click actions
	this.$bird.click(function (e) {
		e.preventDefault();
		e.stopPropagation();

		var color = $(this).data('bird').color;
		console.log('bird clicked');
		if (window.bucket.stage_shown === false) {
			console.log($(this).data('bird'));
			var res = window.bucket.remove($(this).data('bird'));

			if (color === 'black') {
				if (window.bucket.noMoves()) {
					$('.players').append('<p class="win">Player ' + (window.turn + 1) + ' wins! Reload to play again.</p>');
					return;
				}

				// toggle the turn
				if (res) {
					$($('.players p')[window.turn]).removeClass('active');
					window.turn = 1 - window.turn;
					$($('.players p')[window.turn]).addClass('active');
				}
			}
		}
	});
};

// do animations and make the bird remove explode, slingshot, etc
Bird.prototype.die = function () {
	var death = function (bird) {
		bird.$bird.hide();
	};
	var $b = this.$bird; // to get around the "this" problem
	$.when(death(this)).done(function () {
		$b.remove();
	});
};

// bucket should keep a list of birds in no particular order
// and also lists of pointers to different colors birds for reference
// and also their own html elements and the one for the stage where the user
// will be able to choose the birds to add
// and also whether that stage is shown right now or not.
var Bucket = function ($elem, $stage) {
	this.birds = [];
	this.yellows = [];
	this.reds = [];
	this.blacks = [];
	this.$bucket = $elem;
	this.$stage = $stage;
	this.stage_shown = false;
};

// do animations and append bird element to parent bucket
Bucket.prototype.append = function (bird, $stage) {
	$stage = $stage === undefined? this.$bucket : $stage;
	$stage.append(bird.$bird);
};

// add a bird to the bucket
Bucket.prototype.add = function (bird) {
	switch (bird.color) {
		case 'yellow':
			this.birds.push(bird);
			this.yellows.push(bird);
			this.append(bird);
			return;
		case 'red':
			this.birds.push(bird);
			this.reds.push(bird);
			this.append(bird);
			return;
		case 'black':
			this.birds.push(bird);
			this.blacks.push(bird);
			this.append(bird);
			return;
		default:
			return;
	}
};

// remove a bird from the bucket
Bucket.prototype.remove = function (bird) {
	console.log(bird.color);
	switch (bird.color) {
		case 'yellow':
			this.birds.splice(this.birds.indexOf(bird), 1);
			this.yellows.splice(this.yellows.indexOf(bird), 1);
			bird.die();
			break;
		case 'red':
			if ($('.bird.red.selected').length === 0) {
				bird.$bird.addClass('selected');
				return false;
			} else if ($('.bird.red.selected').length === 1) {
				if (bird.$bird.hasClass('selected')) {
					bird.$bird.removeClass('selected');
					return false;
				}
				bird.$bird.addClass('selected');
				var _this = this;
				$.each($('.bird.red.selected'), function () {
					var b = $(this).data('bird');
					_this.birds.splice(_this.birds.indexOf(b), 1);
					_this.reds.splice(_this.reds.indexOf(b), 1);
					b.die();
				});
			} else {
				return false; //something went wrong
			}
			break;
		case 'black':
			this.birds.splice(this.birds.indexOf(bird), 1);
			this.blacks.splice(this.blacks.indexOf(bird), 1);
			bird.die();
			break;
		default:
			return false;
	}

	this.stageChoices(bird.color);
	// bird.die();
	return true;
};

Bucket.prototype.stageChoices = function (color) {
	var stage = [],
		numBirds,
		birdColor,
		_this = this;

	switch (color) {
		case 'yellow':
			birdColor = 'red';
			numBirds = 3;
			break;
		case 'red':
			birdColor = 'black';
			numBirds = 7;
			break;
		default:
			return;
	}

	this.$stage.fadeIn(500);
	this.stage_shown = true;

	for (var i=0; i<numBirds; i++) {
		var b = new Bird(birdColor);
		this.append(b, this.$stage);
		stage.push(b);
	}

	this.$stage.children('.bird').click(function (e) {
		e.preventDefault();
		e.stopPropagation();
		var bird = $(this).data('bird');
		stage.splice(stage.indexOf(bird), 1);
		_this.add(bird);
	});

	this.$stage.append('<div class="done">Done</div>');
	this.$stage.children('.done').click(function () {
		for (var j=0; j<stage.length; j++) {
			stage[j].die();
		}
		_this.$stage.empty();
		_this.stage_shown = false;
		_this.$stage.fadeOut(500);

		// toggle turns, etc
		if (window.bucket.noMoves()) {
			$('.players').append('<p class="win">Player ' + (window.turn + 1) + ' wins! Reload to play again.</p>');
			return;
		}

		// toggle the turn
		$($('.players p')[window.turn]).removeClass('active');
		window.turn = 1 - window.turn;
		$($('.players p')[window.turn]).addClass('active');
	});
};

Bucket.prototype.noMoves = function () {
	if (this.yellows.length === 0 && this.blacks.length === 0 && (this.reds.length === 0 || this.reds.length === 1)) {
		return true;
	}
	return false;
};
