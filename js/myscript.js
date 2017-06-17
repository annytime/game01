/**
 * 键盘对象，依次记录按键信息Key
 */
var QM=10;
var Key={
    enable:false,
    keysDown:new Array(QM),//作为一个按键队列
    front:0,
    rear:0,
    setEnable:function(){
        if(Key.enable){
            document.onkeydown=function(e){
                var e=event||document.event||argument.callee.caller.arguments[0];
                if(e){
                    Key.keysDown[Key.rear]=e.keyCode;   //按键键值入队
                    Key.rear=(Key.rear+1)%QM;
                }
            }
        }else{
            document.onkeydown=null;
            Key.front=0;
            Key.rear=0;
        }
    },
    deleKey:function(){   //键值出队
        if(Key.front==Key.rear){
            return null;
        }else{
            Key.front=(Key.front+1)%QM;
            return Key.keysDown[Key.front-1];
        }
    }
}

window.onload=init;

function $(id){
    return document.getElementById(id);
}

function init(){
    var ctx=$("can").getContext("2d");
    var g=new Game(ctx);
    sessionStorage.user="Guest";
    sessionStorage.score=0;
    $("username").value="";
    g.ginit();
}
/**
 * Game类
 */
//构造函数  
function Game(ctx){
    this.i=0;
    this.scene=new Scene();
    this.tHandle=null;
    this.listeners=new Array(0);
    requestAnimationFrame = window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.msRequestAnimationFrame||
        window.mozRequestAnimationFrame||function( callback ){window.setTimeout(callback, 1000/60);};
}
//用原型方式定义对象的函数属性
//游戏初始化
Game.prototype.ginit=function(){
    console.log("game init");
    Key.enable=false;
    Key.setEnable();
    this.scene.sinit();
    this.scene.reset();
    this.scene.drawBegin();
    var self=this;
    document.onkeydown=function(e){
        if(e.keyCode==32){
            self.run.apply(self);
            $("userInput").style.display="none";
        }
    }
    $("userInput").style.display="";
    $("userShow").style.display="none";
    $("userrank").innerHTML="";
    sessionStorage.user="Guset";
    sessionStorage.score=0;
    $("username").value="";
    this.listeners.length=0;
}

//游戏场景动画
Game.prototype.render=function(){
  
}

Game.prototype.run=function(ctx){
    console.log("game run");
    this.addListener(new FrameListener("afterRender"));
    Key.enable=true;
    Key.setEnable();
    this.mainloop.apply(this);
}

//游戏主循环
Game.prototype.mainloop=function(){
    console.log(this.i++);
    for(var j=0;j<this.listeners.length;j++){
        this.listeners[j].enable&&this.listeners[j].onBeforeRender();
    }
    var flag=this.scene.update(Key.deleKey());
    var tflag=false;
    this.scene.render();
    for(var j=0;j<this.listeners.length;j++){
        if(this.listeners[j].enable){
            if(this.listeners[j] instanceof FrameListener){
                tflag=this.listeners[j].onAfterRender();
            }else{
                this.listeners[j].enable&&this.listeners[j].onAfterRender();
            }
        }
    }
  this.tHandle=requestAnimationFrame(Game.prototype.mainloop.bind(this));
    //Game.prototype.render.apply(this);
    if(flag||tflag){
        this.gstop();
    }
}

//游戏结束
Game.prototype.gstop=function(){
    cancelAnimationFrame(this.tHandle);
    this.removeListener(new FrameListener("afterRender"));
    console.log("game over");
    console.log(sessionStorage.score);
    this.scene.clear();
    this.scene.drawEnd();

    loadXMLDoc(url);
    $("userInput").style.display="none";
    $("userShow").style.display="";
    var self=this;
    document.onkeydown=function(e){
        if(e.keyCode==13){
            self.ginit.apply(self);
        }
    }  
}

//添加侦听器
Game.prototype.addListener=function(ln){
    this.listeners.push(ln);
}
//清除所有侦听器
Game.prototype.removeListener=function(ln){
    this.listeners.length=0;
}
/**
 * FrameState类
 */
//FrameState类用于监测运行帧数和时间
function FrameState(){
    this.currFrame=0;
    this.currTime=0;
    this.sTime=new Date();
    this.sFrame=0;
}

FrameState.prototype={
    fstart:function(){
        this.currFrame=0;
        this.currTime=0;
        this.sTime=0;
        this.sFrame=0;
    },
    fupdate:function(){
        this.currFrame++;
        var fTime=new Date();
        if(fTime-this.sTime>1000){
            this.currTime++;
            this.sTime=fTime;
            this.sFrame=0;
        }else{
          this.sFrame++;
        }
    }
}
/**
 * GameListener类
 */
//侦听器类定义
function GameListener(param){
    this.enable=true;
    this.onBeforeRender=param["beforeRender"]||this.onBeforeRender;
    this.onAfterRender=param["afterRender"]||this.onAfterRender;
}

GameListener.prototype.onBeforeRender=function(){
    return true;
}
GameListener.prototype.onAfterRender=function(){
    return true;
}
/**
 * FrameListener类
 */
//FrameListener类，帧状态侦听器
function FrameListener(){
    GameListener.apply(this,arguments);//继承父类GameListener的非函数属性和方法
    this.f=new FrameState();
    this.f.fstart();
}
FrameListener.prototype=GameListener.prototype;//继承父类的其他属性和方法
FrameListener.prototype.onAfterRender=function(){
    //改写父类方法
    this.f.fupdate();
    var ctx=$("can").getContext("2d");
    var lt=20;
    ctx.font="20px 黑体";
    ctx.fillStyle="rgba(250,211,211,0.9)";
    if(this.f.currTime<=lt){
        ctx.fillText("Time:"+this.f.currTime+"s/"+lt+"s",100,50);
        ctx.fillRect(40,80,(lt-this.f.currTime)*10,6);    //进度条
        return false;
    }else{
        return true;
    }
}
/**
 * Scene类,游戏场景
 */
function Scene(){
  //场景画布属性
    this.can=$("can");
    this.ctx=this.can.getContext("2d");
    this.width=this.can.width;
    this.height=this.can.height;
    this.x=0;
    this.y=0;
    //场景背景图片
    this.bgImage=new Image();
    this.bgReady=false;
    //英雄角色图片
    this.heroReady=false;
    this.heroImage=new Image();
    //怪兽图片
    this.monsterReady=false;
    this.monsterImage=new Image();
    this.monReady=false;
    this.monImage=new Image();
    //游戏音效
    this.bgSound=new Audio();
    this.bgSoundReady=false;
    this.killSound=new Audio();
    this.killSoundReady=false;
    this.winSound=new Audio();
    this.winSoundReady=false;
    this.loseSound=new Audio();
    this.loseSoundReady=false;
    //hero,monster对象
    this.hero={
        x:0,
        y:0,
        speed:5
    };

    this.monsters=new Array(0);
}

Scene.prototype={
    //场景初始化
    sinit:function(){
        if(this.bgImage.complete){
            this.bgReady=true;
        }else{
            this.bgImage.onload=function(){
                this.bgReady=true;
            }
        };this.bgImage.src="images/bg.png";
        //hero图片
        if(this.heroImage.complete){
            this.heroReady=true;
        }else{
            this.heroImage.onload=function(){
                this.heroReady=true;
            }
        };this.heroImage.src="images/hero.png";
        //monster图片
        if(this.monsterImage.complete){
            this.monsterReady=true;
        }else{
            this.monsterImage.onload=function(){
                this.monsterReady=true;
            }
        };this.monsterImage.src="images/monster.png";
        //碰撞后
        if(this.monImage.complete){
            this.monReady=true;
        }else{
            this.monImage.onload=function(){
                this.monReady=true;
            }
        };this.monImage.src="images/monsters.png";
        //设置画布样式
        this.ctx.textAlign="center";
        this.ctx.textBaseline="top";
        this.catchs=0;
        this.k=20;

        this.bgSound.src="images/bgsound.mp3";
        this.killSound.src="images/kill.mp3";
        this.winSound.src="images/good.mp3";
        this.loseSound.src="images/default.mp3";
    },
    //场景重置
    reset:function(){
        //重置场景中各个对象的位置
        //this.clear();
        if(this.bgReady){
            this.ctx.drawImage(this.bgImage,0,0,this.width,this.height);
        }
        this.monsters.length=0;
        this.hero.x=this.width/2;
        this.hero.y=this.height/2;

        var n=Math.round(Math.random()*5)+1;
        for(var i=0;i<n;i++){
            var m=new MonsterObj();
            m.update();
            m.x=35+(Math.random()*(this.width-70));
            m.y=35+(Math.random()*(this.height-70));
            m.sw=this.width-50;
            m.sh=this.height-50;
            this.monsters.push(m);
        }
    },
    //设置场景位置
    setPos:function(x,y){
        this.x=x;
        this.y=y;
    },
    //设置场景大小
    setSize:function(w,h){
        this.width=w;
        this.height=h;
    },
    //更新场景
    update:function(key){
        //根据游戏进程更新场景数据
        if(key==37){
            this.hero.x-=this.hero.speed;
        }
        if(key==38){
            this.hero.y-=this.hero.speed;
        }
        if(key==39){
            this.hero.x+=this.hero.speed;
        }
        if(key==40){
            this.hero.y+=this.hero.speed;
        }
        if(this.hero.x<0){
            this.hero.x=this.width;
        }else if(this.hero.x>this.width){
            this.hero.x=0;
        }
        if(this.hero.y<0){
            this.hero.y=this.height;
        }else if(this.hero.y>this.height){
            this.hero.y=0;
        }

        if(key>=37&&key<=40){
            for(var i=0;i<this.monsters.length;i++){
                if(this.monsters[i].visable){
                    this.monsters[i].moveStep();
                }
            }
        }
        //碰撞检测
        for(var i=0;i<this.monsters.length;i++){
            if(this.hero.x<=(this.monsters[i].x+35)&&this.hero.y<=(this.monsters[i].y+35)
                &&this.monsters[i].x<=(this.hero.x+35)&&this.monsters[i].y<=(this.hero.y+35)){
                if(this.monsters[i].visable){
                    this.catchs++;
                    this.monsters[i].visable=false;
                    sessionStorage.score=this.catchs*3;
                }
            }
        }

        if(this.catchs==this.monsters.length){
            if(this.k==0){
                return true;
            }else{
                this.k--;
                return false;
            }  
        }else{
            return false;
        }
    },
    //渲染场景
    render:function(){
        this.clear();
        this.bgSound.play();
        if(this.bgReady){
            this.ctx.drawImage(this.bgImage,0,0,this.width,this.height);
        }
        this.ctx.font="44px 黑体";
        this.ctx.fillStyle="rgba(250,250,250,0.5)";
        this.ctx.fillText("running",this.width/2,this.height/2);
        this.ctx.font="20px 黑体";
        this.ctx.fillStyle="rgba(250,211,211,0.9)";
        this.ctx.fillText("Catchs:"+this.catchs+"/"+this.monsters.length,this.width-100,this.height-550);
        this.ctx.fillText("Score:"+sessionStorage.score,this.width-115,this.height-530);
        this.ctx.fillText("User:"+sessionStorage.user,this.width-100,this.height-510);

        
        if(this.heroReady){
            this.ctx.drawImage(this.heroImage,this.hero.x,this.hero.y);
        }
        if(this.monsterReady){
            for(var i=0;i<this.monsters.length;i++){
                if(this.monsters[i].visable){
                    this.ctx.drawImage(this.monsterImage,this.monsters[i].x,this.monsters[i].y);
                }else{
                    if(this.monsters[i].life>0){
                        this.ctx.drawImage(this.monImage,this.monsters[i].x,this.monsters[i].y);
                        this.killSound.play();
                        this.monsters[i].life--;
                    }
                }
            }
        }
    },
    //清除场景
    clear:function(){
        this.ctx.restore();
        this.ctx.clearRect(0,0,this.width,this.height);
    },
    drawBegin:function(){
        //this.bgSound.play();
        this.clear();
        if(this.bgReady){
            this.ctx.drawImage(this.bgImage,0,0,this.width,this.height);
        }
        this.ctx.font="40px 黑体";
        this.ctx.fillStyle="yellow";
        this.ctx.fillText("Game Start",this.width/2,this.height/2-50);
        this.ctx.font="20px 黑体";
        this.ctx.fillStyle="rgba(250,250,250,1)";
        this.ctx.fillText("Press <SPACE> to Start...",this.width/2,this.height/2);
        this.ctx.fillText("↑:Up  ↓:Down  ←:Left  →:Right",this.width/2,this.height/2+30);
    },
    drawEnd:function(){
        this.bgSound.pause();
        if(this.bgReady){
            this.ctx.drawImage(this.bgImage,0,0,this.width,this.height);
        }
        this.ctx.font="40px 黑体";
        this.ctx.fillStyle="yellow";
        this.ctx.fillText("Game Over",this.width/2,this.height/2-50);
        this.ctx.font="20px 黑体";
        this.ctx.fillStyle="rgba(250,250,250,1)";
        this.ctx.fillText("Catchs:"+this.catchs+"/"+this.monsters.length,this.width/2,this.height/2);
        if(this.catchs>=(this.monsters.length/2)){
            this.ctx.fillStyle="#FFAEB9";
            this.ctx.font="20px 黑体";
            this.ctx.fillText("Well Done,fighting!",this.width/2,this.height/2+30);
            this.winSound.play();
        }else{
            this.ctx.fillStyle="#FFAEB9";
            this.ctx.fillText("Too Low,keep trying!",this.width/2,this.height/2+30);
            this.loseSound.play();
        }
        this.ctx.fillStyle="rgba(250,250,250,1)";
        this.ctx.fillText("Press <ENTER> to Continue...",this.width/2,this.height/2+60);
        sessionStorage.score=this.catchs*3;
    }
}
 /**
 * MonsterObj类
 */
function MonsterObj(name){
    this.name=name;
    this.x=0;
    this.y=0;
    this.w=0;    //对象的宽度和高度
    this.h=0;
    this.dx=0;   //移动速度
    this.dy=0;
    this.vx=0;   //移动加速度
    this.vy=0;
    this.visable=true;
    this.sw;     //移动的范围
    this.sh;
    this.life=20;
}

MonsterObj.prototype.moveStep=function(){
    this.dx+=this.vx;
    this.dy+=this.vy;
    if(this.x<this.w||this.x>this.sw-this.w){
        this.dx=-this.dx;
    }
    if(this.y<this.h||this.y>this.sh-this.h){
        this.dy=-this.dy;
    }
    this.x+=this.dx;
    this.y+=this.dy;

    if(this.x>this.sw){
        this.x=0;
    }else if(this.x<0){
        this.x=this.sw;
    }
    if(this.y>this.sh){
        this.y=0;
    }else if(this.y<0){
        this.y=this.sh;
    }
}

MonsterObj.prototype.update=function(){
    this.dx=Math.random()*20-10;
    this.dy=Math.random()*20-10;
    //this.vx=Math.random()*10-5;
    //this.vy=Math.random()*10-5;
    this.vx=0;
    this.vy=0;
}
 

