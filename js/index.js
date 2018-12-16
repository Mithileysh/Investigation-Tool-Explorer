var yearCountChart;
var keywordChart;
var StaffChart;
var socialmediaChart;
var toolCount;
var toolTable;
var aorChart;


function loadCsv(path) {
  yearCountChart = dc.barChart("#user-count-chart");
  keywordChart = dc.rowChart("#keyword-count-chart");
  StaffChart = dc.rowChart("#berber-rating-chart");
  socialmediaChart = dc.rowChart("#socialmedia-count-chart");
  aorChart = dc.rowChart("#aor-chart");
  toolCount = dc.dataCount(".dc-data-count");
  toolTable = dc.dataTable(".dc-data-table");
  $("#content").show();
  d3.csv(path, function (data) {
    var dateFormat = d3.time.format("%Y-%m-%d");
    var numberFormat = d3.format(".2f");
    var topDir = 10;
    var totalWidth = 990;
    var height = 300;

    var maxYear = new Date().getFullYear();
    var minYear = maxYear;
    var smtools = [];
    data.map(function (d) {
      if (true) {
        d.rating = +d.Staff;
        d.year = +d.Year;
        d.keywordFreq = +d.KeywordFreq;
        d.votes = +d.Emails;
        d.Individuals = d.Individuals.split(", ");
        d.release = dateFormat.parse(d["Release Date (month/day/year)"]);
        d.smsources = d.Subjects.split(", ");
        d.Keywords = d.Keywords.split(", ");
        if (d.year < minYear) {
          minYear = d.year;
        }
        smtools.push(d);
      }
    });
    console.log(smtools);
    var ratings = crossfilter(smtools);
    console.log(ratings);
    var all = ratings.groupAll();

    var yearlyDimension = ratings.dimension(function (d) {
      return d.year;
    });

    var dateDimension = ratings.dimension(function (d) {
      return d.release;
    });

    var ratingDimension = ratings.dimension(function (d) {
      return d.rating;
    });

    var keywordDimension = ratings.dimension(function (d) {
      return d.Keywords[0];
    });

    var DepartmentDimension = ratings.dimension(function (d) {
      return d.Department;
    });

    // Individuals
    function locreduceAdd(p, v) {

      v.Individuals.forEach(function (val, idx) {
        p[val] = (p[val] || 0) + 1; //increment counts
      });
      return p;
    }

    function locreduceRemove(p, v) {
      v.Individuals.forEach(function (val, idx) {
        p[val] = (p[val] || 0) - 1; //decrement counts
      });
      return p;
    }

    function locreduceInitial() {
      console.log('in initial')
      return {};
    }

    var Individuals = ratings.dimension(function (d) {
      return d.Individuals;
    });
    
    var IndividualGroup = Individuals.groupAll().reduce(locreduceAdd, locreduceRemove, locreduceInitial).value();
    console.log(IndividualGroup);
    IndividualGroup.all = function () {
      console.log('creating Individual group')
      var newObject = [];
      for (var key in this) {
        if (this.hasOwnProperty(key) && key != "all") {
          newObject.push({
            key: key,
            value: this[ key]
          });
        }
      }
      return newObject;
    }
    
    // LANG
    function langreduceAdd(p, v) {
      v.Keywords.forEach(function (val, idx) {
        p[val] = (p[val] || 0) + 1; //increment counts
      });
      return p;
    }
    function langreduceRemove(p, v) {
      v.Keywords.forEach(function (val, idx) {
        p[val] = (p[val] || 0) - 1; //decrement counts
      });
      return p;
    }
    function langreduceInitial() {
      return {};
    }
    var Keywords = ratings.dimension(function (d) {
      return d.Keywords;
    });
    
    var keywordGroup = Keywords.groupAll().reduce(langreduceAdd, langreduceRemove, langreduceInitial).value();

    keywordGroup.all = function () {
      var newObject = [];
      for (var key in this) {
        if (this.hasOwnProperty(key) && key != "all") {
          newObject.push({
            key: key,
            value: this[key]
          });
        }
      }
      return newObject;
    }
    
    // MEDIA SOURCES
    function SMreduceAdd(p, v) {
      v.smsources.forEach(function (val, idx) {
        p[val] = (p[val] || 0) + 1; //increment counts
      });
      return p;
    }

    function SMreduceRemove(p, v) {
      v.smsources.forEach(function (val, idx) {
        p[val] = (p[val] || 0) - 1; //decrement counts
      });
      return p;

    }

    function SMreduceInitial() {
      return {};
    }

    var smsources = ratings.dimension(function (d) {
      return d.smsources;
    });
    
    var socialmediaGroup = smsources.groupAll().reduce(SMreduceAdd, SMreduceRemove, SMreduceInitial).value();

    socialmediaGroup.all = function () {
      var newObject = [];
      for (var key in this) {
        if (this.hasOwnProperty(key) && key != "all") {
          newObject.push({
            key: key,
            value: this[key]
          });
        }
      }
      return newObject;
    }

    var yearGroup = yearlyDimension.group().reduceCount();

    var ratingGroup = ratingDimension.group().reduceCount();

    yearCountChart
      .dimension(yearlyDimension)
      .group(yearGroup)
      .width(totalWidth / 2.1)
      .height(200)
      .x(d3.scale.linear().domain([minYear, maxYear+1]))
      .renderHorizontalGridLines(true)
      .filterPrinter(function (filters) {
      var filter = filters[0], s = '';
      s += numberFormat(filter[0]) + ' -> ' + numberFormat(filter[1]);
      return s;
    })
      .xAxis().tickFormat(d3.format("d"));

    yearCountChart.xAxis().tickFormat(
      function (v) {
        return v;
      });
    yearCountChart.yAxis().ticks(10);

    
    aorChart.width(600)
      .height(296)
      .dimension(Individuals)
      .group(IndividualGroup)/*
      .colors(["#ff7373","#ff4040","#ff0000","#bf3030","#a60000"])
      .colorDomain([13, 30])
      .point("AFRICOM", 34, 33)
      .point("CENTCOM", 34, 33)
      .point("EUCOM", 35, 22)
      .point("NORTHCOM", 15, 15)
      .point("PACOM", 23, 18)
      .point("SOUTHCOM", 35, 22)
      .point("SOCOM", 35, 22)*/
      .filterHandler(function(dimension, filters){
      console.log("*************************")
      console.log("Filtering " + filters)  
      console.log(Individuals)
      console.log(IndividualGroup)
      console.log(Keywords)
      console.log(keywordGroup)
      dimension.filter(null);
      if(filters.length === 0)
        dimension.filter(null);
      else
        dimension.filterFunction(function (d) {
          var isSuperset = filters.every(function(val) { return d.indexOf(val) >= 0;})
          return isSuperset;
        });
      return filters;
    });
  
    StaffChart
      .width(totalWidth / 2.1)
      .height(200)
      .margins({top: 20, left: 10, right: 10, bottom: 20})
      .dimension(ratingDimension)
      .ordinalColors(d3.scale.category10().range())
      .renderLabel(true)
      .ordering(function (d) {
        return -d.key;
      })
      .group(ratingGroup)
      .elasticX(true)
      .xAxis().tickFormat(d3.format("d"));

    keywordChart
      .width(totalWidth / 2.1)
      .height(400)
      .margins({top: 20, left: 10, right: 10, bottom: 20})
      .dimension(Keywords)
      .group(keywordGroup)
      .ordinalColors(d3.scale.category10().range())
      .title(function (d) {
        return d.value;
      })
      .elasticX(true)
    // 
      .filterHandler(function(dimension, filters){
      console.log("*************************")
      console.log("Filtering " + filters)  
      console.log(Individuals)
      console.log(IndividualGroup)
      console.log(Keywords)
      console.log(keywordGroup)
      dimension.filter(null);
      if(filters.length === 0)
        dimension.filter(null);
      else
        dimension.filterFunction(function (d) {
          var isSuperset = filters.every(function(val) { return d.indexOf(val) >= 0;})
          return isSuperset;
        });
      return filters;
    })
      .xAxis().ticks(10).tickFormat(d3.format("d"));

    socialmediaChart
      .width(totalWidth / 2.1)
      .height(400)
      .margins({top: 20, left: 10, right: 10, bottom: 20})
      .dimension(smsources)
      .group(socialmediaGroup)
      .ordinalColors(d3.scale.category10().range())
      .title(function (d) {
      return d.value;
    })
      .ordering(function (d) {
      return -d.value;
    })
      .filterHandler(function(dimension, filters){
      dimension.filter(null);
      if(filters.length === 0)
        dimension.filter(null);
      else
        dimension.filterFunction(function (d) {
          var isSuperset = filters.every(function(val) { return d.indexOf(val) >= 0;})
          return isSuperset;
        });
      return filters;
    })
      .elasticX(true)
      .xAxis().ticks(10)
      .tickFormat(d3.format("d"));

    toolCount /* dc.dataCount('.dc-data-count', 'chartGroup'); */
      .dimension(ratings)
      .group(all)
      .html({
      some: '<strong>%filter-count</strong> selected out of <strong>%total-count</strong> tools' +
      ' | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'\'>Reset All</a>',
      all: 'All tools selected. Please click on the graph to apply filters.'
    });

    toolTable
      .dimension(dateDimension)
      .group(function (d) {
      return "";
    })
      .size(200)
      .columns([
      {
        // Specify a custom format for column 'Change' by using a label with a function.
        label: 'Department',
        format: function (d) {
          return "<a href=" + d.URL + ">" + d.Department + "</a>";
        }
      },
      'year',
      'Individuals',
      'Keywords',
      'Emails',
      {
      // Specify a custom format for column 'Change' by using a label with a function.
      label: 'Subjects',
      format: function (d) {
      var socialmediaString = d.smsources[0];
               d.smsources.forEach(function(val, i){
      if (i > 0) {
        socialmediaString += ", " + val;
      }
    });
    return socialmediaString;
  }
         },
         //'genres',
         'Staff'
         ])
    .sortBy(function (d) {
    return d.Staff;
  })
    .order(d3.descending)
    .on('renderlet', function (table) {
    table.selectAll('.dc-table-group').classed('info', true);
  });

  dc.renderAll();


});
}

function readCsvFromFile(evt) {
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    var f = evt.target.files[0];
    var reader = new FileReader();
    reader.onload = (function(theFile) {

      return function(e) {
        loadCsv(e.target.result);
      };
    })(f);
    reader.readAsDataURL(f);
  } else {
    alert('The File APIs are not fully supported in this browser.');
  }
}

function DepartmentCase(str) {
  var newstr = str.split(" ");
  for(i=0;i<newstr.length;i++){
    var copy = newstr[i].substring(1).toLowerCase();
    newstr[i] = newstr[i][0].toUpperCase() + copy;
  }
  newstr = newstr.join(" ");
  return newstr;
}

$('#csvFile').on('change', readCsvFromFile);
$('#csvFile').on('click',function(){$(this).val("")});