"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/web.dom-collections.iterator.js");

require("core-js/modules/es.array.reduce.js");

require("core-js/modules/es.string.includes.js");

require("core-js/modules/es.array.sort.js");

require("core-js/modules/es.regexp.constructor.js");

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.regexp.to-string.js");

require("core-js/modules/es.string.match.js");

require("core-js/modules/es.string.replace.js");

require("core-js/modules/es.string.search.js");

require("core-js/modules/es.parse-float.js");

var _react = require("react");

var _icons = require("./icons");

var _numeral = _interopRequireDefault(require("numeral"));

var _useOutsideAlerter = _interopRequireDefault(require("./useOutsideAlerter"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const EnterpriseTable = props => {
  const [viewPortBreakpoint, setViewPortBreakpoint] = (0, _react.useState)();
  const [containerWidth, setContainerWidth] = (0, _react.useState)();
  const [filterOn, setFilterOn] = (0, _react.useState)(false);
  const [filterValues, assignFilterValues] = (0, _react.useState)({});
  const [selectedLines, setSelectedLines] = (0, _react.useState)([]);
  const [tableData, setTableData] = (0, _react.useState)([]);
  const [filteredData, setFilteredData] = (0, _react.useState)([]);
  const [commandBarButtonsEnabled, setCommandBarButtonsEnabled] = (0, _react.useState)({});
  const [sideBarButtonsEnabled, setSideBarButtonsEnabled] = (0, _react.useState)({});
  const [sortProperties, setSortProps] = (0, _react.useState)({});
  const [hamburgerMenuOpen, setHamburgerMenuOpen] = (0, _react.useState)(false);
  const tableRef = (0, _react.useRef)();
  const cell_width = 34;
  const [seachBoxShown, setSearchBoxShown] = (0, _react.useState)();
  (0, _react.useEffect)(() => {
    window.addEventListener("resize", handleWindowResize);
    handleWindowResize();
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);
  (0, _react.useEffect)(() => {
    setTableData(props.data);
  }, [props.data]);

  const toggleFilter = () => {
    if (filterOn) {
      assignFilterValues({});
      setFilterOn(false);
    } else {
      setFilterOn(true);
    }
  };

  const getSortedTableData = data => {
    let sort_col = Object.keys(sortProperties)[0];
    let _table_data = [...data];

    if (typeof sort_col === 'undefined') {
      return _table_data;
    }

    let sort_dir = sortProperties[sort_col];
    let first_val,
        second_val = "";
    let col_config = props.columns.filter(col => col.name === sort_col)[0];

    const _extractConcatenatedString = row => {
      return Object.entries(row).reduce((acc, curr) => {
        if (curr[0] === sort_col) {
          return Object.entries(curr[1]).reduce((inner_acc, curr) => {
            if (col_config.select.includes(curr[0])) {
              return inner_acc === "" ? curr[1] : inner_acc + col_config.concatChar + curr[1];
            } else {
              return inner_acc;
            }
          }, "");
        }

        return acc;
      }, "");
    };

    _table_data.sort((curr_row, next_row) => {
      if (col_config.type === "object") {
        first_val = _extractConcatenatedString(curr_row);
        second_val = _extractConcatenatedString(next_row);
      } else {
        first_val = curr_row[sort_col];
        second_val = next_row[sort_col];
      }

      if (sort_dir === "asc") {
        if (first_val < second_val) {
          return -1;
        } else if (first_val > second_val) {
          return 1;
        }

        return 0;
      } else {
        if (first_val < second_val) {
          return 1;
        } else if (first_val > second_val) {
          return -1;
        }

        return 0;
      }
    });

    return _table_data;
  };

  (0, _react.useEffect)(() => {
    if (tableData && Object.keys(sortProperties).length > 0) {
      setFilteredData(getSortedTableData(tableData));
    }
  }, [sortProperties]);

  const setSortProperties = column => {
    setSortProps(prev => {
      let _sortProps = {};

      if (Object.keys(prev).length > 0) {
        if (Object.keys(prev)[0] === column) {
          _sortProps = {
            [column]: prev[column] === "asc" ? "desc" : "asc"
          };
        } else {
          _sortProps = {
            [column]: "asc"
          };
        }
      } else {
        _sortProps = {
          [column]: "asc"
        };
      }

      return _sortProps;
    });
  };

  const setFilterValues = e => {
    if (e.target.value === "") {
      let _temp = _objectSpread({}, filterValues);

      delete _temp[e.target.name];
      assignFilterValues(_objectSpread({}, _temp));
    } else {
      assignFilterValues(prev => _objectSpread(_objectSpread({}, prev), {}, {
        [e.target.name]: e.target.value
      }));
    }
  };

  (0, _react.useEffect)(() => {
    if (tableData) {
      if (filterValues && Object.keys(filterValues).length > 0) {
        var column_types = props.columns.reduce((acc, curr) => {
          return _objectSpread(_objectSpread({}, acc), {}, {
            [curr.name]: curr.type
          });
        }, {});
        setFilteredData(tableData.filter(line => {
          let found = true;
          var match_results = "";
          Object.entries(line).forEach(_ref => {
            let [key, value] = _ref;

            if (filterValues.hasOwnProperty(key) && filterValues[key] !== "") {
              var re = new RegExp(filterValues[key], 'gi');

              switch (column_types[key]) {
                case 'object':
                  match_results = Object.entries(value).reduce((acc, curr) => {
                    if (props.columns.filter(item => item.name === key)[0].select.includes(curr[0])) {
                      return acc + curr[1];
                    }

                    return acc;
                  }, "").match(re);

                  if (!Array.isArray(match_results)) {
                    found = false;
                  }

                  break;

                case 'currency':
                case 'number':
                  let num_val = filterValues[key].replace(/\D+/g, "");

                  if (num_val.toString() === filterValues[key].toString()) {
                    // no math operators have been specified
                    match_results = value.toString().match(re);

                    if (!Array.isArray(match_results)) {
                      found = false;
                    }
                  } else {
                    let reg = new RegExp(num_val, 'g');
                    let op = filterValues[key].replace(reg, "");

                    if (num_val !== "") {
                      if (!eval(value + op + num_val)) {
                        found = false;
                      }
                    }
                  }

                  break;

                case 'string':
                  match_results = value.toString().match(re);

                  if (!Array.isArray(match_results)) {
                    found = false;
                  }

                  break;

                default:
                  break;
              }
            }
          });
          return found;
        }));
      } else {
        setFilteredData(getSortedTableData(tableData));
      }
    }
  }, [filterValues, tableData, props.columns]);

  const handleWindowResize = () => {
    // let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    let vw = props.containerRef.current.offsetWidth;
    let bp = "";

    if (vw > 1536) {
      bp = "3xl";
    } else if (vw > 1280) {
      bp = "2xl";
    } else if (vw > 1024) {
      bp = "xl";
    } else if (vw > 768) {
      bp = "lg";
    } else if (vw > 640) {
      bp = "md";
    } else if (vw > 400) {
      bp = "sm";
    } else {
      bp = "xs";
    }

    setViewPortBreakpoint(bp);
    setContainerWidth(props.containerRef.current.offsetWidth);
  };

  const toggleAllLines = val => {
    if (val) {
      setSelectedLines(filteredData.map(line => line.id));
    } else {
      setSelectedLines([]);
    }
  };

  const toggleRow = (id, val) => {
    if (val) {
      if (selectedLines.length > 0) {
        setSelectedLines([...selectedLines, id]);
      } else {
        setSelectedLines([id]);
      }
    } else {
      if (selectedLines.length > 0) {
        setSelectedLines(selectedLines.filter(line => line !== id));
      }
    }
  };

  (0, _react.useEffect)(() => {
    let _enabled_cmdbar_buttons = props.commandBarButtons.reduce((acc, btn) => {
      let _ret = props.commandBarInquireHandler(filteredData, setFilteredData, selectedLines, btn.action);

      return _objectSpread(_objectSpread({}, acc), {}, {
        [btn.action]: _ret
      });
    }, {});

    setCommandBarButtonsEnabled(_enabled_cmdbar_buttons);

    let _enabled_sidebar_buttons = props.sideBarButtons.reduce((acc, btn) => {
      let _ret = props.sideBarInquireHandler(filteredData, setFilteredData, selectedLines, btn.action);

      return _objectSpread(_objectSpread({}, acc), {}, {
        [btn.action]: _ret
      });
    }, {});

    setSideBarButtonsEnabled(_enabled_sidebar_buttons);
  }, [selectedLines]);
  const [showAdvSearch, setShowAdvSearch] = (0, _react.useState)(false);
  const [searchParams, setSearchParams] = (0, _react.useState)({});

  const search = () => {
    setShowAdvSearch(false);
    props.search(searchParams);
  };

  const onSearchParamsChange = e => {
    setSearchParams(prev => _objectSpread(_objectSpread({}, prev), {}, {
      [e.target.id]: e.target.value
    }));
  };

  (0, _react.useEffect)(() => {
    setSearchParams({});
  }, [showAdvSearch]);
  return /*#__PURE__*/React.createElement("div", {
    className: "w-full"
  }, /*#__PURE__*/React.createElement("table", {
    className: "w-full"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    className: "h-12"
  }, /*#__PURE__*/React.createElement("td", {
    className: ["md", "lg", "xl", "2xl", "3xl"].includes(viewPortBreakpoint) ? "pl-10" : "",
    colSpan: "100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-full flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("div", {
    className: ["md", "lg", "xl", "2xl", "3xl"].includes(viewPortBreakpoint) ? "block" : "hidden"
  }, props.commandBarButtons.map((btn, i) => {
    return /*#__PURE__*/React.createElement("button", {
      key: "".concat(btn.action, "-").concat(i),
      onClick: () => props.commandBarActionHandler(filteredData, setFilteredData, selectedLines, btn.action),
      className: "mr-2 " + "  " + props.style.baseStyle.commandBarButton[commandBarButtonsEnabled[btn.action] ? "enabled" : "disabled"] + " " + props.style[props.theme].commandBarButton[commandBarButtonsEnabled[btn.action] ? "enabled" : "disabled"],
      disabled: !commandBarButtonsEnabled[btn.action]
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center"
    }, /*#__PURE__*/React.createElement("span", {
      className: ""
    }, btn.label)));
  })), /*#__PURE__*/React.createElement("div", {
    className: "relative " + (["md", "lg", "xl", "2xl", "3xl"].includes(viewPortBreakpoint) ? "hidden" : "block")
  }, /*#__PURE__*/React.createElement("button", {
    className: "w-9 h-9 rounded-full bg-ss-200a",
    onClick: () => setHamburgerMenuOpen(prev => !prev)
  }, /*#__PURE__*/React.createElement(_icons.IconHamburger, {
    className: "mx-auto",
    color: "gray",
    width: "20"
  })), hamburgerMenuOpen && /*#__PURE__*/React.createElement("div", {
    className: "z-100 absolute bg-white text-gray-800 border shadow-md min-w-max overflow-hidden ",
    style: {
      marginLeft: 30,
      marginTop: -28
    }
  }, /*#__PURE__*/React.createElement("ul", {
    className: "text-xs"
  }, props.commandBarButtons.map((btn, i) => {
    return /*#__PURE__*/React.createElement("li", {
      key: i,
      className: "px-2 py-1 " + (commandBarButtonsEnabled[btn.action] ? "hover:bg-ss-100" : "")
    }, /*#__PURE__*/React.createElement("button", {
      key: "".concat(btn.action, "-").concat(i),
      onClick: () => props.commandBarActionHandler(filteredData, setFilteredData, selectedLines, btn.action),
      className: "text-left " + (commandBarButtonsEnabled[btn.action] ? "text-gray-700 hover:text-gray-900" : "text-gray-300 cursor-default"),
      disabled: !commandBarButtonsEnabled[btn.action]
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center"
    }, /*#__PURE__*/React.createElement("span", {
      className: ""
    }, btn.label))));
  })))), /*#__PURE__*/React.createElement("div", {
    className: "relative flex items-center h-7"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mr-2 text-xs text-black font-semibold h-full flex items-center font-montserrat"
  }, "Search"), /*#__PURE__*/React.createElement("input", {
    id: "main",
    value: searchParams.main,
    onChange: e => onSearchParamsChange(e),
    type: "text",
    className: "pl-1 pr-16 font-inter h-full w-60 border shadow-innera roundeda overflow-hidden outline-none",
    disabled: showAdvSearch
  }), /*#__PURE__*/React.createElement("div", {
    className: "absolute h-full flex items-center justify-center",
    style: {
      right: 0
    }
  }, !showAdvSearch && /*#__PURE__*/React.createElement("button", {
    onClick: () => search(searchParams),
    className: "h-7 w-7 text-ss-900 border-l border-t border-b bg-white flex justify-center items-center"
  }, /*#__PURE__*/React.createElement(_icons.IconMagnifyingGlass, {
    color: "rgb(70, 70, 70)",
    width: "15"
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowAdvSearch(prev => !prev),
    className: " h-7 w-7 border border-whitea rounded-ra bg-white flex justify-center items-center"
  }, /*#__PURE__*/React.createElement(_icons.IconVDots, {
    color: "rgb(40, 41, 41)",
    width: "15"
  }))), showAdvSearch && /*#__PURE__*/React.createElement("div", {
    className: "z-50 top-8 w-full absolute font-inter text-xs bg-ss-50 border shadow"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-2"
  }, props.columns.filter(item => {
    return item.visible[viewPortBreakpoint] && item.name !== "_seq_";
  }).map((column, col_index, visible_columns) => {
    return /*#__PURE__*/React.createElement("div", {
      key: col_index,
      className: "mt-2"
    }, /*#__PURE__*/React.createElement("label", null, column.label), /*#__PURE__*/React.createElement("input", {
      id: column.name,
      value: searchParams[column.name],
      onChange: e => onSearchParamsChange(e),
      type: "text",
      className: "h-7 border w-full rounded px-1 outline-none"
    }));
  })), /*#__PURE__*/React.createElement("div", {
    className: "mt-2 py-1 px-2 flex justify-end bg-ss-100"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => search(searchParams),
    className: "border roundeda bg-gradient-to-b from-white to-ss-100 text-xs px-2 py-1"
  }, "Search"))))))))), /*#__PURE__*/React.createElement("div", {
    className: "flex"
  }, /*#__PURE__*/React.createElement("div", {
    className: ["md", "lg", "xl", "2xl", "3xl"].includes(viewPortBreakpoint) ? "block" : "hidden"
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: cell_width
    }
  }, /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", {
    className: "",
    style: {
      height: filterOn ? 56 : 35
    }
  }, /*#__PURE__*/React.createElement("td", {
    className: "border border-transparent",
    colSpan: "100"
  })), props.sideBarButtons.map((btn, i) => {
    return /*#__PURE__*/React.createElement("tr", {
      key: "".concat(btn.action, "-").concat(i),
      className: "h-9"
    }, /*#__PURE__*/React.createElement("td", {
      className: " border border-transparent w-9a " + props.style.baseStyle.sideBarButton[sideBarButtonsEnabled[btn.action] ? "enabled" : "disabled"] + " " + props.style[props.theme].sideBarButton[sideBarButtonsEnabled[btn.action] ? "enabled" : "disabled"]
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => props.sideBarActionHandler(tableData, setTableData, selectedLines, btn.action),
      className: " flex items-center justify-center h-9 w-9 " + props.style.baseStyle.sideBarButton[sideBarButtonsEnabled[btn.action] ? "enabled" : "disabled"] + " " + props.style[props.theme].sideBarButton[sideBarButtonsEnabled[btn.action] ? "enabled" : "disabled"],
      disabled: !sideBarButtonsEnabled[btn.action]
    }, /*#__PURE__*/React.createElement(btn.icon, {
      className: "",
      color: "rgb(37, 99, 235)",
      width: "15"
    }))));
  }), !props.conf.addSystemButtonsToSideBar && /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 37
    }
  })))))), /*#__PURE__*/React.createElement("div", {
    className: "w-full overflow-x-auto"
  }, /*#__PURE__*/React.createElement("table", {
    ref: tableRef,
    className: ""
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement(TableHeaderRow, {
    containerWidth: containerWidth,
    columns: props.columns,
    toggleAllLines: toggleAllLines,
    filterOn: filterOn,
    toggleFilter: toggleFilter,
    filterValues: filterValues,
    setFilterValues: setFilterValues,
    sortProperties: sortProperties,
    setSortProperties: setSortProperties,
    viewPortBreakpoint: viewPortBreakpoint
  })), /*#__PURE__*/React.createElement("tbody", null, Object.keys(filteredData).length === 0 && /*#__PURE__*/React.createElement("tr", {
    className: "h-32"
  }, /*#__PURE__*/React.createElement("td", {
    className: "text-center",
    colSpan: 1000
  }, props.loadingSource === props.dataSource ? /*#__PURE__*/React.createElement("span", null, "Loading...") : /*#__PURE__*/React.createElement("span", null, "No Data"))), filteredData && filteredData.map((row, row_index) => /*#__PURE__*/React.createElement(TableDataRow, {
    lineMenu: props.lineMenu,
    lineMenuActionHandler: props.lineMenuActionHandler,
    toggleRow: toggleRow,
    rowSelected: selectedLines.filter(x => x === row.id).length > 0,
    key: row_index,
    isLastRow: row_index === filteredData.length - 1,
    data: row,
    columns: props.columns,
    lineMenuInquireHandler: props.lineMenuInquireHandler,
    viewPortBreakpoint: viewPortBreakpoint
  })), props.conf.showFilterSum && filteredData && /*#__PURE__*/React.createElement(FilterSumRow, {
    conf: props.conf,
    columns: props.columns,
    data: filteredData,
    isFilterOn: filterOn,
    viewPortBreakpoint: viewPortBreakpoint
  }), props.conf.showGrandSum && tableData && /*#__PURE__*/React.createElement(ServerSumRow, {
    conf: props.conf,
    columns: props.columns,
    data: tableData,
    isFilterOn: filterOn,
    viewPortBreakpoint: viewPortBreakpoint
  }))))), Object.keys(filteredData).length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "float-right mt-3"
  }, /*#__PURE__*/React.createElement(Paginator, null)));
};

const Paginator = () => {
  return /*#__PURE__*/React.createElement("div", {
    className: "flex items-center border p-1"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: null,
    className: "text-xs font-inter text-gray-600 p-1 mr-2"
  }, "First"), /*#__PURE__*/React.createElement("button", {
    onClick: null,
    className: "text-xs font-inter text-gray-600 p-1 px-2 mr-2"
  }, "4"), /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-nunito font-semibold border p-1 px-2 mr-2",
    style: {
      color: "rgb(37, 99, 235)",
      borderColor: "rgb(37, 99, 235)"
    }
  }, "5"), /*#__PURE__*/React.createElement("button", {
    onClick: null,
    className: "text-xs font-inter text-gray-600  p-1  px-2 mr-2"
  }, "6"), /*#__PURE__*/React.createElement("button", {
    onClick: null,
    className: "text-xs font-inter text-gray-600 p-1 "
  }, "Last"));
};

const TableDataRow = _ref2 => {
  let {
    lineMenu,
    lineMenuActionHandler,
    data,
    columns,
    isLastRow,
    rowSelected,
    toggleRow,
    lineMenuInquireHandler,
    viewPortBreakpoint
  } = _ref2;
  const [lineMenuOpen, setLineMenuOpen] = (0, _react.useState)(false);
  const wrapperRef = (0, _react.useRef)(null);
  (0, _useOutsideAlerter.default)(wrapperRef);

  const composeParams = param => {
    return data[param];
  };

  return /*#__PURE__*/React.createElement("tr", {
    className: "h-9 transition-colors duration-500 hover:bg-ss-100 hover:shadow-md " + (rowSelected || lineMenuOpen ? "bg-ss-100" : "")
  }, /*#__PURE__*/React.createElement("td", {
    className: "text-xs border-l border-r bg-ss-100 " + (isLastRow ? " border-b " : " border-b ")
  }, /*#__PURE__*/React.createElement("button", {
    className: "h-9 w-9 flex justify-center items-center transition-colors ",
    onClick: () => setLineMenuOpen(prev => !prev)
  }, /*#__PURE__*/React.createElement(_icons.IconVDots, {
    className: "",
    color: "gray",
    width: "15"
  })), lineMenuOpen && /*#__PURE__*/React.createElement("div", {
    className: "z-100 absolute bg-white text-gray-800 border shadow-md min-w-max overflow-hidden ",
    style: {
      marginLeft: 30,
      marginTop: -28
    }
  }, /*#__PURE__*/React.createElement("ul", {
    ref: wrapperRef,
    className: ""
  }, /*#__PURE__*/React.createElement("li", {
    className: "px-2 py-1 hover:bg-ss-100 hover:text-gray-900 " + (["md", "lg", "xl", "2xl", "3xl"].includes(viewPortBreakpoint) ? "hidden" : "block")
  }, /*#__PURE__*/React.createElement("button", {
    className: "w-full text-left flex"
  }, /*#__PURE__*/React.createElement(_icons.IconEdit, {
    className: "mr-2",
    width: "15",
    color: "rgb(59, 130, 246)"
  }), " Edit")), /*#__PURE__*/React.createElement("li", {
    className: "px-2 py-1 hover:bg-ss-100 hover:text-gray-900 " + (["md", "lg", "xl", "2xl", "3xl"].includes(viewPortBreakpoint) ? "hidden" : "block")
  }, /*#__PURE__*/React.createElement("button", {
    className: "w-full text-left flex"
  }, /*#__PURE__*/React.createElement(_icons.IconTrash, {
    className: "mr-2",
    width: "15",
    color: "rgb(59, 130, 246)"
  }), " Delete")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("hr", null)), lineMenu.map(item => /*#__PURE__*/React.createElement("li", {
    key: item.action,
    className: "px-2 py-1 " + (lineMenuInquireHandler(item.action, data.id) ? "hover:bg-ss-100" : "")
  }, /*#__PURE__*/React.createElement("button", {
    className: "text-left " + (lineMenuInquireHandler(item.action, data.id) ? "text-gray-700 hover:text-gray-900" : "text-gray-300 cursor-default"),
    onClick: () => {
      setLineMenuOpen(false);
      lineMenuActionHandler(item.action, item.params.map(param => composeParams(param)));
    },
    disabled: !lineMenuInquireHandler(item.action, data.id)
  }, item.label)))))), /*#__PURE__*/React.createElement("td", {
    className: "text-gray-900 text-xs border-r " + (isLastRow ? "border-b" : "border-b")
  }, /*#__PURE__*/React.createElement("div", {
    className: "mx-auto flex items-center justify-center rounded-full transition-colors"
  }, /*#__PURE__*/React.createElement("input", {
    className: "outline-none",
    type: "checkbox",
    checked: rowSelected,
    onChange: e => toggleRow(data.id, e.target.checked)
  }))), columns.filter(item => item.visible[viewPortBreakpoint]).map((column, col_index, visible_columns) => {
    let value = "",
        obj = {};

    if (column.type === "object") {
      obj = data[column.name];
      value = Object.entries(obj).reduce((acc, curr) => {
        if (column.select.includes(curr[0])) {
          return acc === "" ? curr[1] : acc + column.concatChar + curr[1];
        } else {
          return acc;
        }
      }, "");
    } else {
      value = data[column.name];

      if (column.type === "currency") {
        value = (0, _numeral.default)(data[column.name]).format('0,0.00');
      }
    }

    return /*#__PURE__*/React.createElement("td", {
      key: col_index,
      className: "\n                px-2 font-roboto text-xs text-".concat(column.align, " ") + (isLastRow ? "border-b" : "border-b") + (visible_columns.length === col_index + 1 ? " border-r " : "")
    }, value);
  }));
};

const TableHeaderRow = _ref3 => {
  let {
    containerWidth,
    columns,
    toggleAllLines,
    filterOn,
    toggleFilter,
    filterValues,
    setFilterValues,
    sortProperties,
    setSortProperties,
    viewPortBreakpoint
  } = _ref3;
  const [columnWidthFactor, setColumnWidthFactor] = (0, _react.useState)(0);
  const [colWidth, setColWidth] = (0, _react.useState)();
  const [availWidth, setAvailWidth] = (0, _react.useState)();
  const ellipsis_width = 39;
  const checkbox_width = 34;
  const sidebar_width = 40;
  (0, _react.useEffect)(() => {
    if (containerWidth) {
      let width_factor = 0;
      let cols_width = columns.filter(item => item.visible[viewPortBreakpoint]).reduce((width, column) => width + column.length, 0);
      setColWidth(cols_width);
      let available_width = containerWidth - sidebar_width - ellipsis_width - checkbox_width;
      setAvailWidth(available_width);
      setColumnWidthFactor(available_width / cols_width);
    }
  }, [containerWidth, columns]);
  return /*#__PURE__*/React.createElement("tr", {
    className: filterOn ? "h-14 bg-ss-200" : "h-9"
  }, /*#__PURE__*/React.createElement("td", {
    className: "border-b text-center " + (filterOn ? " border-l border-t" : ""),
    style: {
      minWidth: ellipsis_width,
      width: ellipsis_width
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "rounded-fulla transition-colors hover:bg-".concat(filterOn ? "gray-100a" : "gray-200a", " h-7a w-7a"),
    onClick: () => toggleFilter(prev => !prev)
  }, /*#__PURE__*/React.createElement(_icons.IconFilter, {
    className: filterOn ? "hidden" : "",
    color: "rgb(37, 99, 235)",
    width: "18"
  }), /*#__PURE__*/React.createElement(_icons.IconFilterX, {
    className: filterOn ? "" : "hidden",
    color: "rgb(37, 99, 235)",
    width: "18"
  }))), /*#__PURE__*/React.createElement("td", {
    className: "border-b " + (filterOn ? " border-t" : ""),
    style: {
      minWidth: checkbox_width,
      width: checkbox_width
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "mx-auto flex items-center justify-center rounded-full transition-colors  text-gray-600 hover:text-gray-900 h-7 w-7"
  }, /*#__PURE__*/React.createElement("input", {
    className: "",
    type: "checkbox",
    onChange: e => toggleAllLines(e.target.checked)
  }))), columns.filter(item => item.visible[viewPortBreakpoint]).map((column, col_index, visible_columns) => {
    let justification = "";

    switch (column.align) {
      case "left":
        justification = "start";
        break;

      case "right":
        justification = "end";
        break;

      default:
        justification = "center";
        break;
    }

    return /*#__PURE__*/React.createElement("td", {
      key: col_index,
      className: (Object.keys(sortProperties)[0] === column.name ? sortProperties[column.name] === "asc" ? "abg-gradient-to-b" : "abg-gradient-to-t" : "") + " from-transparent to-ss-200 border-b text-center px-2 " + (filterOn ? visible_columns.length === col_index + 1 ? "border-r  border-t" : " border-t" : ""),
      style: {
        minWidth: column.length,
        width: columnWidthFactor * column.length
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: " flex justify-".concat(justification)
    }, /*#__PURE__*/React.createElement("button", {
      className: "flex items-center  font-montserrat text-xs font-semibold text-blue-600 hover:text-blue-700 ",
      onClick: () => setSortProperties(column.name)
    }, column.label, /*#__PURE__*/React.createElement(_icons.IconSortAsc, {
      className: "ml-2 " + (sortProperties[column.name] === "" ? "hidden" : sortProperties[column.name] === "asc" ? "" : "hidden"),
      width: "10"
    }), /*#__PURE__*/React.createElement(_icons.IconSortDesc, {
      className: "ml-2 " + (sortProperties[column.name] === "" ? "hidden" : sortProperties[column.name] === "desc" ? "" : "hidden"),
      width: "10"
    }))), /*#__PURE__*/React.createElement("input", {
      name: column.name,
      value: filterValues[column.name] || '',
      onChange: e => setFilterValues(e),
      type: "text",
      className: " mt-1 w-full border px-1 h-6 outline-none " + (filterOn ? "" : "hidden"),
      autoComplete: "off"
    }));
  }));
};

const FilterSumRow = _ref4 => {
  let {
    conf,
    columns,
    data,
    isFilterOn,
    viewPortBreakpoint
  } = _ref4;

  const calcFilterSum = column_name => {
    return data.reduce((acc, curr) => {
      return acc + parseFloat(curr[column_name].toString().replace(",", ""));
    }, 0);
  };

  return /*#__PURE__*/React.createElement("tr", {
    className: "h-9 border-t font-roboto font-semibold text-xs " + (isFilterOn ? "" : "hidden")
  }, /*#__PURE__*/React.createElement("td", {
    className: "px-2 text-xla",
    colSpan: "3"
  }, "Filter Totals"), columns.filter(item => item.visible[viewPortBreakpoint]).filter(_ => {
    return _.name !== '_seq_';
  }).map(item => {
    if (conf.sumColumns.includes(item.name)) {
      return /*#__PURE__*/React.createElement("td", {
        key: item.name,
        className: "text-right px-2"
      }, (0, _numeral.default)(calcFilterSum(item.name)).format('0,0.00'));
    }

    return /*#__PURE__*/React.createElement("td", {
      className: "",
      key: item.name
    });
  }));
};

const ServerSumRow = _ref5 => {
  let {
    conf,
    columns,
    data,
    isFilterOn,
    viewPortBreakpoint
  } = _ref5;

  const calcServerSum = column_name => {
    return data.reduce((acc, curr) => {
      return acc + parseFloat(curr[column_name].toString().replace(",", ""));
    }, 0);
  };

  return /*#__PURE__*/React.createElement("tr", {
    className: "h-9 border-t font-roboto font-semibold text-xs " + (isFilterOn ? "opacity-30" : "")
  }, /*#__PURE__*/React.createElement("td", {
    className: "px-2 text-xla",
    colSpan: "3"
  }, "Grand Totals"), columns.filter(item => item.visible[viewPortBreakpoint]).filter(_ => {
    return _.name !== '_seq_';
  }).map(item => {
    if (conf.sumColumns.includes(item.name)) {
      return /*#__PURE__*/React.createElement("td", {
        key: item.name,
        className: "text-right px-2"
      }, (0, _numeral.default)(calcServerSum(item.name)).format('0,0.00'));
    }

    return /*#__PURE__*/React.createElement("td", {
      className: "",
      key: item.name
    });
  }));
};

var _default = EnterpriseTable;
exports.default = _default;