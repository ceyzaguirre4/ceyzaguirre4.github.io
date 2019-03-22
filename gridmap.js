var margin = { top: 0, right: 0, bottom: 0, left: 0 },
  width = window.innerWidth - margin.left - margin.right,
  height = window.innerHeight - margin.top - margin.bottom,
  centered,
  previousCentered,
  eventGrid,
  cellGrid,
  labelGrid,
  cellSize,
  subCellSize;

const categories_mapa = {
  1: "Arts & Culture",
  2: "Career & Business",
  3: "Cars & Motorcycles",
  4: "Community & Environment",
  5: "Dancing",
  6: "Education & Learning",
  7: "Topic",
  8: "Fashion & Beauty",
  9: "Fitness",
  10: "Food & Drink",
  11: "Games",
  12: "LGBT",
  13: "Movements & Politics",
  14: "Health & Wellbeing",
  15: "Hobbies & Crafts",
  16: "Language & Ethnic Identity",
  17: "Lifestyle",
  18: "Book Clubs",
  19: "Topics",
  20: "Movies & Film",
  21: "Music",
  22: "New Age & Spirituality",
  23: "Outdoors & Adventure",
  24: "Paranormal",
  25: "Parents & Family",
  26: "Pets & Animals",
  27: "Photography",
  28: "Religion & Beliefs",
  29: "Sci-Fi & Fantasy",
  30: "Singles",
  31: "Socializing",
  32: "Sports & Recreation",
  33: "Support",
  34: "Tech",
  35: "Fashion & Beauty",
  36: "Writing"
};

var categories = {
  "Arts & Culture": "red",
  "Career & Business": "green",
  "Cars & Motorcycles": "#a2b9bc",
  "Community & Environment": "#878f99",
  Dancing: "#6b5b95",
  "Education & Learning": "#6b5b95",
  Topic: "#6b5b95",
  Fitness: "#feb236",
  "Food & Drink": "#feb236",
  Games: "#feb236",
  LGBT: "#3e4444",
  "Movements & Politics": "#e3eaa7",
  "Health & Wellbeing": "#86af49",
  "Hobbies & Crafts": "red",
  "Language & Ethnic Identity": "#c94c4c",
  Lifestyle: "#3b3a30",
  "Book Clubs": "#1aff1a",
  Topics: "#1aff1a",
  "Movies & Film": "#e6e2d3",
  Music: "#666699",
  "New Age & Spirituality": "gold",
  "Outdoors & Adventure": "#b1cbbb",
  Paranormal: "#c1502e",
  "Parents & Family": "#d5f4e6",
  "Pets & Animals": "#2929a3",
  Photography: "#ff5050",
  "Religion & Beliefs": "#2929a3",
  "Sci-Fi & Fantasy": "#2929a3",
  Singles: "#2929a3",
  Socializing: "#f4e1d2",
  "Sports & Recreation": "#f18973",
  Support: "#b2b2b2",
  Tech: "blue",
  "Fashion & Beauty": "#e3e0cc",
  Writing: "brown"
};

var zoomLevel = 4;
var shrickLevelWidth = 1 / 5;
var shrickLevelHeight = 1;

var catsPerState = {};
var totalCatsState = {};

var myScale = d3.scaleLinear().range([0, 10]);

var svg = d3
  .select("#vis")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

// draw gridlines
var gridData;
[gridData, cellSize] = getGridData(12, 8, width, height);
cellGrid = svg
  .append("g")
  .attr("class", "cellGrid")
  // .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  .selectAll(".row")
  .data(gridData)
  .enter()
  .append("g")
  .attr("class", "row")
  .selectAll(".cell")
  .data(function(d) {
    return d;
  })
  .enter()
  .append("g")
  .attr("class", d => "cell" + " x" + d.x + " y" + d.y);
// .attr("transform", d => "translate(" + d.x + "," + d.y + ")")

d3.csv("/gridmapassets/cats_perstate.csv", stateData => {
  var stateOrderedData = {};
  stateData.forEach(row => {
    if (stateOrderedData[row.state]) {
      stateOrderedData[row.state].push(row);
    } else {
      stateOrderedData[row.state] = [row];
    }
  });

  d3.csv("/gridmapassets/grid.csv", data => {
    //console.log(data)

    // labelGrid overlays label on grid
    function drawSquares() {
      var subGridData;
      [_, subCellSize] = getGridData(10, 10, cellSize, cellSize);
      labelGrid = svg
        .append("g")
        .attr("class", "labelGrid")
        // .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .selectAll(".label")
        .data(data)
        .enter()
        .append("text")
        .each(d => {
          d.x = (d.col - 2) * cellSize + cellSize / 2;
          d.y = (d.row - 1) * cellSize + (cellSize / 2 + 5);
        })
        .attr("x", d => d.x - 3)
        .attr("y", d => d.y)
        .style("text-anchor", "middle")
        .text(d => d.code)
        .attr("class", d => "label " + d.code)
        .each(d => {
          subGridData = getGridData2(
            10,
            10,
            cellSize,
            cellSize,
            d,
            stateOrderedData
          );
          d3.select(
            ".cell.x" +
              (d.x - cellSize / 2 + 1) +
              ".y" +
              (d.y - (cellSize / 2 + 5) + 1)
          )
            .attr("class", "state " + d.code)
            .selectAll(".subrow")
            .data(subGridData)
            .enter()
            .append("g")
            .attr("class", "subrow")
            .selectAll(".subcell")
            .data(d => d)
            .enter()
            .append("rect")
            // .on("click", clicked)
            .attr("class", "subcell")
            .each(e => {
              const realx = e.x + d.x - cellSize / 2 + 1;
              e.realx = realx;
              const realy = d.y + e.y - (cellSize / 2 + 5) + 1;
              e.realy = realy;
            })
            .attr("x", e => e.realx)
            .attr("y", e => e.realy)
            .attr("width", subCellSize)
            .attr("height", subCellSize)
            .style("fill", e => e.color)
            .style("opacity", "0.5");
        });
    }
    drawSquares();

    // draw transparent rectangles on top to read events
    eventGrid = svg
      .append("g")
      .attr("class", "eventGrid")
      .selectAll()
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => (d.col - 2) * cellSize)
      .attr("y", d => (d.row - 1) * cellSize)
      .attr("width", cellSize - subCellSize)
      .attr("height", cellSize - subCellSize)
      .style("opacity", "0")
      // .on("mouseover", d => {
      //   console.log(d)
      // })
      .on("click", clicked);
  });
});

// function that generates a nested array for square grid
function getGridData(ncol, nrow, width, height) {
  var cellSize = calcCellSize(width, height, ncol, nrow);

  var gridData = [];
  var xpos = 1; // starting xpos and ypos at 1 so the stroke will show when we make the grid below
  var ypos = 1;

  // iterate for rows
  for (var row = 0; row < nrow; row++) {
    gridData.push([]);

    // iterate for cells/columns inside each row
    for (var col = 0; col < ncol; col++) {
      gridData[row].push({
        x: xpos,
        y: ypos
      });

      // increment x position (moving over by 50)
      xpos += cellSize;
    }

    // reset x position after a row is complete
    xpos = 1;
    // increment y position (moving down by 50)
    ypos += cellSize;
  }
  return [gridData, cellSize];
}

function myIndex(cats, category) {
  for (var curindex = 0; curindex < cats.length; curindex++) {
    let elem = cats[curindex];
    if (elem.catName === category) {
      // console.log(true, elem.catName, category)
      // console.log("a", curindex);
      return curindex;
    }
    if (curindex >= 4) {
      return 4;
    }
  }
  return 4;
}

var logged = false;
function getGridData2(ncol, nrow, width, height, data, stateData) {
  var scode = stateData[data.code];
  if (!stateData[data.code]) {
    scode = stateData["MT"];
  }

  catsPerState[data.code] = scode.sort(function(a, b) {
    return b.category - a.category;
  });

  var colorArray = [];
  scode.forEach(row => {
    if (!totalCatsState[data.code]) {
      totalCatsState[data.code] = parseInt(row.category);
    } else {
      totalCatsState[data.code] += parseInt(row.category);
    }
    for (var i = 0; i < row.category; i++) {
      colorArray.push(row);
    }
  });

  if (!logged) {
    logged = true;
    // console.log(data);
    // console.log(scode);
    // console.log(colorArray);
  }

  var cellSize = calcCellSize(width, height, ncol, nrow);

  var gridData = [];
  var xpos = 1; // starting xpos and ypos at 1 so the stroke will show when we make the grid below
  var ypos = 1;

  // iterate for rows
  for (var row = 0; row < nrow; row++) {
    gridData.push([]);

    // iterate for cells/columns inside each row
    for (var col = 0; col < ncol; col++) {
      var color = colorArray[Math.floor(Math.random() * colorArray.length)];
      var indexRow = myIndex(
        catsPerState[data.code],
        categories_mapa[color.catId]
      );
      // console.log(indexRow);
      gridData[row].push({
        x: xpos,
        y: ypos,
        color: categories[categories_mapa[color.catId]],
        cat: categories_mapa[color.catId],
        index: indexRow
      });

      // increment x position (moving over by 50)
      xpos += cellSize;
    }

    // reset x position after a row is complete
    xpos = 1;
    // increment y position (moving down by 50)
    ypos += cellSize;
  }
  return gridData;
}

// function to calculate grid cell size based on width and height of svg
function calcCellSize(w, h, ncol, nrow) {
  // leave tiny space in margins
  var gridWidth = w - 2;
  var gridHeight = h - 2;
  var cellSize;

  // calculate size of cells in columns across
  var colWidth = Math.floor(gridWidth / ncol);
  // calculate size of cells in rows down
  var rowWidth = Math.floor(gridHeight / nrow);

  // take the smaller of the calculated cell sizes
  if (colWidth <= rowWidth) {
    cellSize = colWidth;
  } else {
    cellSize = rowWidth;
  }
  return cellSize;
}

function clicked(selected) {
  // console.log(selected);
  var x, y, k;

  if (selected && centered !== selected) {
    x = selected.x;
    y = selected.y;
    k = zoomLevel;
    previousCentered = centered;
    centered = selected;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    previousCentered = centered;
    centered = null;
  }

  myScale.domain([0, 100]);

  shrickLevelWidth = myScale(1);

  d3.selectAll(`.label:not(.${selected.code})`)
    .style("font-size", "20px")
    .attr("y", d => d.y);

  d3.selectAll(`.label.${selected.code}`)
    .style("font-size", "10px")
    .attr("y", d => d.y - 5 * subCellSize * shrickLevelHeight);

  if (previousCentered) {
    d3.select(`.state.${previousCentered.code}`)
      .select(".y")
      .remove();

    d3.select(`.state.${previousCentered.code}`)
      .selectAll(".cat")
      .remove();
  }

  labelGrid = d3.selectAll(".label").each(d => {
    var catOrdered = {};
    var cats2 = [];

    if (centered && d.code !== selected.code) {
      d3.selectAll(`.label`)
        .transition()
        .duration(750)
        .style("font-size", "20px")
        .attr("y", d => d.y);

      var subcells = d3.selectAll(`.state.${d.code} .subcell`);
      subcells
        .each(e => {
          e.realx = e.x + d.x - cellSize / 2 + 1;
          e.realy = d.y + e.y - (cellSize / 2 + 5) + 1;
        })
        .transition()
        .duration(750)
        .attr("width", subCellSize)
        .attr("height", subCellSize)
        .attr("x", e => e.realx)
        .attr("y", e => e.realy);
    } else if (d.code == selected.code) {
      //  zoomed state
      var ns = [5, 5, 5, 5, 5];
      var subcells = d3.selectAll(`.state.${selected.code} .subcell`);
      if (centered) {
        const cats = [0, 0, 0, 0, 0];
        subcells
          .each(e => {
            e.realx = d.x - cellSize / 2 + 1;
            e.realx = e.realx - 5;
            e.realy = d.y - (cellSize / 2 + 5) + 1;
            cats[e.index] = e.cat;

            if (!catOrdered[e.cat]) {
              catOrdered[e.cat] = [e];
              cats2.push(e.cat);
            } else {
              catOrdered[e.cat].push(e);
            }
          })
          .transition()
          .duration(750)
          .attr("width", subCellSize * shrickLevelWidth)
          .attr("height", subCellSize * shrickLevelHeight)
          .attr("x", e => {
            ns[e.index]++;
            if (e.index !== 4) {
              return (
                e.realx + subCellSize * shrickLevelWidth * (ns[e.index] - 1)
              );
            } else {
              var n = 0;
              var stackedx = 0;
              for (var catid = 0; catid < cats2.length; catid++) {
                var curcat = cats2[catid];
                if (
                  curcat != catsPerState[selected.code][0].catName &&
                  curcat != catsPerState[selected.code][1].catName &&
                  curcat != catsPerState[selected.code][2].catName &&
                  curcat != catsPerState[selected.code][3].catName
                ) {
                  for (
                    var scellid = 0;
                    scellid < catOrdered[curcat].length;
                    scellid++
                  ) {
                    if (catOrdered[curcat][scellid] === e) {
                      stackedx = n;
                      break;
                    }
                    n++;
                  }
                }
              }
              return (
                5 * (subCellSize * shrickLevelWidth) +
                e.realx +
                subCellSize * shrickLevelWidth * stackedx
              );
              // return 5 + e.realx + (subCellSize * shrickLevelWidth) * (ns[e.index] - 1);
            }
          })
          .attr("y", e => {
            return (
              1 +
              subCellSize * shrickLevelHeight +
              e.realy +
              e.index * 2 * subCellSize * shrickLevelHeight
            );
          });
        let i = 1;

        ns.forEach(pos => {
          if (i < 5) {
            d3.select(`.state.${selected.code}`)
              .append("text")
              .attr("class", "cat")
              .style("font-size", "4px")
              .style("stroke", "none")
              .attr(
                "transform",
                `translate(${x - cellSize / 2 + pos},${y -
                  (cellSize / 2 + (subCellSize * shrickLevelHeight) / 2 + 1) +
                  i * 2 * subCellSize * shrickLevelHeight})`
              )
              .attr("fill", "#000")
              .text(cats[i - 1]);
          }

          i++;
        });
        var x2 = d3
          .scaleLinear()
          .range([0, cellSize])
          .domain([0, 100]);
        var xAxis = d3
          .axisBottom()
          .scale(x2)
          .ticks(5);
        d3.select(`.state.${selected.code}`)
          .append("g")
          .attr("class", "y axis")
          .call(xAxis)
          .attr(
            "transform",
            `translate(${d.x - cellSize / 2 + 1},${y -
              (cellSize / 2 + 5) +
              2 +
              5 * 2 * subCellSize * shrickLevelHeight})`
          )
          .select("path")
          .attr("d", `M0.5.5H${cellSize}`);
        d3.select(`.state.${selected.code}`)
          .selectAll(".tick line")
          .style("stroke-width", 0.375)
          .style("stroke", "black")
          .attr("y2", 2);
        d3.select(`.state.${selected.code}`)
          .selectAll(".tick text")
          .attr("y", 2)
          .style("font-size", "4px")
          .style("stroke", "none");
      } else {
        d3.selectAll(`.label`)
          .style("font-size", "20px")
          .attr("y", d => d.y);

        // click on self to return to macro view
        var subcells = d3.selectAll(`.state.${previousCentered.code} .subcell`);
        subcells
          .each(e => {
            e.realx = e.x + d.x - cellSize / 2 + 1;
            e.realy = d.y + e.y - (cellSize / 2 + 5) + 1;
          })
          .transition()
          .duration(750)
          .attr("width", subCellSize)
          .attr("height", subCellSize)
          .attr("x", e => e.realx)
          .attr("y", e => e.realy);
      }
    }
  });

  eventGrid
    .transition()
    .duration(750)
    .attr(
      "transform",
      "translate(" +
        width / 2 +
        "," +
        height / 2 +
        ")scale(" +
        k +
        ")translate(" +
        -x +
        "," +
        -y +
        ")"
    )
    .style("stroke-width", 1.5 / k + "px");

  cellGrid
    .transition()
    .duration(750)
    .attr(
      "transform",
      "translate(" +
        width / 2 +
        "," +
        height / 2 +
        ")scale(" +
        k +
        ")translate(" +
        -x +
        "," +
        -y +
        ")"
    )
    .style("stroke-width", 1.5 / k + "px");
  // .style("opacity", () => centered? "0": "1");

  labelGrid
    .transition()
    .duration(750)
    .attr(
      "transform",
      "translate(" +
        width / 2 +
        "," +
        height / 2 +
        ")scale(" +
        k +
        ")translate(" +
        -x +
        "," +
        -y +
        ")"
    )
    .style("stroke-width", 1.5 / k + "px");
}

// todo: barra acumulado se mete al lado
// hover
