
  /*------------定义变量------------*/
    let chessCoordinateArr = [] // 记录棋盘落子 -1 未落,  黑 0,  白 1
     ,whosTurn = true           // 轮到谁  0，黑 1，白 
     ,isCanUndo = false          // 是否能悔棋
     ,isCanTodo = false     // 是否能撤销悔棋
     ,isByDom = true        // 用Dom还是Canvas
     ,chessboard = document.querySelector(".chessboard")
     ,chessboardContainer = document.querySelector(".chessboardContainer")
     ,canvas = document.querySelector("canvas")
     ,btnUndo = document.querySelector("#undo")
     ,btnTodo = document.querySelector("#todo")
     ,btnChange = document.querySelector("#change")
     ,h1 = document.querySelector("h1")
     ,lastChessCoordinate = {i:-1, j:-1}
     ,defineObj = {}
     ,dis = 40
     ,size = 17
     ,border = 20;
  /*------------定义变量------------*/

  /*------------定义属性------------*/
    Object.defineProperty(defineObj, "isCanUndo", {
      set:function(value) {
        if (value) {
          btnUndo.removeAttribute("disabled");
        } else {
          btnUndo.setAttribute("disabled", "disabled");
        };

        isCanUndo = value;
      },
      get:function() {
        return isCanUndo;
      }
    })

    Object.defineProperty(defineObj, "isCanTodo", {
      set:function(value) {
        if (value) {
          btnTodo.removeAttribute("disabled");
        } else {
          btnTodo.setAttribute("disabled", "disabled");
        };

        isCanTodo  = value;
      },
      get:function() {
        return isCanTodo;
      }
    })

    Object.defineProperty(defineObj, "isByDom", {
      set:function(value) {
        chessboardContainer.classList.toggle("hidden");
        canvas.classList.toggle("hidden");
        isByDom  = value;
      },
      get:function() {
        return isByDom;
      }
    })  

    Object.defineProperty(defineObj, "whosTurn", {
      set:function(value) {
        if (value) {
          h1.innerText = "白";
          h1.classList.remove("labelBlack");
          h1.classList.add("labelWhite");
        } else {
          h1.innerText = "黑";
          h1.classList.add("labelBlack");
          h1.classList.remove("labelWhite");        
        };

        whosTurn  = value;
      },
      get:function() {
        return whosTurn;
      }
    })

    defineObj.isCanUndo = isCanUndo;
    defineObj.isCanTodo = isCanTodo;
    defineObj.isByDom = isByDom;
    defineObj.whosTurn = whosTurn;
  /*------------定义属性------------*/

  /*------------事件------------*/
    btnUndo.addEventListener("click", (evt) => {
      if (defineObj.isCanUndo) {
        defineObj.isCanUndo = false;
        defineObj.isCanTodo = true;
        defineObj.whosTurn = !defineObj.whosTurn;
        chessCoordinateArr[lastChessCoordinate.i][lastChessCoordinate.j] = -1;

        if (defineObj.isByDom) {
          let lastChessGrid = document.querySelector(`#_${lastChessCoordinate.i}_${lastChessCoordinate.j}`);
          lastChessGrid.classList.remove( defineObj.whosTurn ? "white" : "black");
        } else {
          recoverChessByCanvas();
        } 
      }
    })

    btnTodo.addEventListener("click", (evt) => {
      if (defineObj.isCanTodo) {
        defineObj.isCanTodo = false;
        defineObj.isCanUndo = true;

        if (defineObj.isByDom) {
          let lastChessGrid = document.querySelector(`#_${lastChessCoordinate.i}_${lastChessCoordinate.j}`);
          lastChessGrid.classList.add(defineObj.whosTurn ? "white" : "black");        
        } else {  
          drawChessByCanvas(lastChessCoordinate.i, lastChessCoordinate.j, defineObj.whosTurn);     
        }

        chessCoordinateArr[lastChessCoordinate.i][lastChessCoordinate.j] = (+defineObj.whosTurn);
        defineObj.whosTurn = !defineObj.whosTurn;
      }    
    })

    btnChange.addEventListener("click", (evt) => {
      defineObj.isByDom = !defineObj.isByDom;

      if(defineObj.isByDom) {
        for (var i = 0; i < size; i++) {
          for (var j = 0; j < size; j++) {
            let chessGrid = null;
            switch(chessCoordinateArr[i][j]) {
              case 0:
                chessGrid = document.querySelector(`#_${i}_${j}`);
                chessGrid.classList.add("black");
                break;
              case 1:
                chessGrid = document.querySelector(`#_${i}_${j}`);
                chessGrid.classList.add("white");            
                break; 
              case -1:
                chessGrid = document.querySelector(`#_${i}_${j}`);
                chessGrid.classList.remove("black");     
                chessGrid.classList.remove("white");                
                break;                     
              default:
                break;
            }                     
          }
        }
      } else {
        recoverChessByCanvas();
      }    
    })

    chessboard.addEventListener("mousedown", (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      let chessGrid = evt.target;
      if (chessGrid !== chessboard) {
        let chessCoordinate = chessGrid.dataset.coordinate.split(",")
          ,i = chessCoordinate[0]
          ,j = chessCoordinate[1];

        playChess(i, j);
      }
    })

    canvas.addEventListener("mousedown", (evt) => {
      let canvasBoundingClientRect = canvas.getBoundingClientRect()
      ,canvasLeft = canvasBoundingClientRect.left
      ,canvasTop = canvasBoundingClientRect.top  
      ,cvsX = evt.pageX - canvasLeft
      ,cvsY = evt.pageY - canvasTop;

      if ( cvsX < border || cvsX > dis * size + dis / 2 || cvsY < border || cvsY > dis * size + dis / 2) {
        return 
      };

      // 需要颠倒一下
      let i = Math.round(cvsY / dis) - 1
        ,j = Math.round(cvsX / dis) - 1;

      playChess(i, j);
    })  
  /*------------事件------------*/

  /*------------初始化------------*/
    initChessboard();

    function initChessboard() {
      initChessCoordinateArr();
      drawChessborad();
      drawChessboardByCanvas();
    }

    function initChessCoordinateArr() {
      for (var i = 0; i < size; i++) {
        chessCoordinateArr[i] = [];
        for (var j = 0; j < size; j++) {
          chessCoordinateArr[i][j] = -1;
        }
      }
    }

    function drawChessborad() {
      chessboard.innerHTML = "";
      for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
          let div = document.createElement("div");
          div.classList.add("chessGrid");
          div.dataset.coordinate = `${i},${j}`;
          div.id = `_${i}_${j}`;
          chessboard.appendChild(div);
        }
      }    
    }

    function drawChessboardByCanvas() {
      let lengthOfSide = dis * size + border * 2
        ,ctx = canvas.getContext("2d");

      canvas.width = lengthOfSide;
      canvas.height = lengthOfSide;
      ctx.lineWidth = 1;

      for (var i = 1; i < size + 1; i++) {
        ctx.moveTo(border + dis / 2, i * dis);
        ctx.lineTo(lengthOfSide - border - dis / 2, i * dis);
        ctx.stroke();
        ctx.moveTo(i * dis, border + dis / 2);
        ctx.lineTo(i * dis, lengthOfSide - border - dis / 2);
        ctx.stroke();      
      }
    }  
  /*------------初始化------------*/

  /*------------下棋流程------------*/
    function playChess(i, j) {
      if (chessCoordinateArr[i][j] === -1) {
        chessCoordinateArr[i][j] = (+defineObj.whosTurn);       

        changeChessGrid(i, j);

        if (isWin(+i, +j, +defineObj.whosTurn)) {
          let whosTurn4Callback = defineObj.whosTurn;
          setTimeout(() => {
            alert((whosTurn4Callback ? "白" : "黑") + "赢了！重开！");
            restart();
          }, 100);
        }

        defineObj.whosTurn = !defineObj.whosTurn;
        defineObj.isCanUndo = true;
        defineObj.isCanTodo = false;
        lastChessCoordinate.i = i;
        lastChessCoordinate.j = j;
      } else {
        console.warn("该格子已被下");
      }
    }

    function changeChessGrid(i, j) {
      if (defineObj.isByDom) {
        let id = `_${i}_${j}`
          ,chessGrid = document.querySelector("#" + id);
        if (defineObj.whosTurn) {
          chessGrid.classList.add("white");
        } else {
          chessGrid.classList.add("black");
        }        
      } else {
        drawChessByCanvas(i, j, defineObj.whosTurn);
      }
    }

    function drawChessByCanvas(i, j, whiteOrblack) {
      let ctx = canvas.getContext("2d");
      ctx.fillStyle = whiteOrblack ? "white" : "black";
      ctx.beginPath();
      // 这里需要颠倒还原。
      ctx.arc((parseInt(j) + 1) * dis, (parseInt(i) + 1) * dis, dis/2, 0, 2*Math.PI);
      ctx.fill();
    }
  /*------------下棋流程------------*/

  /*------------判断胜负算法------------*/
    function isWin(i, j, standard) {
      return horizontal(i, j, standard) || vertical(i, j, standard) || rightSlant(i, j, standard) || leftSlant(i, j, standard);
    }

    function horizontal(i, j, standard) {
      let result = false
        ,count = 0;

      for (var n = j; n > -1; n--) {
        if (chessCoordinateArr[i][n] !== standard) {
          break;
        }
        count++;
      } 

      for (var n = j + 1; n < size; n++) {
        if (chessCoordinateArr[i][n] !== standard) {
          break;
        }
        count++;
      }

      if (count >= 5) {
        result = true;
      }
      
      return result;
    }

    function vertical(i, j, standard) {
      let result = false
        ,count = 0;

      for (var n = i; n > -1; n--) {
        if (chessCoordinateArr[n][j] !== standard) {
          break;
        }
        count++;
      } 

      for (var n = i + 1; n < size; n++) {
        if (chessCoordinateArr[n][j] !== standard) {
          break;
        }
        count++;
      }

      if (count >= 5) {
        result = true;
      }
      
      return result;
    }

    function rightSlant(i, j, standard) {
      let result = false
        ,count = 0;

      for (var n = i, m = j; n > -1 && m < size; n--, m++) {
        if (chessCoordinateArr[n][m] !== standard) {
          break;
        }
        count++;
      }

      for (var n = i + 1, m = j - 1; n < size && m > -1; n++, m--) {
        if (chessCoordinateArr[n][m] !== standard) {
          break;
        }
        count++;
      }

      if (count >= 5) {
        result = true;
      }

      return result;
    }

    function leftSlant(i, j, standard) {
      let result = false
        ,count = 0;

      for (var n = i, m = j; n > -1 && m > -1; n--, m--) {
        if (chessCoordinateArr[n][m] !== standard) {
          break;
        }
        count++;
      }

      for (var n = i + 1, m = j + 1; n < size && m < size; n++, m++) {
        if (chessCoordinateArr[n][m] !== standard) {
          break;
        }
        count++;  
      }

      if (count >= 5) {
        result = true;
      }

      return result;
    }
  /*------------判断胜负算法------------*/

  /*------------重置画布------------*/
    function recoverChessByCanvas() {
      drawChessboardByCanvas();
      for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
          switch(chessCoordinateArr[i][j]) {
            case 0:
              drawChessByCanvas(i, j, false);
              break;
            case 1: 
              drawChessByCanvas(i, j, true);         
              break; 
            case -1:              
              break;                     
            default:
              break;
          }                     
        }
      }    
    }  
  /*------------重置画布------------*/

  /*------------重开棋局------------*/
    function restart() {
      defineObj.isCanUndo = false;
      defineObj.isCanTodo = false;
      lastChessCoordinate = {i:-1, j:-1};
      initChessboard();
    }  
  /*------------重开棋局------------*/