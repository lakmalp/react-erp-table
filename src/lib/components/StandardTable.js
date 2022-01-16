import { useEffect, useRef, useState } from "react"
import { IconFilter, IconFilterX, IconVDots, IconHamburger, IconSortAsc, IconSortDesc, IconMagnifyingGlass, IconEdit, IconTrash } from "./icons"
import numeral from "numeral";
import useOutsideAlerter from "../hooks/useOutsideAlerter";

const StandardTable = (props) => {
  const [viewPortBreakpoint, setViewPortBreakpoint] = useState();
  const [containerWidth, setContainerWidth] = useState();
  const [filterOn, setFilterOn] = useState(false);
  const [filterValues, assignFilterValues] = useState({});
  const [selectedLines, setSelectedLines] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [commandBarButtonsEnabled, setCommandBarButtonsEnabled] = useState({});
  const [sideBarButtonsEnabled, setSideBarButtonsEnabled] = useState({});
  const [sortProperties, setSortProps] = useState({});
  const [hamburgerMenuOpen, setHamburgerMenuOpen] = useState(false);
  const tableRef = useRef();
  const cell_width = 34
  const [seachBoxShown, setSearchBoxShown] = useState();

  useEffect(() => {
    window.addEventListener("resize", handleWindowResize);
    handleWindowResize();

    return (() => {
      window.removeEventListener("resize", handleWindowResize);
    })
  }, [])

  useEffect(() => {
    setTableData(props.data)
  }, [props.data])

  const toggleFilter = () => {
    if (filterOn) {
      assignFilterValues({})
      setFilterOn(false)
    } else {
      setFilterOn(true)
    }
  }

  const getSortedTableData = (data) => {
    let sort_col = Object.keys(sortProperties)[0];
    let _table_data = [...data];
    if (typeof sort_col === 'undefined') {
      return _table_data;
    }
    let sort_dir = sortProperties[sort_col];
    let first_val, second_val = "";
    let col_config = props.columns.filter(col => col.name === sort_col)[0];

    const _extractConcatenatedString = (row) => {
      return Object.entries(row).reduce((acc, curr) => {
        if (curr[0] === sort_col) {
          return Object.entries(curr[1]).reduce((inner_acc, curr) => {
            if (col_config.select.includes(curr[0])) {
              return (inner_acc === "" ? curr[1] : (inner_acc + col_config.concatChar + curr[1]));
            } else {
              return inner_acc;
            }
          }, "")
        }
        return acc;
      }, "")
    }

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
    })

    return _table_data;
  }

  useEffect(() => {
    if (tableData && (Object.keys(sortProperties).length > 0)) {
      setFilteredData(getSortedTableData(tableData))
    }
  }, [sortProperties])

  const setSortProperties = (column) => {
    setSortProps(prev => {
      let _sortProps = {};
      if (Object.keys(prev).length > 0) {
        if (Object.keys(prev)[0] === column) {
          _sortProps = { [column]: (prev[column] === "asc" ? "desc" : "asc") }
        } else {
          _sortProps = { [column]: "asc" }
        }
      } else {
        _sortProps = { [column]: "asc" }
      }
      return _sortProps;
    })
  }

  const setFilterValues = (e) => {
    if (e.target.value === "") {
      let _temp = { ...filterValues }
      delete _temp[e.target.name];
      assignFilterValues({ ..._temp })
    } else {
      assignFilterValues(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }
  }

  useEffect(() => {
    if (tableData) {
      if ((filterValues) && (Object.keys(filterValues).length > 0)) {
        var column_types = props.columns.reduce((acc, curr) => {
          return { ...acc, [curr.name]: curr.type }
        }, {})
        setFilteredData(
          tableData.filter(line => {
            let found = true
            var match_results = ""
            Object.entries(line).forEach(([key, value]) => {
              if (filterValues.hasOwnProperty(key) && filterValues[key] !== "") {
                var re = new RegExp(filterValues[key], 'gi');
                switch (column_types[key]) {
                  case 'object':
                    match_results = Object.entries(value).reduce((acc, curr) => {
                      if (props.columns.filter(item => item.name === key)[0].select.includes(curr[0])) {
                        return acc + curr[1]
                      }
                      return acc
                    }, "").match(re)
                    if (!Array.isArray(match_results)) {
                      found = false
                    }
                    break;
                  case 'currency':
                  case 'number':
                    let num_val = filterValues[key].replace(/\D+/g, "")
                    if (num_val.toString() === filterValues[key].toString()) { // no math operators have been specified
                      match_results = value.toString().match(re)
                      if (!Array.isArray(match_results)) {
                        found = false
                      }
                    } else {
                      let reg = new RegExp(num_val, 'g')
                      let op = filterValues[key].replace(reg, "")
                      if (num_val !== "") {
                        if (!eval(value + op + num_val)) {
                          found = false
                        }
                      }
                    }
                    break;
                  case 'string':
                    match_results = value.toString().match(re)
                    if (!Array.isArray(match_results)) {
                      found = false
                    }
                    break;

                  default:
                    break;
                }
              }
            })
            return found
          })
        )
      } else {
        setFilteredData(getSortedTableData(tableData))
      }
    }
  }, [filterValues, tableData, props.columns])

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
    setViewPortBreakpoint(bp)
    setContainerWidth(props.containerRef.current.offsetWidth)
  }

  const toggleAllLines = (val) => {
    if (val) {
      setSelectedLines(filteredData.map(line => line.id))
    } else {
      setSelectedLines([])
    }
  }

  const toggleRow = (id, val) => {
    if (val) {
      if (selectedLines.length > 0) {
        setSelectedLines([...selectedLines, id])
      } else {
        setSelectedLines([id])
      }
    } else {
      if (selectedLines.length > 0) {
        setSelectedLines(selectedLines.filter(line => line !== id))
      }
    }
  }

  useEffect(() => {
    let _enabled_cmdbar_buttons = props.commandBarButtons.reduce((acc, btn) => {
      let _ret = props.commandBarInquireHandler(filteredData, setFilteredData, selectedLines, btn.action)
      return { ...acc, [btn.action]: _ret }
    }, {})
    setCommandBarButtonsEnabled(_enabled_cmdbar_buttons)

    let _enabled_sidebar_buttons = props.sideBarButtons.reduce((acc, btn) => {
      let _ret = props.sideBarInquireHandler(filteredData, setFilteredData, selectedLines, btn.action)
      return { ...acc, [btn.action]: _ret }
    }, {})
    setSideBarButtonsEnabled(_enabled_sidebar_buttons)
  }, [selectedLines])

  const [showAdvSearch, setShowAdvSearch] = useState(false);
  const [searchParams, setSearchParams] = useState({});

  const search = () => {
    setShowAdvSearch(false)
    props.search(searchParams);
  }

  const onSearchParamsChange = (e) => {
    setSearchParams(prev => ({ ...prev, [e.target.id]: e.target.value }))
  }

  useEffect(() => {
    setSearchParams({});
  }, [showAdvSearch])

  return (
    <div className="w-full">
      <table className="w-full">
        <thead>
          <tr className="h-12">
            <td className={(["md", "lg", "xl", "2xl", "3xl"].includes(viewPortBreakpoint) ? "pl-10" : "")} colSpan="100">
              <div className="w-full flex items-center justify-between">
                <div className={(["md", "lg", "xl", "2xl", "3xl"].includes(viewPortBreakpoint) ? "block" : "hidden")}>
                  {
                    props.commandBarButtons.map((btn, i) => {
                      return (
                        <button
                          key={`${btn.action}-${i}`}
                          onClick={() => props.commandBarActionHandler(filteredData, setFilteredData, selectedLines, btn.action)}
                          className={
                            "mr-2 " +
                            "  " +
                            props.style.baseStyle.commandBarButton[(commandBarButtonsEnabled[btn.action] ? "enabled" : "disabled")] + " " +
                            props.style[props.theme].commandBarButton[(commandBarButtonsEnabled[btn.action] ? "enabled" : "disabled")]
                          }
                          disabled={!commandBarButtonsEnabled[btn.action]}
                        >
                          <div className="flex items-center">
                            <span className="">{btn.label}</span>
                          </div>
                        </button>
                      )
                    })
                  }
                </div>
                <div className={"relative " + (["md", "lg", "xl", "2xl", "3xl"].includes(viewPortBreakpoint) ? "hidden" : "block")}>
                  <button className="w-9 h-9 rounded-full bg-ss-200a" onClick={() => setHamburgerMenuOpen(prev => !prev)}><IconHamburger className="mx-auto" color="gray" width="20" /></button>
                  {
                    hamburgerMenuOpen &&
                    <div className="z-100 absolute bg-white text-gray-800 border shadow-md min-w-max overflow-hidden " style={{ marginLeft: 30, marginTop: -28 }}>
                      <ul className="text-xs">
                        {
                          props.commandBarButtons.map((btn, i) => {
                            return (
                              <li key={i} className={"px-2 py-1 " + (commandBarButtonsEnabled[btn.action] ? "hover:bg-ss-100" : "")}>
                                <button
                                  key={`${btn.action}-${i}`}
                                  onClick={() => props.commandBarActionHandler(filteredData, setFilteredData, selectedLines, btn.action)}
                                  className={"text-left " + (commandBarButtonsEnabled[btn.action] ? "text-gray-700 hover:text-gray-900" : "text-gray-300 cursor-default")}
                                  disabled={!commandBarButtonsEnabled[btn.action]}
                                >
                                  <div className="flex items-center">
                                    <span className="">{btn.label}</span>
                                  </div>
                                </button>
                              </li>
                            )
                          })
                        }
                      </ul>
                    </div>
                  }
                </div>
                <div className="relative flex items-center h-7">
                  <span className="mr-2 text-xs text-black font-semibold h-full flex items-center font-montserrat">Search</span>
                  <input id="main" value={searchParams.main} onChange={e => onSearchParamsChange(e)} type="text" className="pl-1 pr-16 font-inter h-full w-60 border shadow-innera roundeda overflow-hidden outline-none" disabled={showAdvSearch} />
                  <div className="absolute h-full flex items-center justify-center" style={{ right: 0 }}>
                    {
                      !showAdvSearch &&
                      <button onClick={() => search(searchParams)} className="h-7 w-7 text-ss-900 border-l border-t border-b bg-white flex justify-center items-center">
                        <IconMagnifyingGlass color="rgb(70, 70, 70)" width="15" />
                      </button>
                    }
                    <button onClick={() => setShowAdvSearch(prev => !prev)} className=" h-7 w-7 border border-whitea rounded-ra bg-white flex justify-center items-center">
                      <IconVDots color="rgb(40, 41, 41)" width="15" />
                    </button>
                  </div>
                  {
                    showAdvSearch &&
                    <div className="z-50 top-8 w-full absolute font-inter text-xs bg-ss-50 border shadow">
                      <div className="p-2">
                        {
                          props.columns
                            .filter(item => {
                              return (item.visible[viewPortBreakpoint] && item.name !== "_seq_")
                            })
                            .map((column, col_index, visible_columns) => {
                              return (
                                <div key={col_index} className="mt-2">
                                  <label>{column.label}</label>
                                  <input id={column.name} value={searchParams[column.name]} onChange={e => onSearchParamsChange(e)} type="text" className="h-7 border w-full rounded px-1 outline-none" />
                                </div>
                              );
                            })
                        }
                      </div>
                      <div className="mt-2 py-1 px-2 flex justify-end bg-ss-100">
                        <button onClick={() => search(searchParams)} className="border roundeda bg-gradient-to-b from-white to-ss-100 text-xs px-2 py-1">Search</button>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </td>
          </tr>
        </thead>
      </table>
      <div className="flex">
        <div className={(["md", "lg", "xl", "2xl", "3xl"].includes(viewPortBreakpoint) ? "block" : "hidden")}>
          <table style={{ width: cell_width }}>
            <tbody>
              <tr className="" style={{ height: (filterOn ? 56 : 35) }}><td className="border border-transparent" colSpan="100"></td></tr>
              {
                props.sideBarButtons.map((btn, i) => {
                  return (
                    <tr key={`${btn.action}-${i}`} className="h-9">
                      <td
                        className={
                          " border border-transparent w-9a " +
                          props.style.baseStyle.sideBarButton[(sideBarButtonsEnabled[btn.action] ? "enabled" : "disabled")] + " " +
                          props.style[props.theme].sideBarButton[(sideBarButtonsEnabled[btn.action] ? "enabled" : "disabled")]
                        }
                      >

                        <button
                          onClick={() => props.sideBarActionHandler(tableData, setTableData, selectedLines, btn.action)}
                          className={
                            " flex items-center justify-center h-9 w-9 " +
                            props.style.baseStyle.sideBarButton[(sideBarButtonsEnabled[btn.action] ? "enabled" : "disabled")] + " " +
                            props.style[props.theme].sideBarButton[(sideBarButtonsEnabled[btn.action] ? "enabled" : "disabled")]
                          }
                          disabled={!sideBarButtonsEnabled[btn.action]}
                        >
                          <btn.icon className="" color="rgb(37, 99, 235)" width="15" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              }
              {
                !props.conf.addSystemButtonsToSideBar &&
                <tr><td><div style={{ width: 37 }}></div></td></tr>
              }
            </tbody>
          </table>
        </div>
        <div className="w-full overflow-x-auto">
          <table ref={tableRef}
            className=""
          >
            <thead>
              <TableHeaderRow
                containerWidth={containerWidth}
                columns={props.columns}
                toggleAllLines={toggleAllLines}
                filterOn={filterOn}
                toggleFilter={toggleFilter}
                filterValues={filterValues}
                setFilterValues={setFilterValues}
                sortProperties={sortProperties}
                setSortProperties={setSortProperties}
                viewPortBreakpoint={viewPortBreakpoint}
              />
            </thead>
            <tbody>
              {
                (Object.keys(filteredData).length === 0) &&
                <tr className="h-32">
                  <td className="text-center" colSpan={1000}>
                    {
                      (props.loadingSource === props.dataSource ? <span>Loading...</span> : <span>No Data</span>)
                    }
                  </td>
                </tr>
              }
              {
                filteredData && filteredData.map((row, row_index) =>
                  <TableDataRow
                    lineMenu={props.lineMenu}
                    lineMenuActionHandler={props.lineMenuActionHandler}
                    toggleRow={toggleRow}
                    rowSelected={selectedLines.filter(x => x === row.id).length > 0}
                    key={row_index}
                    isLastRow={(row_index === filteredData.length - 1)}
                    data={row}
                    columns={props.columns}
                    lineMenuInquireHandler={props.lineMenuInquireHandler}
                    viewPortBreakpoint={viewPortBreakpoint}
                  />
                )
              }
              {
                (props.conf.showFilterSum) && filteredData &&
                <FilterSumRow conf={props.conf} columns={props.columns} data={filteredData} isFilterOn={filterOn} viewPortBreakpoint={viewPortBreakpoint} />
              }
              {
                (props.conf.showGrandSum) && tableData &&
                <ServerSumRow conf={props.conf} columns={props.columns} data={tableData} isFilterOn={filterOn} viewPortBreakpoint={viewPortBreakpoint} />
              }
            </tbody>
          </table>
        </div>
      </div>
      {
        (Object.keys(filteredData).length > 0) &&
        <div className="float-right mt-3"><Paginator /></div>
      }
    </div>
  )
}

const Paginator = () => {
  return (
    <div className="flex items-center border p-1">
      <button onClick={null} className="text-xs font-inter text-gray-600 p-1 mr-2">First</button>
      <button onClick={null} className="text-xs font-inter text-gray-600 p-1 px-2 mr-2">4</button>
      <div className="text-xs font-nunito font-semibold border p-1 px-2 mr-2" style={{ color: "rgb(37, 99, 235)", borderColor: "rgb(37, 99, 235)" }}>5</div>
      <button onClick={null} className="text-xs font-inter text-gray-600  p-1  px-2 mr-2">6</button>
      <button onClick={null} className="text-xs font-inter text-gray-600 p-1 ">Last</button>
    </div>
  )
}

const TableDataRow = ({ lineMenu, lineMenuActionHandler, data, columns, isLastRow, rowSelected, toggleRow, lineMenuInquireHandler, viewPortBreakpoint }) => {
  const [lineMenuOpen, setLineMenuOpen] = useState(false)
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef)
  const composeParams = (param) => {
    return data[param];
  }
  return (
    <tr className={"h-9 transition-colors duration-500 hover:bg-ss-100 hover:shadow-md " + ((rowSelected || lineMenuOpen) ? "bg-ss-100" : "")}>
      <td className={"text-xs border-l border-r bg-ss-100 " + (isLastRow ? " border-b " : " border-b ")}>
        <button className="h-9 w-9 flex justify-center items-center transition-colors " onClick={() => setLineMenuOpen(prev => !prev)}>
          <IconVDots className="" color="gray" width="15" />
        </button>
        {
          lineMenuOpen &&
          <div className="z-100 absolute bg-white text-gray-800 border shadow-md min-w-max overflow-hidden " style={{ marginLeft: 30, marginTop: -28 }}>
            <ul ref={wrapperRef} className="">
              <li className={"px-2 py-1 hover:bg-ss-100 hover:text-gray-900 " + (["md", "lg", "xl", "2xl", "3xl"].includes(viewPortBreakpoint) ? "hidden" : "block")}><button className="w-full text-left flex"><IconEdit className="mr-2" width="15" color="rgb(59, 130, 246)" /> Edit</button></li>
              <li className={"px-2 py-1 hover:bg-ss-100 hover:text-gray-900 " + (["md", "lg", "xl", "2xl", "3xl"].includes(viewPortBreakpoint) ? "hidden" : "block")}><button className="w-full text-left flex"><IconTrash className="mr-2" width="15" color="rgb(59, 130, 246)" /> Delete</button></li>
              <li><hr /></li>
              {
                lineMenu.map(item =>
                  <li key={item.action} className={"px-2 py-1 " + (lineMenuInquireHandler(item.action, data.id) ? "hover:bg-ss-100" : "")}>
                    <button
                      className={"text-left " + (lineMenuInquireHandler(item.action, data.id) ? "text-gray-700 hover:text-gray-900" : "text-gray-300 cursor-default")}
                      onClick={() => {
                        setLineMenuOpen(false);
                        lineMenuActionHandler(item.action, item.params.map(param => composeParams(param)))
                      }}
                      disabled={!lineMenuInquireHandler(item.action, data.id)}
                    >
                      {item.label}
                    </button>
                  </li>
                )
              }
            </ul>
          </div>
        }
      </td>
      <td className={"text-gray-900 text-xs border-r " + (isLastRow ? "border-b" : "border-b")}>
        <div className="mx-auto flex items-center justify-center rounded-full transition-colors">
          <input className="outline-none" type="checkbox" checked={rowSelected} onChange={(e) => toggleRow(data.id, e.target.checked)} />
        </div>
      </td>
      {
        columns.filter(item => item.visible[viewPortBreakpoint]).map((column, col_index, visible_columns) => {
          let value = "", obj = {};
          if (column.type === "object") {
            obj = data[column.name];
            value = Object.entries(obj).reduce((acc, curr) => {
              if (column.select.includes(curr[0])) {
                return (acc === "" ? curr[1] : (acc + column.concatChar + curr[1]));
              } else {
                return acc;
              }
            }, "")
          } else {
            value = data[column.name];
            if (column.type === "currency") {
              value = numeral(data[column.name]).format('0,0.00')
            }
          }
          return (
            <td
              key={col_index}
              className={`
                px-2 font-roboto text-xs text-${column.align} ` +
                (isLastRow ? "border-b" : "border-b") +
                (((visible_columns.length) === (col_index + 1)) ? " border-r " : "")}
            >
              {value}
            </td>
          )
        })
      }
    </tr>
  )
}

const TableHeaderRow = ({ containerWidth, columns, toggleAllLines, filterOn, toggleFilter, filterValues, setFilterValues, sortProperties, setSortProperties, viewPortBreakpoint }) => {
  const [columnWidthFactor, setColumnWidthFactor] = useState(0)
  const [colWidth, setColWidth] = useState();
  const [availWidth, setAvailWidth] = useState();
  const ellipsis_width = 39
  const checkbox_width = 34
  const sidebar_width = 40

  useEffect(() => {
    if (containerWidth) {
      let width_factor = 0;
      let cols_width = columns.filter(item => item.visible[viewPortBreakpoint]).reduce((width, column) => width + column.length, 0);
      setColWidth(cols_width);
      let available_width = containerWidth - sidebar_width - ellipsis_width - checkbox_width;
      setAvailWidth(available_width);
      setColumnWidthFactor(available_width / cols_width);
    }
  }, [containerWidth, columns])

  return (
    <tr className={filterOn ? "h-14 bg-ss-200" : "h-9"}>
      <td className={"border-b text-center " + (filterOn ? " border-l border-t" : "")} style={{ minWidth: ellipsis_width, width: ellipsis_width }}>
        <button className={`rounded-fulla transition-colors hover:bg-${(filterOn ? "gray-100a" : "gray-200a")} h-7a w-7a`} onClick={() => toggleFilter(prev => !prev)}>
          <IconFilter className={(filterOn ? "hidden" : "")} color="rgb(37, 99, 235)" width="18" />
          <IconFilterX className={(filterOn ? "" : "hidden")} color="rgb(37, 99, 235)" width="18" />
        </button>
      </td>
      <td className={"border-b " + (filterOn ? " border-t" : "")} style={{ minWidth: checkbox_width, width: checkbox_width }}>
        <div className="mx-auto flex items-center justify-center rounded-full transition-colors  text-gray-600 hover:text-gray-900 h-7 w-7">
          <input className="" type="checkbox" onChange={(e) => toggleAllLines(e.target.checked)} />
        </div>
      </td>
      {
        columns
          .filter(item => item.visible[viewPortBreakpoint])
          .map((column, col_index, visible_columns) => {
            let justification = ""
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
            return <td key={col_index} className={((Object.keys(sortProperties)[0] === column.name ? (sortProperties[column.name] === "asc" ? "abg-gradient-to-b" : "abg-gradient-to-t") : "")) + ` from-transparent to-ss-200 border-b text-center px-2 ` + (filterOn ? (visible_columns.length === col_index + 1 ? "border-r  border-t" : " border-t") : "")} style={{ minWidth: column.length, width: (columnWidthFactor * column.length) }}>
              <div className={` flex justify-${justification}`}>
                <button className={`flex items-center  font-montserrat text-xs font-semibold text-blue-600 hover:text-blue-700 `} onClick={() => setSortProperties(column.name)}>
                  {column.label}
                  <IconSortAsc className={"ml-2 " + (sortProperties[column.name] === "" ? "hidden" : (sortProperties[column.name] === "asc" ? "" : "hidden"))} width="10" />
                  <IconSortDesc className={"ml-2 " + (sortProperties[column.name] === "" ? "hidden" : (sortProperties[column.name] === "desc" ? "" : "hidden"))} width="10" />
                </button>
              </div>
              <input
                name={column.name}
                value={filterValues[column.name] || ''}
                onChange={(e) => setFilterValues(e)}
                type="text"
                className={" mt-1 w-full border px-1 h-6 outline-none " + (filterOn ? "" : "hidden")}
                autoComplete="off"
              />
            </td>
          })
      }
    </tr>
  )
}

const FilterSumRow = ({ conf, columns, data, isFilterOn, viewPortBreakpoint }) => {
  const calcFilterSum = (column_name) => {
    return data.reduce((acc, curr) => {
      return acc + parseFloat(curr[column_name].toString().replace(",", ""))
    }, 0)
  }

  return (
    <tr className={"h-9 border-t font-roboto font-semibold text-xs " + (isFilterOn ? "" : "hidden")}>
      <td className="px-2 text-xla" colSpan="3">Filter Totals</td>
      {
        columns
          .filter(item => item.visible[viewPortBreakpoint])
          .filter((_) => {
            return (_.name !== '_seq_')
          })
          .map(item => {
            if (conf.sumColumns.includes(item.name)) {
              return <td key={item.name} className="text-right px-2">{numeral(calcFilterSum(item.name)).format('0,0.00')}</td>
            }
            return <td className="" key={item.name}></td>

          })
      }
    </tr>
  )
}

const ServerSumRow = ({ conf, columns, data, isFilterOn, viewPortBreakpoint }) => {
  const calcServerSum = (column_name) => {
    return data.reduce((acc, curr) => {
      return acc + parseFloat(curr[column_name].toString().replace(",", ""))
    }, 0)
  }

  return (
    <tr className={"h-9 border-t font-roboto font-semibold text-xs " + (isFilterOn ? "opacity-30" : "")}>
      <td className="px-2 text-xla" colSpan="3">Grand Totals</td>
      {
        columns
          .filter(item => item.visible[viewPortBreakpoint])
          .filter((_) => {
            return (_.name !== '_seq_')
          })
          .map(item => {
            if (conf.sumColumns.includes(item.name)) {
              return <td key={item.name} className="text-right px-2">{numeral(calcServerSum(item.name)).format('0,0.00')}</td>
            }
            return <td className="" key={item.name}></td>

          })
      }
    </tr>
  )
}

export default StandardTable;