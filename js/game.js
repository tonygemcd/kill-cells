window.addEventListener('load',function(e) {

  /*
   * 游戏参数
    */
  // 游戏开始时的细胞数
  var numStartCell = 1;
  // 细胞运动的速度 + [0,20]
  var cellSpeed = 30;
  // 细胞存活时间（时间到会死亡，并同时产生两个新细胞）+ [-3,3]
  var cellLifeTime = 5;

  /*
   * 主要变量
   */
  var numCell = 0;// 游戏中存活的细胞数


  var Q = window.Q = Quintus().include("Sprites, Scenes, Input, Touch, UI")
    .setup('screen', { maximize: true })
    .touch();

  Q.component("reposition", {

    added: function() {
      this.entity.on("step",this,"step");
    },

    // 检查细胞是否离开屏幕，并将离开屏幕的细胞放回屏幕
    step: function(dt) {
      var p = this.entity.p;
      var maxSide = Math.sqrt(p.h * p.h  + p.w + p.w);
      if(p.x > Q.width + maxSide) {
        p.x -= Q.width + maxSide;
        p.dy = -p.dy;
      }
      if(p.x < -maxSide) {
        p.x += Q.width + maxSide;
      }

      if(p.y > Q.height + maxSide) {
        p.y -= Q.height + maxSide;
      }
      if(p.y < -maxSide) {
        p.y += Q.height + maxSide;
        p.dx = -p.dx;
      }
      p.speedX = Math.random() * 20 + cellSpeed;
      p.speedY = Math.random() * 20 + cellSpeed;
    }

  });

  Q.Sprite.extend('Cell', {
    init: function(p) {
      p = p || {};

      p.seconds = cellLifeTime + 3*Math.sin(Math.random()*2*Math.PI);//分裂时间

      p.color = 'green';
      p.w = 50;
      p.h = 50;
      p.cx = p.w/2;
      p.cy = p.h/2;
      p.type = Q.SPRITE_NONE;

      p.dx = Math.random() * 5;
      p.dy = Math.random() * 5;
      p.speedX = Math.random() * 20 + 30;
      p.speedY = Math.random() * 20 + 30;
      p.omega = Math.random() * 40 - 20;//旋转角度
      p.scaleOffset = 0;
      p.scaleSpeed = Math.random();
      p.scaleAmount = 0.70 * Math.random();

      this._super(p);
      this.add('reposition');
      this.on('step', this, 'countdown');

      numCell += 1;
    },

    draw: function(ctx) {
      ctx.fillStyle = this.p.color;
      ctx.beginPath();
      ctx.arc(0,
              0,
              this.p.w/2,0,Math.PI*2);
      ctx.fill();
    },

    step: function(dt) {
      var p = this.p;

      p.x += p.dx * p.speedX * dt;
      p.y += p.dy * p.speedY * dt;

//      if(p.x < p.w/2) {
//        p.x = p.w/2;
//        p.dx = -p.dx;
//      } else if(p.x > Q.width - p.w/2) {
//        p.x = Q.width - p.w/2;
//        p.dx = -p.dx;
//      }
//
//      if(p.y < p.h/2) {
//        p.y = p.h/2;
//        p.dy = 1;
//      } else if(p.y > Q.height - p.h/2) {
//        p.y = Q.height - p.h/2;
//        p.dy = -1;
//      }
//
//      p.angle += dt * p.omega;
//
      p.scaleOffset += dt;
      p.scale = 1 + Math.sin(p.scaleOffset * p.scaleSpeed) * p.scaleAmount;
    },

    // 细胞死亡，在其位置分裂出两个新的细胞
    countdown: function(dt) {
      this.p.seconds -= dt;
      if(!Q.stage(1)) {
        if(this.p.seconds < 0) {
          this.stage.insert(new Q.Cell({
            x: this.p.x,
            y: this.p.y
          }));
          this.stage.insert(new Q.Cell({
            x: this.p.x,
            y: this.p.y
          }));
          this.destroy();
          numCell -= 1;
          console.log(numCell)
        } else if (this.p.seconds < 1) {
          this.p.opacity = this.p.seconds;
        }
      }
    }
  });

  // 游戏开始
  Q.scene("start", function(stage) {
    var numStartCellLeft = numStartCell;
    while(numStartCellLeft-- > 0) {
      stage.insert(new Q.Cell({
        x: Math.random()*Q.width,
        y: Math.random()*Q.height
      }));
    }

    stage.on('step', function() {
      if(numCell >= 10) {
        Q.stageScene('endGame', 1, { label: '你已经被细菌弄死！'});
      }
    });
  });

  // 游戏结束
  Q.scene('endGame', function(stage) {

    // UI对话框
    var container = stage.insert(new Q.UI.Container({
      x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.3)"
    }));
    var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill:'#CCCCCC', label: '再玩一次！'}));
    var label = container.insert(new Q.UI.Text({ x: 10, y: -10 - button.p.h, label: stage.options.label}));

    button.on('click', function() {//TODO 手机不能点击
      // 数据清零
      Q.clearStages();
      numCell = 0;

      Q.stageScene('start');
    });

    // Expand the container to visibily fit it's contents
    container.fit(20);
  });

  // Finally call `stageScene` to start the show
  Q.stageScene('start');

  // Render the elements
  // Turning Q.debug and Q.debugFill on will render
  // the sprites' collision meshes, which is all we want
  // in this situation, otherwise nothing would get rendered
//  Q.debug = true;
//  Q.debugFill = true;

});