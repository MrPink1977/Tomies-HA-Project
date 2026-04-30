var Ln = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, It = {}, Mf;
function Rv() {
  if (Mf) return It;
  Mf = 1, Object.defineProperty(It, "__esModule", { value: !0 }), It._accessExpressionAsString = void 0;
  const j = (G) => W(G) ? `.${G}` : `[${JSON.stringify(G)}]`;
  It._accessExpressionAsString = j;
  const W = (G) => d(G) === !1 && /^[a-zA-Z_$][a-zA-Z_$0-9]*$/g.test(G), d = (G) => N.has(G), N = /* @__PURE__ */ new Set([
    "break",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "debugger",
    "default",
    "delete",
    "do",
    "else",
    "enum",
    "export",
    "extends",
    "false",
    "finally",
    "for",
    "function",
    "if",
    "import",
    "in",
    "instanceof",
    "new",
    "null",
    "return",
    "super",
    "switch",
    "this",
    "throw",
    "true",
    "try",
    "typeof",
    "var",
    "void",
    "while",
    "with"
  ]);
  return It;
}
var ar = /* @__PURE__ */ Rv(), jt = {}, Pf;
function Ev() {
  if (Pf) return jt;
  Pf = 1, Object.defineProperty(jt, "__esModule", { value: !0 }), jt._validateReport = void 0;
  const j = (W) => {
    const d = (N) => {
      if (W.length === 0)
        return !0;
      const G = W[W.length - 1].path;
      return N.length > G.length || G.substring(0, N.length) !== N;
    };
    return (N, G) => {
      var D;
      return N && d(G.path) && (G.value === void 0 && ((D = G.description) !== null && D !== void 0 || (G.description = [
        "The value at this path is `undefined`.",
        "",
        `Please fill the \`${G.expected}\` typed value next time.`
      ].join(`
`))), W.push(G)), !1;
    };
  };
  return jt._validateReport = j, jt;
}
var Wt = /* @__PURE__ */ Ev();
const Lv = "ll-strategy-dashboard-", ni = "ll-strategy-view-";
var ke = /* @__PURE__ */ ((j) => (j.entity = "entity", j.domain = "domain", j.device = "device", j.area = "area", j.floor = "floor", j.integration = "integration", j.label = "label", j.state = "state", j.attribute = "attribute", j.disabled_by = "disabled_by", j.hidden_by = "hidden_by", j.entity_category = "entity_category", j))(ke || {}), gr = /* @__PURE__ */ ((j) => (j.equal = "equal", j.match = "match", j.in = "in", j.greater_than = "greater_than", j.lower_than = "lower_than", j.is_null = "is_null", j.is_numeric = "is_numeric", j))(gr || {}), Ft = /* @__PURE__ */ ((j) => (j.ascending = "ascending", j.descending = "descending", j))(Ft || {}), Df = /* @__PURE__ */ ((j) => (j.add = "add", j.reset = "reset", j))(Df || {});
const Bt = (j, W) => (d) => {
  let N = !0;
  return j.filter && (N = (j.filter?.include || new Array()).reduce(($, H) => {
    if (!$)
      return !1;
    try {
      const T = jn(H.type, d, H.config, W);
      return ei(H.comparator || gr.equal, T, H.value);
    } catch (T) {
      return console.error(T), !1;
    }
  }, N), N = (j.filter?.exclude || []).reduce(($, H) => {
    if (!$)
      return !1;
    try {
      const T = jn(H.type, d, H.config, W);
      return !ei(H.comparator || gr.equal, T, H.value);
    } catch (T) {
      return console.error(T), !1;
    }
  }, N)), N;
}, In = (j, W) => (d, N) => {
  let G = 0;
  return j.sort && j.sort.find((D) => {
    const $ = jn(D.type, d, D.config, W), H = jn(D.type, N, D.config, W);
    return G = ei(D.comparator || Ft.ascending, $, H), G;
  }), G;
};
function Iv(j) {
  return Object.values(gr).includes(j);
}
function jv(j) {
  return Object.values(Ft).includes(j);
}
const ei = (j, W, d) => {
  const N = parseFloat(W), G = parseFloat(d), D = String(W), $ = String(d), [H, T] = isNaN(N) || isNaN(G) ? [D, $] : [N, G];
  if (jv(j))
    switch (j) {
      case Ft.ascending:
        return H > T ? 1 : H < T ? -1 : 0;
      case Ft.descending:
        return H < T ? 1 : H > T ? -1 : 0;
    }
  if (Iv(j))
    switch (j) {
      case gr.equal:
        return W == d;
      case gr.match:
        return W ? new RegExp($).test(D) : !1;
      case gr.in:
        return Array.isArray(d) ? d.includes(W) : (console.warn("Cannot compare. Value must be array."), !1);
      case gr.greater_than:
        return isNaN(N) || isNaN(G) ? (console.warn("Cannot compare. One or more values are not numeric"), !1) : N > G;
      case gr.lower_than:
        return isNaN(N) || isNaN(G) ? (console.warn("Cannot compare. One or more values are not numeric"), !1) : N < G;
      case gr.is_null:
        return !!W;
      case gr.is_numeric:
        return !isNaN(N);
    }
  throw Error(`comparator '${j}' not implemented`);
}, yr = (j) => "floor_id" in j, jn = (j, W, d, N) => {
  switch (j) {
    case ke.entity:
      if (yr(W))
        throw Error(`valueType '${j}' not supported for areas`);
      return W.entity_id;
    case ke.domain:
      if (yr(W))
        throw Error(`valueType '${j}' not supported for areas`);
      return W.entity_id.split(".")[0];
    case ke.area:
      const $ = !yr(W) && W.device_id ? N.devices[W.device_id]?.area_id : void 0;
      return W.area_id || $ || void 0;
    case ke.floor:
      if (!yr(W))
        throw Error(`valueType '${j}' not supported for entities`);
      return W.floor_id || void 0;
    case ke.device:
      if (yr(W))
        throw Error(`valueType '${j}' not supported for areas`);
      return W.device_id || void 0;
    case ke.integration:
      if (yr(W))
        throw Error(`valueType '${j}' not supported for areas`);
      return W.platform;
    case ke.label:
      const Q = W.labels;
      return (/* @__PURE__ */ (() => {
        const J = (u) => (u.key === void 0 || typeof u.key == "string") && typeof u.label == "string";
        return (u) => typeof u == "object" && u !== null && J(u);
      })())(d) && Q.find((J) => new RegExp(d.label).test(J)) || void 0;
    case ke.state:
      if (yr(W))
        throw Error(`valueType '${j}' not supported for areas`);
      return N.states[W.entity_id]?.state;
    case ke.attribute:
      if (yr(W))
        throw Error(`valueType '${j}' not supported for areas`);
      const ee = N.states[W.entity_id]?.attributes;
      if ((/* @__PURE__ */ (() => {
        const J = (u) => (u.label === void 0 || typeof u.label == "string") && typeof u.key == "string";
        return (u) => typeof u == "object" && u !== null && J(u);
      })())(d)) {
        if (ee && ee.hasOwnProperty(d.key))
          return ee[d.key];
        console.warn(`'${d.key}' does not exist on '${W.entity_id}'`);
        return;
      } else {
        console.warn("value is not defined correctly");
        return;
      }
    case ke.disabled_by:
      if (yr(W))
        throw Error(`valueType '${j}' not supported for areas`);
      return W.disabled_by || void 0;
    case ke.hidden_by:
      if (yr(W))
        throw Error(`valueType '${j}' not supported for areas`);
      return W.hidden_by || void 0;
    case ke.entity_category:
      if (yr(W))
        throw Error(`valueType '${j}' not supported for areas`);
      return W.entity_category || void 0;
  }
};
var Tt = { exports: {} };
var Tv = Tt.exports, $f;
function Wv() {
  return $f || ($f = 1, (function(j, W) {
    (function() {
      var d, N = "4.17.21", G = 200, D = "Unsupported core-js use. Try https://npms.io/search?q=ponyfill.", $ = "Expected a function", H = "Invalid `variable` option passed into `_.template`", T = "__lodash_hash_undefined__", q = 500, Q = "__lodash_placeholder__", Y = 1, ee = 2, ae = 4, ne = 1, re = 2, J = 1, u = 2, i = 4, x = 8, F = 16, M = 32, ge = 64, we = 128, pe = 256, Se = 512, $e = 30, We = "...", Fe = 800, He = 16, De = 1, k = 2, m = 3, I = 1 / 0, w = 9007199254740991, f = 17976931348623157e292, a = NaN, g = 4294967295, y = g - 1, o = g >>> 1, _ = [
        ["ary", we],
        ["bind", J],
        ["bindKey", u],
        ["curry", x],
        ["curryRight", F],
        ["flip", Se],
        ["partial", M],
        ["partialRight", ge],
        ["rearg", pe]
      ], p = "[object Arguments]", L = "[object Array]", se = "[object AsyncFunction]", Ar = "[object Boolean]", st = "[object Date]", qf = "[object DOMException]", Pt = "[object Error]", $t = "[object Function]", oi = "[object GeneratorFunction]", fr = "[object Map]", lt = "[object Number]", kf = "[object Null]", br = "[object Object]", ii = "[object Promise]", Hf = "[object Proxy]", dt = "[object RegExp]", cr = "[object Set]", ut = "[object String]", Dt = "[object Symbol]", Kf = "[object Undefined]", yt = "[object WeakMap]", zf = "[object WeakSet]", gt = "[object ArrayBuffer]", Zr = "[object DataView]", Tn = "[object Float32Array]", Wn = "[object Float64Array]", Fn = "[object Int8Array]", Bn = "[object Int16Array]", Mn = "[object Int32Array]", Pn = "[object Uint8Array]", $n = "[object Uint8ClampedArray]", Dn = "[object Uint16Array]", Un = "[object Uint32Array]", Zf = /\b__p \+= '';/g, Yf = /\b(__p \+=) '' \+/g, Jf = /(__e\(.*?\)|\b__t\)) \+\n'';/g, ai = /&(?:amp|lt|gt|quot|#39);/g, fi = /[&<>"']/g, Xf = RegExp(ai.source), Vf = RegExp(fi.source), Qf = /<%-([\s\S]+?)%>/g, ec = /<%([\s\S]+?)%>/g, ci = /<%=([\s\S]+?)%>/g, rc = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, tc = /^\w*$/, nc = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g, Nn = /[\\^$.*+?()[\]{}|]/g, oc = RegExp(Nn.source), Gn = /^\s+/, ic = /\s/, ac = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/, fc = /\{\n\/\* \[wrapped with (.+)\] \*/, cc = /,? & /, sc = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g, lc = /[()=,{}\[\]\/\s]/, dc = /\\(\\)?/g, uc = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g, si = /\w*$/, yc = /^[-+]0x[0-9a-f]+$/i, gc = /^0b[01]+$/i, vc = /^\[object .+?Constructor\]$/, hc = /^0o[0-7]+$/i, _c = /^(?:0|[1-9]\d*)$/, mc = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g, Ut = /($^)/, Ac = /['\n\r\u2028\u2029\\]/g, Nt = "\\ud800-\\udfff", bc = "\\u0300-\\u036f", wc = "\\ufe20-\\ufe2f", xc = "\\u20d0-\\u20ff", li = bc + wc + xc, di = "\\u2700-\\u27bf", ui = "a-z\\xdf-\\xf6\\xf8-\\xff", Cc = "\\xac\\xb1\\xd7\\xf7", pc = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf", Sc = "\\u2000-\\u206f", Oc = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000", yi = "A-Z\\xc0-\\xd6\\xd8-\\xde", gi = "\\ufe0e\\ufe0f", vi = Cc + pc + Sc + Oc, qn = "['’]", Rc = "[" + Nt + "]", hi = "[" + vi + "]", Gt = "[" + li + "]", _i = "\\d+", Ec = "[" + di + "]", mi = "[" + ui + "]", Ai = "[^" + Nt + vi + _i + di + ui + yi + "]", kn = "\\ud83c[\\udffb-\\udfff]", Lc = "(?:" + Gt + "|" + kn + ")", bi = "[^" + Nt + "]", Hn = "(?:\\ud83c[\\udde6-\\uddff]){2}", Kn = "[\\ud800-\\udbff][\\udc00-\\udfff]", Yr = "[" + yi + "]", wi = "\\u200d", xi = "(?:" + mi + "|" + Ai + ")", Ic = "(?:" + Yr + "|" + Ai + ")", Ci = "(?:" + qn + "(?:d|ll|m|re|s|t|ve))?", pi = "(?:" + qn + "(?:D|LL|M|RE|S|T|VE))?", Si = Lc + "?", Oi = "[" + gi + "]?", jc = "(?:" + wi + "(?:" + [bi, Hn, Kn].join("|") + ")" + Oi + Si + ")*", Tc = "\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])", Wc = "\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])", Ri = Oi + Si + jc, Fc = "(?:" + [Ec, Hn, Kn].join("|") + ")" + Ri, Bc = "(?:" + [bi + Gt + "?", Gt, Hn, Kn, Rc].join("|") + ")", Mc = RegExp(qn, "g"), Pc = RegExp(Gt, "g"), zn = RegExp(kn + "(?=" + kn + ")|" + Bc + Ri, "g"), $c = RegExp([
        Yr + "?" + mi + "+" + Ci + "(?=" + [hi, Yr, "$"].join("|") + ")",
        Ic + "+" + pi + "(?=" + [hi, Yr + xi, "$"].join("|") + ")",
        Yr + "?" + xi + "+" + Ci,
        Yr + "+" + pi,
        Wc,
        Tc,
        _i,
        Fc
      ].join("|"), "g"), Dc = RegExp("[" + wi + Nt + li + gi + "]"), Uc = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/, Nc = [
        "Array",
        "Buffer",
        "DataView",
        "Date",
        "Error",
        "Float32Array",
        "Float64Array",
        "Function",
        "Int8Array",
        "Int16Array",
        "Int32Array",
        "Map",
        "Math",
        "Object",
        "Promise",
        "RegExp",
        "Set",
        "String",
        "Symbol",
        "TypeError",
        "Uint8Array",
        "Uint8ClampedArray",
        "Uint16Array",
        "Uint32Array",
        "WeakMap",
        "_",
        "clearTimeout",
        "isFinite",
        "parseInt",
        "setTimeout"
      ], Gc = -1, _e = {};
      _e[Tn] = _e[Wn] = _e[Fn] = _e[Bn] = _e[Mn] = _e[Pn] = _e[$n] = _e[Dn] = _e[Un] = !0, _e[p] = _e[L] = _e[gt] = _e[Ar] = _e[Zr] = _e[st] = _e[Pt] = _e[$t] = _e[fr] = _e[lt] = _e[br] = _e[dt] = _e[cr] = _e[ut] = _e[yt] = !1;
      var he = {};
      he[p] = he[L] = he[gt] = he[Zr] = he[Ar] = he[st] = he[Tn] = he[Wn] = he[Fn] = he[Bn] = he[Mn] = he[fr] = he[lt] = he[br] = he[dt] = he[cr] = he[ut] = he[Dt] = he[Pn] = he[$n] = he[Dn] = he[Un] = !0, he[Pt] = he[$t] = he[yt] = !1;
      var qc = {
        // Latin-1 Supplement block.
        À: "A",
        Á: "A",
        Â: "A",
        Ã: "A",
        Ä: "A",
        Å: "A",
        à: "a",
        á: "a",
        â: "a",
        ã: "a",
        ä: "a",
        å: "a",
        Ç: "C",
        ç: "c",
        Ð: "D",
        ð: "d",
        È: "E",
        É: "E",
        Ê: "E",
        Ë: "E",
        è: "e",
        é: "e",
        ê: "e",
        ë: "e",
        Ì: "I",
        Í: "I",
        Î: "I",
        Ï: "I",
        ì: "i",
        í: "i",
        î: "i",
        ï: "i",
        Ñ: "N",
        ñ: "n",
        Ò: "O",
        Ó: "O",
        Ô: "O",
        Õ: "O",
        Ö: "O",
        Ø: "O",
        ò: "o",
        ó: "o",
        ô: "o",
        õ: "o",
        ö: "o",
        ø: "o",
        Ù: "U",
        Ú: "U",
        Û: "U",
        Ü: "U",
        ù: "u",
        ú: "u",
        û: "u",
        ü: "u",
        Ý: "Y",
        ý: "y",
        ÿ: "y",
        Æ: "Ae",
        æ: "ae",
        Þ: "Th",
        þ: "th",
        ß: "ss",
        // Latin Extended-A block.
        Ā: "A",
        Ă: "A",
        Ą: "A",
        ā: "a",
        ă: "a",
        ą: "a",
        Ć: "C",
        Ĉ: "C",
        Ċ: "C",
        Č: "C",
        ć: "c",
        ĉ: "c",
        ċ: "c",
        č: "c",
        Ď: "D",
        Đ: "D",
        ď: "d",
        đ: "d",
        Ē: "E",
        Ĕ: "E",
        Ė: "E",
        Ę: "E",
        Ě: "E",
        ē: "e",
        ĕ: "e",
        ė: "e",
        ę: "e",
        ě: "e",
        Ĝ: "G",
        Ğ: "G",
        Ġ: "G",
        Ģ: "G",
        ĝ: "g",
        ğ: "g",
        ġ: "g",
        ģ: "g",
        Ĥ: "H",
        Ħ: "H",
        ĥ: "h",
        ħ: "h",
        Ĩ: "I",
        Ī: "I",
        Ĭ: "I",
        Į: "I",
        İ: "I",
        ĩ: "i",
        ī: "i",
        ĭ: "i",
        į: "i",
        ı: "i",
        Ĵ: "J",
        ĵ: "j",
        Ķ: "K",
        ķ: "k",
        ĸ: "k",
        Ĺ: "L",
        Ļ: "L",
        Ľ: "L",
        Ŀ: "L",
        Ł: "L",
        ĺ: "l",
        ļ: "l",
        ľ: "l",
        ŀ: "l",
        ł: "l",
        Ń: "N",
        Ņ: "N",
        Ň: "N",
        Ŋ: "N",
        ń: "n",
        ņ: "n",
        ň: "n",
        ŋ: "n",
        Ō: "O",
        Ŏ: "O",
        Ő: "O",
        ō: "o",
        ŏ: "o",
        ő: "o",
        Ŕ: "R",
        Ŗ: "R",
        Ř: "R",
        ŕ: "r",
        ŗ: "r",
        ř: "r",
        Ś: "S",
        Ŝ: "S",
        Ş: "S",
        Š: "S",
        ś: "s",
        ŝ: "s",
        ş: "s",
        š: "s",
        Ţ: "T",
        Ť: "T",
        Ŧ: "T",
        ţ: "t",
        ť: "t",
        ŧ: "t",
        Ũ: "U",
        Ū: "U",
        Ŭ: "U",
        Ů: "U",
        Ű: "U",
        Ų: "U",
        ũ: "u",
        ū: "u",
        ŭ: "u",
        ů: "u",
        ű: "u",
        ų: "u",
        Ŵ: "W",
        ŵ: "w",
        Ŷ: "Y",
        ŷ: "y",
        Ÿ: "Y",
        Ź: "Z",
        Ż: "Z",
        Ž: "Z",
        ź: "z",
        ż: "z",
        ž: "z",
        Ĳ: "IJ",
        ĳ: "ij",
        Œ: "Oe",
        œ: "oe",
        ŉ: "'n",
        ſ: "s"
      }, kc = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }, Hc = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&#39;": "'"
      }, Kc = {
        "\\": "\\",
        "'": "'",
        "\n": "n",
        "\r": "r",
        "\u2028": "u2028",
        "\u2029": "u2029"
      }, zc = parseFloat, Zc = parseInt, Ei = typeof Ln == "object" && Ln && Ln.Object === Object && Ln, Yc = typeof self == "object" && self && self.Object === Object && self, Le = Ei || Yc || Function("return this")(), Zn = W && !W.nodeType && W, Dr = Zn && !0 && j && !j.nodeType && j, Li = Dr && Dr.exports === Zn, Yn = Li && Ei.process, Ve = (function() {
        try {
          var A = Dr && Dr.require && Dr.require("util").types;
          return A || Yn && Yn.binding && Yn.binding("util");
        } catch {
        }
      })(), Ii = Ve && Ve.isArrayBuffer, ji = Ve && Ve.isDate, Ti = Ve && Ve.isMap, Wi = Ve && Ve.isRegExp, Fi = Ve && Ve.isSet, Bi = Ve && Ve.isTypedArray;
      function Ke(A, S, C) {
        switch (C.length) {
          case 0:
            return A.call(S);
          case 1:
            return A.call(S, C[0]);
          case 2:
            return A.call(S, C[0], C[1]);
          case 3:
            return A.call(S, C[0], C[1], C[2]);
        }
        return A.apply(S, C);
      }
      function Jc(A, S, C, P) {
        for (var X = -1, de = A == null ? 0 : A.length; ++X < de; ) {
          var Oe = A[X];
          S(P, Oe, C(Oe), A);
        }
        return P;
      }
      function Qe(A, S) {
        for (var C = -1, P = A == null ? 0 : A.length; ++C < P && S(A[C], C, A) !== !1; )
          ;
        return A;
      }
      function Xc(A, S) {
        for (var C = A == null ? 0 : A.length; C-- && S(A[C], C, A) !== !1; )
          ;
        return A;
      }
      function Mi(A, S) {
        for (var C = -1, P = A == null ? 0 : A.length; ++C < P; )
          if (!S(A[C], C, A))
            return !1;
        return !0;
      }
      function Ir(A, S) {
        for (var C = -1, P = A == null ? 0 : A.length, X = 0, de = []; ++C < P; ) {
          var Oe = A[C];
          S(Oe, C, A) && (de[X++] = Oe);
        }
        return de;
      }
      function qt(A, S) {
        var C = A == null ? 0 : A.length;
        return !!C && Jr(A, S, 0) > -1;
      }
      function Jn(A, S, C) {
        for (var P = -1, X = A == null ? 0 : A.length; ++P < X; )
          if (C(S, A[P]))
            return !0;
        return !1;
      }
      function me(A, S) {
        for (var C = -1, P = A == null ? 0 : A.length, X = Array(P); ++C < P; )
          X[C] = S(A[C], C, A);
        return X;
      }
      function jr(A, S) {
        for (var C = -1, P = S.length, X = A.length; ++C < P; )
          A[X + C] = S[C];
        return A;
      }
      function Xn(A, S, C, P) {
        var X = -1, de = A == null ? 0 : A.length;
        for (P && de && (C = A[++X]); ++X < de; )
          C = S(C, A[X], X, A);
        return C;
      }
      function Vc(A, S, C, P) {
        var X = A == null ? 0 : A.length;
        for (P && X && (C = A[--X]); X--; )
          C = S(C, A[X], X, A);
        return C;
      }
      function Vn(A, S) {
        for (var C = -1, P = A == null ? 0 : A.length; ++C < P; )
          if (S(A[C], C, A))
            return !0;
        return !1;
      }
      var Qc = Qn("length");
      function es(A) {
        return A.split("");
      }
      function rs(A) {
        return A.match(sc) || [];
      }
      function Pi(A, S, C) {
        var P;
        return C(A, function(X, de, Oe) {
          if (S(X, de, Oe))
            return P = de, !1;
        }), P;
      }
      function kt(A, S, C, P) {
        for (var X = A.length, de = C + (P ? 1 : -1); P ? de-- : ++de < X; )
          if (S(A[de], de, A))
            return de;
        return -1;
      }
      function Jr(A, S, C) {
        return S === S ? ys(A, S, C) : kt(A, $i, C);
      }
      function ts(A, S, C, P) {
        for (var X = C - 1, de = A.length; ++X < de; )
          if (P(A[X], S))
            return X;
        return -1;
      }
      function $i(A) {
        return A !== A;
      }
      function Di(A, S) {
        var C = A == null ? 0 : A.length;
        return C ? ro(A, S) / C : a;
      }
      function Qn(A) {
        return function(S) {
          return S == null ? d : S[A];
        };
      }
      function eo(A) {
        return function(S) {
          return A == null ? d : A[S];
        };
      }
      function Ui(A, S, C, P, X) {
        return X(A, function(de, Oe, ve) {
          C = P ? (P = !1, de) : S(C, de, Oe, ve);
        }), C;
      }
      function ns(A, S) {
        var C = A.length;
        for (A.sort(S); C--; )
          A[C] = A[C].value;
        return A;
      }
      function ro(A, S) {
        for (var C, P = -1, X = A.length; ++P < X; ) {
          var de = S(A[P]);
          de !== d && (C = C === d ? de : C + de);
        }
        return C;
      }
      function to(A, S) {
        for (var C = -1, P = Array(A); ++C < A; )
          P[C] = S(C);
        return P;
      }
      function os(A, S) {
        return me(S, function(C) {
          return [C, A[C]];
        });
      }
      function Ni(A) {
        return A && A.slice(0, Hi(A) + 1).replace(Gn, "");
      }
      function ze(A) {
        return function(S) {
          return A(S);
        };
      }
      function no(A, S) {
        return me(S, function(C) {
          return A[C];
        });
      }
      function vt(A, S) {
        return A.has(S);
      }
      function Gi(A, S) {
        for (var C = -1, P = A.length; ++C < P && Jr(S, A[C], 0) > -1; )
          ;
        return C;
      }
      function qi(A, S) {
        for (var C = A.length; C-- && Jr(S, A[C], 0) > -1; )
          ;
        return C;
      }
      function is(A, S) {
        for (var C = A.length, P = 0; C--; )
          A[C] === S && ++P;
        return P;
      }
      var as = eo(qc), fs = eo(kc);
      function cs(A) {
        return "\\" + Kc[A];
      }
      function ss(A, S) {
        return A == null ? d : A[S];
      }
      function Xr(A) {
        return Dc.test(A);
      }
      function ls(A) {
        return Uc.test(A);
      }
      function ds(A) {
        for (var S, C = []; !(S = A.next()).done; )
          C.push(S.value);
        return C;
      }
      function oo(A) {
        var S = -1, C = Array(A.size);
        return A.forEach(function(P, X) {
          C[++S] = [X, P];
        }), C;
      }
      function ki(A, S) {
        return function(C) {
          return A(S(C));
        };
      }
      function Tr(A, S) {
        for (var C = -1, P = A.length, X = 0, de = []; ++C < P; ) {
          var Oe = A[C];
          (Oe === S || Oe === Q) && (A[C] = Q, de[X++] = C);
        }
        return de;
      }
      function Ht(A) {
        var S = -1, C = Array(A.size);
        return A.forEach(function(P) {
          C[++S] = P;
        }), C;
      }
      function us(A) {
        var S = -1, C = Array(A.size);
        return A.forEach(function(P) {
          C[++S] = [P, P];
        }), C;
      }
      function ys(A, S, C) {
        for (var P = C - 1, X = A.length; ++P < X; )
          if (A[P] === S)
            return P;
        return -1;
      }
      function gs(A, S, C) {
        for (var P = C + 1; P--; )
          if (A[P] === S)
            return P;
        return P;
      }
      function Vr(A) {
        return Xr(A) ? hs(A) : Qc(A);
      }
      function sr(A) {
        return Xr(A) ? _s(A) : es(A);
      }
      function Hi(A) {
        for (var S = A.length; S-- && ic.test(A.charAt(S)); )
          ;
        return S;
      }
      var vs = eo(Hc);
      function hs(A) {
        for (var S = zn.lastIndex = 0; zn.test(A); )
          ++S;
        return S;
      }
      function _s(A) {
        return A.match(zn) || [];
      }
      function ms(A) {
        return A.match($c) || [];
      }
      var As = (function A(S) {
        S = S == null ? Le : Qr.defaults(Le.Object(), S, Qr.pick(Le, Nc));
        var C = S.Array, P = S.Date, X = S.Error, de = S.Function, Oe = S.Math, ve = S.Object, io = S.RegExp, bs = S.String, er = S.TypeError, Kt = C.prototype, ws = de.prototype, et = ve.prototype, zt = S["__core-js_shared__"], Zt = ws.toString, ye = et.hasOwnProperty, xs = 0, Ki = (function() {
          var e = /[^.]+$/.exec(zt && zt.keys && zt.keys.IE_PROTO || "");
          return e ? "Symbol(src)_1." + e : "";
        })(), Yt = et.toString, Cs = Zt.call(ve), ps = Le._, Ss = io(
          "^" + Zt.call(ye).replace(Nn, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
        ), Jt = Li ? S.Buffer : d, Wr = S.Symbol, Xt = S.Uint8Array, zi = Jt ? Jt.allocUnsafe : d, Vt = ki(ve.getPrototypeOf, ve), Zi = ve.create, Yi = et.propertyIsEnumerable, Qt = Kt.splice, Ji = Wr ? Wr.isConcatSpreadable : d, ht = Wr ? Wr.iterator : d, Ur = Wr ? Wr.toStringTag : d, en = (function() {
          try {
            var e = Hr(ve, "defineProperty");
            return e({}, "", {}), e;
          } catch {
          }
        })(), Os = S.clearTimeout !== Le.clearTimeout && S.clearTimeout, Rs = P && P.now !== Le.Date.now && P.now, Es = S.setTimeout !== Le.setTimeout && S.setTimeout, rn = Oe.ceil, tn = Oe.floor, ao = ve.getOwnPropertySymbols, Ls = Jt ? Jt.isBuffer : d, Xi = S.isFinite, Is = Kt.join, js = ki(ve.keys, ve), Re = Oe.max, je = Oe.min, Ts = P.now, Ws = S.parseInt, Vi = Oe.random, Fs = Kt.reverse, fo = Hr(S, "DataView"), _t = Hr(S, "Map"), co = Hr(S, "Promise"), rt = Hr(S, "Set"), mt = Hr(S, "WeakMap"), At = Hr(ve, "create"), nn = mt && new mt(), tt = {}, Bs = Kr(fo), Ms = Kr(_t), Ps = Kr(co), $s = Kr(rt), Ds = Kr(mt), on = Wr ? Wr.prototype : d, bt = on ? on.valueOf : d, Qi = on ? on.toString : d;
        function s(e) {
          if (be(e) && !V(e) && !(e instanceof ce)) {
            if (e instanceof rr)
              return e;
            if (ye.call(e, "__wrapped__"))
              return ef(e);
          }
          return new rr(e);
        }
        var nt = /* @__PURE__ */ (function() {
          function e() {
          }
          return function(r) {
            if (!Ae(r))
              return {};
            if (Zi)
              return Zi(r);
            e.prototype = r;
            var t = new e();
            return e.prototype = d, t;
          };
        })();
        function an() {
        }
        function rr(e, r) {
          this.__wrapped__ = e, this.__actions__ = [], this.__chain__ = !!r, this.__index__ = 0, this.__values__ = d;
        }
        s.templateSettings = {
          /**
           * Used to detect `data` property values to be HTML-escaped.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          escape: Qf,
          /**
           * Used to detect code to be evaluated.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          evaluate: ec,
          /**
           * Used to detect `data` property values to inject.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          interpolate: ci,
          /**
           * Used to reference the data object in the template text.
           *
           * @memberOf _.templateSettings
           * @type {string}
           */
          variable: "",
          /**
           * Used to import variables into the compiled template.
           *
           * @memberOf _.templateSettings
           * @type {Object}
           */
          imports: {
            /**
             * A reference to the `lodash` function.
             *
             * @memberOf _.templateSettings.imports
             * @type {Function}
             */
            _: s
          }
        }, s.prototype = an.prototype, s.prototype.constructor = s, rr.prototype = nt(an.prototype), rr.prototype.constructor = rr;
        function ce(e) {
          this.__wrapped__ = e, this.__actions__ = [], this.__dir__ = 1, this.__filtered__ = !1, this.__iteratees__ = [], this.__takeCount__ = g, this.__views__ = [];
        }
        function Us() {
          var e = new ce(this.__wrapped__);
          return e.__actions__ = Ue(this.__actions__), e.__dir__ = this.__dir__, e.__filtered__ = this.__filtered__, e.__iteratees__ = Ue(this.__iteratees__), e.__takeCount__ = this.__takeCount__, e.__views__ = Ue(this.__views__), e;
        }
        function Ns() {
          if (this.__filtered__) {
            var e = new ce(this);
            e.__dir__ = -1, e.__filtered__ = !0;
          } else
            e = this.clone(), e.__dir__ *= -1;
          return e;
        }
        function Gs() {
          var e = this.__wrapped__.value(), r = this.__dir__, t = V(e), n = r < 0, c = t ? e.length : 0, l = ed(0, c, this.__views__), v = l.start, h = l.end, b = h - v, O = n ? h : v - 1, R = this.__iteratees__, E = R.length, B = 0, U = je(b, this.__takeCount__);
          if (!t || !n && c == b && U == b)
            return Ca(e, this.__actions__);
          var z = [];
          e:
            for (; b-- && B < U; ) {
              O += r;
              for (var oe = -1, Z = e[O]; ++oe < E; ) {
                var fe = R[oe], le = fe.iteratee, Je = fe.type, Pe = le(Z);
                if (Je == k)
                  Z = Pe;
                else if (!Pe) {
                  if (Je == De)
                    continue e;
                  break e;
                }
              }
              z[B++] = Z;
            }
          return z;
        }
        ce.prototype = nt(an.prototype), ce.prototype.constructor = ce;
        function Nr(e) {
          var r = -1, t = e == null ? 0 : e.length;
          for (this.clear(); ++r < t; ) {
            var n = e[r];
            this.set(n[0], n[1]);
          }
        }
        function qs() {
          this.__data__ = At ? At(null) : {}, this.size = 0;
        }
        function ks(e) {
          var r = this.has(e) && delete this.__data__[e];
          return this.size -= r ? 1 : 0, r;
        }
        function Hs(e) {
          var r = this.__data__;
          if (At) {
            var t = r[e];
            return t === T ? d : t;
          }
          return ye.call(r, e) ? r[e] : d;
        }
        function Ks(e) {
          var r = this.__data__;
          return At ? r[e] !== d : ye.call(r, e);
        }
        function zs(e, r) {
          var t = this.__data__;
          return this.size += this.has(e) ? 0 : 1, t[e] = At && r === d ? T : r, this;
        }
        Nr.prototype.clear = qs, Nr.prototype.delete = ks, Nr.prototype.get = Hs, Nr.prototype.has = Ks, Nr.prototype.set = zs;
        function wr(e) {
          var r = -1, t = e == null ? 0 : e.length;
          for (this.clear(); ++r < t; ) {
            var n = e[r];
            this.set(n[0], n[1]);
          }
        }
        function Zs() {
          this.__data__ = [], this.size = 0;
        }
        function Ys(e) {
          var r = this.__data__, t = fn(r, e);
          if (t < 0)
            return !1;
          var n = r.length - 1;
          return t == n ? r.pop() : Qt.call(r, t, 1), --this.size, !0;
        }
        function Js(e) {
          var r = this.__data__, t = fn(r, e);
          return t < 0 ? d : r[t][1];
        }
        function Xs(e) {
          return fn(this.__data__, e) > -1;
        }
        function Vs(e, r) {
          var t = this.__data__, n = fn(t, e);
          return n < 0 ? (++this.size, t.push([e, r])) : t[n][1] = r, this;
        }
        wr.prototype.clear = Zs, wr.prototype.delete = Ys, wr.prototype.get = Js, wr.prototype.has = Xs, wr.prototype.set = Vs;
        function xr(e) {
          var r = -1, t = e == null ? 0 : e.length;
          for (this.clear(); ++r < t; ) {
            var n = e[r];
            this.set(n[0], n[1]);
          }
        }
        function Qs() {
          this.size = 0, this.__data__ = {
            hash: new Nr(),
            map: new (_t || wr)(),
            string: new Nr()
          };
        }
        function el(e) {
          var r = An(this, e).delete(e);
          return this.size -= r ? 1 : 0, r;
        }
        function rl(e) {
          return An(this, e).get(e);
        }
        function tl(e) {
          return An(this, e).has(e);
        }
        function nl(e, r) {
          var t = An(this, e), n = t.size;
          return t.set(e, r), this.size += t.size == n ? 0 : 1, this;
        }
        xr.prototype.clear = Qs, xr.prototype.delete = el, xr.prototype.get = rl, xr.prototype.has = tl, xr.prototype.set = nl;
        function Gr(e) {
          var r = -1, t = e == null ? 0 : e.length;
          for (this.__data__ = new xr(); ++r < t; )
            this.add(e[r]);
        }
        function ol(e) {
          return this.__data__.set(e, T), this;
        }
        function il(e) {
          return this.__data__.has(e);
        }
        Gr.prototype.add = Gr.prototype.push = ol, Gr.prototype.has = il;
        function lr(e) {
          var r = this.__data__ = new wr(e);
          this.size = r.size;
        }
        function al() {
          this.__data__ = new wr(), this.size = 0;
        }
        function fl(e) {
          var r = this.__data__, t = r.delete(e);
          return this.size = r.size, t;
        }
        function cl(e) {
          return this.__data__.get(e);
        }
        function sl(e) {
          return this.__data__.has(e);
        }
        function ll(e, r) {
          var t = this.__data__;
          if (t instanceof wr) {
            var n = t.__data__;
            if (!_t || n.length < G - 1)
              return n.push([e, r]), this.size = ++t.size, this;
            t = this.__data__ = new xr(n);
          }
          return t.set(e, r), this.size = t.size, this;
        }
        lr.prototype.clear = al, lr.prototype.delete = fl, lr.prototype.get = cl, lr.prototype.has = sl, lr.prototype.set = ll;
        function ea(e, r) {
          var t = V(e), n = !t && zr(e), c = !t && !n && $r(e), l = !t && !n && !c && ft(e), v = t || n || c || l, h = v ? to(e.length, bs) : [], b = h.length;
          for (var O in e)
            (r || ye.call(e, O)) && !(v && // Safari 9 has enumerable `arguments.length` in strict mode.
            (O == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
            c && (O == "offset" || O == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
            l && (O == "buffer" || O == "byteLength" || O == "byteOffset") || // Skip index properties.
            Or(O, b))) && h.push(O);
          return h;
        }
        function ra(e) {
          var r = e.length;
          return r ? e[bo(0, r - 1)] : d;
        }
        function dl(e, r) {
          return bn(Ue(e), qr(r, 0, e.length));
        }
        function ul(e) {
          return bn(Ue(e));
        }
        function so(e, r, t) {
          (t !== d && !dr(e[r], t) || t === d && !(r in e)) && Cr(e, r, t);
        }
        function wt(e, r, t) {
          var n = e[r];
          (!(ye.call(e, r) && dr(n, t)) || t === d && !(r in e)) && Cr(e, r, t);
        }
        function fn(e, r) {
          for (var t = e.length; t--; )
            if (dr(e[t][0], r))
              return t;
          return -1;
        }
        function yl(e, r, t, n) {
          return Fr(e, function(c, l, v) {
            r(n, c, t(c), v);
          }), n;
        }
        function ta(e, r) {
          return e && _r(r, Ee(r), e);
        }
        function gl(e, r) {
          return e && _r(r, Ge(r), e);
        }
        function Cr(e, r, t) {
          r == "__proto__" && en ? en(e, r, {
            configurable: !0,
            enumerable: !0,
            value: t,
            writable: !0
          }) : e[r] = t;
        }
        function lo(e, r) {
          for (var t = -1, n = r.length, c = C(n), l = e == null; ++t < n; )
            c[t] = l ? d : Ho(e, r[t]);
          return c;
        }
        function qr(e, r, t) {
          return e === e && (t !== d && (e = e <= t ? e : t), r !== d && (e = e >= r ? e : r)), e;
        }
        function tr(e, r, t, n, c, l) {
          var v, h = r & Y, b = r & ee, O = r & ae;
          if (t && (v = c ? t(e, n, c, l) : t(e)), v !== d)
            return v;
          if (!Ae(e))
            return e;
          var R = V(e);
          if (R) {
            if (v = td(e), !h)
              return Ue(e, v);
          } else {
            var E = Te(e), B = E == $t || E == oi;
            if ($r(e))
              return Oa(e, h);
            if (E == br || E == p || B && !c) {
              if (v = b || B ? {} : Ha(e), !h)
                return b ? Hl(e, gl(v, e)) : kl(e, ta(v, e));
            } else {
              if (!he[E])
                return c ? e : {};
              v = nd(e, E, h);
            }
          }
          l || (l = new lr());
          var U = l.get(e);
          if (U)
            return U;
          l.set(e, v), wf(e) ? e.forEach(function(Z) {
            v.add(tr(Z, r, t, Z, e, l));
          }) : Af(e) && e.forEach(function(Z, fe) {
            v.set(fe, tr(Z, r, t, fe, e, l));
          });
          var z = O ? b ? jo : Io : b ? Ge : Ee, oe = R ? d : z(e);
          return Qe(oe || e, function(Z, fe) {
            oe && (fe = Z, Z = e[fe]), wt(v, fe, tr(Z, r, t, fe, e, l));
          }), v;
        }
        function vl(e) {
          var r = Ee(e);
          return function(t) {
            return na(t, e, r);
          };
        }
        function na(e, r, t) {
          var n = t.length;
          if (e == null)
            return !n;
          for (e = ve(e); n--; ) {
            var c = t[n], l = r[c], v = e[c];
            if (v === d && !(c in e) || !l(v))
              return !1;
          }
          return !0;
        }
        function oa(e, r, t) {
          if (typeof e != "function")
            throw new er($);
          return Et(function() {
            e.apply(d, t);
          }, r);
        }
        function xt(e, r, t, n) {
          var c = -1, l = qt, v = !0, h = e.length, b = [], O = r.length;
          if (!h)
            return b;
          t && (r = me(r, ze(t))), n ? (l = Jn, v = !1) : r.length >= G && (l = vt, v = !1, r = new Gr(r));
          e:
            for (; ++c < h; ) {
              var R = e[c], E = t == null ? R : t(R);
              if (R = n || R !== 0 ? R : 0, v && E === E) {
                for (var B = O; B--; )
                  if (r[B] === E)
                    continue e;
                b.push(R);
              } else l(r, E, n) || b.push(R);
            }
          return b;
        }
        var Fr = ja(hr), ia = ja(yo, !0);
        function hl(e, r) {
          var t = !0;
          return Fr(e, function(n, c, l) {
            return t = !!r(n, c, l), t;
          }), t;
        }
        function cn(e, r, t) {
          for (var n = -1, c = e.length; ++n < c; ) {
            var l = e[n], v = r(l);
            if (v != null && (h === d ? v === v && !Ye(v) : t(v, h)))
              var h = v, b = l;
          }
          return b;
        }
        function _l(e, r, t, n) {
          var c = e.length;
          for (t = te(t), t < 0 && (t = -t > c ? 0 : c + t), n = n === d || n > c ? c : te(n), n < 0 && (n += c), n = t > n ? 0 : Cf(n); t < n; )
            e[t++] = r;
          return e;
        }
        function aa(e, r) {
          var t = [];
          return Fr(e, function(n, c, l) {
            r(n, c, l) && t.push(n);
          }), t;
        }
        function Ie(e, r, t, n, c) {
          var l = -1, v = e.length;
          for (t || (t = id), c || (c = []); ++l < v; ) {
            var h = e[l];
            r > 0 && t(h) ? r > 1 ? Ie(h, r - 1, t, n, c) : jr(c, h) : n || (c[c.length] = h);
          }
          return c;
        }
        var uo = Ta(), fa = Ta(!0);
        function hr(e, r) {
          return e && uo(e, r, Ee);
        }
        function yo(e, r) {
          return e && fa(e, r, Ee);
        }
        function sn(e, r) {
          return Ir(r, function(t) {
            return Rr(e[t]);
          });
        }
        function kr(e, r) {
          r = Mr(r, e);
          for (var t = 0, n = r.length; e != null && t < n; )
            e = e[mr(r[t++])];
          return t && t == n ? e : d;
        }
        function ca(e, r, t) {
          var n = r(e);
          return V(e) ? n : jr(n, t(e));
        }
        function Be(e) {
          return e == null ? e === d ? Kf : kf : Ur && Ur in ve(e) ? Ql(e) : ud(e);
        }
        function go(e, r) {
          return e > r;
        }
        function ml(e, r) {
          return e != null && ye.call(e, r);
        }
        function Al(e, r) {
          return e != null && r in ve(e);
        }
        function bl(e, r, t) {
          return e >= je(r, t) && e < Re(r, t);
        }
        function vo(e, r, t) {
          for (var n = t ? Jn : qt, c = e[0].length, l = e.length, v = l, h = C(l), b = 1 / 0, O = []; v--; ) {
            var R = e[v];
            v && r && (R = me(R, ze(r))), b = je(R.length, b), h[v] = !t && (r || c >= 120 && R.length >= 120) ? new Gr(v && R) : d;
          }
          R = e[0];
          var E = -1, B = h[0];
          e:
            for (; ++E < c && O.length < b; ) {
              var U = R[E], z = r ? r(U) : U;
              if (U = t || U !== 0 ? U : 0, !(B ? vt(B, z) : n(O, z, t))) {
                for (v = l; --v; ) {
                  var oe = h[v];
                  if (!(oe ? vt(oe, z) : n(e[v], z, t)))
                    continue e;
                }
                B && B.push(z), O.push(U);
              }
            }
          return O;
        }
        function wl(e, r, t, n) {
          return hr(e, function(c, l, v) {
            r(n, t(c), l, v);
          }), n;
        }
        function Ct(e, r, t) {
          r = Mr(r, e), e = Ya(e, r);
          var n = e == null ? e : e[mr(or(r))];
          return n == null ? d : Ke(n, e, t);
        }
        function sa(e) {
          return be(e) && Be(e) == p;
        }
        function xl(e) {
          return be(e) && Be(e) == gt;
        }
        function Cl(e) {
          return be(e) && Be(e) == st;
        }
        function pt(e, r, t, n, c) {
          return e === r ? !0 : e == null || r == null || !be(e) && !be(r) ? e !== e && r !== r : pl(e, r, t, n, pt, c);
        }
        function pl(e, r, t, n, c, l) {
          var v = V(e), h = V(r), b = v ? L : Te(e), O = h ? L : Te(r);
          b = b == p ? br : b, O = O == p ? br : O;
          var R = b == br, E = O == br, B = b == O;
          if (B && $r(e)) {
            if (!$r(r))
              return !1;
            v = !0, R = !1;
          }
          if (B && !R)
            return l || (l = new lr()), v || ft(e) ? Ga(e, r, t, n, c, l) : Xl(e, r, b, t, n, c, l);
          if (!(t & ne)) {
            var U = R && ye.call(e, "__wrapped__"), z = E && ye.call(r, "__wrapped__");
            if (U || z) {
              var oe = U ? e.value() : e, Z = z ? r.value() : r;
              return l || (l = new lr()), c(oe, Z, t, n, l);
            }
          }
          return B ? (l || (l = new lr()), Vl(e, r, t, n, c, l)) : !1;
        }
        function Sl(e) {
          return be(e) && Te(e) == fr;
        }
        function ho(e, r, t, n) {
          var c = t.length, l = c, v = !n;
          if (e == null)
            return !l;
          for (e = ve(e); c--; ) {
            var h = t[c];
            if (v && h[2] ? h[1] !== e[h[0]] : !(h[0] in e))
              return !1;
          }
          for (; ++c < l; ) {
            h = t[c];
            var b = h[0], O = e[b], R = h[1];
            if (v && h[2]) {
              if (O === d && !(b in e))
                return !1;
            } else {
              var E = new lr();
              if (n)
                var B = n(O, R, b, e, r, E);
              if (!(B === d ? pt(R, O, ne | re, n, E) : B))
                return !1;
            }
          }
          return !0;
        }
        function la(e) {
          if (!Ae(e) || fd(e))
            return !1;
          var r = Rr(e) ? Ss : vc;
          return r.test(Kr(e));
        }
        function Ol(e) {
          return be(e) && Be(e) == dt;
        }
        function Rl(e) {
          return be(e) && Te(e) == cr;
        }
        function El(e) {
          return be(e) && On(e.length) && !!_e[Be(e)];
        }
        function da(e) {
          return typeof e == "function" ? e : e == null ? qe : typeof e == "object" ? V(e) ? ga(e[0], e[1]) : ya(e) : Ff(e);
        }
        function _o(e) {
          if (!Rt(e))
            return js(e);
          var r = [];
          for (var t in ve(e))
            ye.call(e, t) && t != "constructor" && r.push(t);
          return r;
        }
        function Ll(e) {
          if (!Ae(e))
            return dd(e);
          var r = Rt(e), t = [];
          for (var n in e)
            n == "constructor" && (r || !ye.call(e, n)) || t.push(n);
          return t;
        }
        function mo(e, r) {
          return e < r;
        }
        function ua(e, r) {
          var t = -1, n = Ne(e) ? C(e.length) : [];
          return Fr(e, function(c, l, v) {
            n[++t] = r(c, l, v);
          }), n;
        }
        function ya(e) {
          var r = Wo(e);
          return r.length == 1 && r[0][2] ? za(r[0][0], r[0][1]) : function(t) {
            return t === e || ho(t, e, r);
          };
        }
        function ga(e, r) {
          return Bo(e) && Ka(r) ? za(mr(e), r) : function(t) {
            var n = Ho(t, e);
            return n === d && n === r ? Ko(t, e) : pt(r, n, ne | re);
          };
        }
        function ln(e, r, t, n, c) {
          e !== r && uo(r, function(l, v) {
            if (c || (c = new lr()), Ae(l))
              Il(e, r, v, t, ln, n, c);
            else {
              var h = n ? n(Po(e, v), l, v + "", e, r, c) : d;
              h === d && (h = l), so(e, v, h);
            }
          }, Ge);
        }
        function Il(e, r, t, n, c, l, v) {
          var h = Po(e, t), b = Po(r, t), O = v.get(b);
          if (O) {
            so(e, t, O);
            return;
          }
          var R = l ? l(h, b, t + "", e, r, v) : d, E = R === d;
          if (E) {
            var B = V(b), U = !B && $r(b), z = !B && !U && ft(b);
            R = b, B || U || z ? V(h) ? R = h : xe(h) ? R = Ue(h) : U ? (E = !1, R = Oa(b, !0)) : z ? (E = !1, R = Ra(b, !0)) : R = [] : Lt(b) || zr(b) ? (R = h, zr(h) ? R = pf(h) : (!Ae(h) || Rr(h)) && (R = Ha(b))) : E = !1;
          }
          E && (v.set(b, R), c(R, b, n, l, v), v.delete(b)), so(e, t, R);
        }
        function va(e, r) {
          var t = e.length;
          if (t)
            return r += r < 0 ? t : 0, Or(r, t) ? e[r] : d;
        }
        function ha(e, r, t) {
          r.length ? r = me(r, function(l) {
            return V(l) ? function(v) {
              return kr(v, l.length === 1 ? l[0] : l);
            } : l;
          }) : r = [qe];
          var n = -1;
          r = me(r, ze(K()));
          var c = ua(e, function(l, v, h) {
            var b = me(r, function(O) {
              return O(l);
            });
            return { criteria: b, index: ++n, value: l };
          });
          return ns(c, function(l, v) {
            return ql(l, v, t);
          });
        }
        function jl(e, r) {
          return _a(e, r, function(t, n) {
            return Ko(e, n);
          });
        }
        function _a(e, r, t) {
          for (var n = -1, c = r.length, l = {}; ++n < c; ) {
            var v = r[n], h = kr(e, v);
            t(h, v) && St(l, Mr(v, e), h);
          }
          return l;
        }
        function Tl(e) {
          return function(r) {
            return kr(r, e);
          };
        }
        function Ao(e, r, t, n) {
          var c = n ? ts : Jr, l = -1, v = r.length, h = e;
          for (e === r && (r = Ue(r)), t && (h = me(e, ze(t))); ++l < v; )
            for (var b = 0, O = r[l], R = t ? t(O) : O; (b = c(h, R, b, n)) > -1; )
              h !== e && Qt.call(h, b, 1), Qt.call(e, b, 1);
          return e;
        }
        function ma(e, r) {
          for (var t = e ? r.length : 0, n = t - 1; t--; ) {
            var c = r[t];
            if (t == n || c !== l) {
              var l = c;
              Or(c) ? Qt.call(e, c, 1) : Co(e, c);
            }
          }
          return e;
        }
        function bo(e, r) {
          return e + tn(Vi() * (r - e + 1));
        }
        function Wl(e, r, t, n) {
          for (var c = -1, l = Re(rn((r - e) / (t || 1)), 0), v = C(l); l--; )
            v[n ? l : ++c] = e, e += t;
          return v;
        }
        function wo(e, r) {
          var t = "";
          if (!e || r < 1 || r > w)
            return t;
          do
            r % 2 && (t += e), r = tn(r / 2), r && (e += e);
          while (r);
          return t;
        }
        function ie(e, r) {
          return $o(Za(e, r, qe), e + "");
        }
        function Fl(e) {
          return ra(ct(e));
        }
        function Bl(e, r) {
          var t = ct(e);
          return bn(t, qr(r, 0, t.length));
        }
        function St(e, r, t, n) {
          if (!Ae(e))
            return e;
          r = Mr(r, e);
          for (var c = -1, l = r.length, v = l - 1, h = e; h != null && ++c < l; ) {
            var b = mr(r[c]), O = t;
            if (b === "__proto__" || b === "constructor" || b === "prototype")
              return e;
            if (c != v) {
              var R = h[b];
              O = n ? n(R, b, h) : d, O === d && (O = Ae(R) ? R : Or(r[c + 1]) ? [] : {});
            }
            wt(h, b, O), h = h[b];
          }
          return e;
        }
        var Aa = nn ? function(e, r) {
          return nn.set(e, r), e;
        } : qe, Ml = en ? function(e, r) {
          return en(e, "toString", {
            configurable: !0,
            enumerable: !1,
            value: Zo(r),
            writable: !0
          });
        } : qe;
        function Pl(e) {
          return bn(ct(e));
        }
        function nr(e, r, t) {
          var n = -1, c = e.length;
          r < 0 && (r = -r > c ? 0 : c + r), t = t > c ? c : t, t < 0 && (t += c), c = r > t ? 0 : t - r >>> 0, r >>>= 0;
          for (var l = C(c); ++n < c; )
            l[n] = e[n + r];
          return l;
        }
        function $l(e, r) {
          var t;
          return Fr(e, function(n, c, l) {
            return t = r(n, c, l), !t;
          }), !!t;
        }
        function dn(e, r, t) {
          var n = 0, c = e == null ? n : e.length;
          if (typeof r == "number" && r === r && c <= o) {
            for (; n < c; ) {
              var l = n + c >>> 1, v = e[l];
              v !== null && !Ye(v) && (t ? v <= r : v < r) ? n = l + 1 : c = l;
            }
            return c;
          }
          return xo(e, r, qe, t);
        }
        function xo(e, r, t, n) {
          var c = 0, l = e == null ? 0 : e.length;
          if (l === 0)
            return 0;
          r = t(r);
          for (var v = r !== r, h = r === null, b = Ye(r), O = r === d; c < l; ) {
            var R = tn((c + l) / 2), E = t(e[R]), B = E !== d, U = E === null, z = E === E, oe = Ye(E);
            if (v)
              var Z = n || z;
            else O ? Z = z && (n || B) : h ? Z = z && B && (n || !U) : b ? Z = z && B && !U && (n || !oe) : U || oe ? Z = !1 : Z = n ? E <= r : E < r;
            Z ? c = R + 1 : l = R;
          }
          return je(l, y);
        }
        function ba(e, r) {
          for (var t = -1, n = e.length, c = 0, l = []; ++t < n; ) {
            var v = e[t], h = r ? r(v) : v;
            if (!t || !dr(h, b)) {
              var b = h;
              l[c++] = v === 0 ? 0 : v;
            }
          }
          return l;
        }
        function wa(e) {
          return typeof e == "number" ? e : Ye(e) ? a : +e;
        }
        function Ze(e) {
          if (typeof e == "string")
            return e;
          if (V(e))
            return me(e, Ze) + "";
          if (Ye(e))
            return Qi ? Qi.call(e) : "";
          var r = e + "";
          return r == "0" && 1 / e == -I ? "-0" : r;
        }
        function Br(e, r, t) {
          var n = -1, c = qt, l = e.length, v = !0, h = [], b = h;
          if (t)
            v = !1, c = Jn;
          else if (l >= G) {
            var O = r ? null : Yl(e);
            if (O)
              return Ht(O);
            v = !1, c = vt, b = new Gr();
          } else
            b = r ? [] : h;
          e:
            for (; ++n < l; ) {
              var R = e[n], E = r ? r(R) : R;
              if (R = t || R !== 0 ? R : 0, v && E === E) {
                for (var B = b.length; B--; )
                  if (b[B] === E)
                    continue e;
                r && b.push(E), h.push(R);
              } else c(b, E, t) || (b !== h && b.push(E), h.push(R));
            }
          return h;
        }
        function Co(e, r) {
          return r = Mr(r, e), e = Ya(e, r), e == null || delete e[mr(or(r))];
        }
        function xa(e, r, t, n) {
          return St(e, r, t(kr(e, r)), n);
        }
        function un(e, r, t, n) {
          for (var c = e.length, l = n ? c : -1; (n ? l-- : ++l < c) && r(e[l], l, e); )
            ;
          return t ? nr(e, n ? 0 : l, n ? l + 1 : c) : nr(e, n ? l + 1 : 0, n ? c : l);
        }
        function Ca(e, r) {
          var t = e;
          return t instanceof ce && (t = t.value()), Xn(r, function(n, c) {
            return c.func.apply(c.thisArg, jr([n], c.args));
          }, t);
        }
        function po(e, r, t) {
          var n = e.length;
          if (n < 2)
            return n ? Br(e[0]) : [];
          for (var c = -1, l = C(n); ++c < n; )
            for (var v = e[c], h = -1; ++h < n; )
              h != c && (l[c] = xt(l[c] || v, e[h], r, t));
          return Br(Ie(l, 1), r, t);
        }
        function pa(e, r, t) {
          for (var n = -1, c = e.length, l = r.length, v = {}; ++n < c; ) {
            var h = n < l ? r[n] : d;
            t(v, e[n], h);
          }
          return v;
        }
        function So(e) {
          return xe(e) ? e : [];
        }
        function Oo(e) {
          return typeof e == "function" ? e : qe;
        }
        function Mr(e, r) {
          return V(e) ? e : Bo(e, r) ? [e] : Qa(ue(e));
        }
        var Dl = ie;
        function Pr(e, r, t) {
          var n = e.length;
          return t = t === d ? n : t, !r && t >= n ? e : nr(e, r, t);
        }
        var Sa = Os || function(e) {
          return Le.clearTimeout(e);
        };
        function Oa(e, r) {
          if (r)
            return e.slice();
          var t = e.length, n = zi ? zi(t) : new e.constructor(t);
          return e.copy(n), n;
        }
        function Ro(e) {
          var r = new e.constructor(e.byteLength);
          return new Xt(r).set(new Xt(e)), r;
        }
        function Ul(e, r) {
          var t = r ? Ro(e.buffer) : e.buffer;
          return new e.constructor(t, e.byteOffset, e.byteLength);
        }
        function Nl(e) {
          var r = new e.constructor(e.source, si.exec(e));
          return r.lastIndex = e.lastIndex, r;
        }
        function Gl(e) {
          return bt ? ve(bt.call(e)) : {};
        }
        function Ra(e, r) {
          var t = r ? Ro(e.buffer) : e.buffer;
          return new e.constructor(t, e.byteOffset, e.length);
        }
        function Ea(e, r) {
          if (e !== r) {
            var t = e !== d, n = e === null, c = e === e, l = Ye(e), v = r !== d, h = r === null, b = r === r, O = Ye(r);
            if (!h && !O && !l && e > r || l && v && b && !h && !O || n && v && b || !t && b || !c)
              return 1;
            if (!n && !l && !O && e < r || O && t && c && !n && !l || h && t && c || !v && c || !b)
              return -1;
          }
          return 0;
        }
        function ql(e, r, t) {
          for (var n = -1, c = e.criteria, l = r.criteria, v = c.length, h = t.length; ++n < v; ) {
            var b = Ea(c[n], l[n]);
            if (b) {
              if (n >= h)
                return b;
              var O = t[n];
              return b * (O == "desc" ? -1 : 1);
            }
          }
          return e.index - r.index;
        }
        function La(e, r, t, n) {
          for (var c = -1, l = e.length, v = t.length, h = -1, b = r.length, O = Re(l - v, 0), R = C(b + O), E = !n; ++h < b; )
            R[h] = r[h];
          for (; ++c < v; )
            (E || c < l) && (R[t[c]] = e[c]);
          for (; O--; )
            R[h++] = e[c++];
          return R;
        }
        function Ia(e, r, t, n) {
          for (var c = -1, l = e.length, v = -1, h = t.length, b = -1, O = r.length, R = Re(l - h, 0), E = C(R + O), B = !n; ++c < R; )
            E[c] = e[c];
          for (var U = c; ++b < O; )
            E[U + b] = r[b];
          for (; ++v < h; )
            (B || c < l) && (E[U + t[v]] = e[c++]);
          return E;
        }
        function Ue(e, r) {
          var t = -1, n = e.length;
          for (r || (r = C(n)); ++t < n; )
            r[t] = e[t];
          return r;
        }
        function _r(e, r, t, n) {
          var c = !t;
          t || (t = {});
          for (var l = -1, v = r.length; ++l < v; ) {
            var h = r[l], b = n ? n(t[h], e[h], h, t, e) : d;
            b === d && (b = e[h]), c ? Cr(t, h, b) : wt(t, h, b);
          }
          return t;
        }
        function kl(e, r) {
          return _r(e, Fo(e), r);
        }
        function Hl(e, r) {
          return _r(e, qa(e), r);
        }
        function yn(e, r) {
          return function(t, n) {
            var c = V(t) ? Jc : yl, l = r ? r() : {};
            return c(t, e, K(n, 2), l);
          };
        }
        function ot(e) {
          return ie(function(r, t) {
            var n = -1, c = t.length, l = c > 1 ? t[c - 1] : d, v = c > 2 ? t[2] : d;
            for (l = e.length > 3 && typeof l == "function" ? (c--, l) : d, v && Me(t[0], t[1], v) && (l = c < 3 ? d : l, c = 1), r = ve(r); ++n < c; ) {
              var h = t[n];
              h && e(r, h, n, l);
            }
            return r;
          });
        }
        function ja(e, r) {
          return function(t, n) {
            if (t == null)
              return t;
            if (!Ne(t))
              return e(t, n);
            for (var c = t.length, l = r ? c : -1, v = ve(t); (r ? l-- : ++l < c) && n(v[l], l, v) !== !1; )
              ;
            return t;
          };
        }
        function Ta(e) {
          return function(r, t, n) {
            for (var c = -1, l = ve(r), v = n(r), h = v.length; h--; ) {
              var b = v[e ? h : ++c];
              if (t(l[b], b, l) === !1)
                break;
            }
            return r;
          };
        }
        function Kl(e, r, t) {
          var n = r & J, c = Ot(e);
          function l() {
            var v = this && this !== Le && this instanceof l ? c : e;
            return v.apply(n ? t : this, arguments);
          }
          return l;
        }
        function Wa(e) {
          return function(r) {
            r = ue(r);
            var t = Xr(r) ? sr(r) : d, n = t ? t[0] : r.charAt(0), c = t ? Pr(t, 1).join("") : r.slice(1);
            return n[e]() + c;
          };
        }
        function it(e) {
          return function(r) {
            return Xn(Tf(jf(r).replace(Mc, "")), e, "");
          };
        }
        function Ot(e) {
          return function() {
            var r = arguments;
            switch (r.length) {
              case 0:
                return new e();
              case 1:
                return new e(r[0]);
              case 2:
                return new e(r[0], r[1]);
              case 3:
                return new e(r[0], r[1], r[2]);
              case 4:
                return new e(r[0], r[1], r[2], r[3]);
              case 5:
                return new e(r[0], r[1], r[2], r[3], r[4]);
              case 6:
                return new e(r[0], r[1], r[2], r[3], r[4], r[5]);
              case 7:
                return new e(r[0], r[1], r[2], r[3], r[4], r[5], r[6]);
            }
            var t = nt(e.prototype), n = e.apply(t, r);
            return Ae(n) ? n : t;
          };
        }
        function zl(e, r, t) {
          var n = Ot(e);
          function c() {
            for (var l = arguments.length, v = C(l), h = l, b = at(c); h--; )
              v[h] = arguments[h];
            var O = l < 3 && v[0] !== b && v[l - 1] !== b ? [] : Tr(v, b);
            if (l -= O.length, l < t)
              return $a(
                e,
                r,
                gn,
                c.placeholder,
                d,
                v,
                O,
                d,
                d,
                t - l
              );
            var R = this && this !== Le && this instanceof c ? n : e;
            return Ke(R, this, v);
          }
          return c;
        }
        function Fa(e) {
          return function(r, t, n) {
            var c = ve(r);
            if (!Ne(r)) {
              var l = K(t, 3);
              r = Ee(r), t = function(h) {
                return l(c[h], h, c);
              };
            }
            var v = e(r, t, n);
            return v > -1 ? c[l ? r[v] : v] : d;
          };
        }
        function Ba(e) {
          return Sr(function(r) {
            var t = r.length, n = t, c = rr.prototype.thru;
            for (e && r.reverse(); n--; ) {
              var l = r[n];
              if (typeof l != "function")
                throw new er($);
              if (c && !v && mn(l) == "wrapper")
                var v = new rr([], !0);
            }
            for (n = v ? n : t; ++n < t; ) {
              l = r[n];
              var h = mn(l), b = h == "wrapper" ? To(l) : d;
              b && Mo(b[0]) && b[1] == (we | x | M | pe) && !b[4].length && b[9] == 1 ? v = v[mn(b[0])].apply(v, b[3]) : v = l.length == 1 && Mo(l) ? v[h]() : v.thru(l);
            }
            return function() {
              var O = arguments, R = O[0];
              if (v && O.length == 1 && V(R))
                return v.plant(R).value();
              for (var E = 0, B = t ? r[E].apply(this, O) : R; ++E < t; )
                B = r[E].call(this, B);
              return B;
            };
          });
        }
        function gn(e, r, t, n, c, l, v, h, b, O) {
          var R = r & we, E = r & J, B = r & u, U = r & (x | F), z = r & Se, oe = B ? d : Ot(e);
          function Z() {
            for (var fe = arguments.length, le = C(fe), Je = fe; Je--; )
              le[Je] = arguments[Je];
            if (U)
              var Pe = at(Z), Xe = is(le, Pe);
            if (n && (le = La(le, n, c, U)), l && (le = Ia(le, l, v, U)), fe -= Xe, U && fe < O) {
              var Ce = Tr(le, Pe);
              return $a(
                e,
                r,
                gn,
                Z.placeholder,
                t,
                le,
                Ce,
                h,
                b,
                O - fe
              );
            }
            var ur = E ? t : this, Lr = B ? ur[e] : e;
            return fe = le.length, h ? le = yd(le, h) : z && fe > 1 && le.reverse(), R && b < fe && (le.length = b), this && this !== Le && this instanceof Z && (Lr = oe || Ot(Lr)), Lr.apply(ur, le);
          }
          return Z;
        }
        function Ma(e, r) {
          return function(t, n) {
            return wl(t, e, r(n), {});
          };
        }
        function vn(e, r) {
          return function(t, n) {
            var c;
            if (t === d && n === d)
              return r;
            if (t !== d && (c = t), n !== d) {
              if (c === d)
                return n;
              typeof t == "string" || typeof n == "string" ? (t = Ze(t), n = Ze(n)) : (t = wa(t), n = wa(n)), c = e(t, n);
            }
            return c;
          };
        }
        function Eo(e) {
          return Sr(function(r) {
            return r = me(r, ze(K())), ie(function(t) {
              var n = this;
              return e(r, function(c) {
                return Ke(c, n, t);
              });
            });
          });
        }
        function hn(e, r) {
          r = r === d ? " " : Ze(r);
          var t = r.length;
          if (t < 2)
            return t ? wo(r, e) : r;
          var n = wo(r, rn(e / Vr(r)));
          return Xr(r) ? Pr(sr(n), 0, e).join("") : n.slice(0, e);
        }
        function Zl(e, r, t, n) {
          var c = r & J, l = Ot(e);
          function v() {
            for (var h = -1, b = arguments.length, O = -1, R = n.length, E = C(R + b), B = this && this !== Le && this instanceof v ? l : e; ++O < R; )
              E[O] = n[O];
            for (; b--; )
              E[O++] = arguments[++h];
            return Ke(B, c ? t : this, E);
          }
          return v;
        }
        function Pa(e) {
          return function(r, t, n) {
            return n && typeof n != "number" && Me(r, t, n) && (t = n = d), r = Er(r), t === d ? (t = r, r = 0) : t = Er(t), n = n === d ? r < t ? 1 : -1 : Er(n), Wl(r, t, n, e);
          };
        }
        function _n(e) {
          return function(r, t) {
            return typeof r == "string" && typeof t == "string" || (r = ir(r), t = ir(t)), e(r, t);
          };
        }
        function $a(e, r, t, n, c, l, v, h, b, O) {
          var R = r & x, E = R ? v : d, B = R ? d : v, U = R ? l : d, z = R ? d : l;
          r |= R ? M : ge, r &= ~(R ? ge : M), r & i || (r &= -4);
          var oe = [
            e,
            r,
            c,
            U,
            E,
            z,
            B,
            h,
            b,
            O
          ], Z = t.apply(d, oe);
          return Mo(e) && Ja(Z, oe), Z.placeholder = n, Xa(Z, e, r);
        }
        function Lo(e) {
          var r = Oe[e];
          return function(t, n) {
            if (t = ir(t), n = n == null ? 0 : je(te(n), 292), n && Xi(t)) {
              var c = (ue(t) + "e").split("e"), l = r(c[0] + "e" + (+c[1] + n));
              return c = (ue(l) + "e").split("e"), +(c[0] + "e" + (+c[1] - n));
            }
            return r(t);
          };
        }
        var Yl = rt && 1 / Ht(new rt([, -0]))[1] == I ? function(e) {
          return new rt(e);
        } : Xo;
        function Da(e) {
          return function(r) {
            var t = Te(r);
            return t == fr ? oo(r) : t == cr ? us(r) : os(r, e(r));
          };
        }
        function pr(e, r, t, n, c, l, v, h) {
          var b = r & u;
          if (!b && typeof e != "function")
            throw new er($);
          var O = n ? n.length : 0;
          if (O || (r &= -97, n = c = d), v = v === d ? v : Re(te(v), 0), h = h === d ? h : te(h), O -= c ? c.length : 0, r & ge) {
            var R = n, E = c;
            n = c = d;
          }
          var B = b ? d : To(e), U = [
            e,
            r,
            t,
            n,
            c,
            R,
            E,
            l,
            v,
            h
          ];
          if (B && ld(U, B), e = U[0], r = U[1], t = U[2], n = U[3], c = U[4], h = U[9] = U[9] === d ? b ? 0 : e.length : Re(U[9] - O, 0), !h && r & (x | F) && (r &= -25), !r || r == J)
            var z = Kl(e, r, t);
          else r == x || r == F ? z = zl(e, r, h) : (r == M || r == (J | M)) && !c.length ? z = Zl(e, r, t, n) : z = gn.apply(d, U);
          var oe = B ? Aa : Ja;
          return Xa(oe(z, U), e, r);
        }
        function Ua(e, r, t, n) {
          return e === d || dr(e, et[t]) && !ye.call(n, t) ? r : e;
        }
        function Na(e, r, t, n, c, l) {
          return Ae(e) && Ae(r) && (l.set(r, e), ln(e, r, d, Na, l), l.delete(r)), e;
        }
        function Jl(e) {
          return Lt(e) ? d : e;
        }
        function Ga(e, r, t, n, c, l) {
          var v = t & ne, h = e.length, b = r.length;
          if (h != b && !(v && b > h))
            return !1;
          var O = l.get(e), R = l.get(r);
          if (O && R)
            return O == r && R == e;
          var E = -1, B = !0, U = t & re ? new Gr() : d;
          for (l.set(e, r), l.set(r, e); ++E < h; ) {
            var z = e[E], oe = r[E];
            if (n)
              var Z = v ? n(oe, z, E, r, e, l) : n(z, oe, E, e, r, l);
            if (Z !== d) {
              if (Z)
                continue;
              B = !1;
              break;
            }
            if (U) {
              if (!Vn(r, function(fe, le) {
                if (!vt(U, le) && (z === fe || c(z, fe, t, n, l)))
                  return U.push(le);
              })) {
                B = !1;
                break;
              }
            } else if (!(z === oe || c(z, oe, t, n, l))) {
              B = !1;
              break;
            }
          }
          return l.delete(e), l.delete(r), B;
        }
        function Xl(e, r, t, n, c, l, v) {
          switch (t) {
            case Zr:
              if (e.byteLength != r.byteLength || e.byteOffset != r.byteOffset)
                return !1;
              e = e.buffer, r = r.buffer;
            case gt:
              return !(e.byteLength != r.byteLength || !l(new Xt(e), new Xt(r)));
            case Ar:
            case st:
            case lt:
              return dr(+e, +r);
            case Pt:
              return e.name == r.name && e.message == r.message;
            case dt:
            case ut:
              return e == r + "";
            case fr:
              var h = oo;
            case cr:
              var b = n & ne;
              if (h || (h = Ht), e.size != r.size && !b)
                return !1;
              var O = v.get(e);
              if (O)
                return O == r;
              n |= re, v.set(e, r);
              var R = Ga(h(e), h(r), n, c, l, v);
              return v.delete(e), R;
            case Dt:
              if (bt)
                return bt.call(e) == bt.call(r);
          }
          return !1;
        }
        function Vl(e, r, t, n, c, l) {
          var v = t & ne, h = Io(e), b = h.length, O = Io(r), R = O.length;
          if (b != R && !v)
            return !1;
          for (var E = b; E--; ) {
            var B = h[E];
            if (!(v ? B in r : ye.call(r, B)))
              return !1;
          }
          var U = l.get(e), z = l.get(r);
          if (U && z)
            return U == r && z == e;
          var oe = !0;
          l.set(e, r), l.set(r, e);
          for (var Z = v; ++E < b; ) {
            B = h[E];
            var fe = e[B], le = r[B];
            if (n)
              var Je = v ? n(le, fe, B, r, e, l) : n(fe, le, B, e, r, l);
            if (!(Je === d ? fe === le || c(fe, le, t, n, l) : Je)) {
              oe = !1;
              break;
            }
            Z || (Z = B == "constructor");
          }
          if (oe && !Z) {
            var Pe = e.constructor, Xe = r.constructor;
            Pe != Xe && "constructor" in e && "constructor" in r && !(typeof Pe == "function" && Pe instanceof Pe && typeof Xe == "function" && Xe instanceof Xe) && (oe = !1);
          }
          return l.delete(e), l.delete(r), oe;
        }
        function Sr(e) {
          return $o(Za(e, d, nf), e + "");
        }
        function Io(e) {
          return ca(e, Ee, Fo);
        }
        function jo(e) {
          return ca(e, Ge, qa);
        }
        var To = nn ? function(e) {
          return nn.get(e);
        } : Xo;
        function mn(e) {
          for (var r = e.name + "", t = tt[r], n = ye.call(tt, r) ? t.length : 0; n--; ) {
            var c = t[n], l = c.func;
            if (l == null || l == e)
              return c.name;
          }
          return r;
        }
        function at(e) {
          var r = ye.call(s, "placeholder") ? s : e;
          return r.placeholder;
        }
        function K() {
          var e = s.iteratee || Yo;
          return e = e === Yo ? da : e, arguments.length ? e(arguments[0], arguments[1]) : e;
        }
        function An(e, r) {
          var t = e.__data__;
          return ad(r) ? t[typeof r == "string" ? "string" : "hash"] : t.map;
        }
        function Wo(e) {
          for (var r = Ee(e), t = r.length; t--; ) {
            var n = r[t], c = e[n];
            r[t] = [n, c, Ka(c)];
          }
          return r;
        }
        function Hr(e, r) {
          var t = ss(e, r);
          return la(t) ? t : d;
        }
        function Ql(e) {
          var r = ye.call(e, Ur), t = e[Ur];
          try {
            e[Ur] = d;
            var n = !0;
          } catch {
          }
          var c = Yt.call(e);
          return n && (r ? e[Ur] = t : delete e[Ur]), c;
        }
        var Fo = ao ? function(e) {
          return e == null ? [] : (e = ve(e), Ir(ao(e), function(r) {
            return Yi.call(e, r);
          }));
        } : Vo, qa = ao ? function(e) {
          for (var r = []; e; )
            jr(r, Fo(e)), e = Vt(e);
          return r;
        } : Vo, Te = Be;
        (fo && Te(new fo(new ArrayBuffer(1))) != Zr || _t && Te(new _t()) != fr || co && Te(co.resolve()) != ii || rt && Te(new rt()) != cr || mt && Te(new mt()) != yt) && (Te = function(e) {
          var r = Be(e), t = r == br ? e.constructor : d, n = t ? Kr(t) : "";
          if (n)
            switch (n) {
              case Bs:
                return Zr;
              case Ms:
                return fr;
              case Ps:
                return ii;
              case $s:
                return cr;
              case Ds:
                return yt;
            }
          return r;
        });
        function ed(e, r, t) {
          for (var n = -1, c = t.length; ++n < c; ) {
            var l = t[n], v = l.size;
            switch (l.type) {
              case "drop":
                e += v;
                break;
              case "dropRight":
                r -= v;
                break;
              case "take":
                r = je(r, e + v);
                break;
              case "takeRight":
                e = Re(e, r - v);
                break;
            }
          }
          return { start: e, end: r };
        }
        function rd(e) {
          var r = e.match(fc);
          return r ? r[1].split(cc) : [];
        }
        function ka(e, r, t) {
          r = Mr(r, e);
          for (var n = -1, c = r.length, l = !1; ++n < c; ) {
            var v = mr(r[n]);
            if (!(l = e != null && t(e, v)))
              break;
            e = e[v];
          }
          return l || ++n != c ? l : (c = e == null ? 0 : e.length, !!c && On(c) && Or(v, c) && (V(e) || zr(e)));
        }
        function td(e) {
          var r = e.length, t = new e.constructor(r);
          return r && typeof e[0] == "string" && ye.call(e, "index") && (t.index = e.index, t.input = e.input), t;
        }
        function Ha(e) {
          return typeof e.constructor == "function" && !Rt(e) ? nt(Vt(e)) : {};
        }
        function nd(e, r, t) {
          var n = e.constructor;
          switch (r) {
            case gt:
              return Ro(e);
            case Ar:
            case st:
              return new n(+e);
            case Zr:
              return Ul(e, t);
            case Tn:
            case Wn:
            case Fn:
            case Bn:
            case Mn:
            case Pn:
            case $n:
            case Dn:
            case Un:
              return Ra(e, t);
            case fr:
              return new n();
            case lt:
            case ut:
              return new n(e);
            case dt:
              return Nl(e);
            case cr:
              return new n();
            case Dt:
              return Gl(e);
          }
        }
        function od(e, r) {
          var t = r.length;
          if (!t)
            return e;
          var n = t - 1;
          return r[n] = (t > 1 ? "& " : "") + r[n], r = r.join(t > 2 ? ", " : " "), e.replace(ac, `{
/* [wrapped with ` + r + `] */
`);
        }
        function id(e) {
          return V(e) || zr(e) || !!(Ji && e && e[Ji]);
        }
        function Or(e, r) {
          var t = typeof e;
          return r = r ?? w, !!r && (t == "number" || t != "symbol" && _c.test(e)) && e > -1 && e % 1 == 0 && e < r;
        }
        function Me(e, r, t) {
          if (!Ae(t))
            return !1;
          var n = typeof r;
          return (n == "number" ? Ne(t) && Or(r, t.length) : n == "string" && r in t) ? dr(t[r], e) : !1;
        }
        function Bo(e, r) {
          if (V(e))
            return !1;
          var t = typeof e;
          return t == "number" || t == "symbol" || t == "boolean" || e == null || Ye(e) ? !0 : tc.test(e) || !rc.test(e) || r != null && e in ve(r);
        }
        function ad(e) {
          var r = typeof e;
          return r == "string" || r == "number" || r == "symbol" || r == "boolean" ? e !== "__proto__" : e === null;
        }
        function Mo(e) {
          var r = mn(e), t = s[r];
          if (typeof t != "function" || !(r in ce.prototype))
            return !1;
          if (e === t)
            return !0;
          var n = To(t);
          return !!n && e === n[0];
        }
        function fd(e) {
          return !!Ki && Ki in e;
        }
        var cd = zt ? Rr : Qo;
        function Rt(e) {
          var r = e && e.constructor, t = typeof r == "function" && r.prototype || et;
          return e === t;
        }
        function Ka(e) {
          return e === e && !Ae(e);
        }
        function za(e, r) {
          return function(t) {
            return t == null ? !1 : t[e] === r && (r !== d || e in ve(t));
          };
        }
        function sd(e) {
          var r = pn(e, function(n) {
            return t.size === q && t.clear(), n;
          }), t = r.cache;
          return r;
        }
        function ld(e, r) {
          var t = e[1], n = r[1], c = t | n, l = c < (J | u | we), v = n == we && t == x || n == we && t == pe && e[7].length <= r[8] || n == (we | pe) && r[7].length <= r[8] && t == x;
          if (!(l || v))
            return e;
          n & J && (e[2] = r[2], c |= t & J ? 0 : i);
          var h = r[3];
          if (h) {
            var b = e[3];
            e[3] = b ? La(b, h, r[4]) : h, e[4] = b ? Tr(e[3], Q) : r[4];
          }
          return h = r[5], h && (b = e[5], e[5] = b ? Ia(b, h, r[6]) : h, e[6] = b ? Tr(e[5], Q) : r[6]), h = r[7], h && (e[7] = h), n & we && (e[8] = e[8] == null ? r[8] : je(e[8], r[8])), e[9] == null && (e[9] = r[9]), e[0] = r[0], e[1] = c, e;
        }
        function dd(e) {
          var r = [];
          if (e != null)
            for (var t in ve(e))
              r.push(t);
          return r;
        }
        function ud(e) {
          return Yt.call(e);
        }
        function Za(e, r, t) {
          return r = Re(r === d ? e.length - 1 : r, 0), function() {
            for (var n = arguments, c = -1, l = Re(n.length - r, 0), v = C(l); ++c < l; )
              v[c] = n[r + c];
            c = -1;
            for (var h = C(r + 1); ++c < r; )
              h[c] = n[c];
            return h[r] = t(v), Ke(e, this, h);
          };
        }
        function Ya(e, r) {
          return r.length < 2 ? e : kr(e, nr(r, 0, -1));
        }
        function yd(e, r) {
          for (var t = e.length, n = je(r.length, t), c = Ue(e); n--; ) {
            var l = r[n];
            e[n] = Or(l, t) ? c[l] : d;
          }
          return e;
        }
        function Po(e, r) {
          if (!(r === "constructor" && typeof e[r] == "function") && r != "__proto__")
            return e[r];
        }
        var Ja = Va(Aa), Et = Es || function(e, r) {
          return Le.setTimeout(e, r);
        }, $o = Va(Ml);
        function Xa(e, r, t) {
          var n = r + "";
          return $o(e, od(n, gd(rd(n), t)));
        }
        function Va(e) {
          var r = 0, t = 0;
          return function() {
            var n = Ts(), c = He - (n - t);
            if (t = n, c > 0) {
              if (++r >= Fe)
                return arguments[0];
            } else
              r = 0;
            return e.apply(d, arguments);
          };
        }
        function bn(e, r) {
          var t = -1, n = e.length, c = n - 1;
          for (r = r === d ? n : r; ++t < r; ) {
            var l = bo(t, c), v = e[l];
            e[l] = e[t], e[t] = v;
          }
          return e.length = r, e;
        }
        var Qa = sd(function(e) {
          var r = [];
          return e.charCodeAt(0) === 46 && r.push(""), e.replace(nc, function(t, n, c, l) {
            r.push(c ? l.replace(dc, "$1") : n || t);
          }), r;
        });
        function mr(e) {
          if (typeof e == "string" || Ye(e))
            return e;
          var r = e + "";
          return r == "0" && 1 / e == -I ? "-0" : r;
        }
        function Kr(e) {
          if (e != null) {
            try {
              return Zt.call(e);
            } catch {
            }
            try {
              return e + "";
            } catch {
            }
          }
          return "";
        }
        function gd(e, r) {
          return Qe(_, function(t) {
            var n = "_." + t[0];
            r & t[1] && !qt(e, n) && e.push(n);
          }), e.sort();
        }
        function ef(e) {
          if (e instanceof ce)
            return e.clone();
          var r = new rr(e.__wrapped__, e.__chain__);
          return r.__actions__ = Ue(e.__actions__), r.__index__ = e.__index__, r.__values__ = e.__values__, r;
        }
        function vd(e, r, t) {
          (t ? Me(e, r, t) : r === d) ? r = 1 : r = Re(te(r), 0);
          var n = e == null ? 0 : e.length;
          if (!n || r < 1)
            return [];
          for (var c = 0, l = 0, v = C(rn(n / r)); c < n; )
            v[l++] = nr(e, c, c += r);
          return v;
        }
        function hd(e) {
          for (var r = -1, t = e == null ? 0 : e.length, n = 0, c = []; ++r < t; ) {
            var l = e[r];
            l && (c[n++] = l);
          }
          return c;
        }
        function _d() {
          var e = arguments.length;
          if (!e)
            return [];
          for (var r = C(e - 1), t = arguments[0], n = e; n--; )
            r[n - 1] = arguments[n];
          return jr(V(t) ? Ue(t) : [t], Ie(r, 1));
        }
        var md = ie(function(e, r) {
          return xe(e) ? xt(e, Ie(r, 1, xe, !0)) : [];
        }), Ad = ie(function(e, r) {
          var t = or(r);
          return xe(t) && (t = d), xe(e) ? xt(e, Ie(r, 1, xe, !0), K(t, 2)) : [];
        }), bd = ie(function(e, r) {
          var t = or(r);
          return xe(t) && (t = d), xe(e) ? xt(e, Ie(r, 1, xe, !0), d, t) : [];
        });
        function wd(e, r, t) {
          var n = e == null ? 0 : e.length;
          return n ? (r = t || r === d ? 1 : te(r), nr(e, r < 0 ? 0 : r, n)) : [];
        }
        function xd(e, r, t) {
          var n = e == null ? 0 : e.length;
          return n ? (r = t || r === d ? 1 : te(r), r = n - r, nr(e, 0, r < 0 ? 0 : r)) : [];
        }
        function Cd(e, r) {
          return e && e.length ? un(e, K(r, 3), !0, !0) : [];
        }
        function pd(e, r) {
          return e && e.length ? un(e, K(r, 3), !0) : [];
        }
        function Sd(e, r, t, n) {
          var c = e == null ? 0 : e.length;
          return c ? (t && typeof t != "number" && Me(e, r, t) && (t = 0, n = c), _l(e, r, t, n)) : [];
        }
        function rf(e, r, t) {
          var n = e == null ? 0 : e.length;
          if (!n)
            return -1;
          var c = t == null ? 0 : te(t);
          return c < 0 && (c = Re(n + c, 0)), kt(e, K(r, 3), c);
        }
        function tf(e, r, t) {
          var n = e == null ? 0 : e.length;
          if (!n)
            return -1;
          var c = n - 1;
          return t !== d && (c = te(t), c = t < 0 ? Re(n + c, 0) : je(c, n - 1)), kt(e, K(r, 3), c, !0);
        }
        function nf(e) {
          var r = e == null ? 0 : e.length;
          return r ? Ie(e, 1) : [];
        }
        function Od(e) {
          var r = e == null ? 0 : e.length;
          return r ? Ie(e, I) : [];
        }
        function Rd(e, r) {
          var t = e == null ? 0 : e.length;
          return t ? (r = r === d ? 1 : te(r), Ie(e, r)) : [];
        }
        function Ed(e) {
          for (var r = -1, t = e == null ? 0 : e.length, n = {}; ++r < t; ) {
            var c = e[r];
            n[c[0]] = c[1];
          }
          return n;
        }
        function of(e) {
          return e && e.length ? e[0] : d;
        }
        function Ld(e, r, t) {
          var n = e == null ? 0 : e.length;
          if (!n)
            return -1;
          var c = t == null ? 0 : te(t);
          return c < 0 && (c = Re(n + c, 0)), Jr(e, r, c);
        }
        function Id(e) {
          var r = e == null ? 0 : e.length;
          return r ? nr(e, 0, -1) : [];
        }
        var jd = ie(function(e) {
          var r = me(e, So);
          return r.length && r[0] === e[0] ? vo(r) : [];
        }), Td = ie(function(e) {
          var r = or(e), t = me(e, So);
          return r === or(t) ? r = d : t.pop(), t.length && t[0] === e[0] ? vo(t, K(r, 2)) : [];
        }), Wd = ie(function(e) {
          var r = or(e), t = me(e, So);
          return r = typeof r == "function" ? r : d, r && t.pop(), t.length && t[0] === e[0] ? vo(t, d, r) : [];
        });
        function Fd(e, r) {
          return e == null ? "" : Is.call(e, r);
        }
        function or(e) {
          var r = e == null ? 0 : e.length;
          return r ? e[r - 1] : d;
        }
        function Bd(e, r, t) {
          var n = e == null ? 0 : e.length;
          if (!n)
            return -1;
          var c = n;
          return t !== d && (c = te(t), c = c < 0 ? Re(n + c, 0) : je(c, n - 1)), r === r ? gs(e, r, c) : kt(e, $i, c, !0);
        }
        function Md(e, r) {
          return e && e.length ? va(e, te(r)) : d;
        }
        var Pd = ie(af);
        function af(e, r) {
          return e && e.length && r && r.length ? Ao(e, r) : e;
        }
        function $d(e, r, t) {
          return e && e.length && r && r.length ? Ao(e, r, K(t, 2)) : e;
        }
        function Dd(e, r, t) {
          return e && e.length && r && r.length ? Ao(e, r, d, t) : e;
        }
        var Ud = Sr(function(e, r) {
          var t = e == null ? 0 : e.length, n = lo(e, r);
          return ma(e, me(r, function(c) {
            return Or(c, t) ? +c : c;
          }).sort(Ea)), n;
        });
        function Nd(e, r) {
          var t = [];
          if (!(e && e.length))
            return t;
          var n = -1, c = [], l = e.length;
          for (r = K(r, 3); ++n < l; ) {
            var v = e[n];
            r(v, n, e) && (t.push(v), c.push(n));
          }
          return ma(e, c), t;
        }
        function Do(e) {
          return e == null ? e : Fs.call(e);
        }
        function Gd(e, r, t) {
          var n = e == null ? 0 : e.length;
          return n ? (t && typeof t != "number" && Me(e, r, t) ? (r = 0, t = n) : (r = r == null ? 0 : te(r), t = t === d ? n : te(t)), nr(e, r, t)) : [];
        }
        function qd(e, r) {
          return dn(e, r);
        }
        function kd(e, r, t) {
          return xo(e, r, K(t, 2));
        }
        function Hd(e, r) {
          var t = e == null ? 0 : e.length;
          if (t) {
            var n = dn(e, r);
            if (n < t && dr(e[n], r))
              return n;
          }
          return -1;
        }
        function Kd(e, r) {
          return dn(e, r, !0);
        }
        function zd(e, r, t) {
          return xo(e, r, K(t, 2), !0);
        }
        function Zd(e, r) {
          var t = e == null ? 0 : e.length;
          if (t) {
            var n = dn(e, r, !0) - 1;
            if (dr(e[n], r))
              return n;
          }
          return -1;
        }
        function Yd(e) {
          return e && e.length ? ba(e) : [];
        }
        function Jd(e, r) {
          return e && e.length ? ba(e, K(r, 2)) : [];
        }
        function Xd(e) {
          var r = e == null ? 0 : e.length;
          return r ? nr(e, 1, r) : [];
        }
        function Vd(e, r, t) {
          return e && e.length ? (r = t || r === d ? 1 : te(r), nr(e, 0, r < 0 ? 0 : r)) : [];
        }
        function Qd(e, r, t) {
          var n = e == null ? 0 : e.length;
          return n ? (r = t || r === d ? 1 : te(r), r = n - r, nr(e, r < 0 ? 0 : r, n)) : [];
        }
        function eu(e, r) {
          return e && e.length ? un(e, K(r, 3), !1, !0) : [];
        }
        function ru(e, r) {
          return e && e.length ? un(e, K(r, 3)) : [];
        }
        var tu = ie(function(e) {
          return Br(Ie(e, 1, xe, !0));
        }), nu = ie(function(e) {
          var r = or(e);
          return xe(r) && (r = d), Br(Ie(e, 1, xe, !0), K(r, 2));
        }), ou = ie(function(e) {
          var r = or(e);
          return r = typeof r == "function" ? r : d, Br(Ie(e, 1, xe, !0), d, r);
        });
        function iu(e) {
          return e && e.length ? Br(e) : [];
        }
        function au(e, r) {
          return e && e.length ? Br(e, K(r, 2)) : [];
        }
        function fu(e, r) {
          return r = typeof r == "function" ? r : d, e && e.length ? Br(e, d, r) : [];
        }
        function Uo(e) {
          if (!(e && e.length))
            return [];
          var r = 0;
          return e = Ir(e, function(t) {
            if (xe(t))
              return r = Re(t.length, r), !0;
          }), to(r, function(t) {
            return me(e, Qn(t));
          });
        }
        function ff(e, r) {
          if (!(e && e.length))
            return [];
          var t = Uo(e);
          return r == null ? t : me(t, function(n) {
            return Ke(r, d, n);
          });
        }
        var cu = ie(function(e, r) {
          return xe(e) ? xt(e, r) : [];
        }), su = ie(function(e) {
          return po(Ir(e, xe));
        }), lu = ie(function(e) {
          var r = or(e);
          return xe(r) && (r = d), po(Ir(e, xe), K(r, 2));
        }), du = ie(function(e) {
          var r = or(e);
          return r = typeof r == "function" ? r : d, po(Ir(e, xe), d, r);
        }), uu = ie(Uo);
        function yu(e, r) {
          return pa(e || [], r || [], wt);
        }
        function gu(e, r) {
          return pa(e || [], r || [], St);
        }
        var vu = ie(function(e) {
          var r = e.length, t = r > 1 ? e[r - 1] : d;
          return t = typeof t == "function" ? (e.pop(), t) : d, ff(e, t);
        });
        function cf(e) {
          var r = s(e);
          return r.__chain__ = !0, r;
        }
        function hu(e, r) {
          return r(e), e;
        }
        function wn(e, r) {
          return r(e);
        }
        var _u = Sr(function(e) {
          var r = e.length, t = r ? e[0] : 0, n = this.__wrapped__, c = function(l) {
            return lo(l, e);
          };
          return r > 1 || this.__actions__.length || !(n instanceof ce) || !Or(t) ? this.thru(c) : (n = n.slice(t, +t + (r ? 1 : 0)), n.__actions__.push({
            func: wn,
            args: [c],
            thisArg: d
          }), new rr(n, this.__chain__).thru(function(l) {
            return r && !l.length && l.push(d), l;
          }));
        });
        function mu() {
          return cf(this);
        }
        function Au() {
          return new rr(this.value(), this.__chain__);
        }
        function bu() {
          this.__values__ === d && (this.__values__ = xf(this.value()));
          var e = this.__index__ >= this.__values__.length, r = e ? d : this.__values__[this.__index__++];
          return { done: e, value: r };
        }
        function wu() {
          return this;
        }
        function xu(e) {
          for (var r, t = this; t instanceof an; ) {
            var n = ef(t);
            n.__index__ = 0, n.__values__ = d, r ? c.__wrapped__ = n : r = n;
            var c = n;
            t = t.__wrapped__;
          }
          return c.__wrapped__ = e, r;
        }
        function Cu() {
          var e = this.__wrapped__;
          if (e instanceof ce) {
            var r = e;
            return this.__actions__.length && (r = new ce(this)), r = r.reverse(), r.__actions__.push({
              func: wn,
              args: [Do],
              thisArg: d
            }), new rr(r, this.__chain__);
          }
          return this.thru(Do);
        }
        function pu() {
          return Ca(this.__wrapped__, this.__actions__);
        }
        var Su = yn(function(e, r, t) {
          ye.call(e, t) ? ++e[t] : Cr(e, t, 1);
        });
        function Ou(e, r, t) {
          var n = V(e) ? Mi : hl;
          return t && Me(e, r, t) && (r = d), n(e, K(r, 3));
        }
        function Ru(e, r) {
          var t = V(e) ? Ir : aa;
          return t(e, K(r, 3));
        }
        var Eu = Fa(rf), Lu = Fa(tf);
        function Iu(e, r) {
          return Ie(xn(e, r), 1);
        }
        function ju(e, r) {
          return Ie(xn(e, r), I);
        }
        function Tu(e, r, t) {
          return t = t === d ? 1 : te(t), Ie(xn(e, r), t);
        }
        function sf(e, r) {
          var t = V(e) ? Qe : Fr;
          return t(e, K(r, 3));
        }
        function lf(e, r) {
          var t = V(e) ? Xc : ia;
          return t(e, K(r, 3));
        }
        var Wu = yn(function(e, r, t) {
          ye.call(e, t) ? e[t].push(r) : Cr(e, t, [r]);
        });
        function Fu(e, r, t, n) {
          e = Ne(e) ? e : ct(e), t = t && !n ? te(t) : 0;
          var c = e.length;
          return t < 0 && (t = Re(c + t, 0)), Rn(e) ? t <= c && e.indexOf(r, t) > -1 : !!c && Jr(e, r, t) > -1;
        }
        var Bu = ie(function(e, r, t) {
          var n = -1, c = typeof r == "function", l = Ne(e) ? C(e.length) : [];
          return Fr(e, function(v) {
            l[++n] = c ? Ke(r, v, t) : Ct(v, r, t);
          }), l;
        }), Mu = yn(function(e, r, t) {
          Cr(e, t, r);
        });
        function xn(e, r) {
          var t = V(e) ? me : ua;
          return t(e, K(r, 3));
        }
        function Pu(e, r, t, n) {
          return e == null ? [] : (V(r) || (r = r == null ? [] : [r]), t = n ? d : t, V(t) || (t = t == null ? [] : [t]), ha(e, r, t));
        }
        var $u = yn(function(e, r, t) {
          e[t ? 0 : 1].push(r);
        }, function() {
          return [[], []];
        });
        function Du(e, r, t) {
          var n = V(e) ? Xn : Ui, c = arguments.length < 3;
          return n(e, K(r, 4), t, c, Fr);
        }
        function Uu(e, r, t) {
          var n = V(e) ? Vc : Ui, c = arguments.length < 3;
          return n(e, K(r, 4), t, c, ia);
        }
        function Nu(e, r) {
          var t = V(e) ? Ir : aa;
          return t(e, Sn(K(r, 3)));
        }
        function Gu(e) {
          var r = V(e) ? ra : Fl;
          return r(e);
        }
        function qu(e, r, t) {
          (t ? Me(e, r, t) : r === d) ? r = 1 : r = te(r);
          var n = V(e) ? dl : Bl;
          return n(e, r);
        }
        function ku(e) {
          var r = V(e) ? ul : Pl;
          return r(e);
        }
        function Hu(e) {
          if (e == null)
            return 0;
          if (Ne(e))
            return Rn(e) ? Vr(e) : e.length;
          var r = Te(e);
          return r == fr || r == cr ? e.size : _o(e).length;
        }
        function Ku(e, r, t) {
          var n = V(e) ? Vn : $l;
          return t && Me(e, r, t) && (r = d), n(e, K(r, 3));
        }
        var zu = ie(function(e, r) {
          if (e == null)
            return [];
          var t = r.length;
          return t > 1 && Me(e, r[0], r[1]) ? r = [] : t > 2 && Me(r[0], r[1], r[2]) && (r = [r[0]]), ha(e, Ie(r, 1), []);
        }), Cn = Rs || function() {
          return Le.Date.now();
        };
        function Zu(e, r) {
          if (typeof r != "function")
            throw new er($);
          return e = te(e), function() {
            if (--e < 1)
              return r.apply(this, arguments);
          };
        }
        function df(e, r, t) {
          return r = t ? d : r, r = e && r == null ? e.length : r, pr(e, we, d, d, d, d, r);
        }
        function uf(e, r) {
          var t;
          if (typeof r != "function")
            throw new er($);
          return e = te(e), function() {
            return --e > 0 && (t = r.apply(this, arguments)), e <= 1 && (r = d), t;
          };
        }
        var No = ie(function(e, r, t) {
          var n = J;
          if (t.length) {
            var c = Tr(t, at(No));
            n |= M;
          }
          return pr(e, n, r, t, c);
        }), yf = ie(function(e, r, t) {
          var n = J | u;
          if (t.length) {
            var c = Tr(t, at(yf));
            n |= M;
          }
          return pr(r, n, e, t, c);
        });
        function gf(e, r, t) {
          r = t ? d : r;
          var n = pr(e, x, d, d, d, d, d, r);
          return n.placeholder = gf.placeholder, n;
        }
        function vf(e, r, t) {
          r = t ? d : r;
          var n = pr(e, F, d, d, d, d, d, r);
          return n.placeholder = vf.placeholder, n;
        }
        function hf(e, r, t) {
          var n, c, l, v, h, b, O = 0, R = !1, E = !1, B = !0;
          if (typeof e != "function")
            throw new er($);
          r = ir(r) || 0, Ae(t) && (R = !!t.leading, E = "maxWait" in t, l = E ? Re(ir(t.maxWait) || 0, r) : l, B = "trailing" in t ? !!t.trailing : B);
          function U(Ce) {
            var ur = n, Lr = c;
            return n = c = d, O = Ce, v = e.apply(Lr, ur), v;
          }
          function z(Ce) {
            return O = Ce, h = Et(fe, r), R ? U(Ce) : v;
          }
          function oe(Ce) {
            var ur = Ce - b, Lr = Ce - O, Bf = r - ur;
            return E ? je(Bf, l - Lr) : Bf;
          }
          function Z(Ce) {
            var ur = Ce - b, Lr = Ce - O;
            return b === d || ur >= r || ur < 0 || E && Lr >= l;
          }
          function fe() {
            var Ce = Cn();
            if (Z(Ce))
              return le(Ce);
            h = Et(fe, oe(Ce));
          }
          function le(Ce) {
            return h = d, B && n ? U(Ce) : (n = c = d, v);
          }
          function Je() {
            h !== d && Sa(h), O = 0, n = b = c = h = d;
          }
          function Pe() {
            return h === d ? v : le(Cn());
          }
          function Xe() {
            var Ce = Cn(), ur = Z(Ce);
            if (n = arguments, c = this, b = Ce, ur) {
              if (h === d)
                return z(b);
              if (E)
                return Sa(h), h = Et(fe, r), U(b);
            }
            return h === d && (h = Et(fe, r)), v;
          }
          return Xe.cancel = Je, Xe.flush = Pe, Xe;
        }
        var Yu = ie(function(e, r) {
          return oa(e, 1, r);
        }), Ju = ie(function(e, r, t) {
          return oa(e, ir(r) || 0, t);
        });
        function Xu(e) {
          return pr(e, Se);
        }
        function pn(e, r) {
          if (typeof e != "function" || r != null && typeof r != "function")
            throw new er($);
          var t = function() {
            var n = arguments, c = r ? r.apply(this, n) : n[0], l = t.cache;
            if (l.has(c))
              return l.get(c);
            var v = e.apply(this, n);
            return t.cache = l.set(c, v) || l, v;
          };
          return t.cache = new (pn.Cache || xr)(), t;
        }
        pn.Cache = xr;
        function Sn(e) {
          if (typeof e != "function")
            throw new er($);
          return function() {
            var r = arguments;
            switch (r.length) {
              case 0:
                return !e.call(this);
              case 1:
                return !e.call(this, r[0]);
              case 2:
                return !e.call(this, r[0], r[1]);
              case 3:
                return !e.call(this, r[0], r[1], r[2]);
            }
            return !e.apply(this, r);
          };
        }
        function Vu(e) {
          return uf(2, e);
        }
        var Qu = Dl(function(e, r) {
          r = r.length == 1 && V(r[0]) ? me(r[0], ze(K())) : me(Ie(r, 1), ze(K()));
          var t = r.length;
          return ie(function(n) {
            for (var c = -1, l = je(n.length, t); ++c < l; )
              n[c] = r[c].call(this, n[c]);
            return Ke(e, this, n);
          });
        }), Go = ie(function(e, r) {
          var t = Tr(r, at(Go));
          return pr(e, M, d, r, t);
        }), _f = ie(function(e, r) {
          var t = Tr(r, at(_f));
          return pr(e, ge, d, r, t);
        }), ey = Sr(function(e, r) {
          return pr(e, pe, d, d, d, r);
        });
        function ry(e, r) {
          if (typeof e != "function")
            throw new er($);
          return r = r === d ? r : te(r), ie(e, r);
        }
        function ty(e, r) {
          if (typeof e != "function")
            throw new er($);
          return r = r == null ? 0 : Re(te(r), 0), ie(function(t) {
            var n = t[r], c = Pr(t, 0, r);
            return n && jr(c, n), Ke(e, this, c);
          });
        }
        function ny(e, r, t) {
          var n = !0, c = !0;
          if (typeof e != "function")
            throw new er($);
          return Ae(t) && (n = "leading" in t ? !!t.leading : n, c = "trailing" in t ? !!t.trailing : c), hf(e, r, {
            leading: n,
            maxWait: r,
            trailing: c
          });
        }
        function oy(e) {
          return df(e, 1);
        }
        function iy(e, r) {
          return Go(Oo(r), e);
        }
        function ay() {
          if (!arguments.length)
            return [];
          var e = arguments[0];
          return V(e) ? e : [e];
        }
        function fy(e) {
          return tr(e, ae);
        }
        function cy(e, r) {
          return r = typeof r == "function" ? r : d, tr(e, ae, r);
        }
        function sy(e) {
          return tr(e, Y | ae);
        }
        function ly(e, r) {
          return r = typeof r == "function" ? r : d, tr(e, Y | ae, r);
        }
        function dy(e, r) {
          return r == null || na(e, r, Ee(r));
        }
        function dr(e, r) {
          return e === r || e !== e && r !== r;
        }
        var uy = _n(go), yy = _n(function(e, r) {
          return e >= r;
        }), zr = sa(/* @__PURE__ */ (function() {
          return arguments;
        })()) ? sa : function(e) {
          return be(e) && ye.call(e, "callee") && !Yi.call(e, "callee");
        }, V = C.isArray, gy = Ii ? ze(Ii) : xl;
        function Ne(e) {
          return e != null && On(e.length) && !Rr(e);
        }
        function xe(e) {
          return be(e) && Ne(e);
        }
        function vy(e) {
          return e === !0 || e === !1 || be(e) && Be(e) == Ar;
        }
        var $r = Ls || Qo, hy = ji ? ze(ji) : Cl;
        function _y(e) {
          return be(e) && e.nodeType === 1 && !Lt(e);
        }
        function my(e) {
          if (e == null)
            return !0;
          if (Ne(e) && (V(e) || typeof e == "string" || typeof e.splice == "function" || $r(e) || ft(e) || zr(e)))
            return !e.length;
          var r = Te(e);
          if (r == fr || r == cr)
            return !e.size;
          if (Rt(e))
            return !_o(e).length;
          for (var t in e)
            if (ye.call(e, t))
              return !1;
          return !0;
        }
        function Ay(e, r) {
          return pt(e, r);
        }
        function by(e, r, t) {
          t = typeof t == "function" ? t : d;
          var n = t ? t(e, r) : d;
          return n === d ? pt(e, r, d, t) : !!n;
        }
        function qo(e) {
          if (!be(e))
            return !1;
          var r = Be(e);
          return r == Pt || r == qf || typeof e.message == "string" && typeof e.name == "string" && !Lt(e);
        }
        function wy(e) {
          return typeof e == "number" && Xi(e);
        }
        function Rr(e) {
          if (!Ae(e))
            return !1;
          var r = Be(e);
          return r == $t || r == oi || r == se || r == Hf;
        }
        function mf(e) {
          return typeof e == "number" && e == te(e);
        }
        function On(e) {
          return typeof e == "number" && e > -1 && e % 1 == 0 && e <= w;
        }
        function Ae(e) {
          var r = typeof e;
          return e != null && (r == "object" || r == "function");
        }
        function be(e) {
          return e != null && typeof e == "object";
        }
        var Af = Ti ? ze(Ti) : Sl;
        function xy(e, r) {
          return e === r || ho(e, r, Wo(r));
        }
        function Cy(e, r, t) {
          return t = typeof t == "function" ? t : d, ho(e, r, Wo(r), t);
        }
        function py(e) {
          return bf(e) && e != +e;
        }
        function Sy(e) {
          if (cd(e))
            throw new X(D);
          return la(e);
        }
        function Oy(e) {
          return e === null;
        }
        function Ry(e) {
          return e == null;
        }
        function bf(e) {
          return typeof e == "number" || be(e) && Be(e) == lt;
        }
        function Lt(e) {
          if (!be(e) || Be(e) != br)
            return !1;
          var r = Vt(e);
          if (r === null)
            return !0;
          var t = ye.call(r, "constructor") && r.constructor;
          return typeof t == "function" && t instanceof t && Zt.call(t) == Cs;
        }
        var ko = Wi ? ze(Wi) : Ol;
        function Ey(e) {
          return mf(e) && e >= -w && e <= w;
        }
        var wf = Fi ? ze(Fi) : Rl;
        function Rn(e) {
          return typeof e == "string" || !V(e) && be(e) && Be(e) == ut;
        }
        function Ye(e) {
          return typeof e == "symbol" || be(e) && Be(e) == Dt;
        }
        var ft = Bi ? ze(Bi) : El;
        function Ly(e) {
          return e === d;
        }
        function Iy(e) {
          return be(e) && Te(e) == yt;
        }
        function jy(e) {
          return be(e) && Be(e) == zf;
        }
        var Ty = _n(mo), Wy = _n(function(e, r) {
          return e <= r;
        });
        function xf(e) {
          if (!e)
            return [];
          if (Ne(e))
            return Rn(e) ? sr(e) : Ue(e);
          if (ht && e[ht])
            return ds(e[ht]());
          var r = Te(e), t = r == fr ? oo : r == cr ? Ht : ct;
          return t(e);
        }
        function Er(e) {
          if (!e)
            return e === 0 ? e : 0;
          if (e = ir(e), e === I || e === -I) {
            var r = e < 0 ? -1 : 1;
            return r * f;
          }
          return e === e ? e : 0;
        }
        function te(e) {
          var r = Er(e), t = r % 1;
          return r === r ? t ? r - t : r : 0;
        }
        function Cf(e) {
          return e ? qr(te(e), 0, g) : 0;
        }
        function ir(e) {
          if (typeof e == "number")
            return e;
          if (Ye(e))
            return a;
          if (Ae(e)) {
            var r = typeof e.valueOf == "function" ? e.valueOf() : e;
            e = Ae(r) ? r + "" : r;
          }
          if (typeof e != "string")
            return e === 0 ? e : +e;
          e = Ni(e);
          var t = gc.test(e);
          return t || hc.test(e) ? Zc(e.slice(2), t ? 2 : 8) : yc.test(e) ? a : +e;
        }
        function pf(e) {
          return _r(e, Ge(e));
        }
        function Fy(e) {
          return e ? qr(te(e), -w, w) : e === 0 ? e : 0;
        }
        function ue(e) {
          return e == null ? "" : Ze(e);
        }
        var By = ot(function(e, r) {
          if (Rt(r) || Ne(r)) {
            _r(r, Ee(r), e);
            return;
          }
          for (var t in r)
            ye.call(r, t) && wt(e, t, r[t]);
        }), Sf = ot(function(e, r) {
          _r(r, Ge(r), e);
        }), En = ot(function(e, r, t, n) {
          _r(r, Ge(r), e, n);
        }), My = ot(function(e, r, t, n) {
          _r(r, Ee(r), e, n);
        }), Py = Sr(lo);
        function $y(e, r) {
          var t = nt(e);
          return r == null ? t : ta(t, r);
        }
        var Dy = ie(function(e, r) {
          e = ve(e);
          var t = -1, n = r.length, c = n > 2 ? r[2] : d;
          for (c && Me(r[0], r[1], c) && (n = 1); ++t < n; )
            for (var l = r[t], v = Ge(l), h = -1, b = v.length; ++h < b; ) {
              var O = v[h], R = e[O];
              (R === d || dr(R, et[O]) && !ye.call(e, O)) && (e[O] = l[O]);
            }
          return e;
        }), Uy = ie(function(e) {
          return e.push(d, Na), Ke(Of, d, e);
        });
        function Ny(e, r) {
          return Pi(e, K(r, 3), hr);
        }
        function Gy(e, r) {
          return Pi(e, K(r, 3), yo);
        }
        function qy(e, r) {
          return e == null ? e : uo(e, K(r, 3), Ge);
        }
        function ky(e, r) {
          return e == null ? e : fa(e, K(r, 3), Ge);
        }
        function Hy(e, r) {
          return e && hr(e, K(r, 3));
        }
        function Ky(e, r) {
          return e && yo(e, K(r, 3));
        }
        function zy(e) {
          return e == null ? [] : sn(e, Ee(e));
        }
        function Zy(e) {
          return e == null ? [] : sn(e, Ge(e));
        }
        function Ho(e, r, t) {
          var n = e == null ? d : kr(e, r);
          return n === d ? t : n;
        }
        function Yy(e, r) {
          return e != null && ka(e, r, ml);
        }
        function Ko(e, r) {
          return e != null && ka(e, r, Al);
        }
        var Jy = Ma(function(e, r, t) {
          r != null && typeof r.toString != "function" && (r = Yt.call(r)), e[r] = t;
        }, Zo(qe)), Xy = Ma(function(e, r, t) {
          r != null && typeof r.toString != "function" && (r = Yt.call(r)), ye.call(e, r) ? e[r].push(t) : e[r] = [t];
        }, K), Vy = ie(Ct);
        function Ee(e) {
          return Ne(e) ? ea(e) : _o(e);
        }
        function Ge(e) {
          return Ne(e) ? ea(e, !0) : Ll(e);
        }
        function Qy(e, r) {
          var t = {};
          return r = K(r, 3), hr(e, function(n, c, l) {
            Cr(t, r(n, c, l), n);
          }), t;
        }
        function eg(e, r) {
          var t = {};
          return r = K(r, 3), hr(e, function(n, c, l) {
            Cr(t, c, r(n, c, l));
          }), t;
        }
        var rg = ot(function(e, r, t) {
          ln(e, r, t);
        }), Of = ot(function(e, r, t, n) {
          ln(e, r, t, n);
        }), tg = Sr(function(e, r) {
          var t = {};
          if (e == null)
            return t;
          var n = !1;
          r = me(r, function(l) {
            return l = Mr(l, e), n || (n = l.length > 1), l;
          }), _r(e, jo(e), t), n && (t = tr(t, Y | ee | ae, Jl));
          for (var c = r.length; c--; )
            Co(t, r[c]);
          return t;
        });
        function ng(e, r) {
          return Rf(e, Sn(K(r)));
        }
        var og = Sr(function(e, r) {
          return e == null ? {} : jl(e, r);
        });
        function Rf(e, r) {
          if (e == null)
            return {};
          var t = me(jo(e), function(n) {
            return [n];
          });
          return r = K(r), _a(e, t, function(n, c) {
            return r(n, c[0]);
          });
        }
        function ig(e, r, t) {
          r = Mr(r, e);
          var n = -1, c = r.length;
          for (c || (c = 1, e = d); ++n < c; ) {
            var l = e == null ? d : e[mr(r[n])];
            l === d && (n = c, l = t), e = Rr(l) ? l.call(e) : l;
          }
          return e;
        }
        function ag(e, r, t) {
          return e == null ? e : St(e, r, t);
        }
        function fg(e, r, t, n) {
          return n = typeof n == "function" ? n : d, e == null ? e : St(e, r, t, n);
        }
        var Ef = Da(Ee), Lf = Da(Ge);
        function cg(e, r, t) {
          var n = V(e), c = n || $r(e) || ft(e);
          if (r = K(r, 4), t == null) {
            var l = e && e.constructor;
            c ? t = n ? new l() : [] : Ae(e) ? t = Rr(l) ? nt(Vt(e)) : {} : t = {};
          }
          return (c ? Qe : hr)(e, function(v, h, b) {
            return r(t, v, h, b);
          }), t;
        }
        function sg(e, r) {
          return e == null ? !0 : Co(e, r);
        }
        function lg(e, r, t) {
          return e == null ? e : xa(e, r, Oo(t));
        }
        function dg(e, r, t, n) {
          return n = typeof n == "function" ? n : d, e == null ? e : xa(e, r, Oo(t), n);
        }
        function ct(e) {
          return e == null ? [] : no(e, Ee(e));
        }
        function ug(e) {
          return e == null ? [] : no(e, Ge(e));
        }
        function yg(e, r, t) {
          return t === d && (t = r, r = d), t !== d && (t = ir(t), t = t === t ? t : 0), r !== d && (r = ir(r), r = r === r ? r : 0), qr(ir(e), r, t);
        }
        function gg(e, r, t) {
          return r = Er(r), t === d ? (t = r, r = 0) : t = Er(t), e = ir(e), bl(e, r, t);
        }
        function vg(e, r, t) {
          if (t && typeof t != "boolean" && Me(e, r, t) && (r = t = d), t === d && (typeof r == "boolean" ? (t = r, r = d) : typeof e == "boolean" && (t = e, e = d)), e === d && r === d ? (e = 0, r = 1) : (e = Er(e), r === d ? (r = e, e = 0) : r = Er(r)), e > r) {
            var n = e;
            e = r, r = n;
          }
          if (t || e % 1 || r % 1) {
            var c = Vi();
            return je(e + c * (r - e + zc("1e-" + ((c + "").length - 1))), r);
          }
          return bo(e, r);
        }
        var hg = it(function(e, r, t) {
          return r = r.toLowerCase(), e + (t ? If(r) : r);
        });
        function If(e) {
          return zo(ue(e).toLowerCase());
        }
        function jf(e) {
          return e = ue(e), e && e.replace(mc, as).replace(Pc, "");
        }
        function _g(e, r, t) {
          e = ue(e), r = Ze(r);
          var n = e.length;
          t = t === d ? n : qr(te(t), 0, n);
          var c = t;
          return t -= r.length, t >= 0 && e.slice(t, c) == r;
        }
        function mg(e) {
          return e = ue(e), e && Vf.test(e) ? e.replace(fi, fs) : e;
        }
        function Ag(e) {
          return e = ue(e), e && oc.test(e) ? e.replace(Nn, "\\$&") : e;
        }
        var bg = it(function(e, r, t) {
          return e + (t ? "-" : "") + r.toLowerCase();
        }), wg = it(function(e, r, t) {
          return e + (t ? " " : "") + r.toLowerCase();
        }), xg = Wa("toLowerCase");
        function Cg(e, r, t) {
          e = ue(e), r = te(r);
          var n = r ? Vr(e) : 0;
          if (!r || n >= r)
            return e;
          var c = (r - n) / 2;
          return hn(tn(c), t) + e + hn(rn(c), t);
        }
        function pg(e, r, t) {
          e = ue(e), r = te(r);
          var n = r ? Vr(e) : 0;
          return r && n < r ? e + hn(r - n, t) : e;
        }
        function Sg(e, r, t) {
          e = ue(e), r = te(r);
          var n = r ? Vr(e) : 0;
          return r && n < r ? hn(r - n, t) + e : e;
        }
        function Og(e, r, t) {
          return t || r == null ? r = 0 : r && (r = +r), Ws(ue(e).replace(Gn, ""), r || 0);
        }
        function Rg(e, r, t) {
          return (t ? Me(e, r, t) : r === d) ? r = 1 : r = te(r), wo(ue(e), r);
        }
        function Eg() {
          var e = arguments, r = ue(e[0]);
          return e.length < 3 ? r : r.replace(e[1], e[2]);
        }
        var Lg = it(function(e, r, t) {
          return e + (t ? "_" : "") + r.toLowerCase();
        });
        function Ig(e, r, t) {
          return t && typeof t != "number" && Me(e, r, t) && (r = t = d), t = t === d ? g : t >>> 0, t ? (e = ue(e), e && (typeof r == "string" || r != null && !ko(r)) && (r = Ze(r), !r && Xr(e)) ? Pr(sr(e), 0, t) : e.split(r, t)) : [];
        }
        var jg = it(function(e, r, t) {
          return e + (t ? " " : "") + zo(r);
        });
        function Tg(e, r, t) {
          return e = ue(e), t = t == null ? 0 : qr(te(t), 0, e.length), r = Ze(r), e.slice(t, t + r.length) == r;
        }
        function Wg(e, r, t) {
          var n = s.templateSettings;
          t && Me(e, r, t) && (r = d), e = ue(e), r = En({}, r, n, Ua);
          var c = En({}, r.imports, n.imports, Ua), l = Ee(c), v = no(c, l), h, b, O = 0, R = r.interpolate || Ut, E = "__p += '", B = io(
            (r.escape || Ut).source + "|" + R.source + "|" + (R === ci ? uc : Ut).source + "|" + (r.evaluate || Ut).source + "|$",
            "g"
          ), U = "//# sourceURL=" + (ye.call(r, "sourceURL") ? (r.sourceURL + "").replace(/\s/g, " ") : "lodash.templateSources[" + ++Gc + "]") + `
`;
          e.replace(B, function(Z, fe, le, Je, Pe, Xe) {
            return le || (le = Je), E += e.slice(O, Xe).replace(Ac, cs), fe && (h = !0, E += `' +
__e(` + fe + `) +
'`), Pe && (b = !0, E += `';
` + Pe + `;
__p += '`), le && (E += `' +
((__t = (` + le + `)) == null ? '' : __t) +
'`), O = Xe + Z.length, Z;
          }), E += `';
`;
          var z = ye.call(r, "variable") && r.variable;
          if (!z)
            E = `with (obj) {
` + E + `
}
`;
          else if (lc.test(z))
            throw new X(H);
          E = (b ? E.replace(Zf, "") : E).replace(Yf, "$1").replace(Jf, "$1;"), E = "function(" + (z || "obj") + `) {
` + (z ? "" : `obj || (obj = {});
`) + "var __t, __p = ''" + (h ? ", __e = _.escape" : "") + (b ? `, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
` : `;
`) + E + `return __p
}`;
          var oe = Wf(function() {
            return de(l, U + "return " + E).apply(d, v);
          });
          if (oe.source = E, qo(oe))
            throw oe;
          return oe;
        }
        function Fg(e) {
          return ue(e).toLowerCase();
        }
        function Bg(e) {
          return ue(e).toUpperCase();
        }
        function Mg(e, r, t) {
          if (e = ue(e), e && (t || r === d))
            return Ni(e);
          if (!e || !(r = Ze(r)))
            return e;
          var n = sr(e), c = sr(r), l = Gi(n, c), v = qi(n, c) + 1;
          return Pr(n, l, v).join("");
        }
        function Pg(e, r, t) {
          if (e = ue(e), e && (t || r === d))
            return e.slice(0, Hi(e) + 1);
          if (!e || !(r = Ze(r)))
            return e;
          var n = sr(e), c = qi(n, sr(r)) + 1;
          return Pr(n, 0, c).join("");
        }
        function $g(e, r, t) {
          if (e = ue(e), e && (t || r === d))
            return e.replace(Gn, "");
          if (!e || !(r = Ze(r)))
            return e;
          var n = sr(e), c = Gi(n, sr(r));
          return Pr(n, c).join("");
        }
        function Dg(e, r) {
          var t = $e, n = We;
          if (Ae(r)) {
            var c = "separator" in r ? r.separator : c;
            t = "length" in r ? te(r.length) : t, n = "omission" in r ? Ze(r.omission) : n;
          }
          e = ue(e);
          var l = e.length;
          if (Xr(e)) {
            var v = sr(e);
            l = v.length;
          }
          if (t >= l)
            return e;
          var h = t - Vr(n);
          if (h < 1)
            return n;
          var b = v ? Pr(v, 0, h).join("") : e.slice(0, h);
          if (c === d)
            return b + n;
          if (v && (h += b.length - h), ko(c)) {
            if (e.slice(h).search(c)) {
              var O, R = b;
              for (c.global || (c = io(c.source, ue(si.exec(c)) + "g")), c.lastIndex = 0; O = c.exec(R); )
                var E = O.index;
              b = b.slice(0, E === d ? h : E);
            }
          } else if (e.indexOf(Ze(c), h) != h) {
            var B = b.lastIndexOf(c);
            B > -1 && (b = b.slice(0, B));
          }
          return b + n;
        }
        function Ug(e) {
          return e = ue(e), e && Xf.test(e) ? e.replace(ai, vs) : e;
        }
        var Ng = it(function(e, r, t) {
          return e + (t ? " " : "") + r.toUpperCase();
        }), zo = Wa("toUpperCase");
        function Tf(e, r, t) {
          return e = ue(e), r = t ? d : r, r === d ? ls(e) ? ms(e) : rs(e) : e.match(r) || [];
        }
        var Wf = ie(function(e, r) {
          try {
            return Ke(e, d, r);
          } catch (t) {
            return qo(t) ? t : new X(t);
          }
        }), Gg = Sr(function(e, r) {
          return Qe(r, function(t) {
            t = mr(t), Cr(e, t, No(e[t], e));
          }), e;
        });
        function qg(e) {
          var r = e == null ? 0 : e.length, t = K();
          return e = r ? me(e, function(n) {
            if (typeof n[1] != "function")
              throw new er($);
            return [t(n[0]), n[1]];
          }) : [], ie(function(n) {
            for (var c = -1; ++c < r; ) {
              var l = e[c];
              if (Ke(l[0], this, n))
                return Ke(l[1], this, n);
            }
          });
        }
        function kg(e) {
          return vl(tr(e, Y));
        }
        function Zo(e) {
          return function() {
            return e;
          };
        }
        function Hg(e, r) {
          return e == null || e !== e ? r : e;
        }
        var Kg = Ba(), zg = Ba(!0);
        function qe(e) {
          return e;
        }
        function Yo(e) {
          return da(typeof e == "function" ? e : tr(e, Y));
        }
        function Zg(e) {
          return ya(tr(e, Y));
        }
        function Yg(e, r) {
          return ga(e, tr(r, Y));
        }
        var Jg = ie(function(e, r) {
          return function(t) {
            return Ct(t, e, r);
          };
        }), Xg = ie(function(e, r) {
          return function(t) {
            return Ct(e, t, r);
          };
        });
        function Jo(e, r, t) {
          var n = Ee(r), c = sn(r, n);
          t == null && !(Ae(r) && (c.length || !n.length)) && (t = r, r = e, e = this, c = sn(r, Ee(r)));
          var l = !(Ae(t) && "chain" in t) || !!t.chain, v = Rr(e);
          return Qe(c, function(h) {
            var b = r[h];
            e[h] = b, v && (e.prototype[h] = function() {
              var O = this.__chain__;
              if (l || O) {
                var R = e(this.__wrapped__), E = R.__actions__ = Ue(this.__actions__);
                return E.push({ func: b, args: arguments, thisArg: e }), R.__chain__ = O, R;
              }
              return b.apply(e, jr([this.value()], arguments));
            });
          }), e;
        }
        function Vg() {
          return Le._ === this && (Le._ = ps), this;
        }
        function Xo() {
        }
        function Qg(e) {
          return e = te(e), ie(function(r) {
            return va(r, e);
          });
        }
        var ev = Eo(me), rv = Eo(Mi), tv = Eo(Vn);
        function Ff(e) {
          return Bo(e) ? Qn(mr(e)) : Tl(e);
        }
        function nv(e) {
          return function(r) {
            return e == null ? d : kr(e, r);
          };
        }
        var ov = Pa(), iv = Pa(!0);
        function Vo() {
          return [];
        }
        function Qo() {
          return !1;
        }
        function av() {
          return {};
        }
        function fv() {
          return "";
        }
        function cv() {
          return !0;
        }
        function sv(e, r) {
          if (e = te(e), e < 1 || e > w)
            return [];
          var t = g, n = je(e, g);
          r = K(r), e -= g;
          for (var c = to(n, r); ++t < e; )
            r(t);
          return c;
        }
        function lv(e) {
          return V(e) ? me(e, mr) : Ye(e) ? [e] : Ue(Qa(ue(e)));
        }
        function dv(e) {
          var r = ++xs;
          return ue(e) + r;
        }
        var uv = vn(function(e, r) {
          return e + r;
        }, 0), yv = Lo("ceil"), gv = vn(function(e, r) {
          return e / r;
        }, 1), vv = Lo("floor");
        function hv(e) {
          return e && e.length ? cn(e, qe, go) : d;
        }
        function _v(e, r) {
          return e && e.length ? cn(e, K(r, 2), go) : d;
        }
        function mv(e) {
          return Di(e, qe);
        }
        function Av(e, r) {
          return Di(e, K(r, 2));
        }
        function bv(e) {
          return e && e.length ? cn(e, qe, mo) : d;
        }
        function wv(e, r) {
          return e && e.length ? cn(e, K(r, 2), mo) : d;
        }
        var xv = vn(function(e, r) {
          return e * r;
        }, 1), Cv = Lo("round"), pv = vn(function(e, r) {
          return e - r;
        }, 0);
        function Sv(e) {
          return e && e.length ? ro(e, qe) : 0;
        }
        function Ov(e, r) {
          return e && e.length ? ro(e, K(r, 2)) : 0;
        }
        return s.after = Zu, s.ary = df, s.assign = By, s.assignIn = Sf, s.assignInWith = En, s.assignWith = My, s.at = Py, s.before = uf, s.bind = No, s.bindAll = Gg, s.bindKey = yf, s.castArray = ay, s.chain = cf, s.chunk = vd, s.compact = hd, s.concat = _d, s.cond = qg, s.conforms = kg, s.constant = Zo, s.countBy = Su, s.create = $y, s.curry = gf, s.curryRight = vf, s.debounce = hf, s.defaults = Dy, s.defaultsDeep = Uy, s.defer = Yu, s.delay = Ju, s.difference = md, s.differenceBy = Ad, s.differenceWith = bd, s.drop = wd, s.dropRight = xd, s.dropRightWhile = Cd, s.dropWhile = pd, s.fill = Sd, s.filter = Ru, s.flatMap = Iu, s.flatMapDeep = ju, s.flatMapDepth = Tu, s.flatten = nf, s.flattenDeep = Od, s.flattenDepth = Rd, s.flip = Xu, s.flow = Kg, s.flowRight = zg, s.fromPairs = Ed, s.functions = zy, s.functionsIn = Zy, s.groupBy = Wu, s.initial = Id, s.intersection = jd, s.intersectionBy = Td, s.intersectionWith = Wd, s.invert = Jy, s.invertBy = Xy, s.invokeMap = Bu, s.iteratee = Yo, s.keyBy = Mu, s.keys = Ee, s.keysIn = Ge, s.map = xn, s.mapKeys = Qy, s.mapValues = eg, s.matches = Zg, s.matchesProperty = Yg, s.memoize = pn, s.merge = rg, s.mergeWith = Of, s.method = Jg, s.methodOf = Xg, s.mixin = Jo, s.negate = Sn, s.nthArg = Qg, s.omit = tg, s.omitBy = ng, s.once = Vu, s.orderBy = Pu, s.over = ev, s.overArgs = Qu, s.overEvery = rv, s.overSome = tv, s.partial = Go, s.partialRight = _f, s.partition = $u, s.pick = og, s.pickBy = Rf, s.property = Ff, s.propertyOf = nv, s.pull = Pd, s.pullAll = af, s.pullAllBy = $d, s.pullAllWith = Dd, s.pullAt = Ud, s.range = ov, s.rangeRight = iv, s.rearg = ey, s.reject = Nu, s.remove = Nd, s.rest = ry, s.reverse = Do, s.sampleSize = qu, s.set = ag, s.setWith = fg, s.shuffle = ku, s.slice = Gd, s.sortBy = zu, s.sortedUniq = Yd, s.sortedUniqBy = Jd, s.split = Ig, s.spread = ty, s.tail = Xd, s.take = Vd, s.takeRight = Qd, s.takeRightWhile = eu, s.takeWhile = ru, s.tap = hu, s.throttle = ny, s.thru = wn, s.toArray = xf, s.toPairs = Ef, s.toPairsIn = Lf, s.toPath = lv, s.toPlainObject = pf, s.transform = cg, s.unary = oy, s.union = tu, s.unionBy = nu, s.unionWith = ou, s.uniq = iu, s.uniqBy = au, s.uniqWith = fu, s.unset = sg, s.unzip = Uo, s.unzipWith = ff, s.update = lg, s.updateWith = dg, s.values = ct, s.valuesIn = ug, s.without = cu, s.words = Tf, s.wrap = iy, s.xor = su, s.xorBy = lu, s.xorWith = du, s.zip = uu, s.zipObject = yu, s.zipObjectDeep = gu, s.zipWith = vu, s.entries = Ef, s.entriesIn = Lf, s.extend = Sf, s.extendWith = En, Jo(s, s), s.add = uv, s.attempt = Wf, s.camelCase = hg, s.capitalize = If, s.ceil = yv, s.clamp = yg, s.clone = fy, s.cloneDeep = sy, s.cloneDeepWith = ly, s.cloneWith = cy, s.conformsTo = dy, s.deburr = jf, s.defaultTo = Hg, s.divide = gv, s.endsWith = _g, s.eq = dr, s.escape = mg, s.escapeRegExp = Ag, s.every = Ou, s.find = Eu, s.findIndex = rf, s.findKey = Ny, s.findLast = Lu, s.findLastIndex = tf, s.findLastKey = Gy, s.floor = vv, s.forEach = sf, s.forEachRight = lf, s.forIn = qy, s.forInRight = ky, s.forOwn = Hy, s.forOwnRight = Ky, s.get = Ho, s.gt = uy, s.gte = yy, s.has = Yy, s.hasIn = Ko, s.head = of, s.identity = qe, s.includes = Fu, s.indexOf = Ld, s.inRange = gg, s.invoke = Vy, s.isArguments = zr, s.isArray = V, s.isArrayBuffer = gy, s.isArrayLike = Ne, s.isArrayLikeObject = xe, s.isBoolean = vy, s.isBuffer = $r, s.isDate = hy, s.isElement = _y, s.isEmpty = my, s.isEqual = Ay, s.isEqualWith = by, s.isError = qo, s.isFinite = wy, s.isFunction = Rr, s.isInteger = mf, s.isLength = On, s.isMap = Af, s.isMatch = xy, s.isMatchWith = Cy, s.isNaN = py, s.isNative = Sy, s.isNil = Ry, s.isNull = Oy, s.isNumber = bf, s.isObject = Ae, s.isObjectLike = be, s.isPlainObject = Lt, s.isRegExp = ko, s.isSafeInteger = Ey, s.isSet = wf, s.isString = Rn, s.isSymbol = Ye, s.isTypedArray = ft, s.isUndefined = Ly, s.isWeakMap = Iy, s.isWeakSet = jy, s.join = Fd, s.kebabCase = bg, s.last = or, s.lastIndexOf = Bd, s.lowerCase = wg, s.lowerFirst = xg, s.lt = Ty, s.lte = Wy, s.max = hv, s.maxBy = _v, s.mean = mv, s.meanBy = Av, s.min = bv, s.minBy = wv, s.stubArray = Vo, s.stubFalse = Qo, s.stubObject = av, s.stubString = fv, s.stubTrue = cv, s.multiply = xv, s.nth = Md, s.noConflict = Vg, s.noop = Xo, s.now = Cn, s.pad = Cg, s.padEnd = pg, s.padStart = Sg, s.parseInt = Og, s.random = vg, s.reduce = Du, s.reduceRight = Uu, s.repeat = Rg, s.replace = Eg, s.result = ig, s.round = Cv, s.runInContext = A, s.sample = Gu, s.size = Hu, s.snakeCase = Lg, s.some = Ku, s.sortedIndex = qd, s.sortedIndexBy = kd, s.sortedIndexOf = Hd, s.sortedLastIndex = Kd, s.sortedLastIndexBy = zd, s.sortedLastIndexOf = Zd, s.startCase = jg, s.startsWith = Tg, s.subtract = pv, s.sum = Sv, s.sumBy = Ov, s.template = Wg, s.times = sv, s.toFinite = Er, s.toInteger = te, s.toLength = Cf, s.toLower = Fg, s.toNumber = ir, s.toSafeInteger = Fy, s.toString = ue, s.toUpper = Bg, s.trim = Mg, s.trimEnd = Pg, s.trimStart = $g, s.truncate = Dg, s.unescape = Ug, s.uniqueId = dv, s.upperCase = Ng, s.upperFirst = zo, s.each = sf, s.eachRight = lf, s.first = of, Jo(s, (function() {
          var e = {};
          return hr(s, function(r, t) {
            ye.call(s.prototype, t) || (e[t] = r);
          }), e;
        })(), { chain: !1 }), s.VERSION = N, Qe(["bind", "bindKey", "curry", "curryRight", "partial", "partialRight"], function(e) {
          s[e].placeholder = s;
        }), Qe(["drop", "take"], function(e, r) {
          ce.prototype[e] = function(t) {
            t = t === d ? 1 : Re(te(t), 0);
            var n = this.__filtered__ && !r ? new ce(this) : this.clone();
            return n.__filtered__ ? n.__takeCount__ = je(t, n.__takeCount__) : n.__views__.push({
              size: je(t, g),
              type: e + (n.__dir__ < 0 ? "Right" : "")
            }), n;
          }, ce.prototype[e + "Right"] = function(t) {
            return this.reverse()[e](t).reverse();
          };
        }), Qe(["filter", "map", "takeWhile"], function(e, r) {
          var t = r + 1, n = t == De || t == m;
          ce.prototype[e] = function(c) {
            var l = this.clone();
            return l.__iteratees__.push({
              iteratee: K(c, 3),
              type: t
            }), l.__filtered__ = l.__filtered__ || n, l;
          };
        }), Qe(["head", "last"], function(e, r) {
          var t = "take" + (r ? "Right" : "");
          ce.prototype[e] = function() {
            return this[t](1).value()[0];
          };
        }), Qe(["initial", "tail"], function(e, r) {
          var t = "drop" + (r ? "" : "Right");
          ce.prototype[e] = function() {
            return this.__filtered__ ? new ce(this) : this[t](1);
          };
        }), ce.prototype.compact = function() {
          return this.filter(qe);
        }, ce.prototype.find = function(e) {
          return this.filter(e).head();
        }, ce.prototype.findLast = function(e) {
          return this.reverse().find(e);
        }, ce.prototype.invokeMap = ie(function(e, r) {
          return typeof e == "function" ? new ce(this) : this.map(function(t) {
            return Ct(t, e, r);
          });
        }), ce.prototype.reject = function(e) {
          return this.filter(Sn(K(e)));
        }, ce.prototype.slice = function(e, r) {
          e = te(e);
          var t = this;
          return t.__filtered__ && (e > 0 || r < 0) ? new ce(t) : (e < 0 ? t = t.takeRight(-e) : e && (t = t.drop(e)), r !== d && (r = te(r), t = r < 0 ? t.dropRight(-r) : t.take(r - e)), t);
        }, ce.prototype.takeRightWhile = function(e) {
          return this.reverse().takeWhile(e).reverse();
        }, ce.prototype.toArray = function() {
          return this.take(g);
        }, hr(ce.prototype, function(e, r) {
          var t = /^(?:filter|find|map|reject)|While$/.test(r), n = /^(?:head|last)$/.test(r), c = s[n ? "take" + (r == "last" ? "Right" : "") : r], l = n || /^find/.test(r);
          c && (s.prototype[r] = function() {
            var v = this.__wrapped__, h = n ? [1] : arguments, b = v instanceof ce, O = h[0], R = b || V(v), E = function(fe) {
              var le = c.apply(s, jr([fe], h));
              return n && B ? le[0] : le;
            };
            R && t && typeof O == "function" && O.length != 1 && (b = R = !1);
            var B = this.__chain__, U = !!this.__actions__.length, z = l && !B, oe = b && !U;
            if (!l && R) {
              v = oe ? v : new ce(this);
              var Z = e.apply(v, h);
              return Z.__actions__.push({ func: wn, args: [E], thisArg: d }), new rr(Z, B);
            }
            return z && oe ? e.apply(this, h) : (Z = this.thru(E), z ? n ? Z.value()[0] : Z.value() : Z);
          });
        }), Qe(["pop", "push", "shift", "sort", "splice", "unshift"], function(e) {
          var r = Kt[e], t = /^(?:push|sort|unshift)$/.test(e) ? "tap" : "thru", n = /^(?:pop|shift)$/.test(e);
          s.prototype[e] = function() {
            var c = arguments;
            if (n && !this.__chain__) {
              var l = this.value();
              return r.apply(V(l) ? l : [], c);
            }
            return this[t](function(v) {
              return r.apply(V(v) ? v : [], c);
            });
          };
        }), hr(ce.prototype, function(e, r) {
          var t = s[r];
          if (t) {
            var n = t.name + "";
            ye.call(tt, n) || (tt[n] = []), tt[n].push({ name: r, func: t });
          }
        }), tt[gn(d, u).name] = [{
          name: "wrapper",
          func: d
        }], ce.prototype.clone = Us, ce.prototype.reverse = Ns, ce.prototype.value = Gs, s.prototype.at = _u, s.prototype.chain = mu, s.prototype.commit = Au, s.prototype.next = bu, s.prototype.plant = xu, s.prototype.reverse = Cu, s.prototype.toJSON = s.prototype.valueOf = s.prototype.value = pu, s.prototype.first = s.prototype.head, ht && (s.prototype[ht] = wu), s;
      }), Qr = As();
      Dr ? ((Dr.exports = Qr)._ = Qr, Zn._ = Qr) : Le._ = Qr;
    }).call(Tv);
  })(Tt, Tt.exports)), Tt.exports;
}
var Mt = Wv();
function vr(j) {
  return j != null;
}
function Uf(j, W) {
  if (Array.isArray(j) || Array.isArray(W)) {
    const d = Mt.castArray(j).filter(vr), N = Mt.castArray(W).filter(vr);
    return d.concat(N);
  }
}
const ri = {
  anchors: [
    { "actions-info": {
      tap_action: { action: "more-info" },
      icon_tap_action: { action: "more-info" },
      hold_action: { action: "more-info" }
    } },
    { "actions-toggle": {
      tap_action: { action: "toggle" },
      icon_tap_action: { action: "toggle" },
      hold_action: { action: "more-info" }
    } },
    { tile: {
      type: "tile",
      entity: "$entity",
      hide_state: !0,
      vertical: !1,
      features_position: "bottom"
    } }
  ],
  global: {
    minCardWidth: 200,
    filter: { exclude: [
      {
        type: "disabled_by",
        comparator: "match",
        value: ".*"
      },
      {
        type: "hidden_by",
        comparator: "match",
        value: ".*"
      },
      {
        type: "label",
        config: { label: "hidden" },
        value: "hidden"
      }
    ] },
    sort: [
      {
        type: "label",
        config: { label: "^sort_\\d+$" }
      },
      { type: "integration" },
      { type: "entity" }
    ]
  },
  grids: [
    {
      id: "control_alarm",
      title: "Alarm",
      filter: { include: [{
        type: "domain",
        value: "alarm_control_panel"
      }] },
      card: {
        type: "tile",
        entity: "$entity",
        hide_state: !0,
        vertical: !1,
        features_position: "bottom",
        tap_action: { action: "more-info" },
        icon_tap_action: { action: "more-info" },
        hold_action: { action: "more-info" },
        features: [{
          type: "alarm-modes",
          modes: [
            "armed_home",
            "armed_away",
            "armed_night",
            "armed_vacation",
            "armed_custom_bypass",
            "disarmed"
          ]
        }]
      }
    },
    {
      id: "control_media",
      title: "Media",
      filter: { include: [{
        type: "domain",
        value: "media_player"
      }] },
      card: {
        type: "tile",
        entity: "$entity",
        hide_state: !0,
        vertical: !1,
        features_position: "bottom",
        tap_action: { action: "toggle" },
        icon_tap_action: { action: "toggle" },
        hold_action: { action: "more-info" },
        show_entity_picture: !0,
        features: [
          { type: "media-player-volume-slider" },
          { type: "media-player-playback" }
        ]
      }
    },
    {
      id: "control_light",
      title: "Light",
      filter: { include: [{
        type: "domain",
        value: "light"
      }] },
      card: {
        type: "tile",
        entity: "$entity",
        hide_state: !0,
        vertical: !1,
        features_position: "bottom",
        tap_action: { action: "toggle" },
        icon_tap_action: { action: "toggle" },
        hold_action: { action: "more-info" },
        features: [
          { type: "light-brightness" },
          { type: "light-color-temp" }
        ]
      }
    },
    {
      id: "control_fan",
      title: "Fan",
      filter: { include: [{
        type: "domain",
        value: "fan"
      }] },
      card: {
        type: "tile",
        entity: "$entity",
        hide_state: !0,
        vertical: !1,
        features_position: "bottom",
        tap_action: { action: "toggle" },
        icon_tap_action: { action: "toggle" },
        hold_action: { action: "more-info" },
        features: [
          { type: "fan-speed" },
          {
            type: "fan-preset-modes",
            style: "icons"
          }
        ]
      }
    },
    {
      id: "control_humidifier",
      title: "Humidifier",
      filter: { include: [{
        type: "domain",
        value: "humidifier"
      }] },
      card: {
        type: "tile",
        entity: "$entity",
        hide_state: !0,
        vertical: !1,
        features_position: "bottom",
        tap_action: { action: "toggle" },
        icon_tap_action: { action: "toggle" },
        hold_action: { action: "more-info" },
        features: [
          { type: "target-humidity" },
          { type: "humidifier-toggle" }
        ]
      }
    },
    {
      id: "control_cover",
      title: "Cover",
      filter: { include: [{
        type: "domain",
        value: "cover"
      }] },
      card: {
        type: "tile",
        entity: "$entity",
        hide_state: !0,
        vertical: !1,
        features_position: "bottom",
        tap_action: { action: "more-info" },
        icon_tap_action: { action: "more-info" },
        hold_action: { action: "more-info" },
        features: [{ type: "cover-open-close" }]
      }
    },
    {
      id: "control_vacuum",
      title: "Vacuum",
      filter: { include: [{
        type: "domain",
        value: "vacuum"
      }] },
      card: {
        type: "tile",
        entity: "$entity",
        hide_state: !0,
        vertical: !1,
        features_position: "bottom",
        tap_action: { action: "more-info" },
        icon_tap_action: { action: "more-info" },
        hold_action: { action: "more-info" },
        features: [{
          type: "vacuum-commands",
          commands: [
            "start_pause",
            "return_home"
          ]
        }]
      }
    },
    {
      id: "control_switch",
      title: "Switch",
      filter: { include: [{
        type: "domain",
        comparator: "in",
        value: [
          "switch",
          "input_boolean"
        ]
      }] },
      card: {
        type: "tile",
        entity: "$entity",
        hide_state: !0,
        vertical: !1,
        features_position: "bottom",
        tap_action: { action: "toggle" },
        icon_tap_action: { action: "toggle" },
        hold_action: { action: "more-info" }
      }
    },
    {
      id: "control_select",
      title: "Select",
      filter: { include: [{
        type: "domain",
        comparator: "in",
        value: [
          "select",
          "input_select"
        ]
      }] },
      card: {
        type: "tile",
        entity: "$entity",
        hide_state: !0,
        vertical: !1,
        features_position: "bottom",
        tap_action: { action: "more-info" },
        icon_tap_action: { action: "more-info" },
        hold_action: { action: "more-info" },
        features: [{ type: "select-options" }]
      }
    },
    {
      id: "control_button",
      title: "Button",
      filter: { include: [{
        type: "domain",
        comparator: "in",
        value: [
          "button",
          "scene"
        ]
      }] },
      card: {
        type: "tile",
        entity: "$entity",
        hide_state: !0,
        vertical: !1,
        features_position: "bottom",
        tap_action: { action: "toggle" },
        icon_tap_action: { action: "toggle" },
        hold_action: { action: "more-info" }
      }
    },
    {
      id: "control_number",
      title: "Number",
      filter: { include: [{
        type: "domain",
        value: "number"
      }] },
      card: {
        type: "tile",
        entity: "$entity",
        hide_state: !0,
        vertical: !1,
        features_position: "bottom",
        tap_action: { action: "more-info" },
        icon_tap_action: { action: "more-info" },
        hold_action: { action: "more-info" },
        features: [{
          type: "numeric-input",
          style: "slider"
        }]
      }
    },
    {
      id: "stats_alert",
      title: "Alert",
      filter: {
        include: [{
          type: "domain",
          value: "binary_sensor"
        }],
        exclude: [{
          type: "attribute",
          config: { key: "device_class" },
          comparator: "in",
          value: [
            "motion",
            "occupancy"
          ]
        }]
      },
      card: {
        type: "tile",
        entity: "$entity",
        hide_state: !0,
        vertical: !1,
        features_position: "bottom",
        tap_action: { action: "more-info" },
        icon_tap_action: { action: "more-info" },
        hold_action: { action: "more-info" }
      }
    },
    {
      id: "stats_sensor",
      title: "Sensor",
      filter: {
        include: [{
          type: "domain",
          value: "sensor"
        }],
        exclude: [
          {
            type: "attribute",
            config: { key: "device_class" },
            value: "battery"
          },
          {
            type: "state",
            comparator: "is_numeric"
          }
        ]
      },
      card: {
        type: "tile",
        entity: "$entity",
        hide_state: !1,
        vertical: !1,
        features_position: "bottom",
        tap_action: { action: "more-info" },
        icon_tap_action: { action: "more-info" },
        hold_action: { action: "more-info" }
      }
    },
    {
      id: "stats_graphs",
      title: "Graphs",
      filter: {
        include: [
          {
            type: "domain",
            value: "sensor"
          },
          {
            type: "state",
            comparator: "is_numeric"
          }
        ],
        exclude: [{
          type: "attribute",
          config: { key: "device_class" },
          value: "battery"
        }]
      },
      card: {
        tap_action: { action: "more-info" },
        icon_tap_action: { action: "more-info" },
        hold_action: { action: "more-info" },
        type: "custom:mini-graph-card",
        entities: ["$entity"],
        align_header: "left",
        align_icon: "left",
        align_state: "center",
        font_size: 50,
        font_size_header: 12,
        card_mod: { style: `.header {
  max-width: 80%;
}
.line--rect,
.fill--rect,
.line--points {
  {% set COLOR = 'grey' %}
  {% if state_attr(config.entities[0],'device_class') in ['date', 'timestamp', 'irradiance', 'distance', 'duration', 'illuminance', 'enum', 'monetary'] %} 
    {% set COLOR = 'grey' %}
  {% elif state_attr(config.entities[0],'device_class') in ['apparent_power', 'battery', 'current', 'energy', 'energy_storage', 'power_factor', 'power', 'voltage'] %} 
    {% set COLOR = 'yellow' %}
  {% elif state_attr(config.entities[0],'device_class') in ['aqi', 'sulphur_dioxide', 'volatile_organic_compounds', 'volatile_organic_compounds_parts', 'atmospheric_pressure', 'carbon_dioxide', 'carbon_monoxide', 'nitrogen_dioxide', 'gas', 'nitrogen_monoxide', 'nitrous_oxide', 'ozone', 'pm1', 'pm10', 'pm25'] %} 
    {% set COLOR = 'green' %}
  {% elif state_attr(config.entities[0],'device_class') in ['pressure', 'reactive_power', 'speed', 'temperature', 'weight', 'wind_speed'] %} 
    {% set COLOR = 'orangered' %}
  {% elif state_attr(config.entities[0],'device_class') in ['moisture', 'ph', 'precipitation', 'precipitation_intensity', 'humidity', 'water', 'volume', 'volume_storage'] %} 
    {% set COLOR = 'royalblue' %}
  {% elif state_attr(config.entities[0],'device_class') in ['data_rate', 'data_size', 'signal_strength', 'frequency', 'sound_pressure'] %}
    {% set COLOR = 'orange' %}
  {% endif %}
  fill: {{COLOR}};
  stroke: {{COLOR}};
}` }
      }
    },
    {
      id: "camera_camera",
      filter: { include: [{
        type: "domain",
        value: "camera"
      }] },
      card: {
        tap_action: { action: "more-info" },
        icon_tap_action: { action: "more-info" },
        hold_action: { action: "more-info" },
        type: "picture-entity",
        entity: "$entity"
      }
    }
  ],
  gridMergeStrategy: "add",
  navigation: {
    id: "area",
    minCardWidth: 300,
    card: {
      type: "area",
      display_type: "picture",
      area: "$area",
      navigation_path: "$area#main",
      aspect_ratio: "40:15",
      alert_classes: ["occupancy"],
      sensor_classes: [
        "temperature",
        "humidity"
      ],
      features_position: "inline",
      features: [{
        type: "area-controls",
        controls: [
          "light",
          "fan"
        ]
      }],
      card_mod: { style: `{% set colors = [
  "rgba(42,72,100,0.3)",
  "rgba(234,162,33,0.3)",
  "rgba(214,64,92,0.3)",
  "rgba(190,70,178,0.3)",
  "rgba(145,142,80,0.3)",
  "rgba(12,162,121,0.3)",
  "rgba(76,159,171,0.3)",
  "rgba(147,72,26,0.3)",
] %} 
{% set color = colors[$index%(colors|length)] %}

{% if '$area' != '$currArea' %}
hui-image {
  opacity: 0.3;
}
div.header {
    background-color: {{color}};
}
{% endif %}
` }
    },
    filter: { exclude: [{
      type: "label",
      config: { label: "hidden" },
      value: "hidden"
    }] },
    sort: [
      {
        type: "label",
        config: { label: "^sort_\\d+$" }
      },
      { type: "floor" },
      { type: "area" }
    ]
  },
  main: [
    {
      title: "Control",
      icon: "mdi:button-pointer",
      match: "^control_.*$"
    },
    {
      title: "Stats",
      icon: "mdi:chart-line",
      match: "^stats_.*$"
    },
    {
      title: "Camera",
      icon: "mdi:camera",
      match: "^camera_.*$"
    }
  ]
}, Nf = (...j) => {
  const W = j?.filter(vr), d = W.filter(vr).reduce((D, $) => ({ ...D, ...$ }));
  if (d.global = W.map((D) => D.global).filter(vr).reduce((D, $) => ({ ...D, ...$ })), !(/* @__PURE__ */ (() => {
    const D = /* @__PURE__ */ new Set(["entity", "domain", "device", "area", "floor", "integration", "label", "state", "attribute", "disabled_by", "hidden_by", "entity_category"]), $ = /* @__PURE__ */ new Set(["entity", "domain", "device", "area", "floor", "integration", "label", "state", "attribute", "disabled_by", "hidden_by", "entity_category"]), H = (u) => (u.global === void 0 || typeof u.global == "object" && u.global !== null && Array.isArray(u.global) === !1 && T(u.global)) && (u.gridMergeStrategy === "add" || u.gridMergeStrategy === "reset"), T = (u) => (u.id === void 0 || typeof u.id == "string") && (u.title === void 0 || typeof u.title == "string") && (u.position === void 0 || typeof u.position == "number") && (u.minCardWidth === void 0 || typeof u.minCardWidth == "number") && (u.replace === void 0 || typeof u.replace == "object" && u.replace !== null && Array.isArray(u.replace) === !1 && q(u.replace)) && (u.filter === void 0 || typeof u.filter == "object" && u.filter !== null && Array.isArray(u.filter) === !1 && ee(u.filter)) && (u.sort === void 0 || Array.isArray(u.sort) && u.sort.every((i) => typeof i == "object" && i !== null && re(i))) && (u.card === void 0 || typeof u.card == "object" && u.card !== null && Array.isArray(u.card) === !1 && J(u.card)), q = (u) => Object.keys(u).every((i) => {
      const x = u[i];
      return x === void 0 ? !0 : typeof x == "object" && x !== null && Q(x);
    }), Q = (u) => typeof u.card == "object" && u.card !== null && Y(u.card), Y = (u) => (u.index === void 0 || typeof u.index == "number") && (u.view_index === void 0 || typeof u.view_index == "number") && typeof u.type == "string" && Object.keys(u).every((i) => (["index", "view_index", "type"].some((F) => i === F) || u[i] === void 0, !0)), ee = (u) => (u.exclude === void 0 || Array.isArray(u.exclude) && u.exclude.every((i) => typeof i == "object" && i !== null && ae(i))) && (u.include === void 0 || Array.isArray(u.include) && u.include.every((i) => typeof i == "object" && i !== null && ae(i))), ae = (u) => (u.comparator === void 0 || u.comparator === "equal" || u.comparator === "match" || u.comparator === "in" || u.comparator === "greater_than" || u.comparator === "lower_than" || u.comparator === "is_null" || u.comparator === "is_numeric") && !0 && D.has(u.type) === !0 && (u.config === void 0 || typeof u.config == "object" && u.config !== null && Array.isArray(u.config) === !1 && ne(u.config)), ne = (u) => (u.key === void 0 || typeof u.key == "string") && (u.label === void 0 || typeof u.label == "string"), re = (u) => (u.comparator === void 0 || u.comparator === "ascending" || u.comparator === "descending") && $.has(u.type) === !0 && (u.config === void 0 || typeof u.config == "object" && u.config !== null && Array.isArray(u.config) === !1 && ne(u.config)), J = (u) => (u.index === void 0 || typeof u.index == "number") && (u.view_index === void 0 || typeof u.view_index == "number") && (u.type === void 0 || typeof u.type == "string") && Object.keys(u).every((i) => (["index", "view_index", "type"].some((F) => i === F) || u[i] === void 0, !0));
    return (u) => typeof u == "object" && u !== null && H(u);
  })())(d)) {
    const D = (/* @__PURE__ */ (() => {
      const $ = /* @__PURE__ */ new Set(["entity", "domain", "device", "area", "floor", "integration", "label", "state", "attribute", "disabled_by", "hidden_by", "entity_category"]), H = /* @__PURE__ */ new Set(["entity", "domain", "device", "area", "floor", "integration", "label", "state", "attribute", "disabled_by", "hidden_by", "entity_category"]), T = /* @__PURE__ */ new Set(["entity", "domain", "device", "area", "floor", "integration", "label", "state", "attribute", "disabled_by", "hidden_by", "entity_category"]), q = /* @__PURE__ */ new Set(["entity", "domain", "device", "area", "floor", "integration", "label", "state", "attribute", "disabled_by", "hidden_by", "entity_category"]), Q = (o) => (o.global === void 0 || typeof o.global == "object" && o.global !== null && Array.isArray(o.global) === !1 && Y(o.global)) && Array.isArray(o.grids) && o.grids.every((_) => typeof _ == "object" && _ !== null && ge(_)) && (o.gridMergeStrategy === "add" || o.gridMergeStrategy === "reset"), Y = (o) => (o.id === void 0 || typeof o.id == "string") && (o.title === void 0 || typeof o.title == "string") && (o.position === void 0 || typeof o.position == "number") && (o.minCardWidth === void 0 || typeof o.minCardWidth == "number") && (o.replace === void 0 || typeof o.replace == "object" && o.replace !== null && Array.isArray(o.replace) === !1 && ee(o.replace)) && (o.filter === void 0 || typeof o.filter == "object" && o.filter !== null && Array.isArray(o.filter) === !1 && re(o.filter)) && (o.sort === void 0 || Array.isArray(o.sort) && o.sort.every((_) => typeof _ == "object" && _ !== null && i(_))) && (o.card === void 0 || typeof o.card == "object" && o.card !== null && Array.isArray(o.card) === !1 && x(o.card)), ee = (o) => Object.keys(o).every((_) => {
        const p = o[_];
        return p === void 0 ? !0 : typeof p == "object" && p !== null && ae(p);
      }), ae = (o) => typeof o.card == "object" && o.card !== null && ne(o.card), ne = (o) => (o.index === void 0 || typeof o.index == "number") && (o.view_index === void 0 || typeof o.view_index == "number") && typeof o.type == "string" && Object.keys(o).every((_) => (["index", "view_index", "type"].some((L) => _ === L) || o[_] === void 0, !0)), re = (o) => (o.exclude === void 0 || Array.isArray(o.exclude) && o.exclude.every((_) => typeof _ == "object" && _ !== null && J(_))) && (o.include === void 0 || Array.isArray(o.include) && o.include.every((_) => typeof _ == "object" && _ !== null && J(_))), J = (o) => (o.comparator === void 0 || o.comparator === "equal" || o.comparator === "match" || o.comparator === "in" || o.comparator === "greater_than" || o.comparator === "lower_than" || o.comparator === "is_null" || o.comparator === "is_numeric") && !0 && $.has(o.type) === !0 && (o.config === void 0 || typeof o.config == "object" && o.config !== null && Array.isArray(o.config) === !1 && u(o.config)), u = (o) => (o.key === void 0 || typeof o.key == "string") && (o.label === void 0 || typeof o.label == "string"), i = (o) => (o.comparator === void 0 || o.comparator === "ascending" || o.comparator === "descending") && H.has(o.type) === !0 && (o.config === void 0 || typeof o.config == "object" && o.config !== null && Array.isArray(o.config) === !1 && u(o.config)), x = (o) => (o.index === void 0 || typeof o.index == "number") && (o.view_index === void 0 || typeof o.view_index == "number") && (o.type === void 0 || typeof o.type == "string") && Object.keys(o).every((_) => (["index", "view_index", "type"].some((L) => _ === L) || o[_] === void 0, !0)), F = (o) => typeof o.id == "string" && (o.title === void 0 || typeof o.title == "string") && (o.position === void 0 || typeof o.position == "number") && typeof o.minCardWidth == "number" && (o.replace === void 0 || typeof o.replace == "object" && o.replace !== null && Array.isArray(o.replace) === !1 && ee(o.replace)) && (o.filter === void 0 || typeof o.filter == "object" && o.filter !== null && Array.isArray(o.filter) === !1 && re(o.filter)) && (o.sort === void 0 || Array.isArray(o.sort) && o.sort.every((_) => typeof _ == "object" && _ !== null && i(_))) && typeof o.card == "object" && o.card !== null && ne(o.card), M = (o) => typeof o.gridId == "string" && (o.id === void 0 || typeof o.id == "string") && (o.title === void 0 || typeof o.title == "string") && (o.position === void 0 || typeof o.position == "number") && (o.minCardWidth === void 0 || typeof o.minCardWidth == "number") && (o.replace === void 0 || typeof o.replace == "object" && o.replace !== null && Array.isArray(o.replace) === !1 && ee(o.replace)) && (o.filter === void 0 || typeof o.filter == "object" && o.filter !== null && Array.isArray(o.filter) === !1 && re(o.filter)) && (o.sort === void 0 || Array.isArray(o.sort) && o.sort.every((_) => typeof _ == "object" && _ !== null && i(_))) && (o.card === void 0 || typeof o.card == "object" && o.card !== null && Array.isArray(o.card) === !1 && x(o.card)), ge = (o) => o.gridId !== void 0 ? M(o) : F(o), we = (o, _, p = !0) => [o.global === void 0 || (typeof o.global == "object" && o.global !== null && Array.isArray(o.global) === !1 || y(p, {
        path: _ + ".global",
        expected: "(DeepPartial<BaseRowOptions> | undefined)",
        value: o.global
      })) && pe(o.global, _ + ".global", p) || y(p, {
        path: _ + ".global",
        expected: "(DeepPartial<BaseRowOptions> | undefined)",
        value: o.global
      }), (Array.isArray(o.grids) || y(p, {
        path: _ + ".grids",
        expected: "Array<BaseRowOptions | BaseRowRefOptions>",
        value: o.grids
      })) && o.grids.map((L, se) => (typeof L == "object" && L !== null || y(p, {
        path: _ + ".grids[" + se + "]",
        expected: "(BaseRowOptions | BaseRowRefOptions)",
        value: L
      })) && f(L, _ + ".grids[" + se + "]", p) || y(p, {
        path: _ + ".grids[" + se + "]",
        expected: "(BaseRowOptions | BaseRowRefOptions)",
        value: L
      })).every((L) => L) || y(p, {
        path: _ + ".grids",
        expected: "Array<BaseRowOptions | BaseRowRefOptions>",
        value: o.grids
      }), o.gridMergeStrategy === "add" || o.gridMergeStrategy === "reset" || y(p, {
        path: _ + ".gridMergeStrategy",
        expected: '("add" | "reset")',
        value: o.gridMergeStrategy
      })].every((L) => L), pe = (o, _, p = !0) => [o.id === void 0 || typeof o.id == "string" || y(p, {
        path: _ + ".id",
        expected: "(string | undefined)",
        value: o.id
      }), o.title === void 0 || typeof o.title == "string" || y(p, {
        path: _ + ".title",
        expected: "(string | undefined)",
        value: o.title
      }), o.position === void 0 || typeof o.position == "number" || y(p, {
        path: _ + ".position",
        expected: "(number | undefined)",
        value: o.position
      }), o.minCardWidth === void 0 || typeof o.minCardWidth == "number" || y(p, {
        path: _ + ".minCardWidth",
        expected: "(number | undefined)",
        value: o.minCardWidth
      }), o.replace === void 0 || (typeof o.replace == "object" && o.replace !== null && Array.isArray(o.replace) === !1 || y(p, {
        path: _ + ".replace",
        expected: "(Record<string, GridStrategyCardConfig> | undefined)",
        value: o.replace
      })) && Se(o.replace, _ + ".replace", p) || y(p, {
        path: _ + ".replace",
        expected: "(Record<string, GridStrategyCardConfig> | undefined)",
        value: o.replace
      }), o.filter === void 0 || (typeof o.filter == "object" && o.filter !== null && Array.isArray(o.filter) === !1 || y(p, {
        path: _ + ".filter",
        expected: "(FilterObject | undefined)",
        value: o.filter
      })) && Fe(o.filter, _ + ".filter", p) || y(p, {
        path: _ + ".filter",
        expected: "(FilterObject | undefined)",
        value: o.filter
      }), o.sort === void 0 || (Array.isArray(o.sort) || y(p, {
        path: _ + ".sort",
        expected: "(Array<SortConfig> | undefined)",
        value: o.sort
      })) && o.sort.map((L, se) => (typeof L == "object" && L !== null || y(p, {
        path: _ + ".sort[" + se + "]",
        expected: "SortConfig",
        value: L
      })) && k(L, _ + ".sort[" + se + "]", p) || y(p, {
        path: _ + ".sort[" + se + "]",
        expected: "SortConfig",
        value: L
      })).every((L) => L) || y(p, {
        path: _ + ".sort",
        expected: "(Array<SortConfig> | undefined)",
        value: o.sort
      }), o.card === void 0 || (typeof o.card == "object" && o.card !== null && Array.isArray(o.card) === !1 || y(p, {
        path: _ + ".card",
        expected: "(DeepPartial<LovelaceCardConfig> | undefined)",
        value: o.card
      })) && m(o.card, _ + ".card", p) || y(p, {
        path: _ + ".card",
        expected: "(DeepPartial<LovelaceCardConfig> | undefined)",
        value: o.card
      })].every((L) => L), Se = (o, _, p = !0) => [p === !1 || Object.keys(o).map((L) => {
        const se = o[L];
        return se === void 0 ? !0 : (typeof se == "object" && se !== null || y(p, {
          path: _ + ar._accessExpressionAsString(L),
          expected: "GridStrategyCardConfig",
          value: se
        })) && $e(se, _ + ar._accessExpressionAsString(L), p) || y(p, {
          path: _ + ar._accessExpressionAsString(L),
          expected: "GridStrategyCardConfig",
          value: se
        });
      }).every((L) => L)].every((L) => L), $e = (o, _, p = !0) => [(typeof o.card == "object" && o.card !== null || y(p, {
        path: _ + ".card",
        expected: "LovelaceCardConfig",
        value: o.card
      })) && We(o.card, _ + ".card", p) || y(p, {
        path: _ + ".card",
        expected: "LovelaceCardConfig",
        value: o.card
      })].every((L) => L), We = (o, _, p = !0) => [o.index === void 0 || typeof o.index == "number" || y(p, {
        path: _ + ".index",
        expected: "(number | undefined)",
        value: o.index
      }), o.view_index === void 0 || typeof o.view_index == "number" || y(p, {
        path: _ + ".view_index",
        expected: "(number | undefined)",
        value: o.view_index
      }), typeof o.type == "string" || y(p, {
        path: _ + ".type",
        expected: "string",
        value: o.type
      }), p === !1 || Object.keys(o).map((L) => (["index", "view_index", "type"].some((Ar) => L === Ar) || o[L] === void 0, !0)).every((L) => L)].every((L) => L), Fe = (o, _, p = !0) => [o.exclude === void 0 || (Array.isArray(o.exclude) || y(p, {
        path: _ + ".exclude",
        expected: "(Array<FilterConfig> | undefined)",
        value: o.exclude
      })) && o.exclude.map((L, se) => (typeof L == "object" && L !== null || y(p, {
        path: _ + ".exclude[" + se + "]",
        expected: "FilterConfig",
        value: L
      })) && He(L, _ + ".exclude[" + se + "]", p) || y(p, {
        path: _ + ".exclude[" + se + "]",
        expected: "FilterConfig",
        value: L
      })).every((L) => L) || y(p, {
        path: _ + ".exclude",
        expected: "(Array<FilterConfig> | undefined)",
        value: o.exclude
      }), o.include === void 0 || (Array.isArray(o.include) || y(p, {
        path: _ + ".include",
        expected: "(Array<FilterConfig> | undefined)",
        value: o.include
      })) && o.include.map((L, se) => (typeof L == "object" && L !== null || y(p, {
        path: _ + ".include[" + se + "]",
        expected: "FilterConfig",
        value: L
      })) && He(L, _ + ".include[" + se + "]", p) || y(p, {
        path: _ + ".include[" + se + "]",
        expected: "FilterConfig",
        value: L
      })).every((L) => L) || y(p, {
        path: _ + ".include",
        expected: "(Array<FilterConfig> | undefined)",
        value: o.include
      })].every((L) => L), He = (o, _, p = !0) => [o.comparator === void 0 || o.comparator === "equal" || o.comparator === "match" || o.comparator === "in" || o.comparator === "greater_than" || o.comparator === "lower_than" || o.comparator === "is_null" || o.comparator === "is_numeric" || y(p, {
        path: _ + ".comparator",
        expected: '("equal" | "greater_than" | "in" | "is_null" | "is_numeric" | "lower_than" | "match" | undefined)',
        value: o.comparator
      }), !0, T.has(o.type) === !0 || y(p, {
        path: _ + ".type",
        expected: '("area" | "attribute" | "device" | "disabled_by" | "domain" | "entity" | "entity_category" | "floor" | "hidden_by" | "integration" | "label" | "state")',
        value: o.type
      }), o.config === void 0 || (typeof o.config == "object" && o.config !== null && Array.isArray(o.config) === !1 || y(p, {
        path: _ + ".config",
        expected: "(TypeConfig | undefined)",
        value: o.config
      })) && De(o.config, _ + ".config", p) || y(p, {
        path: _ + ".config",
        expected: "(TypeConfig | undefined)",
        value: o.config
      })].every((L) => L), De = (o, _, p = !0) => [o.key === void 0 || typeof o.key == "string" || y(p, {
        path: _ + ".key",
        expected: "(string | undefined)",
        value: o.key
      }), o.label === void 0 || typeof o.label == "string" || y(p, {
        path: _ + ".label",
        expected: "(string | undefined)",
        value: o.label
      })].every((L) => L), k = (o, _, p = !0) => [o.comparator === void 0 || o.comparator === "ascending" || o.comparator === "descending" || y(p, {
        path: _ + ".comparator",
        expected: '("ascending" | "descending" | undefined)',
        value: o.comparator
      }), q.has(o.type) === !0 || y(p, {
        path: _ + ".type",
        expected: '("area" | "attribute" | "device" | "disabled_by" | "domain" | "entity" | "entity_category" | "floor" | "hidden_by" | "integration" | "label" | "state")',
        value: o.type
      }), o.config === void 0 || (typeof o.config == "object" && o.config !== null && Array.isArray(o.config) === !1 || y(p, {
        path: _ + ".config",
        expected: "(TypeConfig | undefined)",
        value: o.config
      })) && De(o.config, _ + ".config", p) || y(p, {
        path: _ + ".config",
        expected: "(TypeConfig | undefined)",
        value: o.config
      })].every((L) => L), m = (o, _, p = !0) => [o.index === void 0 || typeof o.index == "number" || y(p, {
        path: _ + ".index",
        expected: "(number | undefined)",
        value: o.index
      }), o.view_index === void 0 || typeof o.view_index == "number" || y(p, {
        path: _ + ".view_index",
        expected: "(number | undefined)",
        value: o.view_index
      }), o.type === void 0 || typeof o.type == "string" || y(p, {
        path: _ + ".type",
        expected: "(string | undefined)",
        value: o.type
      }), p === !1 || Object.keys(o).map((L) => (["index", "view_index", "type"].some((Ar) => L === Ar) || o[L] === void 0, !0)).every((L) => L)].every((L) => L), I = (o, _, p = !0) => [typeof o.id == "string" || y(p, {
        path: _ + ".id",
        expected: "string",
        value: o.id
      }), o.title === void 0 || typeof o.title == "string" || y(p, {
        path: _ + ".title",
        expected: "(string | undefined)",
        value: o.title
      }), o.position === void 0 || typeof o.position == "number" || y(p, {
        path: _ + ".position",
        expected: "(number | undefined)",
        value: o.position
      }), typeof o.minCardWidth == "number" || y(p, {
        path: _ + ".minCardWidth",
        expected: "number",
        value: o.minCardWidth
      }), o.replace === void 0 || (typeof o.replace == "object" && o.replace !== null && Array.isArray(o.replace) === !1 || y(p, {
        path: _ + ".replace",
        expected: "(Record<string, GridStrategyCardConfig> | undefined)",
        value: o.replace
      })) && Se(o.replace, _ + ".replace", p) || y(p, {
        path: _ + ".replace",
        expected: "(Record<string, GridStrategyCardConfig> | undefined)",
        value: o.replace
      }), o.filter === void 0 || (typeof o.filter == "object" && o.filter !== null && Array.isArray(o.filter) === !1 || y(p, {
        path: _ + ".filter",
        expected: "(FilterObject | undefined)",
        value: o.filter
      })) && Fe(o.filter, _ + ".filter", p) || y(p, {
        path: _ + ".filter",
        expected: "(FilterObject | undefined)",
        value: o.filter
      }), o.sort === void 0 || (Array.isArray(o.sort) || y(p, {
        path: _ + ".sort",
        expected: "(Array<SortConfig> | undefined)",
        value: o.sort
      })) && o.sort.map((L, se) => (typeof L == "object" && L !== null || y(p, {
        path: _ + ".sort[" + se + "]",
        expected: "SortConfig",
        value: L
      })) && k(L, _ + ".sort[" + se + "]", p) || y(p, {
        path: _ + ".sort[" + se + "]",
        expected: "SortConfig",
        value: L
      })).every((L) => L) || y(p, {
        path: _ + ".sort",
        expected: "(Array<SortConfig> | undefined)",
        value: o.sort
      }), (typeof o.card == "object" && o.card !== null || y(p, {
        path: _ + ".card",
        expected: "LovelaceCardConfig",
        value: o.card
      })) && We(o.card, _ + ".card", p) || y(p, {
        path: _ + ".card",
        expected: "LovelaceCardConfig",
        value: o.card
      })].every((L) => L), w = (o, _, p = !0) => [typeof o.gridId == "string" || y(p, {
        path: _ + ".gridId",
        expected: "string",
        value: o.gridId
      }), o.id === void 0 || typeof o.id == "string" || y(p, {
        path: _ + ".id",
        expected: "(string | undefined)",
        value: o.id
      }), o.title === void 0 || typeof o.title == "string" || y(p, {
        path: _ + ".title",
        expected: "(string | undefined)",
        value: o.title
      }), o.position === void 0 || typeof o.position == "number" || y(p, {
        path: _ + ".position",
        expected: "(number | undefined)",
        value: o.position
      }), o.minCardWidth === void 0 || typeof o.minCardWidth == "number" || y(p, {
        path: _ + ".minCardWidth",
        expected: "(number | undefined)",
        value: o.minCardWidth
      }), o.replace === void 0 || (typeof o.replace == "object" && o.replace !== null && Array.isArray(o.replace) === !1 || y(p, {
        path: _ + ".replace",
        expected: "(Record<string, GridStrategyCardConfig> | undefined)",
        value: o.replace
      })) && Se(o.replace, _ + ".replace", p) || y(p, {
        path: _ + ".replace",
        expected: "(Record<string, GridStrategyCardConfig> | undefined)",
        value: o.replace
      }), o.filter === void 0 || (typeof o.filter == "object" && o.filter !== null && Array.isArray(o.filter) === !1 || y(p, {
        path: _ + ".filter",
        expected: "(FilterObject | undefined)",
        value: o.filter
      })) && Fe(o.filter, _ + ".filter", p) || y(p, {
        path: _ + ".filter",
        expected: "(FilterObject | undefined)",
        value: o.filter
      }), o.sort === void 0 || (Array.isArray(o.sort) || y(p, {
        path: _ + ".sort",
        expected: "(Array<SortConfig> | undefined)",
        value: o.sort
      })) && o.sort.map((L, se) => (typeof L == "object" && L !== null || y(p, {
        path: _ + ".sort[" + se + "]",
        expected: "SortConfig",
        value: L
      })) && k(L, _ + ".sort[" + se + "]", p) || y(p, {
        path: _ + ".sort[" + se + "]",
        expected: "SortConfig",
        value: L
      })).every((L) => L) || y(p, {
        path: _ + ".sort",
        expected: "(Array<SortConfig> | undefined)",
        value: o.sort
      }), o.card === void 0 || (typeof o.card == "object" && o.card !== null && Array.isArray(o.card) === !1 || y(p, {
        path: _ + ".card",
        expected: "(DeepPartial<LovelaceCardConfig> | undefined)",
        value: o.card
      })) && m(o.card, _ + ".card", p) || y(p, {
        path: _ + ".card",
        expected: "(DeepPartial<LovelaceCardConfig> | undefined)",
        value: o.card
      })].every((L) => L), f = (o, _, p = !0) => o.gridId !== void 0 ? w(o, _, p) : I(o, _, p), a = (o) => typeof o == "object" && o !== null && Q(o);
      let g, y;
      return (o) => {
        if (a(o) === !1) {
          g = [], y = Wt._validateReport(g), ((p, L, se = !0) => (typeof p == "object" && p !== null || y(!0, {
            path: L + "",
            expected: "BaseGridOptions<BaseRowOptions | BaseRowRefOptions>",
            value: p
          })) && we(p, L + "", !0) || y(!0, {
            path: L + "",
            expected: "BaseGridOptions<BaseRowOptions | BaseRowRefOptions>",
            value: p
          }))(o, "$input", !0);
          const _ = g.length === 0;
          return _ ? {
            success: _,
            data: o
          } : {
            success: _,
            errors: g,
            data: o
          };
        }
        return {
          success: !0,
          data: o
        };
      };
    })())(d);
    throw Error(D.success ? "Something went wrong. Check config." : JSON.stringify(D.errors));
  }
  const G = (d.gridMergeStrategy == Df.reset ? W.map((D) => D.grids).filter(vr).slice(-1)[0] : W.flatMap((D) => D.grids).filter(vr)).reduce((D, $) => {
    if ((/* @__PURE__ */ (() => {
      const H = /* @__PURE__ */ new Set(["entity", "domain", "device", "area", "floor", "integration", "label", "state", "attribute", "disabled_by", "hidden_by", "entity_category"]), T = /* @__PURE__ */ new Set(["entity", "domain", "device", "area", "floor", "integration", "label", "state", "attribute", "disabled_by", "hidden_by", "entity_category"]), q = (i) => typeof i.gridId == "string" && (i.id === void 0 || typeof i.id == "string") && (i.title === void 0 || typeof i.title == "string") && (i.position === void 0 || typeof i.position == "number") && (i.minCardWidth === void 0 || typeof i.minCardWidth == "number") && (i.replace === void 0 || typeof i.replace == "object" && i.replace !== null && Array.isArray(i.replace) === !1 && Q(i.replace)) && (i.filter === void 0 || typeof i.filter == "object" && i.filter !== null && Array.isArray(i.filter) === !1 && ae(i.filter)) && (i.sort === void 0 || Array.isArray(i.sort) && i.sort.every((x) => typeof x == "object" && x !== null && J(x))) && (i.card === void 0 || typeof i.card == "object" && i.card !== null && Array.isArray(i.card) === !1 && u(i.card)), Q = (i) => Object.keys(i).every((x) => {
        const F = i[x];
        return F === void 0 ? !0 : typeof F == "object" && F !== null && Y(F);
      }), Y = (i) => typeof i.card == "object" && i.card !== null && ee(i.card), ee = (i) => (i.index === void 0 || typeof i.index == "number") && (i.view_index === void 0 || typeof i.view_index == "number") && typeof i.type == "string" && Object.keys(i).every((x) => (["index", "view_index", "type"].some((M) => x === M) || i[x] === void 0, !0)), ae = (i) => (i.exclude === void 0 || Array.isArray(i.exclude) && i.exclude.every((x) => typeof x == "object" && x !== null && ne(x))) && (i.include === void 0 || Array.isArray(i.include) && i.include.every((x) => typeof x == "object" && x !== null && ne(x))), ne = (i) => (i.comparator === void 0 || i.comparator === "equal" || i.comparator === "match" || i.comparator === "in" || i.comparator === "greater_than" || i.comparator === "lower_than" || i.comparator === "is_null" || i.comparator === "is_numeric") && !0 && H.has(i.type) === !0 && (i.config === void 0 || typeof i.config == "object" && i.config !== null && Array.isArray(i.config) === !1 && re(i.config)), re = (i) => (i.key === void 0 || typeof i.key == "string") && (i.label === void 0 || typeof i.label == "string"), J = (i) => (i.comparator === void 0 || i.comparator === "ascending" || i.comparator === "descending") && T.has(i.type) === !0 && (i.config === void 0 || typeof i.config == "object" && i.config !== null && Array.isArray(i.config) === !1 && re(i.config)), u = (i) => (i.index === void 0 || typeof i.index == "number") && (i.view_index === void 0 || typeof i.view_index == "number") && (i.type === void 0 || typeof i.type == "string") && Object.keys(i).every((x) => (["index", "view_index", "type"].some((M) => x === M) || i[x] === void 0, !0));
      return (i) => typeof i == "object" && i !== null && q(i);
    })())($))
      if (D[$.gridId])
        D[$.gridId] = {
          ...D[$.gridId],
          ...$
        };
      else
        throw Error(`gridId '${$.gridId}' not defined`);
    else {
      const H = Mt.mergeWith({}, d.global, $, Uf);
      if (!(/* @__PURE__ */ (() => {
        const T = /* @__PURE__ */ new Set(["entity", "domain", "device", "area", "floor", "integration", "label", "state", "attribute", "disabled_by", "hidden_by", "entity_category"]), q = /* @__PURE__ */ new Set(["entity", "domain", "device", "area", "floor", "integration", "label", "state", "attribute", "disabled_by", "hidden_by", "entity_category"]), Q = (i) => typeof i.id == "string" && (i.title === void 0 || typeof i.title == "string") && (i.position === void 0 || typeof i.position == "number") && typeof i.minCardWidth == "number" && (i.replace === void 0 || typeof i.replace == "object" && i.replace !== null && Array.isArray(i.replace) === !1 && Y(i.replace)) && (i.filter === void 0 || typeof i.filter == "object" && i.filter !== null && Array.isArray(i.filter) === !1 && ne(i.filter)) && (i.sort === void 0 || Array.isArray(i.sort) && i.sort.every((x) => typeof x == "object" && x !== null && u(x))) && typeof i.card == "object" && i.card !== null && ae(i.card), Y = (i) => Object.keys(i).every((x) => {
          const F = i[x];
          return F === void 0 ? !0 : typeof F == "object" && F !== null && ee(F);
        }), ee = (i) => typeof i.card == "object" && i.card !== null && ae(i.card), ae = (i) => (i.index === void 0 || typeof i.index == "number") && (i.view_index === void 0 || typeof i.view_index == "number") && typeof i.type == "string" && Object.keys(i).every((x) => (["index", "view_index", "type"].some((M) => x === M) || i[x] === void 0, !0)), ne = (i) => (i.exclude === void 0 || Array.isArray(i.exclude) && i.exclude.every((x) => typeof x == "object" && x !== null && re(x))) && (i.include === void 0 || Array.isArray(i.include) && i.include.every((x) => typeof x == "object" && x !== null && re(x))), re = (i) => (i.comparator === void 0 || i.comparator === "equal" || i.comparator === "match" || i.comparator === "in" || i.comparator === "greater_than" || i.comparator === "lower_than" || i.comparator === "is_null" || i.comparator === "is_numeric") && !0 && T.has(i.type) === !0 && (i.config === void 0 || typeof i.config == "object" && i.config !== null && Array.isArray(i.config) === !1 && J(i.config)), J = (i) => (i.key === void 0 || typeof i.key == "string") && (i.label === void 0 || typeof i.label == "string"), u = (i) => (i.comparator === void 0 || i.comparator === "ascending" || i.comparator === "descending") && q.has(i.type) === !0 && (i.config === void 0 || typeof i.config == "object" && i.config !== null && Array.isArray(i.config) === !1 && J(i.config));
        return (i) => typeof i == "object" && i !== null && Q(i);
      })())(H)) {
        const T = (/* @__PURE__ */ (() => {
          const q = /* @__PURE__ */ new Set(["entity", "domain", "device", "area", "floor", "integration", "label", "state", "attribute", "disabled_by", "hidden_by", "entity_category"]), Q = /* @__PURE__ */ new Set(["entity", "domain", "device", "area", "floor", "integration", "label", "state", "attribute", "disabled_by", "hidden_by", "entity_category"]), Y = /* @__PURE__ */ new Set(["entity", "domain", "device", "area", "floor", "integration", "label", "state", "attribute", "disabled_by", "hidden_by", "entity_category"]), ee = /* @__PURE__ */ new Set(["entity", "domain", "device", "area", "floor", "integration", "label", "state", "attribute", "disabled_by", "hidden_by", "entity_category"]), ae = (m) => typeof m.id == "string" && (m.title === void 0 || typeof m.title == "string") && (m.position === void 0 || typeof m.position == "number") && typeof m.minCardWidth == "number" && (m.replace === void 0 || typeof m.replace == "object" && m.replace !== null && Array.isArray(m.replace) === !1 && ne(m.replace)) && (m.filter === void 0 || typeof m.filter == "object" && m.filter !== null && Array.isArray(m.filter) === !1 && u(m.filter)) && (m.sort === void 0 || Array.isArray(m.sort) && m.sort.every((I) => typeof I == "object" && I !== null && F(I))) && typeof m.card == "object" && m.card !== null && J(m.card), ne = (m) => Object.keys(m).every((I) => {
            const w = m[I];
            return w === void 0 ? !0 : typeof w == "object" && w !== null && re(w);
          }), re = (m) => typeof m.card == "object" && m.card !== null && J(m.card), J = (m) => (m.index === void 0 || typeof m.index == "number") && (m.view_index === void 0 || typeof m.view_index == "number") && typeof m.type == "string" && Object.keys(m).every((I) => (["index", "view_index", "type"].some((f) => I === f) || m[I] === void 0, !0)), u = (m) => (m.exclude === void 0 || Array.isArray(m.exclude) && m.exclude.every((I) => typeof I == "object" && I !== null && i(I))) && (m.include === void 0 || Array.isArray(m.include) && m.include.every((I) => typeof I == "object" && I !== null && i(I))), i = (m) => (m.comparator === void 0 || m.comparator === "equal" || m.comparator === "match" || m.comparator === "in" || m.comparator === "greater_than" || m.comparator === "lower_than" || m.comparator === "is_null" || m.comparator === "is_numeric") && !0 && q.has(m.type) === !0 && (m.config === void 0 || typeof m.config == "object" && m.config !== null && Array.isArray(m.config) === !1 && x(m.config)), x = (m) => (m.key === void 0 || typeof m.key == "string") && (m.label === void 0 || typeof m.label == "string"), F = (m) => (m.comparator === void 0 || m.comparator === "ascending" || m.comparator === "descending") && Q.has(m.type) === !0 && (m.config === void 0 || typeof m.config == "object" && m.config !== null && Array.isArray(m.config) === !1 && x(m.config)), M = (m, I, w = !0) => [typeof m.id == "string" || k(w, {
            path: I + ".id",
            expected: "string",
            value: m.id
          }), m.title === void 0 || typeof m.title == "string" || k(w, {
            path: I + ".title",
            expected: "(string | undefined)",
            value: m.title
          }), m.position === void 0 || typeof m.position == "number" || k(w, {
            path: I + ".position",
            expected: "(number | undefined)",
            value: m.position
          }), typeof m.minCardWidth == "number" || k(w, {
            path: I + ".minCardWidth",
            expected: "number",
            value: m.minCardWidth
          }), m.replace === void 0 || (typeof m.replace == "object" && m.replace !== null && Array.isArray(m.replace) === !1 || k(w, {
            path: I + ".replace",
            expected: "(Record<string, GridStrategyCardConfig> | undefined)",
            value: m.replace
          })) && ge(m.replace, I + ".replace", w) || k(w, {
            path: I + ".replace",
            expected: "(Record<string, GridStrategyCardConfig> | undefined)",
            value: m.replace
          }), m.filter === void 0 || (typeof m.filter == "object" && m.filter !== null && Array.isArray(m.filter) === !1 || k(w, {
            path: I + ".filter",
            expected: "(FilterObject | undefined)",
            value: m.filter
          })) && Se(m.filter, I + ".filter", w) || k(w, {
            path: I + ".filter",
            expected: "(FilterObject | undefined)",
            value: m.filter
          }), m.sort === void 0 || (Array.isArray(m.sort) || k(w, {
            path: I + ".sort",
            expected: "(Array<SortConfig> | undefined)",
            value: m.sort
          })) && m.sort.map((f, a) => (typeof f == "object" && f !== null || k(w, {
            path: I + ".sort[" + a + "]",
            expected: "SortConfig",
            value: f
          })) && Fe(f, I + ".sort[" + a + "]", w) || k(w, {
            path: I + ".sort[" + a + "]",
            expected: "SortConfig",
            value: f
          })).every((f) => f) || k(w, {
            path: I + ".sort",
            expected: "(Array<SortConfig> | undefined)",
            value: m.sort
          }), (typeof m.card == "object" && m.card !== null || k(w, {
            path: I + ".card",
            expected: "LovelaceCardConfig",
            value: m.card
          })) && pe(m.card, I + ".card", w) || k(w, {
            path: I + ".card",
            expected: "LovelaceCardConfig",
            value: m.card
          })].every((f) => f), ge = (m, I, w = !0) => [w === !1 || Object.keys(m).map((f) => {
            const a = m[f];
            return a === void 0 ? !0 : (typeof a == "object" && a !== null || k(w, {
              path: I + ar._accessExpressionAsString(f),
              expected: "GridStrategyCardConfig",
              value: a
            })) && we(a, I + ar._accessExpressionAsString(f), w) || k(w, {
              path: I + ar._accessExpressionAsString(f),
              expected: "GridStrategyCardConfig",
              value: a
            });
          }).every((f) => f)].every((f) => f), we = (m, I, w = !0) => [(typeof m.card == "object" && m.card !== null || k(w, {
            path: I + ".card",
            expected: "LovelaceCardConfig",
            value: m.card
          })) && pe(m.card, I + ".card", w) || k(w, {
            path: I + ".card",
            expected: "LovelaceCardConfig",
            value: m.card
          })].every((f) => f), pe = (m, I, w = !0) => [m.index === void 0 || typeof m.index == "number" || k(w, {
            path: I + ".index",
            expected: "(number | undefined)",
            value: m.index
          }), m.view_index === void 0 || typeof m.view_index == "number" || k(w, {
            path: I + ".view_index",
            expected: "(number | undefined)",
            value: m.view_index
          }), typeof m.type == "string" || k(w, {
            path: I + ".type",
            expected: "string",
            value: m.type
          }), w === !1 || Object.keys(m).map((f) => (["index", "view_index", "type"].some((g) => f === g) || m[f] === void 0, !0)).every((f) => f)].every((f) => f), Se = (m, I, w = !0) => [m.exclude === void 0 || (Array.isArray(m.exclude) || k(w, {
            path: I + ".exclude",
            expected: "(Array<FilterConfig> | undefined)",
            value: m.exclude
          })) && m.exclude.map((f, a) => (typeof f == "object" && f !== null || k(w, {
            path: I + ".exclude[" + a + "]",
            expected: "FilterConfig",
            value: f
          })) && $e(f, I + ".exclude[" + a + "]", w) || k(w, {
            path: I + ".exclude[" + a + "]",
            expected: "FilterConfig",
            value: f
          })).every((f) => f) || k(w, {
            path: I + ".exclude",
            expected: "(Array<FilterConfig> | undefined)",
            value: m.exclude
          }), m.include === void 0 || (Array.isArray(m.include) || k(w, {
            path: I + ".include",
            expected: "(Array<FilterConfig> | undefined)",
            value: m.include
          })) && m.include.map((f, a) => (typeof f == "object" && f !== null || k(w, {
            path: I + ".include[" + a + "]",
            expected: "FilterConfig",
            value: f
          })) && $e(f, I + ".include[" + a + "]", w) || k(w, {
            path: I + ".include[" + a + "]",
            expected: "FilterConfig",
            value: f
          })).every((f) => f) || k(w, {
            path: I + ".include",
            expected: "(Array<FilterConfig> | undefined)",
            value: m.include
          })].every((f) => f), $e = (m, I, w = !0) => [m.comparator === void 0 || m.comparator === "equal" || m.comparator === "match" || m.comparator === "in" || m.comparator === "greater_than" || m.comparator === "lower_than" || m.comparator === "is_null" || m.comparator === "is_numeric" || k(w, {
            path: I + ".comparator",
            expected: '("equal" | "greater_than" | "in" | "is_null" | "is_numeric" | "lower_than" | "match" | undefined)',
            value: m.comparator
          }), !0, Y.has(m.type) === !0 || k(w, {
            path: I + ".type",
            expected: '("area" | "attribute" | "device" | "disabled_by" | "domain" | "entity" | "entity_category" | "floor" | "hidden_by" | "integration" | "label" | "state")',
            value: m.type
          }), m.config === void 0 || (typeof m.config == "object" && m.config !== null && Array.isArray(m.config) === !1 || k(w, {
            path: I + ".config",
            expected: "(TypeConfig | undefined)",
            value: m.config
          })) && We(m.config, I + ".config", w) || k(w, {
            path: I + ".config",
            expected: "(TypeConfig | undefined)",
            value: m.config
          })].every((f) => f), We = (m, I, w = !0) => [m.key === void 0 || typeof m.key == "string" || k(w, {
            path: I + ".key",
            expected: "(string | undefined)",
            value: m.key
          }), m.label === void 0 || typeof m.label == "string" || k(w, {
            path: I + ".label",
            expected: "(string | undefined)",
            value: m.label
          })].every((f) => f), Fe = (m, I, w = !0) => [m.comparator === void 0 || m.comparator === "ascending" || m.comparator === "descending" || k(w, {
            path: I + ".comparator",
            expected: '("ascending" | "descending" | undefined)',
            value: m.comparator
          }), ee.has(m.type) === !0 || k(w, {
            path: I + ".type",
            expected: '("area" | "attribute" | "device" | "disabled_by" | "domain" | "entity" | "entity_category" | "floor" | "hidden_by" | "integration" | "label" | "state")',
            value: m.type
          }), m.config === void 0 || (typeof m.config == "object" && m.config !== null && Array.isArray(m.config) === !1 || k(w, {
            path: I + ".config",
            expected: "(TypeConfig | undefined)",
            value: m.config
          })) && We(m.config, I + ".config", w) || k(w, {
            path: I + ".config",
            expected: "(TypeConfig | undefined)",
            value: m.config
          })].every((f) => f), He = (m) => typeof m == "object" && m !== null && ae(m);
          let De, k;
          return (m) => {
            if (He(m) === !1) {
              De = [], k = Wt._validateReport(De), ((w, f, a = !0) => (typeof w == "object" && w !== null || k(!0, {
                path: f + "",
                expected: "BaseRowOptions",
                value: w
              })) && M(w, f + "", !0) || k(!0, {
                path: f + "",
                expected: "BaseRowOptions",
                value: w
              }))(m, "$input", !0);
              const I = De.length === 0;
              return I ? {
                success: I,
                data: m
              } : {
                success: I,
                errors: De,
                data: m
              };
            }
            return {
              success: !0,
              data: m
            };
          };
        })())(H);
        throw Error(T.success ? "Something went wrong. Check config." : JSON.stringify(T.errors));
      }
      D[H.id] = H;
    }
    return D;
  }, {});
  if (d.grids = Object.values(G).sort((D, $) => (D.position || 0) - ($.position || 0)), !(/* @__PURE__ */ (() => {
    const D = /* @__PURE__ */ new Set(["entity", "domain", "device", "area", "floor", "integration", "label", "state", "attribute", "disabled_by", "hidden_by", "entity_category"]), $ = /* @__PURE__ */ new Set(["entity", "domain", "device", "area", "floor", "integration", "label", "state", "attribute", "disabled_by", "hidden_by", "entity_category"]), H = (i) => (i.global === void 0 || typeof i.global == "object" && i.global !== null && Array.isArray(i.global) === !1 && T(i.global)) && Array.isArray(i.grids) && i.grids.every((x) => typeof x == "object" && x !== null && u(x)) && (i.gridMergeStrategy === "add" || i.gridMergeStrategy === "reset"), T = (i) => (i.id === void 0 || typeof i.id == "string") && (i.title === void 0 || typeof i.title == "string") && (i.position === void 0 || typeof i.position == "number") && (i.minCardWidth === void 0 || typeof i.minCardWidth == "number") && (i.replace === void 0 || typeof i.replace == "object" && i.replace !== null && Array.isArray(i.replace) === !1 && q(i.replace)) && (i.filter === void 0 || typeof i.filter == "object" && i.filter !== null && Array.isArray(i.filter) === !1 && ee(i.filter)) && (i.sort === void 0 || Array.isArray(i.sort) && i.sort.every((x) => typeof x == "object" && x !== null && re(x))) && (i.card === void 0 || typeof i.card == "object" && i.card !== null && Array.isArray(i.card) === !1 && J(i.card)), q = (i) => Object.keys(i).every((x) => {
      const F = i[x];
      return F === void 0 ? !0 : typeof F == "object" && F !== null && Q(F);
    }), Q = (i) => typeof i.card == "object" && i.card !== null && Y(i.card), Y = (i) => (i.index === void 0 || typeof i.index == "number") && (i.view_index === void 0 || typeof i.view_index == "number") && typeof i.type == "string" && Object.keys(i).every((x) => (["index", "view_index", "type"].some((M) => x === M) || i[x] === void 0, !0)), ee = (i) => (i.exclude === void 0 || Array.isArray(i.exclude) && i.exclude.every((x) => typeof x == "object" && x !== null && ae(x))) && (i.include === void 0 || Array.isArray(i.include) && i.include.every((x) => typeof x == "object" && x !== null && ae(x))), ae = (i) => (i.comparator === void 0 || i.comparator === "equal" || i.comparator === "match" || i.comparator === "in" || i.comparator === "greater_than" || i.comparator === "lower_than" || i.comparator === "is_null" || i.comparator === "is_numeric") && !0 && D.has(i.type) === !0 && (i.config === void 0 || typeof i.config == "object" && i.config !== null && Array.isArray(i.config) === !1 && ne(i.config)), ne = (i) => (i.key === void 0 || typeof i.key == "string") && (i.label === void 0 || typeof i.label == "string"), re = (i) => (i.comparator === void 0 || i.comparator === "ascending" || i.comparator === "descending") && $.has(i.type) === !0 && (i.config === void 0 || typeof i.config == "object" && i.config !== null && Array.isArray(i.config) === !1 && ne(i.config)), J = (i) => (i.index === void 0 || typeof i.index == "number") && (i.view_index === void 0 || typeof i.view_index == "number") && (i.type === void 0 || typeof i.type == "string") && Object.keys(i).every((x) => (["index", "view_index", "type"].some((M) => x === M) || i[x] === void 0, !0)), u = (i) => typeof i.id == "string" && (i.title === void 0 || typeof i.title == "string") && (i.position === void 0 || typeof i.position == "number") && typeof i.minCardWidth == "number" && (i.replace === void 0 || typeof i.replace == "object" && i.replace !== null && Array.isArray(i.replace) === !1 && q(i.replace)) && (i.filter === void 0 || typeof i.filter == "object" && i.filter !== null && Array.isArray(i.filter) === !1 && ee(i.filter)) && (i.sort === void 0 || Array.isArray(i.sort) && i.sort.every((x) => typeof x == "object" && x !== null && re(x))) && typeof i.card == "object" && i.card !== null && Y(i.card);
    return (i) => typeof i == "object" && i !== null && H(i);
  })())(d)) {
    const D = (/* @__PURE__ */ (() => {
      const $ = /* @__PURE__ */ new Set(["entity", "domain", "device", "area", "floor", "integration", "label", "state", "attribute", "disabled_by", "hidden_by", "entity_category"]), H = /* @__PURE__ */ new Set(["entity", "domain", "device", "area", "floor", "integration", "label", "state", "attribute", "disabled_by", "hidden_by", "entity_category"]), T = /* @__PURE__ */ new Set(["entity", "domain", "device", "area", "floor", "integration", "label", "state", "attribute", "disabled_by", "hidden_by", "entity_category"]), q = /* @__PURE__ */ new Set(["entity", "domain", "device", "area", "floor", "integration", "label", "state", "attribute", "disabled_by", "hidden_by", "entity_category"]), Q = (f) => (f.global === void 0 || typeof f.global == "object" && f.global !== null && Array.isArray(f.global) === !1 && Y(f.global)) && Array.isArray(f.grids) && f.grids.every((a) => typeof a == "object" && a !== null && F(a)) && (f.gridMergeStrategy === "add" || f.gridMergeStrategy === "reset"), Y = (f) => (f.id === void 0 || typeof f.id == "string") && (f.title === void 0 || typeof f.title == "string") && (f.position === void 0 || typeof f.position == "number") && (f.minCardWidth === void 0 || typeof f.minCardWidth == "number") && (f.replace === void 0 || typeof f.replace == "object" && f.replace !== null && Array.isArray(f.replace) === !1 && ee(f.replace)) && (f.filter === void 0 || typeof f.filter == "object" && f.filter !== null && Array.isArray(f.filter) === !1 && re(f.filter)) && (f.sort === void 0 || Array.isArray(f.sort) && f.sort.every((a) => typeof a == "object" && a !== null && i(a))) && (f.card === void 0 || typeof f.card == "object" && f.card !== null && Array.isArray(f.card) === !1 && x(f.card)), ee = (f) => Object.keys(f).every((a) => {
        const g = f[a];
        return g === void 0 ? !0 : typeof g == "object" && g !== null && ae(g);
      }), ae = (f) => typeof f.card == "object" && f.card !== null && ne(f.card), ne = (f) => (f.index === void 0 || typeof f.index == "number") && (f.view_index === void 0 || typeof f.view_index == "number") && typeof f.type == "string" && Object.keys(f).every((a) => (["index", "view_index", "type"].some((y) => a === y) || f[a] === void 0, !0)), re = (f) => (f.exclude === void 0 || Array.isArray(f.exclude) && f.exclude.every((a) => typeof a == "object" && a !== null && J(a))) && (f.include === void 0 || Array.isArray(f.include) && f.include.every((a) => typeof a == "object" && a !== null && J(a))), J = (f) => (f.comparator === void 0 || f.comparator === "equal" || f.comparator === "match" || f.comparator === "in" || f.comparator === "greater_than" || f.comparator === "lower_than" || f.comparator === "is_null" || f.comparator === "is_numeric") && !0 && $.has(f.type) === !0 && (f.config === void 0 || typeof f.config == "object" && f.config !== null && Array.isArray(f.config) === !1 && u(f.config)), u = (f) => (f.key === void 0 || typeof f.key == "string") && (f.label === void 0 || typeof f.label == "string"), i = (f) => (f.comparator === void 0 || f.comparator === "ascending" || f.comparator === "descending") && H.has(f.type) === !0 && (f.config === void 0 || typeof f.config == "object" && f.config !== null && Array.isArray(f.config) === !1 && u(f.config)), x = (f) => (f.index === void 0 || typeof f.index == "number") && (f.view_index === void 0 || typeof f.view_index == "number") && (f.type === void 0 || typeof f.type == "string") && Object.keys(f).every((a) => (["index", "view_index", "type"].some((y) => a === y) || f[a] === void 0, !0)), F = (f) => typeof f.id == "string" && (f.title === void 0 || typeof f.title == "string") && (f.position === void 0 || typeof f.position == "number") && typeof f.minCardWidth == "number" && (f.replace === void 0 || typeof f.replace == "object" && f.replace !== null && Array.isArray(f.replace) === !1 && ee(f.replace)) && (f.filter === void 0 || typeof f.filter == "object" && f.filter !== null && Array.isArray(f.filter) === !1 && re(f.filter)) && (f.sort === void 0 || Array.isArray(f.sort) && f.sort.every((a) => typeof a == "object" && a !== null && i(a))) && typeof f.card == "object" && f.card !== null && ne(f.card), M = (f, a, g = !0) => [f.global === void 0 || (typeof f.global == "object" && f.global !== null && Array.isArray(f.global) === !1 || w(g, {
        path: a + ".global",
        expected: "(DeepPartial<BaseRowOptions> | undefined)",
        value: f.global
      })) && ge(f.global, a + ".global", g) || w(g, {
        path: a + ".global",
        expected: "(DeepPartial<BaseRowOptions> | undefined)",
        value: f.global
      }), (Array.isArray(f.grids) || w(g, {
        path: a + ".grids",
        expected: "Array<BaseRowOptions>",
        value: f.grids
      })) && f.grids.map((y, o) => (typeof y == "object" && y !== null || w(g, {
        path: a + ".grids[" + o + "]",
        expected: "BaseRowOptions",
        value: y
      })) && k(y, a + ".grids[" + o + "]", g) || w(g, {
        path: a + ".grids[" + o + "]",
        expected: "BaseRowOptions",
        value: y
      })).every((y) => y) || w(g, {
        path: a + ".grids",
        expected: "Array<BaseRowOptions>",
        value: f.grids
      }), f.gridMergeStrategy === "add" || f.gridMergeStrategy === "reset" || w(g, {
        path: a + ".gridMergeStrategy",
        expected: '("add" | "reset")',
        value: f.gridMergeStrategy
      })].every((y) => y), ge = (f, a, g = !0) => [f.id === void 0 || typeof f.id == "string" || w(g, {
        path: a + ".id",
        expected: "(string | undefined)",
        value: f.id
      }), f.title === void 0 || typeof f.title == "string" || w(g, {
        path: a + ".title",
        expected: "(string | undefined)",
        value: f.title
      }), f.position === void 0 || typeof f.position == "number" || w(g, {
        path: a + ".position",
        expected: "(number | undefined)",
        value: f.position
      }), f.minCardWidth === void 0 || typeof f.minCardWidth == "number" || w(g, {
        path: a + ".minCardWidth",
        expected: "(number | undefined)",
        value: f.minCardWidth
      }), f.replace === void 0 || (typeof f.replace == "object" && f.replace !== null && Array.isArray(f.replace) === !1 || w(g, {
        path: a + ".replace",
        expected: "(Record<string, GridStrategyCardConfig> | undefined)",
        value: f.replace
      })) && we(f.replace, a + ".replace", g) || w(g, {
        path: a + ".replace",
        expected: "(Record<string, GridStrategyCardConfig> | undefined)",
        value: f.replace
      }), f.filter === void 0 || (typeof f.filter == "object" && f.filter !== null && Array.isArray(f.filter) === !1 || w(g, {
        path: a + ".filter",
        expected: "(FilterObject | undefined)",
        value: f.filter
      })) && $e(f.filter, a + ".filter", g) || w(g, {
        path: a + ".filter",
        expected: "(FilterObject | undefined)",
        value: f.filter
      }), f.sort === void 0 || (Array.isArray(f.sort) || w(g, {
        path: a + ".sort",
        expected: "(Array<SortConfig> | undefined)",
        value: f.sort
      })) && f.sort.map((y, o) => (typeof y == "object" && y !== null || w(g, {
        path: a + ".sort[" + o + "]",
        expected: "SortConfig",
        value: y
      })) && He(y, a + ".sort[" + o + "]", g) || w(g, {
        path: a + ".sort[" + o + "]",
        expected: "SortConfig",
        value: y
      })).every((y) => y) || w(g, {
        path: a + ".sort",
        expected: "(Array<SortConfig> | undefined)",
        value: f.sort
      }), f.card === void 0 || (typeof f.card == "object" && f.card !== null && Array.isArray(f.card) === !1 || w(g, {
        path: a + ".card",
        expected: "(DeepPartial<LovelaceCardConfig> | undefined)",
        value: f.card
      })) && De(f.card, a + ".card", g) || w(g, {
        path: a + ".card",
        expected: "(DeepPartial<LovelaceCardConfig> | undefined)",
        value: f.card
      })].every((y) => y), we = (f, a, g = !0) => [g === !1 || Object.keys(f).map((y) => {
        const o = f[y];
        return o === void 0 ? !0 : (typeof o == "object" && o !== null || w(g, {
          path: a + ar._accessExpressionAsString(y),
          expected: "GridStrategyCardConfig",
          value: o
        })) && pe(o, a + ar._accessExpressionAsString(y), g) || w(g, {
          path: a + ar._accessExpressionAsString(y),
          expected: "GridStrategyCardConfig",
          value: o
        });
      }).every((y) => y)].every((y) => y), pe = (f, a, g = !0) => [(typeof f.card == "object" && f.card !== null || w(g, {
        path: a + ".card",
        expected: "LovelaceCardConfig",
        value: f.card
      })) && Se(f.card, a + ".card", g) || w(g, {
        path: a + ".card",
        expected: "LovelaceCardConfig",
        value: f.card
      })].every((y) => y), Se = (f, a, g = !0) => [f.index === void 0 || typeof f.index == "number" || w(g, {
        path: a + ".index",
        expected: "(number | undefined)",
        value: f.index
      }), f.view_index === void 0 || typeof f.view_index == "number" || w(g, {
        path: a + ".view_index",
        expected: "(number | undefined)",
        value: f.view_index
      }), typeof f.type == "string" || w(g, {
        path: a + ".type",
        expected: "string",
        value: f.type
      }), g === !1 || Object.keys(f).map((y) => (["index", "view_index", "type"].some((_) => y === _) || f[y] === void 0, !0)).every((y) => y)].every((y) => y), $e = (f, a, g = !0) => [f.exclude === void 0 || (Array.isArray(f.exclude) || w(g, {
        path: a + ".exclude",
        expected: "(Array<FilterConfig> | undefined)",
        value: f.exclude
      })) && f.exclude.map((y, o) => (typeof y == "object" && y !== null || w(g, {
        path: a + ".exclude[" + o + "]",
        expected: "FilterConfig",
        value: y
      })) && We(y, a + ".exclude[" + o + "]", g) || w(g, {
        path: a + ".exclude[" + o + "]",
        expected: "FilterConfig",
        value: y
      })).every((y) => y) || w(g, {
        path: a + ".exclude",
        expected: "(Array<FilterConfig> | undefined)",
        value: f.exclude
      }), f.include === void 0 || (Array.isArray(f.include) || w(g, {
        path: a + ".include",
        expected: "(Array<FilterConfig> | undefined)",
        value: f.include
      })) && f.include.map((y, o) => (typeof y == "object" && y !== null || w(g, {
        path: a + ".include[" + o + "]",
        expected: "FilterConfig",
        value: y
      })) && We(y, a + ".include[" + o + "]", g) || w(g, {
        path: a + ".include[" + o + "]",
        expected: "FilterConfig",
        value: y
      })).every((y) => y) || w(g, {
        path: a + ".include",
        expected: "(Array<FilterConfig> | undefined)",
        value: f.include
      })].every((y) => y), We = (f, a, g = !0) => [f.comparator === void 0 || f.comparator === "equal" || f.comparator === "match" || f.comparator === "in" || f.comparator === "greater_than" || f.comparator === "lower_than" || f.comparator === "is_null" || f.comparator === "is_numeric" || w(g, {
        path: a + ".comparator",
        expected: '("equal" | "greater_than" | "in" | "is_null" | "is_numeric" | "lower_than" | "match" | undefined)',
        value: f.comparator
      }), !0, T.has(f.type) === !0 || w(g, {
        path: a + ".type",
        expected: '("area" | "attribute" | "device" | "disabled_by" | "domain" | "entity" | "entity_category" | "floor" | "hidden_by" | "integration" | "label" | "state")',
        value: f.type
      }), f.config === void 0 || (typeof f.config == "object" && f.config !== null && Array.isArray(f.config) === !1 || w(g, {
        path: a + ".config",
        expected: "(TypeConfig | undefined)",
        value: f.config
      })) && Fe(f.config, a + ".config", g) || w(g, {
        path: a + ".config",
        expected: "(TypeConfig | undefined)",
        value: f.config
      })].every((y) => y), Fe = (f, a, g = !0) => [f.key === void 0 || typeof f.key == "string" || w(g, {
        path: a + ".key",
        expected: "(string | undefined)",
        value: f.key
      }), f.label === void 0 || typeof f.label == "string" || w(g, {
        path: a + ".label",
        expected: "(string | undefined)",
        value: f.label
      })].every((y) => y), He = (f, a, g = !0) => [f.comparator === void 0 || f.comparator === "ascending" || f.comparator === "descending" || w(g, {
        path: a + ".comparator",
        expected: '("ascending" | "descending" | undefined)',
        value: f.comparator
      }), q.has(f.type) === !0 || w(g, {
        path: a + ".type",
        expected: '("area" | "attribute" | "device" | "disabled_by" | "domain" | "entity" | "entity_category" | "floor" | "hidden_by" | "integration" | "label" | "state")',
        value: f.type
      }), f.config === void 0 || (typeof f.config == "object" && f.config !== null && Array.isArray(f.config) === !1 || w(g, {
        path: a + ".config",
        expected: "(TypeConfig | undefined)",
        value: f.config
      })) && Fe(f.config, a + ".config", g) || w(g, {
        path: a + ".config",
        expected: "(TypeConfig | undefined)",
        value: f.config
      })].every((y) => y), De = (f, a, g = !0) => [f.index === void 0 || typeof f.index == "number" || w(g, {
        path: a + ".index",
        expected: "(number | undefined)",
        value: f.index
      }), f.view_index === void 0 || typeof f.view_index == "number" || w(g, {
        path: a + ".view_index",
        expected: "(number | undefined)",
        value: f.view_index
      }), f.type === void 0 || typeof f.type == "string" || w(g, {
        path: a + ".type",
        expected: "(string | undefined)",
        value: f.type
      }), g === !1 || Object.keys(f).map((y) => (["index", "view_index", "type"].some((_) => y === _) || f[y] === void 0, !0)).every((y) => y)].every((y) => y), k = (f, a, g = !0) => [typeof f.id == "string" || w(g, {
        path: a + ".id",
        expected: "string",
        value: f.id
      }), f.title === void 0 || typeof f.title == "string" || w(g, {
        path: a + ".title",
        expected: "(string | undefined)",
        value: f.title
      }), f.position === void 0 || typeof f.position == "number" || w(g, {
        path: a + ".position",
        expected: "(number | undefined)",
        value: f.position
      }), typeof f.minCardWidth == "number" || w(g, {
        path: a + ".minCardWidth",
        expected: "number",
        value: f.minCardWidth
      }), f.replace === void 0 || (typeof f.replace == "object" && f.replace !== null && Array.isArray(f.replace) === !1 || w(g, {
        path: a + ".replace",
        expected: "(Record<string, GridStrategyCardConfig> | undefined)",
        value: f.replace
      })) && we(f.replace, a + ".replace", g) || w(g, {
        path: a + ".replace",
        expected: "(Record<string, GridStrategyCardConfig> | undefined)",
        value: f.replace
      }), f.filter === void 0 || (typeof f.filter == "object" && f.filter !== null && Array.isArray(f.filter) === !1 || w(g, {
        path: a + ".filter",
        expected: "(FilterObject | undefined)",
        value: f.filter
      })) && $e(f.filter, a + ".filter", g) || w(g, {
        path: a + ".filter",
        expected: "(FilterObject | undefined)",
        value: f.filter
      }), f.sort === void 0 || (Array.isArray(f.sort) || w(g, {
        path: a + ".sort",
        expected: "(Array<SortConfig> | undefined)",
        value: f.sort
      })) && f.sort.map((y, o) => (typeof y == "object" && y !== null || w(g, {
        path: a + ".sort[" + o + "]",
        expected: "SortConfig",
        value: y
      })) && He(y, a + ".sort[" + o + "]", g) || w(g, {
        path: a + ".sort[" + o + "]",
        expected: "SortConfig",
        value: y
      })).every((y) => y) || w(g, {
        path: a + ".sort",
        expected: "(Array<SortConfig> | undefined)",
        value: f.sort
      }), (typeof f.card == "object" && f.card !== null || w(g, {
        path: a + ".card",
        expected: "LovelaceCardConfig",
        value: f.card
      })) && Se(f.card, a + ".card", g) || w(g, {
        path: a + ".card",
        expected: "LovelaceCardConfig",
        value: f.card
      })].every((y) => y), m = (f) => typeof f == "object" && f !== null && Q(f);
      let I, w;
      return (f) => {
        if (m(f) === !1) {
          I = [], w = Wt._validateReport(I), ((g, y, o = !0) => (typeof g == "object" && g !== null || w(!0, {
            path: y + "",
            expected: "BaseGridOptions<BaseRowOptions>",
            value: g
          })) && M(g, y + "", !0) || w(!0, {
            path: y + "",
            expected: "BaseGridOptions<BaseRowOptions>",
            value: g
          }))(f, "$input", !0);
          const a = I.length === 0;
          return a ? {
            success: a,
            data: f
          } : {
            success: a,
            errors: I,
            data: f
          };
        }
        return {
          success: !0,
          data: f
        };
      };
    })())(d);
    throw Error(D.success ? "Something went wrong. Check config." : JSON.stringify(D.errors));
  }
  return d;
}, ti = (j, W, d = { placeholder: "$entity", key: "entity_id" }) => {
  const N = [], G = [];
  return W.forEach((D, $) => {
    const H = (j.replace || {})[D[d.key]]?.card || j.card, T = Object.fromEntries([
      ...d.replaces || [],
      ["$index", $.toString()],
      [d.placeholder, D[d.key]]
    ]), q = Object.entries(H).filter(([Q, Y]) => {
      const ee = JSON.stringify(Y);
      return Object.keys(T).some((ae) => ee.includes(ae));
    }).map(([Q, Y]) => {
      const ee = JSON.stringify(Y), ae = Object.entries(T).reduce((ne, re) => ne.replaceAll(re[0], re[1]), ee);
      return [Q, JSON.parse(ae)];
    });
    G.push({
      type: "vertical-stack",
      cards: [
        {
          ...H,
          ...Object.fromEntries(q)
        }
      ]
    });
  }), G.length > 0 && (j.title && N.push({
    type: "markdown",
    text_only: !0,
    content: "## " + j.title
  }), N.push({
    type: "custom:layout-card",
    layout_type: "custom:grid-layout",
    layout: {
      "grid-template-rows": "auto",
      "grid-template-columns": `repeat(auto-fit, minmax(${j.minCardWidth}px, 1fr))`
    },
    cards: G
  })), N;
}, Gf = (...j) => {
  const W = j.filter(vr).reduce((d, N) => ({ ...d, ...N }));
  if (W.navigation = j.map((d) => d?.navigation).filter(vr).reduce((d, N) => ({ ...d, ...N })), !(/* @__PURE__ */ (() => {
    const d = /* @__PURE__ */ new Set(["entity", "domain", "device", "area", "floor", "integration", "label", "state", "attribute", "disabled_by", "hidden_by", "entity_category"]), N = /* @__PURE__ */ new Set(["entity", "domain", "device", "area", "floor", "integration", "label", "state", "attribute", "disabled_by", "hidden_by", "entity_category"]), G = (u) => Array.isArray(u.main) && u.main.every((i) => typeof i == "object" && i !== null && D(i)) && typeof u.navigation == "object" && u.navigation !== null && $(u.navigation) && (u.topCards === void 0 || Array.isArray(u.topCards) && u.topCards.every((i) => typeof i == "object" && i !== null && q(i))) && (u.extraViews === void 0 || Array.isArray(u.extraViews) && u.extraViews.every((i) => typeof i == "object" && i !== null && Array.isArray(i) === !1 && ne(i))), D = (u) => typeof u.title == "string" && typeof u.icon == "string" && typeof u.match == "string", $ = (u) => typeof u.id == "string" && (u.title === void 0 || typeof u.title == "string") && (u.position === void 0 || typeof u.position == "number") && typeof u.minCardWidth == "number" && (u.replace === void 0 || typeof u.replace == "object" && u.replace !== null && Array.isArray(u.replace) === !1 && H(u.replace)) && (u.filter === void 0 || typeof u.filter == "object" && u.filter !== null && Array.isArray(u.filter) === !1 && Q(u.filter)) && (u.sort === void 0 || Array.isArray(u.sort) && u.sort.every((i) => typeof i == "object" && i !== null && ae(i))) && typeof u.card == "object" && u.card !== null && q(u.card), H = (u) => Object.keys(u).every((i) => {
      const x = u[i];
      return x === void 0 ? !0 : typeof x == "object" && x !== null && T(x);
    }), T = (u) => typeof u.card == "object" && u.card !== null && q(u.card), q = (u) => (u.index === void 0 || typeof u.index == "number") && (u.view_index === void 0 || typeof u.view_index == "number") && typeof u.type == "string" && Object.keys(u).every((i) => (["index", "view_index", "type"].some((F) => i === F) || u[i] === void 0, !0)), Q = (u) => (u.exclude === void 0 || Array.isArray(u.exclude) && u.exclude.every((i) => typeof i == "object" && i !== null && Y(i))) && (u.include === void 0 || Array.isArray(u.include) && u.include.every((i) => typeof i == "object" && i !== null && Y(i))), Y = (u) => (u.comparator === void 0 || u.comparator === "equal" || u.comparator === "match" || u.comparator === "in" || u.comparator === "greater_than" || u.comparator === "lower_than" || u.comparator === "is_null" || u.comparator === "is_numeric") && !0 && d.has(u.type) === !0 && (u.config === void 0 || typeof u.config == "object" && u.config !== null && Array.isArray(u.config) === !1 && ee(u.config)), ee = (u) => (u.key === void 0 || typeof u.key == "string") && (u.label === void 0 || typeof u.label == "string"), ae = (u) => (u.comparator === void 0 || u.comparator === "ascending" || u.comparator === "descending") && N.has(u.type) === !0 && (u.config === void 0 || typeof u.config == "object" && u.config !== null && Array.isArray(u.config) === !1 && ee(u.config)), ne = (u) => (u.index === void 0 || typeof u.index == "number") && (u.title === void 0 || typeof u.title == "string") && (u.badges === void 0 || Array.isArray(u.badges) && u.badges.every((i) => i != null && (typeof i == "string" || typeof i == "object" && i !== null && Array.isArray(i) === !1 && re(i)))) && (u.cards === void 0 || Array.isArray(u.cards) && u.cards.every((i) => typeof i == "object" && i !== null && q(i))) && (u.path === void 0 || typeof u.path == "string") && (u.icon === void 0 || typeof u.icon == "string") && (u.theme === void 0 || typeof u.theme == "string") && (u.panel === void 0 || typeof u.panel == "boolean") && (u.background === void 0 || typeof u.background == "string") && u.visible !== null && (u.visible === void 0 || typeof u.visible == "boolean" || Array.isArray(u.visible) && u.visible.every((i) => typeof i == "object" && i !== null && Array.isArray(i) === !1 && J(i))), re = (u) => (u.type === void 0 || typeof u.type == "string") && Object.keys(u).every((i) => (["type"].some((F) => i === F) || u[i] === void 0, !0)), J = (u) => u.user === void 0 || typeof u.user == "string";
    return (u) => typeof u == "object" && u !== null && G(u);
  })())(W)) {
    const d = (/* @__PURE__ */ (() => {
      const N = /* @__PURE__ */ new Set(["entity", "domain", "device", "area", "floor", "integration", "label", "state", "attribute", "disabled_by", "hidden_by", "entity_category"]), G = /* @__PURE__ */ new Set(["entity", "domain", "device", "area", "floor", "integration", "label", "state", "attribute", "disabled_by", "hidden_by", "entity_category"]), D = /* @__PURE__ */ new Set(["entity", "domain", "device", "area", "floor", "integration", "label", "state", "attribute", "disabled_by", "hidden_by", "entity_category"]), $ = /* @__PURE__ */ new Set(["entity", "domain", "device", "area", "floor", "integration", "label", "state", "attribute", "disabled_by", "hidden_by", "entity_category"]), H = (a) => Array.isArray(a.main) && a.main.every((g) => typeof g == "object" && g !== null && T(g)) && typeof a.navigation == "object" && a.navigation !== null && q(a.navigation) && (a.topCards === void 0 || Array.isArray(a.topCards) && a.topCards.every((g) => typeof g == "object" && g !== null && ee(g))) && (a.extraViews === void 0 || Array.isArray(a.extraViews) && a.extraViews.every((g) => typeof g == "object" && g !== null && Array.isArray(g) === !1 && u(g))), T = (a) => typeof a.title == "string" && typeof a.icon == "string" && typeof a.match == "string", q = (a) => typeof a.id == "string" && (a.title === void 0 || typeof a.title == "string") && (a.position === void 0 || typeof a.position == "number") && typeof a.minCardWidth == "number" && (a.replace === void 0 || typeof a.replace == "object" && a.replace !== null && Array.isArray(a.replace) === !1 && Q(a.replace)) && (a.filter === void 0 || typeof a.filter == "object" && a.filter !== null && Array.isArray(a.filter) === !1 && ae(a.filter)) && (a.sort === void 0 || Array.isArray(a.sort) && a.sort.every((g) => typeof g == "object" && g !== null && J(g))) && typeof a.card == "object" && a.card !== null && ee(a.card), Q = (a) => Object.keys(a).every((g) => {
        const y = a[g];
        return y === void 0 ? !0 : typeof y == "object" && y !== null && Y(y);
      }), Y = (a) => typeof a.card == "object" && a.card !== null && ee(a.card), ee = (a) => (a.index === void 0 || typeof a.index == "number") && (a.view_index === void 0 || typeof a.view_index == "number") && typeof a.type == "string" && Object.keys(a).every((g) => (["index", "view_index", "type"].some((o) => g === o) || a[g] === void 0, !0)), ae = (a) => (a.exclude === void 0 || Array.isArray(a.exclude) && a.exclude.every((g) => typeof g == "object" && g !== null && ne(g))) && (a.include === void 0 || Array.isArray(a.include) && a.include.every((g) => typeof g == "object" && g !== null && ne(g))), ne = (a) => (a.comparator === void 0 || a.comparator === "equal" || a.comparator === "match" || a.comparator === "in" || a.comparator === "greater_than" || a.comparator === "lower_than" || a.comparator === "is_null" || a.comparator === "is_numeric") && !0 && N.has(a.type) === !0 && (a.config === void 0 || typeof a.config == "object" && a.config !== null && Array.isArray(a.config) === !1 && re(a.config)), re = (a) => (a.key === void 0 || typeof a.key == "string") && (a.label === void 0 || typeof a.label == "string"), J = (a) => (a.comparator === void 0 || a.comparator === "ascending" || a.comparator === "descending") && G.has(a.type) === !0 && (a.config === void 0 || typeof a.config == "object" && a.config !== null && Array.isArray(a.config) === !1 && re(a.config)), u = (a) => (a.index === void 0 || typeof a.index == "number") && (a.title === void 0 || typeof a.title == "string") && (a.badges === void 0 || Array.isArray(a.badges) && a.badges.every((g) => g != null && (typeof g == "string" || typeof g == "object" && g !== null && Array.isArray(g) === !1 && i(g)))) && (a.cards === void 0 || Array.isArray(a.cards) && a.cards.every((g) => typeof g == "object" && g !== null && ee(g))) && (a.path === void 0 || typeof a.path == "string") && (a.icon === void 0 || typeof a.icon == "string") && (a.theme === void 0 || typeof a.theme == "string") && (a.panel === void 0 || typeof a.panel == "boolean") && (a.background === void 0 || typeof a.background == "string") && a.visible !== null && (a.visible === void 0 || typeof a.visible == "boolean" || Array.isArray(a.visible) && a.visible.every((g) => typeof g == "object" && g !== null && Array.isArray(g) === !1 && x(g))), i = (a) => (a.type === void 0 || typeof a.type == "string") && Object.keys(a).every((g) => (["type"].some((o) => g === o) || a[g] === void 0, !0)), x = (a) => a.user === void 0 || typeof a.user == "string", F = (a, g, y = !0) => [(Array.isArray(a.main) || f(y, {
        path: g + ".main",
        expected: "Array<TabConfig>",
        value: a.main
      })) && a.main.map((o, _) => (typeof o == "object" && o !== null || f(y, {
        path: g + ".main[" + _ + "]",
        expected: "TabConfig",
        value: o
      })) && M(o, g + ".main[" + _ + "]", y) || f(y, {
        path: g + ".main[" + _ + "]",
        expected: "TabConfig",
        value: o
      })).every((o) => o) || f(y, {
        path: g + ".main",
        expected: "Array<TabConfig>",
        value: a.main
      }), (typeof a.navigation == "object" && a.navigation !== null || f(y, {
        path: g + ".navigation",
        expected: "BaseRowOptions",
        value: a.navigation
      })) && ge(a.navigation, g + ".navigation", y) || f(y, {
        path: g + ".navigation",
        expected: "BaseRowOptions",
        value: a.navigation
      }), a.topCards === void 0 || (Array.isArray(a.topCards) || f(y, {
        path: g + ".topCards",
        expected: "(Array<LovelaceCardConfig> | undefined)",
        value: a.topCards
      })) && a.topCards.map((o, _) => (typeof o == "object" && o !== null || f(y, {
        path: g + ".topCards[" + _ + "]",
        expected: "LovelaceCardConfig",
        value: o
      })) && Se(o, g + ".topCards[" + _ + "]", y) || f(y, {
        path: g + ".topCards[" + _ + "]",
        expected: "LovelaceCardConfig",
        value: o
      })).every((o) => o) || f(y, {
        path: g + ".topCards",
        expected: "(Array<LovelaceCardConfig> | undefined)",
        value: a.topCards
      }), a.extraViews === void 0 || (Array.isArray(a.extraViews) || f(y, {
        path: g + ".extraViews",
        expected: "(Array<LovelaceViewConfig> | undefined)",
        value: a.extraViews
      })) && a.extraViews.map((o, _) => (typeof o == "object" && o !== null && Array.isArray(o) === !1 || f(y, {
        path: g + ".extraViews[" + _ + "]",
        expected: "LovelaceViewConfig",
        value: o
      })) && De(o, g + ".extraViews[" + _ + "]", y) || f(y, {
        path: g + ".extraViews[" + _ + "]",
        expected: "LovelaceViewConfig",
        value: o
      })).every((o) => o) || f(y, {
        path: g + ".extraViews",
        expected: "(Array<LovelaceViewConfig> | undefined)",
        value: a.extraViews
      })].every((o) => o), M = (a, g, y = !0) => [typeof a.title == "string" || f(y, {
        path: g + ".title",
        expected: "string",
        value: a.title
      }), typeof a.icon == "string" || f(y, {
        path: g + ".icon",
        expected: "string",
        value: a.icon
      }), typeof a.match == "string" || f(y, {
        path: g + ".match",
        expected: "string",
        value: a.match
      })].every((o) => o), ge = (a, g, y = !0) => [typeof a.id == "string" || f(y, {
        path: g + ".id",
        expected: "string",
        value: a.id
      }), a.title === void 0 || typeof a.title == "string" || f(y, {
        path: g + ".title",
        expected: "(string | undefined)",
        value: a.title
      }), a.position === void 0 || typeof a.position == "number" || f(y, {
        path: g + ".position",
        expected: "(number | undefined)",
        value: a.position
      }), typeof a.minCardWidth == "number" || f(y, {
        path: g + ".minCardWidth",
        expected: "number",
        value: a.minCardWidth
      }), a.replace === void 0 || (typeof a.replace == "object" && a.replace !== null && Array.isArray(a.replace) === !1 || f(y, {
        path: g + ".replace",
        expected: "(Record<string, GridStrategyCardConfig> | undefined)",
        value: a.replace
      })) && we(a.replace, g + ".replace", y) || f(y, {
        path: g + ".replace",
        expected: "(Record<string, GridStrategyCardConfig> | undefined)",
        value: a.replace
      }), a.filter === void 0 || (typeof a.filter == "object" && a.filter !== null && Array.isArray(a.filter) === !1 || f(y, {
        path: g + ".filter",
        expected: "(FilterObject | undefined)",
        value: a.filter
      })) && $e(a.filter, g + ".filter", y) || f(y, {
        path: g + ".filter",
        expected: "(FilterObject | undefined)",
        value: a.filter
      }), a.sort === void 0 || (Array.isArray(a.sort) || f(y, {
        path: g + ".sort",
        expected: "(Array<SortConfig> | undefined)",
        value: a.sort
      })) && a.sort.map((o, _) => (typeof o == "object" && o !== null || f(y, {
        path: g + ".sort[" + _ + "]",
        expected: "SortConfig",
        value: o
      })) && He(o, g + ".sort[" + _ + "]", y) || f(y, {
        path: g + ".sort[" + _ + "]",
        expected: "SortConfig",
        value: o
      })).every((o) => o) || f(y, {
        path: g + ".sort",
        expected: "(Array<SortConfig> | undefined)",
        value: a.sort
      }), (typeof a.card == "object" && a.card !== null || f(y, {
        path: g + ".card",
        expected: "LovelaceCardConfig",
        value: a.card
      })) && Se(a.card, g + ".card", y) || f(y, {
        path: g + ".card",
        expected: "LovelaceCardConfig",
        value: a.card
      })].every((o) => o), we = (a, g, y = !0) => [y === !1 || Object.keys(a).map((o) => {
        const _ = a[o];
        return _ === void 0 ? !0 : (typeof _ == "object" && _ !== null || f(y, {
          path: g + ar._accessExpressionAsString(o),
          expected: "GridStrategyCardConfig",
          value: _
        })) && pe(_, g + ar._accessExpressionAsString(o), y) || f(y, {
          path: g + ar._accessExpressionAsString(o),
          expected: "GridStrategyCardConfig",
          value: _
        });
      }).every((o) => o)].every((o) => o), pe = (a, g, y = !0) => [(typeof a.card == "object" && a.card !== null || f(y, {
        path: g + ".card",
        expected: "LovelaceCardConfig",
        value: a.card
      })) && Se(a.card, g + ".card", y) || f(y, {
        path: g + ".card",
        expected: "LovelaceCardConfig",
        value: a.card
      })].every((o) => o), Se = (a, g, y = !0) => [a.index === void 0 || typeof a.index == "number" || f(y, {
        path: g + ".index",
        expected: "(number | undefined)",
        value: a.index
      }), a.view_index === void 0 || typeof a.view_index == "number" || f(y, {
        path: g + ".view_index",
        expected: "(number | undefined)",
        value: a.view_index
      }), typeof a.type == "string" || f(y, {
        path: g + ".type",
        expected: "string",
        value: a.type
      }), y === !1 || Object.keys(a).map((o) => (["index", "view_index", "type"].some((p) => o === p) || a[o] === void 0, !0)).every((o) => o)].every((o) => o), $e = (a, g, y = !0) => [a.exclude === void 0 || (Array.isArray(a.exclude) || f(y, {
        path: g + ".exclude",
        expected: "(Array<FilterConfig> | undefined)",
        value: a.exclude
      })) && a.exclude.map((o, _) => (typeof o == "object" && o !== null || f(y, {
        path: g + ".exclude[" + _ + "]",
        expected: "FilterConfig",
        value: o
      })) && We(o, g + ".exclude[" + _ + "]", y) || f(y, {
        path: g + ".exclude[" + _ + "]",
        expected: "FilterConfig",
        value: o
      })).every((o) => o) || f(y, {
        path: g + ".exclude",
        expected: "(Array<FilterConfig> | undefined)",
        value: a.exclude
      }), a.include === void 0 || (Array.isArray(a.include) || f(y, {
        path: g + ".include",
        expected: "(Array<FilterConfig> | undefined)",
        value: a.include
      })) && a.include.map((o, _) => (typeof o == "object" && o !== null || f(y, {
        path: g + ".include[" + _ + "]",
        expected: "FilterConfig",
        value: o
      })) && We(o, g + ".include[" + _ + "]", y) || f(y, {
        path: g + ".include[" + _ + "]",
        expected: "FilterConfig",
        value: o
      })).every((o) => o) || f(y, {
        path: g + ".include",
        expected: "(Array<FilterConfig> | undefined)",
        value: a.include
      })].every((o) => o), We = (a, g, y = !0) => [a.comparator === void 0 || a.comparator === "equal" || a.comparator === "match" || a.comparator === "in" || a.comparator === "greater_than" || a.comparator === "lower_than" || a.comparator === "is_null" || a.comparator === "is_numeric" || f(y, {
        path: g + ".comparator",
        expected: '("equal" | "greater_than" | "in" | "is_null" | "is_numeric" | "lower_than" | "match" | undefined)',
        value: a.comparator
      }), !0, D.has(a.type) === !0 || f(y, {
        path: g + ".type",
        expected: '("area" | "attribute" | "device" | "disabled_by" | "domain" | "entity" | "entity_category" | "floor" | "hidden_by" | "integration" | "label" | "state")',
        value: a.type
      }), a.config === void 0 || (typeof a.config == "object" && a.config !== null && Array.isArray(a.config) === !1 || f(y, {
        path: g + ".config",
        expected: "(TypeConfig | undefined)",
        value: a.config
      })) && Fe(a.config, g + ".config", y) || f(y, {
        path: g + ".config",
        expected: "(TypeConfig | undefined)",
        value: a.config
      })].every((o) => o), Fe = (a, g, y = !0) => [a.key === void 0 || typeof a.key == "string" || f(y, {
        path: g + ".key",
        expected: "(string | undefined)",
        value: a.key
      }), a.label === void 0 || typeof a.label == "string" || f(y, {
        path: g + ".label",
        expected: "(string | undefined)",
        value: a.label
      })].every((o) => o), He = (a, g, y = !0) => [a.comparator === void 0 || a.comparator === "ascending" || a.comparator === "descending" || f(y, {
        path: g + ".comparator",
        expected: '("ascending" | "descending" | undefined)',
        value: a.comparator
      }), $.has(a.type) === !0 || f(y, {
        path: g + ".type",
        expected: '("area" | "attribute" | "device" | "disabled_by" | "domain" | "entity" | "entity_category" | "floor" | "hidden_by" | "integration" | "label" | "state")',
        value: a.type
      }), a.config === void 0 || (typeof a.config == "object" && a.config !== null && Array.isArray(a.config) === !1 || f(y, {
        path: g + ".config",
        expected: "(TypeConfig | undefined)",
        value: a.config
      })) && Fe(a.config, g + ".config", y) || f(y, {
        path: g + ".config",
        expected: "(TypeConfig | undefined)",
        value: a.config
      })].every((o) => o), De = (a, g, y = !0) => [a.index === void 0 || typeof a.index == "number" || f(y, {
        path: g + ".index",
        expected: "(number | undefined)",
        value: a.index
      }), a.title === void 0 || typeof a.title == "string" || f(y, {
        path: g + ".title",
        expected: "(string | undefined)",
        value: a.title
      }), a.badges === void 0 || (Array.isArray(a.badges) || f(y, {
        path: g + ".badges",
        expected: "(Array<string | LovelaceBadgeConfig> | undefined)",
        value: a.badges
      })) && a.badges.map((o, _) => (o !== null || f(y, {
        path: g + ".badges[" + _ + "]",
        expected: "(LovelaceBadgeConfig | string)",
        value: o
      })) && (o !== void 0 || f(y, {
        path: g + ".badges[" + _ + "]",
        expected: "(LovelaceBadgeConfig | string)",
        value: o
      })) && (typeof o == "string" || (typeof o == "object" && o !== null && Array.isArray(o) === !1 || f(y, {
        path: g + ".badges[" + _ + "]",
        expected: "(LovelaceBadgeConfig | string)",
        value: o
      })) && k(o, g + ".badges[" + _ + "]", y) || f(y, {
        path: g + ".badges[" + _ + "]",
        expected: "(LovelaceBadgeConfig | string)",
        value: o
      }))).every((o) => o) || f(y, {
        path: g + ".badges",
        expected: "(Array<string | LovelaceBadgeConfig> | undefined)",
        value: a.badges
      }), a.cards === void 0 || (Array.isArray(a.cards) || f(y, {
        path: g + ".cards",
        expected: "(Array<LovelaceCardConfig> | undefined)",
        value: a.cards
      })) && a.cards.map((o, _) => (typeof o == "object" && o !== null || f(y, {
        path: g + ".cards[" + _ + "]",
        expected: "LovelaceCardConfig",
        value: o
      })) && Se(o, g + ".cards[" + _ + "]", y) || f(y, {
        path: g + ".cards[" + _ + "]",
        expected: "LovelaceCardConfig",
        value: o
      })).every((o) => o) || f(y, {
        path: g + ".cards",
        expected: "(Array<LovelaceCardConfig> | undefined)",
        value: a.cards
      }), a.path === void 0 || typeof a.path == "string" || f(y, {
        path: g + ".path",
        expected: "(string | undefined)",
        value: a.path
      }), a.icon === void 0 || typeof a.icon == "string" || f(y, {
        path: g + ".icon",
        expected: "(string | undefined)",
        value: a.icon
      }), a.theme === void 0 || typeof a.theme == "string" || f(y, {
        path: g + ".theme",
        expected: "(string | undefined)",
        value: a.theme
      }), a.panel === void 0 || typeof a.panel == "boolean" || f(y, {
        path: g + ".panel",
        expected: "(boolean | undefined)",
        value: a.panel
      }), a.background === void 0 || typeof a.background == "string" || f(y, {
        path: g + ".background",
        expected: "(string | undefined)",
        value: a.background
      }), (a.visible !== null || f(y, {
        path: g + ".visible",
        expected: "(Array<ShowViewConfig> | boolean | undefined)",
        value: a.visible
      })) && (a.visible === void 0 || typeof a.visible == "boolean" || (Array.isArray(a.visible) || f(y, {
        path: g + ".visible",
        expected: "(Array<ShowViewConfig> | boolean | undefined)",
        value: a.visible
      })) && a.visible.map((o, _) => (typeof o == "object" && o !== null && Array.isArray(o) === !1 || f(y, {
        path: g + ".visible[" + _ + "]",
        expected: "ShowViewConfig",
        value: o
      })) && m(o, g + ".visible[" + _ + "]", y) || f(y, {
        path: g + ".visible[" + _ + "]",
        expected: "ShowViewConfig",
        value: o
      })).every((o) => o) || f(y, {
        path: g + ".visible",
        expected: "(Array<ShowViewConfig> | boolean | undefined)",
        value: a.visible
      }))].every((o) => o), k = (a, g, y = !0) => [a.type === void 0 || typeof a.type == "string" || f(y, {
        path: g + ".type",
        expected: "(string | undefined)",
        value: a.type
      }), y === !1 || Object.keys(a).map((o) => (["type"].some((p) => o === p) || a[o] === void 0, !0)).every((o) => o)].every((o) => o), m = (a, g, y = !0) => [a.user === void 0 || typeof a.user == "string" || f(y, {
        path: g + ".user",
        expected: "(string | undefined)",
        value: a.user
      })].every((o) => o), I = (a) => typeof a == "object" && a !== null && H(a);
      let w, f;
      return (a) => {
        if (I(a) === !1) {
          w = [], f = Wt._validateReport(w), ((y, o, _ = !0) => (typeof y == "object" && y !== null || f(!0, {
            path: o + "",
            expected: "Omit<AreaStrategyOptions, keyof BaseGridOptions<BaseRowOptions | BaseRowRefOptions>>",
            value: y
          })) && F(y, o + "", !0) || f(!0, {
            path: o + "",
            expected: "Omit<AreaStrategyOptions, keyof BaseGridOptions<BaseRowOptions | BaseRowRefOptions>>",
            value: y
          }))(a, "$input", !0);
          const g = w.length === 0;
          return g ? {
            success: g,
            data: a
          } : {
            success: g,
            errors: w,
            data: a
          };
        }
        return {
          success: !0,
          data: a
        };
      };
    })())(W);
    throw Error(d.success ? "Something went wrong. Check config." : JSON.stringify(d.errors));
  }
  return W;
};
class Fv extends HTMLTemplateElement {
  static async generate(W, d) {
    const [N] = await Promise.all([d.callWS({ type: "config/area_registry/list" })]), G = Gf(ri, W?.config), D = Bt(G.navigation, d), $ = In(G.navigation, d);
    return {
      views: [...N.filter(D).sort($).map((q, Q) => ({
        strategy: {
          type: "custom:area-view-strategy",
          config: { ...W.config, area: q.area_id }
        },
        title: q.name,
        path: q.area_id,
        icon: "mdi:home",
        type: "panel",
        subview: !1,
        visible: Q == 0
      })), ...W.config?.extraViews || []]
    };
  }
}
class Bv extends HTMLTemplateElement {
  static async generate(W, d) {
    const N = W.config?.area, G = Gf(ri, W.config), { main: D, navigation: $, topCards: H } = G, { grids: T } = Nf(ri, W.config);
    let q = Array(), Q = Array();
    const Y = await Promise.all([
      d.callWS({ type: "config/entity_registry/list" }),
      d.callWS({ type: "config/area_registry/list" })
    ]);
    q = Y[0], Q = Y[1];
    const ee = Bt($, d), ae = In($, d), ne = Q.filter(ee).sort(ae), re = ne.find((M) => M.area_id == N);
    if (!re)
      throw Error("No area defined");
    const J = ti($, ne, { placeholder: "$area", key: "area_id", replaces: [["$currArea", re.area_id]] }), u = {
      type: "vertical-stack",
      cards: [
        ...H || [],
        ...J,
        {
          type: "custom:gap-card",
          height: 60
        }
      ]
    }, i = D.map((M) => {
      const we = T.filter((pe) => new RegExp(M.match).test(pe.id)).flatMap((pe) => {
        const Se = {
          filter: {
            include: [
              {
                type: ke.area,
                value: re.area_id
              }
            ]
          }
        }, $e = Mt.mergeWith({}, Se, Mt.cloneDeep(pe), Uf), We = Bt($e, d), Fe = In($e, d), He = q.filter(We).sort(Fe);
        return ti(pe, He);
      });
      return we.length > 0 ? {
        attributes: {
          label: M.title,
          icon: M.icon,
          stacked: !0
        },
        card: {
          type: "vertical-stack",
          cards: [
            {
              type: "custom:gap-card",
              height: 20
            },
            ...we
          ]
        }
      } : null;
    }).filter(vr), x = {
      type: "custom:tabbed-card",
      styles: {
        "--mdc-tab-text-label-color-default": "var(--primary-text-color)",
        "--mdc-tab-color-default": "var(--primary-text-color)"
      },
      tabs: i
    };
    return {
      panel: !0,
      cards: [{
        type: "vertical-stack",
        cards: [
          {
            type: "conditional",
            conditions: [
              {
                condition: "screen",
                media_query: "(max-width: 1000px)"
              }
            ],
            card: {
              type: "custom:state-switch",
              entity: "hash",
              default: "default",
              states: {
                "": u,
                default: {
                  type: "vertical-stack",
                  cards: [
                    x,
                    {
                      type: "button",
                      icon: "mdi:home",
                      show_name: !1,
                      show_state: !1,
                      show_icon: !0,
                      icon_height: "40px",
                      tap_action: {
                        action: "navigate",
                        navigation_path: window.location.pathname
                      },
                      card_mod: {
                        style: `
                        ha-card { 
                            background: var(--app-header-background-color);
                            padding: 0 !important;
                        }
                        :host {
                            width: 100%;
                            height: 80px;
                            z-index: 2;
                            position: fixed;
                            bottom: 0;
                            left: 50%;
                            transform: translateX(-50%);
                        }
                        @media (min-width: 1001px) {
                            :host {
                                display: none;
                            }
                        }`
                      }
                    },
                    {
                      type: "custom:gap-card",
                      height: 60
                    }
                  ]
                }
              }
            }
          },
          {
            type: "conditional",
            conditions: [
              {
                condition: "screen",
                media_query: "(min-width: 1001px)"
              }
            ],
            card: {
              type: "custom:layout-card",
              layout_type: "custom:grid-layout",
              layout: {
                "grid-template-columns": "2fr 3fr",
                "grid-template-areas": "navigation main"
              },
              cards: [u, x]
            }
          }
        ]
      }]
    };
  }
}
customElements.define(`${Lv}area-dashboard-strategy`, Fv);
customElements.define(`${ni}area-view-strategy`, Bv);
const Mv = (...j) => {
  const W = j.filter(vr).reduce((d, N) => ({ ...d, ...N }));
  if (!(/* @__PURE__ */ (() => {
    const d = /* @__PURE__ */ new Set(["entity", "domain", "device", "area", "floor", "integration", "label", "state", "attribute", "disabled_by", "hidden_by", "entity_category"]), N = (T) => Array.isArray(T.presets) && T.presets.every((q) => typeof q == "object" && q !== null && G(q)), G = (T) => typeof T.title == "string" && typeof T.icon == "string" && (T.filter === void 0 || typeof T.filter == "object" && T.filter !== null && Array.isArray(T.filter) === !1 && D(T.filter)), D = (T) => (T.exclude === void 0 || Array.isArray(T.exclude) && T.exclude.every((q) => typeof q == "object" && q !== null && $(q))) && (T.include === void 0 || Array.isArray(T.include) && T.include.every((q) => typeof q == "object" && q !== null && $(q))), $ = (T) => (T.comparator === void 0 || T.comparator === "equal" || T.comparator === "match" || T.comparator === "in" || T.comparator === "greater_than" || T.comparator === "lower_than" || T.comparator === "is_null" || T.comparator === "is_numeric") && !0 && d.has(T.type) === !0 && (T.config === void 0 || typeof T.config == "object" && T.config !== null && Array.isArray(T.config) === !1 && H(T.config)), H = (T) => (T.key === void 0 || typeof T.key == "string") && (T.label === void 0 || typeof T.label == "string");
    return (T) => typeof T == "object" && T !== null && N(T);
  })())(W)) {
    const d = (/* @__PURE__ */ (() => {
      const N = /* @__PURE__ */ new Set(["entity", "domain", "device", "area", "floor", "integration", "label", "state", "attribute", "disabled_by", "hidden_by", "entity_category"]), G = /* @__PURE__ */ new Set(["entity", "domain", "device", "area", "floor", "integration", "label", "state", "attribute", "disabled_by", "hidden_by", "entity_category"]), D = (i) => Array.isArray(i.presets) && i.presets.every((x) => typeof x == "object" && x !== null && $(x)), $ = (i) => typeof i.title == "string" && typeof i.icon == "string" && (i.filter === void 0 || typeof i.filter == "object" && i.filter !== null && Array.isArray(i.filter) === !1 && H(i.filter)), H = (i) => (i.exclude === void 0 || Array.isArray(i.exclude) && i.exclude.every((x) => typeof x == "object" && x !== null && T(x))) && (i.include === void 0 || Array.isArray(i.include) && i.include.every((x) => typeof x == "object" && x !== null && T(x))), T = (i) => (i.comparator === void 0 || i.comparator === "equal" || i.comparator === "match" || i.comparator === "in" || i.comparator === "greater_than" || i.comparator === "lower_than" || i.comparator === "is_null" || i.comparator === "is_numeric") && !0 && N.has(i.type) === !0 && (i.config === void 0 || typeof i.config == "object" && i.config !== null && Array.isArray(i.config) === !1 && q(i.config)), q = (i) => (i.key === void 0 || typeof i.key == "string") && (i.label === void 0 || typeof i.label == "string"), Q = (i, x, F = !0) => [(Array.isArray(i.presets) || u(F, {
        path: x + ".presets",
        expected: "Array<LogPreset>",
        value: i.presets
      })) && i.presets.map((M, ge) => (typeof M == "object" && M !== null || u(F, {
        path: x + ".presets[" + ge + "]",
        expected: "LogPreset",
        value: M
      })) && Y(M, x + ".presets[" + ge + "]", F) || u(F, {
        path: x + ".presets[" + ge + "]",
        expected: "LogPreset",
        value: M
      })).every((M) => M) || u(F, {
        path: x + ".presets",
        expected: "Array<LogPreset>",
        value: i.presets
      })].every((M) => M), Y = (i, x, F = !0) => [typeof i.title == "string" || u(F, {
        path: x + ".title",
        expected: "string",
        value: i.title
      }), typeof i.icon == "string" || u(F, {
        path: x + ".icon",
        expected: "string",
        value: i.icon
      }), i.filter === void 0 || (typeof i.filter == "object" && i.filter !== null && Array.isArray(i.filter) === !1 || u(F, {
        path: x + ".filter",
        expected: "(FilterObject | undefined)",
        value: i.filter
      })) && ee(i.filter, x + ".filter", F) || u(F, {
        path: x + ".filter",
        expected: "(FilterObject | undefined)",
        value: i.filter
      })].every((M) => M), ee = (i, x, F = !0) => [i.exclude === void 0 || (Array.isArray(i.exclude) || u(F, {
        path: x + ".exclude",
        expected: "(Array<FilterConfig> | undefined)",
        value: i.exclude
      })) && i.exclude.map((M, ge) => (typeof M == "object" && M !== null || u(F, {
        path: x + ".exclude[" + ge + "]",
        expected: "FilterConfig",
        value: M
      })) && ae(M, x + ".exclude[" + ge + "]", F) || u(F, {
        path: x + ".exclude[" + ge + "]",
        expected: "FilterConfig",
        value: M
      })).every((M) => M) || u(F, {
        path: x + ".exclude",
        expected: "(Array<FilterConfig> | undefined)",
        value: i.exclude
      }), i.include === void 0 || (Array.isArray(i.include) || u(F, {
        path: x + ".include",
        expected: "(Array<FilterConfig> | undefined)",
        value: i.include
      })) && i.include.map((M, ge) => (typeof M == "object" && M !== null || u(F, {
        path: x + ".include[" + ge + "]",
        expected: "FilterConfig",
        value: M
      })) && ae(M, x + ".include[" + ge + "]", F) || u(F, {
        path: x + ".include[" + ge + "]",
        expected: "FilterConfig",
        value: M
      })).every((M) => M) || u(F, {
        path: x + ".include",
        expected: "(Array<FilterConfig> | undefined)",
        value: i.include
      })].every((M) => M), ae = (i, x, F = !0) => [i.comparator === void 0 || i.comparator === "equal" || i.comparator === "match" || i.comparator === "in" || i.comparator === "greater_than" || i.comparator === "lower_than" || i.comparator === "is_null" || i.comparator === "is_numeric" || u(F, {
        path: x + ".comparator",
        expected: '("equal" | "greater_than" | "in" | "is_null" | "is_numeric" | "lower_than" | "match" | undefined)',
        value: i.comparator
      }), !0, G.has(i.type) === !0 || u(F, {
        path: x + ".type",
        expected: '("area" | "attribute" | "device" | "disabled_by" | "domain" | "entity" | "entity_category" | "floor" | "hidden_by" | "integration" | "label" | "state")',
        value: i.type
      }), i.config === void 0 || (typeof i.config == "object" && i.config !== null && Array.isArray(i.config) === !1 || u(F, {
        path: x + ".config",
        expected: "(TypeConfig | undefined)",
        value: i.config
      })) && ne(i.config, x + ".config", F) || u(F, {
        path: x + ".config",
        expected: "(TypeConfig | undefined)",
        value: i.config
      })].every((M) => M), ne = (i, x, F = !0) => [i.key === void 0 || typeof i.key == "string" || u(F, {
        path: x + ".key",
        expected: "(string | undefined)",
        value: i.key
      }), i.label === void 0 || typeof i.label == "string" || u(F, {
        path: x + ".label",
        expected: "(string | undefined)",
        value: i.label
      })].every((M) => M), re = (i) => typeof i == "object" && i !== null && D(i);
      let J, u;
      return (i) => {
        if (re(i) === !1) {
          J = [], u = Wt._validateReport(J), ((F, M, ge = !0) => (typeof F == "object" && F !== null || u(!0, {
            path: M + "",
            expected: "LogViewOptions",
            value: F
          })) && Q(F, M + "", !0) || u(!0, {
            path: M + "",
            expected: "LogViewOptions",
            value: F
          }))(i, "$input", !0);
          const x = J.length === 0;
          return x ? {
            success: x,
            data: i
          } : {
            success: x,
            errors: J,
            data: i
          };
        }
        return {
          success: !0,
          data: i
        };
      };
    })())(W);
    throw Error(d.success ? "Something went wrong. Check config." : JSON.stringify(d.errors));
  }
  return W;
};
class Pv extends HTMLTemplateElement {
  static async generate(W, d) {
    const { config: N } = W, G = {
      ...N
    }, { presets: D } = Mv(G);
    if (!D)
      throw Error("presets not defined!");
    const [$] = await Promise.all([d.callWS({ type: "config/entity_registry/list" })]), H = {
      type: "vertical-stack",
      cards: [],
      view_layout: {
        position: "sidebar"
      }
    }, T = D.reduce((Q, Y) => (Q.cards.push({
      type: "button",
      name: Y.title,
      icon: Y.icon,
      tap_action: {
        action: "navigate",
        navigation_path: window.location.pathname + "#" + encodeURI(Y.title)
      }
    }), Q), H), q = D.reduce((Q, Y) => {
      const ee = $.filter(Bt(Y, d)), ne = {
        type: "vertical-stack",
        cards: [{
          type: "logbook",
          title: Y.title,
          entities: ee.map((re) => re.entity_id)
        }]
      };
      return Q.set(encodeURI(Y.title), ne), Q;
    }, /* @__PURE__ */ new Map());
    return {
      type: "sidebar",
      cards: [
        {
          type: "custom:state-switch",
          entity: "hash",
          default: q.keys().next().value,
          states: Object.fromEntries(q.entries())
        },
        T
      ]
    };
  }
}
customElements.define(`${ni}log-view-strategy`, Pv);
const $v = {
  global: {
    minCardWidth: 300,
    filter: { exclude: [
      {
        type: "disabled_by",
        comparator: "match",
        value: ".*"
      },
      {
        type: "hidden_by",
        comparator: "match",
        value: ".*"
      },
      {
        type: "label",
        config: { label: "hidden" },
        value: "hidden"
      }
    ] },
    sort: [
      {
        type: "label",
        config: { label: "^sort_\\d+$" }
      },
      { type: "area" },
      { type: "integration" },
      { type: "entity" }
    ]
  },
  gridMergeStrategy: "reset"
};
class Dv extends HTMLTemplateElement {
  static async generate(W, d) {
    const { config: N } = W, G = Nf($v, N), { grids: D } = G, [$] = await Promise.all([d.callWS({ type: "config/entity_registry/list" })]);
    return {
      panel: !0,
      cards: [
        {
          type: "vertical-stack",
          cards: D.reduce((T, q) => {
            const Q = $.filter(Bt(q, d)).sort(In(q, d));
            return T.push(...ti(q, Q)), T;
          }, new Array())
        }
      ]
    };
  }
}
customElements.define(`${ni}grid-view-strategy`, Dv);
