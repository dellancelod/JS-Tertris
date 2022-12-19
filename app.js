document.addEventListener('DOMContentLoaded', ()=>{
    const grid = document.querySelector('.grid');
    let squares = Array.from(document.querySelectorAll('.grid div'));
    const scoreDisplay = document.querySelector('#score');
    const speedDisplay = document.querySelector('#speed');
    const startButton = document.querySelector('#start-button');
    const slider = document.getElementById("speed-slider");
    const width = 10
    let nextRandom = 0
    let gameSpeed = 1000
    let timerId
    let score = 0
    let colors = [
        'red',
        'blue',
        'magenta',
        'purple',
        'green'
    ]

    let rules = document.querySelector('.rules')

    rules.textContent = `Випадкові фігурки тетраміно падають зверху на прямокутне поле шириною 10 і висотою 20 клітин. 
    У польоті гравець може повертати фігурку на 90° стрілочкою вверх, а також переміщювати вліво та вправо відповідно. 
    Також можна «скидати» фігурку, тобто прискорювати її падіння стрілочкою вниз. 
    Фігурка летить до тих пір, поки не натрапить на іншу фігурку або на дно склянки. 
    Якщо при цьому заповнився горизонтальний ряд з 10 клітин, він пропадає і все, що вище за нього, 
    опускається на одну клітину. Додатково показується фігурка, яка слідуватиме після поточної — це підказка, 
    яка дозволяє гравцеві планувати дії. Гра закінчується, коли нова фігурка не може поміститися у склянку. 
    Гравець отримує очки за кожен заповнений ряд, тому ваше завдання - заповнювати ряди, 
    не заповнюючи саму склянку (по вертикалі) якомога довше, щоб таким чином отримати якомога більше очок.`

    document.getElementById('soundtrack').play()

    //The tetraminoes
    const lTetromino = [
        [1, width+1, width*2+1, 2],
        [width, width+1, width+2, width*2+2],
        [1, width+1, width*2+1, width*2],
        [width, width*2, width*2+1, width*2+2]
      ]

    const zTetromino = [
        [0,width,width+1,width*2+1],
        [width+1, width+2,width*2,width*2+1],
        [0,width,width+1,width*2+1],
        [width+1, width+2,width*2,width*2+1]
    ]
    
    const tTetromino = [
        [1,width,width+1,width+2],
        [1,width+1,width+2,width*2+1],
        [width,width+1,width+2,width*2+1],
        [1,width,width+1,width*2+1]
    ]
    
    const oTetromino = [
        [0,1,width,width+1],
        [0,1,width,width+1],
        [0,1,width,width+1],
        [0,1,width,width+1]
    ]
    
    const iTetromino = [
        [1,width+1,width*2+1,width*3+1],
        [width,width+1,width+2,width+3],
        [1,width+1,width*2+1,width*3+1],
        [width,width+1,width+2,width+3]
    ]

    const tetraminoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino]

    let currentPosition = 4
    let currentRotation = 0

    let random = Math.floor(Math.random()*tetraminoes.length)
    let current = tetraminoes[random][currentRotation]

    function control(e){
        if(e.keyCode === 37){
            moveLeft()
        }
        else if(e.keyCode === 38){
            rotate()
        }
        else if(e.keyCode === 39){
            moveRight()
        }
        else if(e.keyCode === 40){
            moveDown()
        }
    }

    slider.oninput = function() {
        gameSpeed = this.value;
        clearInterval(timerId)
        timerId = null
        console.log(gameSpeed)
        timerId = setInterval(moveDown, gameSpeed)

        if(gameSpeed == slider.min){
            speedDisplay.innerHTML = "x2"
        }
        if(gameSpeed == slider.max){
            speedDisplay.innerHTML = "x0.5"
        }
    } 

    function draw(){
        current.forEach(index => {
            squares[currentPosition + index].classList.add('tetromino')
            squares[currentPosition + index].style.backgroundColor = colors[random]
        })
    }
    
    function clear(){
        current.forEach(index => {
            squares[currentPosition + index].classList.remove('tetromino')
            squares[currentPosition + index].style.backgroundColor = ''
        })
    }

    function moveDown(){
        clear()
        currentPosition += width
        draw()
        freeze()
    }

    function freeze(){
        if(current.some(index => squares[currentPosition + index + width].classList.contains('taken'))){

            current.forEach(index => squares[currentPosition + index].classList.add('taken'))
            random = nextRandom
            nextRandom = Math.floor(Math.random() * tetraminoes.length)
            current = tetraminoes[random][currentRotation]
            currentPosition = 4

            draw()
            displayShape()
            addScore()
            gameOver()
        }
    }
    
    function moveLeft(){
        clear()
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)

        if(!isAtLeftEdge) currentPosition -= 1;

        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))){
            currentPosition += 1
        }

        draw()
    }

    function moveRight(){
        clear()

        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1)

        if(!isAtRightEdge) currentPosition += 1;

        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))){
            currentPosition -= 1
        }

        draw()
    }


    function rotate(){
        clear()
        currentRotation++
        if(currentRotation === current.length){
            currentRotation = 0
        }
        current = tetraminoes[random][currentRotation]
        checkRotation()
        draw()
    }

    ///FIX ROTATION OF TETROMINOS A THE EDGE 
    function isAtRight() {
        return current.some(index=> (currentPosition + index + 1) % width === 0)  
    }
    
    function isAtLeft() {
        return current.some(index=> (currentPosition + index) % width === 0)
    }
    function checkRotation(P){
        P = P || currentPosition       //get current position.  Then, check if the piece is near the left side.
        if ((P+1) % width < 4) {         //add 1 because the position index can be 1 less than where the piece is (with how they are indexed).     
          if (isAtRight()){            //use actual position to check if it's flipped over to right side
            currentPosition += 1    //if so, add one to wrap it back around
            checkRotatedPosition(P) //check again.  Pass position from start, since long block might need to move more.
            }
        }
        else if (P % width > 5) {
          if (isAtLeft()){
            currentPosition -= 1
          checkRotatedPosition(P)
          }
        }
      }

    //mini-grid
    const displayMiniGrid = document.querySelectorAll(".mini-grid div")
    const displayWidth = 4
    const displayIndex = 0

    const upNextTetrominoes = [
        [1, displayWidth + 1, displayWidth * 2 + 1, 2],
        [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1],
        [1, displayWidth, displayWidth + 1, displayWidth + 2],
        [0, 1, displayWidth, displayWidth + 1],
        [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1]
    ]
    
    function displayShape(){
        displayMiniGrid.forEach(square => {
            square.classList.remove('tetromino')
            square.style.backgroundColor = ''
        })
        upNextTetrominoes[nextRandom].forEach(index =>{
            displayMiniGrid[displayIndex + index].classList.add('tetromino')
            displayMiniGrid[displayIndex + index].style.backgroundColor = colors[nextRandom]
        })
    }

    startButton.addEventListener('click', () => {
        if(timerId){
            clearInterval(timerId)
            timerId = null
            document.removeEventListener('keyup', control)
        }
        else{
            document.addEventListener('keyup', control);
            draw()
            timerId = setInterval(moveDown, gameSpeed)
            nextRandom = Math.floor(Math.random() * tetraminoes.length)
            displayShape()
        }
    })

    function addScore(){
        for(let i = 0; i < 199; i += width){
            const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]

            if(row.every(index => squares[index].classList.contains('taken'))){
                score += 10;
                scoreDisplay.innerHTML = score
                row.forEach(index => {
                   squares[index].classList.remove('taken')
                   squares[index].classList.remove('tetromino')
                   squares[index].style.backgroundColor = ''
                })
                const squaresRemoved = squares.splice(i, width)

                squares = squaresRemoved.concat(squares)
                squares.forEach(cell => grid.appendChild(cell))
            }
        }
    }

    function gameOver(){
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))){
            scoreDisplay.innerHTML = ' end with score ' + score
            clearInterval(timerId)
            document.removeEventListener('keyup', control)
        }
    }
    
})