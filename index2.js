function start() {
  const canvas = document.querySelector("#canvas");
  const ctx = canvas.getContext("2d");

  const scaleFactor = 1.5; // Коэффициент увеличения

  const imgUrl = "https://i.ibb.co/Q9yv5Jk/flappy-bird-set.png";
  const img = new Image();
  img.src = "bird.png";

  //инициализация констант

  const SPEED = 3.1 * scaleFactor; // Увеличиваем скорость
  const GRAVITY = 0.5 * scaleFactor; // Увеличиваем гравитацию
  const FLAP = -8 * scaleFactor; // Увеличиваем подъем при нажатии
  const SIZE = [34, 24]; // Увеличиваем размеры птицы
  let BestScore;
  let gameOver = false;
  let score = 0;
  if (localStorage.getItem("BestScore") === null) {
    localStorage.setItem("BestScore", 0);
  }

  class Background {
    constructor() {
      this.index = 0;
    }

    render() {
      if (!bird.isFalling) {
        this.index += 0.3;
      }
      const backgroundX = -((this.index * SPEED) % canvas.width);

      ctx.drawImage(
        img,
        0,
        0,
        canvas.width / scaleFactor,
        canvas.height / scaleFactor,
        backgroundX + canvas.width,
        0,
        canvas.width,
        canvas.height
      );

      ctx.drawImage(
        img,
        0,
        0,
        canvas.width / scaleFactor,
        canvas.height / scaleFactor,
        backgroundX,
        0,
        canvas.width,
        canvas.height
      );
    }
  }

  class Bird {
    constructor() {
      this.x = canvas.width / 2 - SIZE[0] / 2;
      this.y = 200 * scaleFactor;
      this.width = SIZE[0] * scaleFactor;
      this.height = SIZE[1] * scaleFactor;
      this.speedY = 0;
      this.isFalling = false;
    }

    flap() {
      if (!this.isFalling) this.speedY = FLAP;
    }

    update() {
      if (this.isFalling) {
        this.speedY += GRAVITY;
        this.y += this.speedY;
        return;
      }

      this.speedY += GRAVITY;
      this.y += this.speedY;

      if (this.y + SIZE[1] > canvas.height) {
        this.y = canvas.height - SIZE[1];
        this.speedY = 0;
        gameOver = true;
      }
      if (this.y < 0) {
        this.y = 0;
        this.speedY = 0.5;
      }
    }

    render() {
      const birdPic = {
        x: 288,
        y: Math.floor((background.index % 9) / 3) * SIZE[1],
        width: SIZE[0],
        height: SIZE[1],
      };
      if (this.isFalling) {
        this.birdPic = {
          x: 288,
          y: 1 * SIZE[1],
          width: SIZE[0],
          height: SIZE[1],
        };
      }

      //вычилим угол поворота
      let rotation = Math.min(Math.PI / 6, this.speedY / 20);
      if (this.isFalling) {
        rotation = Math.PI / 2;
      }
      //сохранение ситтемы координат
      ctx.save();
      ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
      ctx.rotate(rotation);
      ctx.drawImage(
        img,
        birdPic.x,
        birdPic.y,
        birdPic.width,
        birdPic.height,

        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );
      ctx.restore();
    }

    getCoords() {
      return {
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
      };
    }
  }

  let pipes = [];
  class Pipe {
    constructor() {
      this.pipePicUp = {
        x: 288,
        y: 71,
        width: 52,
        height: 322,
      };

      this.pipePicDown = {
        x: 340,
        y: 71,
        width: 52,
        height: 322,
      };
      this.scoreIcrasesd = false;
      this.width = SIZE[1] * 2 * 2; // Увеличиваем ширину трубы
      this.gap = SIZE[1] * 5 * scaleFactor; // Увеличиваем зазор между трубами
      this.x = canvas.width;
      this.speed = SPEED;

      const minTopHeight =
        canvas.height - (this.pipePicDown.height * scaleFactor + this.gap);
      const maxTopHeight = this.pipePicUp.height * scaleFactor;

      // Случайная высота для верхней трубы с учётом минимального значения
      this.heightRandom =
        Math.floor(Math.random() * (maxTopHeight - minTopHeight)) +
        minTopHeight;

      this.yTop = this.heightRandom - this.pipePicUp.height * scaleFactor;
      this.yBottom = this.heightRandom + this.gap;
    }

    update() {
      if (gameOver) return;
      const birdCanv = bird.getCoords();
      if (
        birdCanv.x + birdCanv.width > this.x &&
        birdCanv.x <= this.x + this.pipePicUp.width * scaleFactor
      ) {
        if (
          bird.y < this.yTop + this.pipePicUp.height * scaleFactor || // Верхняя труба
          bird.y + bird.height > this.yBottom // Нижняя труба
        ) {
          bird.isFalling = true;
          bird.speedY = 3;
          renderFall();
        }
      }

      if (birdCanv.x > this.x + this.pipePicUp.width && !bird.isFalling) {
        if (!this.scoreIcrasesd) {
          score++;
          this.scoreIcrasesd = true;
          if (score > localStorage.getItem("BestScore")) {
            localStorage.setItem("BestScore", score);
          }
        }
      }

      this.x -= this.speed;
    }

    render() {
      ctx.drawImage(
        img,
        this.pipePicUp.x,
        this.pipePicUp.y,
        this.pipePicUp.width,
        this.pipePicUp.height,
        this.x,
        this.yTop,
        this.width,
        this.pipePicUp.height * scaleFactor
      );

      ctx.drawImage(
        img,
        this.pipePicDown.x,
        this.pipePicDown.y,
        this.pipePicDown.width,
        this.pipePicDown.height,
        this.x,
        this.yBottom,
        this.width,
        this.pipePicDown.height * scaleFactor
      );
    }
  }

  const background = new Background();
  const bird = new Bird();

  const render = () => {
    if (bird.isFalling) return;
    background.render();

    let pipesToRemove = [];

    pipes.forEach((pipe, index) => {
      pipe.update();

      if (pipe.x + pipe.width < 0) {
        pipesToRemove.push(index);
      }

      pipe.render();
    });

    pipesToRemove.forEach((index) => {
      pipes.splice(index, 1);
    });
    bird.update();
    bird.render();

    ctx.fillStyle = "white";
    ctx.font = `${50 * scaleFactor}px 'Jersey 10'`;
    ctx.textAlign = "left";

    ctx.lineWidth = 8;
    ctx.strokeStyle = "black";
    ctx.strokeText(`${score}`, canvas.width / 2 - 10, canvas.height / 5);
    ctx.fillText(`${score}`, canvas.width / 2 - 10, canvas.height / 5);

    if (gameOver) {
      background.render();
      showGameOverScreen();
    } else {
      window.requestAnimationFrame(render);
    }
  };
  const renderFall = () => {
    if (bird.isFalling) {
      background.render();
      pipes.forEach((pipe) => pipe.render()); // Рендеринг труб
      bird.update();
      bird.render();

      if (bird.y + bird.height < canvas.height) {
        window.requestAnimationFrame(renderFall);
      } else {
        gameOver = true;
        window.cancelAnimationFrame(renderFall);
        showGameOverScreen();
      }
    }
  };

  const spawnPipes = () => {
    setInterval(() => {
      pipes.push(new Pipe());
    }, 1500);
  };

  spawnPipes();

  //экран конца игры

  const showGameOverScreen = () => {
    ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ctx.fillStyle = "black";
    // ctx.fillRect(0, 100 * scaleFactor, canvas.width, 183 * scaleFactor);
    ctx.lineWidth = 10;
    ctx.strokeStyle = "black";
    ctx.fillStyle = "white";
    ctx.font = `${70 * scaleFactor}px 'Jersey 10'`;
    ctx.textAlign = "center";
    ctx.strokeText("Game Over", canvas.width / 2, 170 * scaleFactor);
    ctx.fillText("Game Over", canvas.width / 2, 170 * scaleFactor);

    ctx.font = `${24 * scaleFactor}px 'Tiny5'`;
    ctx.lineWidth = 8;

    ctx.strokeText(`Score: ${score}`, canvas.width / 2, 250 * scaleFactor);
    ctx.fillText(`Score: ${score}`, canvas.width / 2, 250 * scaleFactor);

    ctx.strokeText("Press R to Restart", canvas.width / 2, canvas.height - 50);
    ctx.fillText("Press R to Restart", canvas.width / 2, canvas.height - 50);

    ctx.strokeText(
      `Best Score: ${localStorage.getItem("BestScore")}`,
      canvas.width / 2,
      290 * scaleFactor
    );
    ctx.fillText(
      `Best Score: ${localStorage.getItem("BestScore")}`,
      canvas.width / 2,
      290 * scaleFactor
    );
  };

  window.addEventListener("keydown", () => bird.flap());

  const restartGame = () => {
    if (gameOver) {
      gameOver = false;
      score = 0;
      bird.isFalling = false;
      bird.y = 200 * scaleFactor;
      bird.speedY = 0;
      background.index = 0;
      pipes = [];
      render();
    }
  };

  window.addEventListener("keydown", (e) => {
    if (e.key === "r") {
      restartGame();
    }
  });

  img.onload = () => {
    preloadFonts(); // Предварительная загрузка шрифтов
    render(); // Запуск игры
  };

  const preloadFonts = () => {
    ctx.font = `${70 * scaleFactor}px 'Jersey 10'`;
    ctx.fillText(".", -1000, -1000); // Рисуем текст за пределами видимой области

    ctx.font = `${24 * scaleFactor}px 'Tiny5'`;
    ctx.fillText(".", -1000, -1000); // Рисуем текст за пределами видимой области
  };
}

addEventListener("DOMContentLoaded", start);
