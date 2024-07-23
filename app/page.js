"use client";

import next from "next";
import Image from "next/image";
import { useEffect, useState } from "react";


var EmptyItem = {
  Amount: 0,
  Points: 0,
  isFruit: false,
  icon: "❌",
}

var Bomb = {
  Amount: 15,
  Points: 0,
  isFruit: false,
  icon: "💣",
  //onMine: (state) => {},
}

var Mango = {
  Amount: 10,
  Points: 300,
  isFruit: true,
  icon: "🥭",
  //onMine: (state) => {},
}

var Apple = {
  Amount: 8,
  Points: 100,
  isFruit: true,
  icon: "🍎",
  //onMine: (state) => {/* plus 100 for every apple */},
}

var Watermelon = {
  Amount: 4,
  Points: 100,
  isFruit: true,
  icon: "🍉",
  //onMine: (state) => {/* blows up adjacent fruit for half value*/},
}

var Pomegrante = {
  Amount: 4,
  Points: 200,
  isFruit: true,
  icon: "🔴",
  //onMine: (state) => {/* 1.5x next dig*/},
}

var Coconut = {
  Amount: 3,
  Points: 200,
  isFruit: true,
  icon: "🥥",
  //onMine: (state) => {/* prevents bomb*/},
}

var Cherry = {
  Amount: 2,
  Points: 200,
  isFruit: true,
  icon: "🍒",
  //onMine: (state) => {/* second cherry gives 500*/},
}

var Durian = {
  Amount: 2,
  Points: 800,
  isFruit: true,
  icon: "🍈",
  //onMine: (state) => {/* decreases next dig by .5x*/},
}

var Dragonfruit = {
  Amount: 1,
  Points: 1200,
  isFruit: true,
  icon: "🍓",
  //onMine: (state) => {/* decreases next dig by .5x*/},
}


export default function Home() {

  function EmptyTable() {
    var a = [];
    for(var x = 0; x < 7; x++) {
      var b = [];
      for(var y = 0; y < 7; y++) {
        b.push(structuredClone(EmptyItem));
      }
      a.push(b);
    }
    return a;
  }

  function RandomPosition(t) {
    const x = Math.floor(Math.random() * 7);
    const y = Math.floor(Math.random() * 7);
    if(t[x][y].icon !== EmptyItem.icon) {
      return RandomPosition(t);
    }
    return [x, y]
  }

  function GenerateTable() {
    var t = EmptyTable();
    const items = [Bomb, Mango, Apple, Watermelon, Pomegrante, Coconut, Cherry, Durian, Dragonfruit];
    items.forEach((item) => {
      for(var i = 0; i < item.Amount; i++) {
        const pos = RandomPosition(t);
        t[pos[0]][pos[1]] = structuredClone(item);
      }
    })

    setTable(t)
    setPoints(0);
    setMoves(15);
  }

  function GetValidPositions(x, y) {
    const pos = [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]];
    var vpos = []
    pos.forEach((p) => {
      if(typeof table[x+p[0]][y+p[1]] === "undefined") {
        return;
      }
      vpos.push([x+p[0], y+p[1]]);
    });

    return vpos;
  }


  function Mine(x, y) {
    setBlockBomb(false);
    setNextMultiplier(1);

    var item = table[x][y];

    // bombs destroy nerby fruits
    console.log(item)
    if(item.isFruit) {
      var fruitPoints = item.Points;
      if(item.icon === Apple.icon) {
        setApples((oldApples) => oldApples+1);
        fruitPoints = 100*apples;
      } else if(item.icon === Watermelon.icon) {
        //blows udjacent fruitPoints;
      } else if(item.icon === Pomegrante.icon) {
        setNextMultiplier(1.5);
      } else if(item.icon === Coconut.icon) {
        setBlockBomb(true);
      } else if(item.icon === Cherry.icon) {
        if(cherry) {
          fruitPoints === 500;
        } else {
          setCherry(true);
        }
      } else if(item.icon === Durian.icon) {
        setNextMultiplier(.5);
      } else if(item.icon === Dragonfruit.icon) {
        setNextMultiplier(.5);
      }

      var points = fruitPoints * oldNextMultiplier;
      setPoints((oldPoints) => oldPoints + points);

      const newTable = structuredClone(table);
      newTable[x][y] = EmptyItem
      setTable(newTable)
    } else {
      if(item.icon === Bomb.icon) {
        const p = GetValidPositions(x,y);
        var toDel = [[x, y]]
        p.forEach((i) => {
          if(table[i[0]][i[1]].isFruit) {
            toDel.push(i)
          }
        })

        const newTable = structuredClone(table);
        toDel.forEach(d => {
          newTable[d[0]][d[1]] = EmptyItem
        })
       
        setTable(newTable)
      }
    }

    setOldNextMultiplier(nextMultiplier);
    setNextMultiplier(1);
    setMoves((oldMoves) => oldMoves-1)
  } 


  const[table, setTable] = useState(EmptyTable())

  const[points, setPoints] = useState(0);
  const[moves, setMoves] = useState(15);
  const[nextMultiplier, setNextMultiplier] = useState(1);
  const[oldNextMultiplier, setOldNextMultiplier] = useState(1);
  const[apples, setApples] = useState(1);
  const[blockBomb, setBlockBomb] = useState(false);
  const[cherry, setCherry] = useState(true);

  const[hide, setHide] = useState(true);


  useEffect(() => {
    GenerateTable();
  }, [])

  return (
    
    <div className="min-h-screen w-screen flex flex-col justify-center items-center">
      <button className="bg-yellow-200 p-3 mb-2 rounded-lg" onClick={GenerateTable}>Regenerate Table</button>
      <button className="bg-yellow-200 p-3 mb-2 rounded-lg" onClick={()=>setHide((h)=>!h)}>Toggle Hiding</button>
      <p>Points: {points} | Multiplier: {oldNextMultiplier} | Moves: {moves}</p>

      <div className="w-96 h-96 bg-slate-400 p-4 rounded-lg flex flex-col justify-evenly">
        {
          table.map((row, x) => <div className="w-full flex flex-row justify-evenly">
            {
              row.map((item, y) => <button className="bg-white rounded-lg w-12 h-12" onClick={()=>{Mine(x, y)}}>{item.icon !== EmptyItem.icon ? (hide ? "?" : item.icon) : EmptyItem.icon}</button>)
            }
            </div>
          )
        }
      </div>
    </div>
  );
}
