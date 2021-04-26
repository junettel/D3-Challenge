// Define svg dimensions
var svgWidth = 900;
var svgHeight = 630;

// Define chart margins
var chartMargin = {
  top: 20,
  right: 20,
  bottom: 100,
  left: 100
};

// Define chart dimensions
var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

// Add svg element to scatter element and set dimensions
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Add chart element to svg element and shift to adhere to chartMargin
var chartGroup = svg.append("g")
  .classed("chart", true)
  .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

// Starting axis parameters
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// Update x-axis scale based on data
function xScale(censusData, chosenXAxis) {
  var xLinearScale = d3.scaleLinear()
    .range([0, chartWidth])
    .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
             d3.max(censusData, d => d[chosenXAxis]) * 1.1
    ]);
  return xLinearScale;
};

// Update y-axis scale based on data
function yScale(censusData, chosenYAxis) {
  var yLinearScale = d3.scaleLinear()
    .range([chartHeight, 0])
    .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8,
             d3.max(censusData, d => d[chosenYAxis]) * 1.1
    ]);
  return yLinearScale;
};

// Update x-axis based on data for new selection
function renderXAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
};

// Update y-axis based on data for new selection
function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  yAxis.transition()
    .duration(1000)
    .call(leftAxis);
  return yAxis;
};

// Update state circle markers positions based on data for new selection
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));
  return circlesGroup;
};

// Update state text marker labels based on data for new selection
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  textGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]));
  return textGroup;
};

// Format tool tip values
function formatXTip(value, chosenXAxis) {
  if (chosenXAxis == "poverty") {
    return `${value}%`;
  }
  else if (chosenXAxis === "income") {
    return `$${value}`;
  }
  else {
    return `${value}`;
  }
};

// Function to call tool tip based on selected axes
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup) {

  // Format x-axis marker labels on hover
  if (chosenXAxis === "poverty") {
    var xLabel = "Poverty";
  }
  else if (chosenXAxis === "age") {
    var xLabel = "Median Age";
  }
  else if (chosenXAxis === "income") {
    var xLabel = "Median Income";
  }

  // Format y-axis marker labels on hover
  if (chosenYAxis === "healthcare") {
    var yLabel = "No Healthcare";
  }
  else if (chosenYAxis === "smokes") {
    var yLabel = "Smokers";
  }
  else if (chosenYAxis === "obesity") {
    var yLabel = "Obesity";
  }

  // Create tool tip for marker labels
  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-10, 0])
    .html(function(d) {
      return (`<strong>${d.state}</strong><br>
              ${xLabel}: ${formatXTip(d[chosenXAxis], chosenXAxis)}<br>
              ${yLabel}: ${d[chosenYAxis]}%`)
    });

  // Call tool tip
  circlesGroup.call(toolTip);
    
  // Show tool tip on hover over circle marker
  circlesGroup
    .on("mouseover", toolTip.show)
    .on("mouseout", toolTip.hide);

  // Show tool tip on hover over text within circle marker
  textGroup
    .on("mouseover", toolTip.show)
    .on("mouseout", toolTip.hide);

  return circlesGroup;
};


// ###################################
// Load csv data
// ###################################

d3.csv("assets/data/data.csv").then(function(censusData) {

  // Test data load
  console.log("Census Data:", censusData);

  // Parse data as integers
  censusData.forEach(state => {
    state.poverty = +state.poverty;
    state.age = +state.age;
    state.income = +state.income;
    state.healthcare = +state.healthcare;
    state.obesity = +state.obesity;
    state.smokes = +state.smokes;
  })

  // Create scaling functions
  var xLinearScale = xScale(censusData, chosenXAxis);
  var yLinearScale = yScale(censusData, chosenYAxis);

  // Create axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // Add x-axis to chartGroup
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(bottomAxis);
  
  // Add y-axis to chartGroup
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // Add circle markers
  var circlesGroup = chartGroup.append("g")
    .classed("circles", true)
    .selectAll(".stateCircle")
    .data(censusData)
    .enter()
    .append("circle")
    .classed("stateCircle", true)
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 12)
    .attr("opacity", 0.5);

  // Add state abbreviations for circle markers
  var textGroup = chartGroup.append("g")
    .classed("text", true)
    .selectAll(".stateText")
    .data(censusData)
    .enter()
    .append("text")
    .classed("stateText", true)
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .attr("dy", 4)
    .text(d => d.abbr)
    .attr("font-size", "14px");

  // Create x-axis labels group
  var xLabelGroup = chartGroup.append("g")
    .classed("x-axis-labels", true)
    .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);
    
  // Activate starting x-axis label
  var povertyLabel = xLabelGroup.append("text")
    .classed("active", true)
    .classed("aText", true)
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // EVENT HANDLER TRIGGER VALUE
    .text("In Poverty (%)");
    
  // Inactive x-axis label, activated using event handler upon click
  var ageLabel = xLabelGroup.append("text")
    .classed("inactive", true)
    .classed("aText", true)
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // EVENT HANDLER TRIGGER VALUE
    .text("Age (Median)");

  // Inactive x-axis label, activated using event handler later
  var incomeLabel = xLabelGroup.append("text")
    .classed("inactive", true)
    .classed("aText", true)
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // EVENT HANDLER TRIGGER VALUE
    .text("Household Income (Median)");
    
  // Create y-axis labels group
  var yLabelGroup = chartGroup.append("g")
    .classed("y-axis-labels", true)
    .attr("transform", `translate(${0 - chartMargin.left / 4}, ${chartHeight / 2})`);

  // Activate starting y-axis label
  var healthcareLabel = yLabelGroup.append("text")
    .classed("active", true)
    .classed("aText", true)
    .attr("x", 0)
    .attr("y", -20)
    .attr("transform", "rotate(-90)")
    .attr("value", "healthcare") // EVENT HANDLER TRIGGER VALUE
    .text("Lacks Healthcare (%)");

  // Inactive y-axis label, activated using event handler upon click
  var smokesLabel = yLabelGroup.append("text")
  .classed("inactive", true)
  .classed("aText", true)
  .attr("x", 0)
  .attr("y", -40)
  .attr("transform", "rotate(-90)")
  .attr("value", "smokes") // EVENT HANDLER TRIGGER VALUE
  .text("Smokes (%)");
  
  // Inactive y-axis label, activated using event handler upon click
  var obesityLabel = yLabelGroup.append("text")
    .classed("inactive", true)
    .classed("aText", true)
    .attr("x", 0)
    .attr("y", -60)
    .attr("transform", "rotate(-90)")
    .attr("value", "obesity") // EVENT HANDLER TRIGGER VALUE
    .text("Obese (%)");

  // Update tool tip function
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

  // Event handler for x-axis selection on click
  xLabelGroup.selectAll("text").on("click", function() {

    // Assign selected value to variable
    var value = d3.select(this).attr("value");
    console.log("New x-axis:", `${value}`);

    // Update all functions for x-axis selection upon change
    if (value != chosenXAxis) {         
      chosenXAxis = value;
      xLinearScale = xScale(censusData, chosenXAxis)
      xAxis = renderXAxis(xLinearScale, xAxis);
      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
      textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

      // Activate x-axis selection upon change
      if (chosenXAxis === "poverty") {
        povertyLabel.classed("active", true).classed("inactive", false);
        ageLabel.classed("active", false).classed("inactive", true);
        incomeLabel.classed("active", false).classed("inactive", true);
      }
      else if (chosenXAxis === "age") {
        povertyLabel.classed("active", false).classed("inactive", true);
        ageLabel.classed("active", true).classed("inactive", false);
        incomeLabel.classed("active", false).classed("inactive", true);
      }
      else if (chosenXAxis === "income") {
        povertyLabel.classed("active", false).classed("inactive", true);
        ageLabel.classed("active", false).classed("inactive", true);
        incomeLabel.classed("active", true).classed("inactive", false);
      }
    };
  });

  // Event listener for y-axis selection on click
  yLabelGroup.selectAll("text").on("click", function() {

    // Assign selected value to variable
    var value = d3.select(this).attr("value");
    console.log("New y-axis:", `${value}`);

    // Update all functions for x-axis selection upon change
    if (value != chosenYAxis) {         
      chosenYAxis = value;
      yLinearScale = yScale(censusData, chosenYAxis)
      yAxis = renderYAxis(yLinearScale, yAxis);
      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
      textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

      // Activate x-axis selection upon change
      if (chosenYAxis === "healthcare") {
        healthcareLabel.classed("active", true).classed("inactive", false);
        smokesLabel.classed("active", false).classed("inactive", true);
        obesityLabel.classed("active", false).classed("inactive", true);
      }
      else if (chosenYAxis === "smokes") {
        healthcareLabel.classed("active", false).classed("inactive", true);
        smokesLabel.classed("active", true).classed("inactive", false);
        obesityLabel.classed("active", false).classed("inactive", true);
      }
      else if (chosenYAxis === "obesity") {
        healthcareLabel.classed("active", false).classed("inactive", true);
        smokesLabel.classed("active", false).classed("inactive", true);
        obesityLabel.classed("active", true).classed("inactive", false);
      }
    };
  });

}).catch(function(error) {
  console.log(error);
});


