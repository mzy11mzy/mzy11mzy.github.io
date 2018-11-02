
//Handles functionality of Probability
$(window).load(function() {
  probability();
  expectation();
});

//Handles CSS animation for card and die
//Adapted from http://jsfiddle.net/byrichardpowell/38MGS/1/
$.fn.animatecss = function(anim, time, cb) {
  if (time) this.css('-webkit-transition', time / 1000 + 's');
  this.addClass(anim);
  if ($.isFunction(cb)) {
    setTimeout(function() {
      $(this).each(cb);
    }, (time) ? time : 250);
  }
  return this;
};

//Cumulative Sum function for array
function cumsum(array) {
  var resultArray = [];
  array.reduce(function(a, b, i) {
    return resultArray[i] = a + b.p;
  }, 0);
  return resultArray;
}


//*******************************************************************************//
//probability
//*******************************************************************************//
function probability() {
  //Variables
  var cardCount = [0, 0, 0, 0];
  var cardProb = [0.012, .0457, 0.2279, 0.7144];
  var cardData = [{
    data: [{
      value: cardCount[0],
      type: 'legendary'
    }, {
      value: cardCount[1],
      type: 'epic'
    }, {
      value: cardCount[2],
      type: 'rare'
    }, {
      value: cardCount[3],
      type: 'common'
    }],
    state: 'Outcomes'
  },
    {
      data: [{
        value: cardProb[0],
        type: 'legendary'
      }, {
        value: cardProb[1],
        type: 'epic'
      }, {
        value: cardProb[2],
        type: 'rare'
      }, {
        value: cardProb[3],
        type: 'common'
      }],
      state: 'Probabilities'
    }];

  //Create SVG
  var svgCard = d3.select("#graph1").append("svg");

  //Create Container
  var containerCard = svgCard.append('g');

  //Create Scales
  var yScaleCard = d3.scale.linear().domain([0, 1]);
  var x0ScaleCard = d3.scale.ordinal().domain(['Probabilities', 'Outcomes']);
  var x1ScaleCard = d3.scale.ordinal().domain(['legendary', 'epic', 'rare', 'common']);

  //Create SVG Elements
  var states = containerCard.selectAll("g.state").data(cardData).enter().append("g").attr("class", "state");

  var rects = states.selectAll("rect").data(function(d) {
    return d.data;
  }).enter().append("rect");

  var types = states.selectAll("image").data(function(d) {
    return d.data;
  }).enter().append("image").attr("class", "card");

  var axisCard = svgCard.append("g").attr("class", "x axis");

  var xAxisCard = d3.svg.axis().scale(x0ScaleCard).orient("bottom").ticks(0);


  //Create tool tips for observed and expected
  var tipCardObs = d3.tip().attr('id', 'tipCardObs').attr('class', 'd3-tip').offset([-10, 0]);
  var tipCardTheo = d3.tip().attr('id', 'tipCardTheo').attr('class', 'd3-tip').offset([-10, 0]);

  //Update rectangles and text
  function updateCard(t) {
    var total = Math.max(1, cardCount[0] + cardCount[1] + cardCount[2] + cardCount[3]);
    var probObs = [cardCount[0] / total, cardCount[1] / total, cardCount[2] / total, cardCount[3] / total];
    cardData[0].data[0].value = probObs[0];
    cardData[0].data[1].value = probObs[1];
    cardData[0].data[2].value = probObs[2];
    cardData[0].data[3].value = probObs[3];
    cardData[1].data[0].value = cardProb[0];
    cardData[1].data[1].value = cardProb[1];
    cardData[1].data[2].value = cardProb[2];
    cardData[1].data[3].value = cardProb[3];

    tipCardObs.html(function(d) {
      return d3.round(d.value, 3) + ' = ' + d3.round(d.value * total, 0) + '/' + total;
    });
    tipCardTheo.html(function(d, i) {
      return d3.round(d.value, 3);
    });

    states
      .attr("transform", function(d) {
        return "translate(" + x0ScaleCard(d.state) + "," + 0 + ")";
      })
      .attr("class", function(d) {
        return d.state;
      });

    rects.transition().duration(t)
      .attr("width", x1ScaleCard.rangeBand())
      .attr("x", function(d) {
        return x1ScaleCard(d.type);
      })
      .attr("y", function(d) {
        return yScaleCard(d.value);
      })
      .attr("height", function(d) {
        return yScaleCard(1 - d.value);
      })
      .attr("class", function(d) {
        return d.type;
      });

    types
      .attr("xlink:href", function(d, i) {
        return "./img/" + (d.type) + ".png";
      })
      .attr("x", function(d) {
        return x1ScaleCard(d.type) + x1ScaleCard.rangeBand() / 6;
      })
      .attr("y", function(d) {
        return yScaleCard(0) + 25;
      })
      .attr("width", x1ScaleCard.rangeBand() * 3 / 7)
      .attr("height", x1ScaleCard.rangeBand());

    containerCard.selectAll('g.Outcomes rect').each(function() {
      d3.select(this).on('mouseover', tipCardObs.show).on('mouseout', tipCardObs.hide);
    })
    containerCard.selectAll('g.Probabilities rect').each(function() {
      d3.select(this).on('mousedown', function(d) {
        tipCardTheo.show(d, this)
      })
        .on('mouseover', function(d) {
          tipCardTheo.show(d, this)
        })
        .on('mouseout', tipCardTheo.hide)
    })
    $('#graph1').parent().on('mouseup', tipCardTheo.hide);

  }

  //Determines outcome of card flip and updates data
  function flip(card) {
    var num = Math.random();
    if (num < cardProb[0]) {
      card.css("background-image", "url(./img/card_4.png");
      cardCount[0] = cardCount[0] + 1;
    } else if (num < cardProb[0] + cardProb[1]) {
      card.css("background-image", "url(./img/card_3.png");
      cardCount[1] = cardCount[1] + 1;
    } else if (num < cardProb[0] + cardProb[1] + cardProb[2]) {
      card.css("background-image", "url(./img/card_2.png");
      cardCount[2] = cardCount[2] + 1;
    } else {
      card.css("background-image", "url(./img/card_1.png");
      cardCount[3] = cardCount[3] + 1;
    }
    updateCard(50);
  }

  //Flip once
  $('#drawOne').click(function() {
    var card = $("#card");
    var count = 0;
    var interval = setInterval(function() {
      card.animatecss('blur-out', 100, function() {
        card.css("font-size", "50px");
        flip(card);
        card.removeClass('blur-out');
      });
      count++;
      if (count == 5) {
        clearInterval(interval);
      }
    }, 15);
  });

  //Flip one-hundred times
  $('#drawTen').click(function() {
    var card = $("#card");
    var count = 0;
    var interval = setInterval(function() {
      card.animatecss('blur-out', 15, function() {
        card.css("font-size", "50px");
        flip(card);
        card.removeClass('blur-out');
      });
      count++;
      if (count == 50) {
        clearInterval(interval);
      }
    }, 15);
  });

  //Update SVG based on width of container
  function drawCard() {
    //var width = d3.select('#graph1').node().clientWidth;
    var width = 450;
    var height = 450;
    var padCard = 150;

    //Update SVG
    svgCard.attr("width", width).attr("height", height).call(tipCardObs).call(tipCardTheo);

    //Update Scales
    yScaleCard.range([height - 2 * padCard, 0]);
    x0ScaleCard.rangeRoundBands([0, width], .1);
    x1ScaleCard.rangeRoundBands([0, x0ScaleCard.rangeBand()], .4);

    //Update Container
    containerCard.attr("transform", "translate(" + 0 + "," - (padCard) + ")")

    //Update Axis
    axisCard.attr("transform", "translate(" + 0 + "," + (height - padCard + 1 - 150) + ")").call(xAxisCard);

    //Update Rectangles
    updateCard(0);
  }
  drawCard()
  $(window).on("resize", drawCard);
}

//*******************************************************************************//
//Expectation
//*******************************************************************************//
function expectation() {
  //Constants
  var probCd = [{
    p: 0.7144
  }, {
    p: 0.2279
  }, {
    p: 0.0457
  }, {
    p: 0.012
  }];
  var valueCd = [5, 20, 100, 400];
  var countCd = [0, 0, 0, 1];
  var expectedData = [average(countCd)];

  //Create SVG and SVG elements
  var svgCd = d3.select("#graph2").append("svg");

  //Create Probability Bar for Cards
  var containerDie = svgCd.append("g").attr('class', 'Probability');

  //yScale
  var yScaleDie = d3.scale.linear().domain([0, 1]);

  //xScale
  var xScaleDie = d3.scale.ordinal().domain([1, 2, 3, 4]);

  //xAxis
  var xAxisDie = d3.svg.axis().scale(xScaleDie).orient("bottom").ticks(0);
  var axisDie = svgCd.append("g").attr("class", "x axis");

  //Drag function for card bar chart
  var dragDie = d3.behavior.drag()
    .origin(function(d, i) {
      return {
        x: 0,
        y: yScaleDie(d.p)
      };
    })
    .on('drag', function(d, i) {
      var y = Math.min(1, Math.max(0, yScaleDie.invert(d3.event.y)));
      var oldV = probCd[i].p;
      var change = y - oldV;
      probCd.map(function(x, index) {
        if (index == i)
          x.p = y;
        else {
          if (oldV == 1)
            x.p = -change / 3; //5
          else
            x.p = x.p - change * x.p / (1 - oldV);
        }
      });
      updateDie();
      tipDie.show(d, this);
      countCd = [0, 0, 0, 0];
      expectedData = [];
      maxXExpected = 200;
      expectation(expectedData, expectationCalc(probCd));
    })

  //Create Rects
  var expectedRects = containerDie.selectAll("rect").data(probCd).enter().append("rect");

  //Create Labels
  var dieFaces = svgCd.select("g.axis").selectAll("g.tick").data(probCd).enter().append("image");

  //Tool Tip
  var tipDie = d3.tip().attr('id', 'tipDie').attr('class', 'd3-tip').offset([-10, 0]);

  //Update Card Bar Chart
  function updateDie() {

    tipDie.html(function(d, i) {
      return d3.round(d.p, 2);
    });

    expectedRects
      .attr("x", function(d, i) {
        return xScaleDie(i + 1);
      })
      .attr("y", function(d, i) {
        return yScaleDie(d.p);
      })
      .attr("height", function(d, i) {
        return yScaleDie(1 - d.p);
      })
      .attr("width", xScaleDie.rangeBand())
      .attr("id", function(d, i) {
        return i;
      })
      .on('mousedown', function(d) {
        tipDie.show(d, this)
      })
      .on('mouseover', function(d) {
        tipDie.show(d, this)
      })
      .on('mouseout', tipDie.hide)
      .call(dragDie);

    $('#graph2').parent().on('mouseup', tipDie.hide);

    svgCd.select(".axis").selectAll(".tick").remove();
    dieFaces
      .attr("xlink:href", function(d, i) {
        return "./img/type_" + (i + 1) + ".png"; //x aixs
      })
      .attr("x", function(d, i) {
        return xScaleDie(i + 1) + 1 / 4 * xScaleDie.rangeBand();
      })
      .attr("y", 1 / 4 * xScaleDie.rangeBand())
      .attr("width", 1 / 2 * xScaleDie.rangeBand())
      .attr("height", 1 / 2 * xScaleDie.rangeBand());
  }

  //Handles Die Roll
  function roll(die) {
    var num = Math.random();
    var cumProb = cumsum(probCd);
    if (num < cumProb[0]) {
      die.css("background-image", "url(./img/card_1.png");
      countCd[0] = countCd[0] + 1;
    } else if (num < cumProb[1]) {
      die.css("background-image", "url(./img/card_2.png");
      countCd[1] = countCd[1] + 1;
    } else if (num < cumProb[2]) {
      die.css("background-image", "url(./img/card_3.png");
      countCd[2] = countCd[2] + 1;
    } else {
      die.css("background-image", "url(./img/card_4.png");
      countCd[3] = countCd[3] + 1;
    }
    updateDie();
    expectedData.push(average(countCd));
    expectation(expectedData, expectationCalc(probCd));
  }

  $('#openOne').click(function() {
    var die = $("#die");
    var count = 0;
    var interval = setInterval(function() {
      die.animatecss('blur-out', 30, function() {
        die.css("font-size", "30px");
        roll(die);
        die.removeClass('blur-out');
      });
      count++;
      if (count == 5) {
        clearInterval(interval);
      }
    }, 15);
  });

  $('#openTen').click(function() {
    var die = $("#die");
    var count = 0;
    var interval = setInterval(function() {
      die.animatecss('blur-out', 15, function() {
        die.css("font-size", "30px");
        roll(die);
        die.removeClass('blur-out');
      });
      count++;
      if (count == 50) {
        clearInterval(interval);
      }
    }, 15);
  });

  //Returns total samples and average at that point
  function average(data) {
    var total = data.reduce(function(a, b) {
      return a + b;
    }, 0);
    var sum = data.reduce(function(a, b, i) {
      return a + b * valueCd[i];
    }, 0);
    return [total, sum / total];
  }
  //Returns expectation of die based on probability
  function expectationCalc(data) {
    return data.reduce(function(a, b, i) {
      return a + b.p * valueCd[i];
    }, 0);
  }
  //Returns probability from count data
  function countToProb(data) {
    var total = Math.max(1, data.reduce(function(a, b) {
      return a + b;
    }, 0));
    return data.map(function(x) {
      return x / total;
    });
  }

  //Expectation SVG and elements
  var maxXExpected = 200;
  var expectedPlot = d3.select("#graph3").append("svg");
  var xaxisDie = expectedPlot.append("g").attr("class", "x axis");
  var xaxisTextDie = expectedPlot.append("text").attr("text-anchor", "middle").text("Number of Rolls");
  var yaxisDie = expectedPlot.append("g").attr("class", "y axis");
  var yaxisTextDie = expectedPlot.append("text").attr("text-anchor", "middle").text("Value");
  var pathExpected = expectedPlot.append("path").attr("id", "expected");
  var pathActual = expectedPlot.append("path").attr("id", "actual");

  //X scale
  var xScaleExpected = d3.scale.linear().domain([1, maxXExpected]);

  //Y Scale
  var yScaleExpected = d3.scale.linear().domain([0, 400]);

  //Define X axis
  var xAxisExpected = d3.svg.axis().scale(xScaleExpected).orient("bottom").ticks(4);
  //Define Y axis
  var yAxisExpected = d3.svg.axis().scale(yScaleExpected).orient("left").ticks(6); //step


  //Update error plot
  function expectation(data, prob) {
    var line = d3.svg.line()
      .x(function(d) {
        return xScaleExpected(d[0])
      })
      .y(function(d) {
        return yScaleExpected(d[1])
      })
      .interpolate("linear");
    if (data.length > maxXExpected * 0.9) {
      maxXExpected = maxXExpected * 1.5;
    }
    xScaleExpected.domain([1, maxXExpected]);
    expectedPlot.select(".x.axis")
      .transition()
      .call(xAxisExpected.ticks(4));
    pathExpected
      .datum(data)
      .attr("d", line);
    pathActual
      .datum([[1, prob], [maxXExpected, prob]])
      .style("stroke-dasharray", ("5, 5"))
      .attr("d", line);
  }

  //Tool tip on expectation chart...
  var tipDieFocus = d3.tip().attr('id', 'tipDieFocus').attr('class', 'd3-tip').offset([0, 10]).direction('e');

  var focus = expectedPlot.append("g").style("display", "none");

  focus.append("rect").attr("y", 0).style('fill', 'white').style('opacity', '0.75');

  focus.append("line").attr('id', 'focusLine').style("stroke-dasharray", ("2, 2"));

  focus.append("circle").attr("r", 5).attr('class', 'expectedCircle').attr('id', 'expectedCircle');

  focus.append("circle").attr("r", 5).attr('class', 'averageCircle');


  expectedPlot.on("mouseover", mousemove).on("mouseout", mousemove).on("mousemove", mousemove);

  function mousemove() {
    var x = d3.round(xScaleExpected.invert(d3.mouse(this)[0]), 0);
    var y = yScaleExpected.invert(d3.mouse(this)[1]);
    if (x > 0 && x < expectedData.length + 1 && y >= 1 && y <= 400) {
      focus.style("display", null)
      var y = expectedData[x - 1][1];
      focus.select('.expectedCircle').attr("cx", xScaleExpected(x)).attr('cy', yScaleExpected(expectationCalc(probCd)));
      focus.select('.averageCircle').attr("cx", xScaleExpected(x)).attr('cy', yScaleExpected(y));
      focus.select('rect').style("fill", "#B8C398").style("opacity", 0.5).attr("x", xScaleExpected(x)).attr("height", yScaleExpected(1) - 1).attr("width", xScaleExpected(maxXExpected - x));
      focus.select('line').attr("x1", xScaleExpected(x)).attr("y1", yScaleExpected(400)).attr("x2", xScaleExpected(x)).attr("y2", yScaleExpected(1));
      xaxisDie.call(xAxisExpected.tickValues([x]));
      tipDieFocus.html(function(d) {
        return 'Average: <span id="avgFocus">' + d3.round(y, 2) + '</span><br>' +
          'Expectation: <span id="expFocus">' + d3.round(expectationCalc(probCd), 2) + '</span>';
      });
      tipDieFocus.show(document.getElementById("expectedCircle"));
    } else {
      focus.style("display", "none");
      tipDieFocus.hide();
      xaxisDie.call(xAxisExpected.tickValues(null));
    }
  }

  //Update SVG based on width of container
  function drawDie() {
    //Constants Bar Die
    //var width = d3.select('#graph2').node().clientWidth;
    var width = 300;
    var height = 300;
    var padDie = width / 20;

    //Update SVG
    svgCd.attr("width", width).attr("height", height).call(tipDie);

    //Update Scales
    yScaleDie.range([height - 2 * padDie, 0]);
    xScaleDie.rangeRoundBands([0, width - 2 * padDie], .5);

    //Update Container and Axis
    axisDie.attr("transform", "translate(" + padDie + "," + (height - 2 * padDie + 1) + ")").call(xAxisDie);
    containerDie.attr("transform", "translate(" + padDie + "," + 0 + ")");

    //Update Rects
    updateDie();

    //Constants Expectation Die
    //var w = d3.select('#graph3').node().clientWidth;
    var w = 300;
    var h = 300;
    var padExp = 35;

    //Update SVG
    expectedPlot.attr("width", w).attr("height", h).style("cursor", "crosshair").call(tipDieFocus);

    //Update Scales
    xScaleExpected.range([padExp, (w - padExp)]);
    yScaleExpected.range([(h - padExp), padExp]);

    //Update Axis
    xaxisDie.attr("transform", "translate(0," + (h - padExp) + ")").call(xAxisExpected);
    yaxisDie.attr("transform", "translate(" + 1 * padExp + ",0)").call(yAxisExpected);

    //Update Labels
    xaxisTextDie.attr("transform", "translate(" + (w / 2) + "," + (h) + ")")
    yaxisTextDie.attr("transform", "translate(" + (padExp / 4) + "," + (h / 2) + ")rotate(-90)")

    //Update Paths
    expectation(expectedData, expectationCalc(probCd));
  }
  drawDie();
  $(window).on("resize", drawDie);
}
