var microtime = require("microtime");

function compareSimple(a, b) {
  if(a.length !== b.length) {
    return a.length - b.length;
  }
  var as = a.slice(0)
    , bs = b.slice(0);
  as.sort();
  bs.sort();
  for(var i=0; i<a.length; ++i) {
    var d = as[i] - bs[i];
    if(d) {
      return d;
    }
  }
  return 0;
}

function compare0(a,b) {
  return 0;
}

function compare1(a, b) {
  return a[0] - b[0];
}

function compare2Brutal(a, b) {
  if(a[0] < a[1]) {
    if(b[0] < b[1]) {
      if(a[0] === b[0]) {
        return a[1] - b[1];
      }
      return a[0] - b[0];
    } else {
      if(a[0] === b[1]) {
        return a[1] - b[0];
      }
      return a[0] - b[1];
    }
  } else {
    if(b[0] < b[1]) {
      if(a[1] === b[0]) {
        return a[0] - b[1];
      }
      return a[1] - b[0];
    } else {
      if(a[1] === b[1]) {
        return a[0] - b[0];
      }
      return a[1] - b[1];
    }
  }
}

function compare2Sym(a, b) {
  var d = a[0] + a[1] - b[0] - b[1];
  if(d) {
    return d;
  }
  return a[0] * a[1] - b[0] * b[1];
}

function compare2SymMask(a, b) {
  var d = ((a[0] + a[1])&0xffffffff) - ((b[0] - b[1])&0xffffffff);
  if(d) {
    return d;
  }
  return ((a[0] * a[1])&0xffffffff) - ((b[0] * b[1])&0xffffffff);
}


function compare3Sym(a, b) {
  var d = a[0] + a[1] + a[2] - b[0] - b[1] - b[2];
  if(d) {
    return d;
  }
  d = a[0] * a[1] + a[0] * a[2] + a[1] * a[2] - b[0] * b[1] - b[0] * b[2] - b[1] * b[2];
  if(d) {
    return d;
  }
  return a[0] * a[1] * a[2] - b[0] * b[1] * b[2];
}

function compare4Sym(a, b) {
  var d = a[0] + a[1] + a[2] + a[3] - b[0] - b[1] - b[2] - b[3];
  if(d) {
    return d;
  }
  d = 0;
  for(var i=0; i<4; ++i) {
    for(var j=i+1; j<4; ++j) {
      d += a[i] * a[j] - b[i] * b[j];
    }
  }
  if(d) {
    return d;
  }
  d = 0;
  for(var i=0; i<4; ++i) {
    for(var j=i+1; j<4; ++j) {
      for(var k=j+1; k<4; ++k) {
        d += a[i] * a[j] * a[k] - b[i] * b[j] * b[k];
      }
    }
  }
  if(d) {
    return d;
  }
  return a[0] * a[1] * a[2] * a[3] - b[0] * b[1] * b[2] * b[3];
}

function compare3SymOpt(a,b) {
  var l0 = a[0] + a[1]
    , m0 = b[0] + b[1]
    , d  = l0 + a[2] - m0 - b[2];
  if(d) {
    return d;
  }
  var l1 = a[0] * a[1]
    , m1 = b[0] * b[1];
  d = l1 * a[2] - m1 * b[2];
  if(d) {
    return d;
  }
  return l0 * a[2] + l1 - m0 * b[2] - m1;
}


function compare4SymOpt(a,b) {
  var l0 = a[0] + a[1]
    , l1 = a[2] + a[3]
    , m0 = b[0] + b[1]
    , m1 = b[2] + b[3]
    , d  = l0 + l1 - m0 - m1;
  if(d) {
    return d;
  }
  var l10 = a[0] * a[1]
    , l11 = a[2] * a[3]
    , m10 = b[0] * b[1]
    , m11 = b[2] * b[3];
  d = l10 * l11 - m10 * m11;
  if(d) {
    return d;
  }
  d = l0 * l1 + l10 + l11 - m0 * m1 - m10 - m11;
  if(d) {
    return d;
  }
  return l10 * l1 + l11 * l0 - m10 * m1 - m11 * m0;
}


function compare2Rank(a, b) {
  var d = Math.min(a[0],a[1]) - Math.min(b[0],b[1]);
  if(d) {
    return d;
  }
  return Math.max(a[0],a[1]) - Math.max(b[0],b[1]);
}

function compare3Rank(a,b) {
  var l0 = Math.min(a[0], a[1])
    , m0 = Math.min(b[0], b[1])
    , d  = Math.min(l0, a[2]) - Math.min(m0, b[2]);
  if(d) {
    return d;
  }
  var l1 = Math.max(a[0], a[1])
    , m1 = Math.max(b[0], b[1]);
  d = Math.max(l1, a[2]) - Math.max(m1, b[2]);
  if(d) {
    return d;
  }
  return Math.min(Math.max(l0, a[2]), l1) - Math.min(Math.max(m0, b[2]), m1);
}

function compare2MinP(a, b) {
  var d = a[0]+a[1]-b[0]-b[1];
  if(d) {
    return d;
  }
  return Math.min(a[0],a[1]) - Math.min(b[0],b[1]);
}

function compare3MinP(a, b) {
  var l1 = a[0]+a[1]
    , m1 = b[0]+b[1];
  d = l1+a[2] - (m1+b[2]);
  if(d) {
    return d;
  }
  var l0 = Math.min(a[0], a[1])
    , m0 = Math.min(b[0], b[1])
    , d  = Math.min(l0, a[2]) - Math.min(m0, b[2]);
  if(d) {
    return d;
  }
  return Math.min(l0+a[2], l1) - Math.min(m0+b[2], m1);
}

function do_benchmark(count, n, d, cmp) {
  var data = new Array(n);
  for(var i=0; i<n; ++i) {
    data[i] = new Array(d);
  }
  var total = 0;
  for(var k=0; k<count; ++k) {
    for(var i=0; i<n; ++i) {
      var tmp = data[i];
      for(var j=0; j<d; ++j) {
        tmp[j] = Math.floor(Math.random() * 1000);
      }
    }
    var start = microtime.now();
    data.sort(cmp);
    total += microtime.now() - start;
  }
  return total / count;
}



var tests = [
  {
    "simple":   compareSimple,
    "noop":     compare0
  },
  {
    "simple":   compareSimple,
    "optimal":  compare1
  },
  {
    "simple":   compareSimple,
    "brutal":   compare2Brutal,
    "sym":      compare2Sym,
    "masked":   compare2SymMask,
    "rank":     compare2Rank,
    "minp":     compare2MinP
  },
  {
    "simple":   compareSimple,
    "sym":      compare3Sym,
    "sym_opt":  compare3SymOpt,
    "rank":     compare3Rank,
    "minp":     compare3MinP
  },
  {
    "simple":   compareSimple,
    "sym":      compare4Sym,
    "sym_opt":  compare4SymOpt
  }
];

(function() {
  for(var d=0; d<tests.length; ++d) {
    var cases = tests[d];
    console.log("------------- D =", d, "---------------");
    for(var c in cases) {
      console.log(c, ":", do_benchmark(200, 1000, d, cases[c]));
    }
  }
})();
