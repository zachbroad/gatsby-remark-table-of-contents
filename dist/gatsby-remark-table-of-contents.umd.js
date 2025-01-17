(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
})((function () { 'use strict';

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);

      if (enumerableOnly) {
        symbols = symbols.filter(function (sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        });
      }

      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  // convert "in-string" to "inString"
  var strToCamel = function strToCamel(str) {
    return str.replace(/-(.)/g, function (match, chr) {
      return chr.toUpperCase();
    });
  }; // convert "{'in-key': val}" to "{'inKey': val}"

  var keysToCamel = function keysToCamel(obj) {
    if (obj) {
      var newObj = {};
      Object.keys(obj).forEach(function (k) {
        newObj[strToCamel(k)] = obj[k];
      });
      return newObj;
    }

    return obj;
  };

  var util = require("mdast-util-toc"); // todo: as soon as js-yaml version 4 is out
  // we can import a three-shaked version
  // https://github.com/nodeca/js-yaml/pull/558


  var yaml = require("js-yaml");

  var defaultPrefs = {
    tight: false,
    fromHeading: 2,
    toHeading: 6,
    className: "toc",
    ordered: false
  };

  var parsePrefs = function parsePrefs(prefsStrYaml) {
    try {
      return yaml.safeLoad(prefsStrYaml);
    } catch (e) {
      console.log("Can't parse TOC-Configuration", e);
      return {};
    }
  };

  var transformer = function transformer(markdownAST, pluginOptions) {
    // find position of TOC
    var index = markdownAST.children.findIndex(function (node) {
      return node.type === "code" && node.lang === "toc";
    }); // we have no TOC

    if (index === -1) {
      return;
    }

    var prefs = _objectSpread2(_objectSpread2(_objectSpread2({}, defaultPrefs), keysToCamel(pluginOptions)), keysToCamel(parsePrefs(markdownAST.children[index].value))); // For XSS safety, we only allow basic css names


    if (!prefs.className.match(/^[ a-zA-Z0-9_-]*$/)) {
      prefs.className = "toc";
    } // this ist the ast we nned consider


    var tocMarkdownAST = _objectSpread2(_objectSpread2({}, markdownAST), {}, {
      children: []
    }); // add all headings


    markdownAST.children.forEach(function (node) {
      if (node.type === "heading" && node.depth > prefs.fromHeading - 1) {
        tocMarkdownAST.children.push(node);
      }
    }); // calculate TOC

    var result = util(tocMarkdownAST, {
      maxDepth: prefs.toHeading,
      tight: prefs.tight,
      ordered: prefs.ordered,
      skip: Array.isArray(prefs.exclude) ? prefs.exclude.join("|") : prefs.exclude
    }); // insert the TOC
    // eslint-disable-next-line

    markdownAST.children = [].concat(markdownAST.children.slice(0, index), {
      type: pluginOptions.mdx ? "jsx" : "html",
      value: "<div ".concat(pluginOptions.mdx ? "className" : "class", "=\"").concat(prefs.className, "\">")
    }, result.map, {
      type: pluginOptions.mdx ? "jsx" : "html",
      value: "</div>"
    }, markdownAST.children.slice(index + 1));
  };

  module.exports = function (_ref, pluginOptions) {
    var markdownAST = _ref.markdownAST,
        _ref$markdownNode = _ref.markdownNode;
    _ref$markdownNode = _ref$markdownNode === void 0 ? {} : _ref$markdownNode;
    var _ref$markdownNode$int = _ref$markdownNode.internal;
    _ref$markdownNode$int = _ref$markdownNode$int === void 0 ? {} : _ref$markdownNode$int;
    var type = _ref$markdownNode$int.type;
    return transformer(markdownAST, _objectSpread2({
      mdx: type && type.toLowerCase() === "mdx"
    }, pluginOptions));
  };

}));
