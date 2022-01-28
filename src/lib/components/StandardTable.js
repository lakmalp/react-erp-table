import React, { useEffect, useRef, useState } from "react"
import numeral from "numeral";

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
  }, [selectedLines, ...props.buttonEnablers])

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
                  <button className="w-9 h-9 rounded-full bg-ss-200a" onClick={() => setHamburgerMenuOpen(prev => !prev)}><Icon icon="Hamburger" className="mx-auto" color="gray" width="20" /></button>
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
                {
                <div className="relative flex items-center h-7">
                  <span className="mr-2 text-xs text-black font-semibold h-full flex items-center font-montserrat">Search</span>
                  <input id="main" value={searchParams.main} onChange={e => onSearchParamsChange(e)} type="text" className="pl-1 pr-16 font-inter h-full w-60 border shadow-innera roundeda overflow-hidden outline-none" disabled={showAdvSearch} />
                  <div className="absolute h-full flex items-center justify-center" style={{ right: 0 }}>
                    {
                      !showAdvSearch &&
                      <button onClick={() => search(searchParams)} className="h-7 w-7 text-ss-900 border-l border-t border-b bg-white flex justify-center items-center">
                          <Icon icon="MagnifyingGlass" color="rgb(70, 70, 70)" width="15" />
                      </button>
                    }
                    <button onClick={() => setShowAdvSearch(prev => !prev)} className=" h-7 w-7 border border-whitea rounded-ra bg-white flex justify-center items-center">
                      <Icon icon="VDots" color="rgb(40, 41, 41)" width="15" />
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
                }
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
          <Icon icon="VDots" className="" color="gray" width="15" />
        </button>
        {
          lineMenuOpen &&
          <div className="z-100 absolute bg-white text-gray-800 border shadow-md min-w-max overflow-hidden " style={{ marginLeft: 30, marginTop: -28 }}>
            <ul ref={wrapperRef} className="">
              <li className={"px-2 py-1 hover:bg-ss-100 hover:text-gray-900 " + (["md", "lg", "xl", "2xl", "3xl"].includes(viewPortBreakpoint) ? "hidden" : "block")}><button className="w-full text-left flex"><Icon icon="Edit" className="mr-2" width="15" color="rgb(59, 130, 246)" /> Edit</button></li>
              <li className={"px-2 py-1 hover:bg-ss-100 hover:text-gray-900 " + (["md", "lg", "xl", "2xl", "3xl"].includes(viewPortBreakpoint) ? "hidden" : "block")}><button className="w-full text-left flex"><Icon icon="Trash" className="mr-2" width="15" color="rgb(59, 130, 246)" /> Delete</button></li>
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
          <Icon icon="Filter" className={(filterOn ? "hidden" : "")} color="rgb(37, 99, 235)" width="18" />
          <Icon icon="FilterX" className={(filterOn ? "" : "hidden")} color="rgb(37, 99, 235)" width="18" />
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
                  <Icon icon="SortAsc" className={"ml-2 " + (sortProperties[column.name] === "" ? "hidden" : (sortProperties[column.name] === "asc" ? "" : "hidden"))} width="10" />
                  <Icon icon="SortDesc" className={"ml-2 " + (sortProperties[column.name] === "" ? "hidden" : (sortProperties[column.name] === "desc" ? "" : "hidden"))} width="10" />
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

const Icon = ({ icon, className, color, width }) => {
  let markup = '';
  let viewBox = '';

  switch (icon) {
    case "MagnifyingGlass":
      viewBox = "0 0 49.999 49.999";
      markup = (
        <>
          <title>{icon}</title>
          <path d="M48.681,42.295l-8.925-8.904c-0.045-0.045-0.098-0.078-0.145-0.11c-0.802,1.233-1.761,2.405-2.843,3.487 c-1.081,1.082-2.255,2.041-3.501,2.845c0.044,0.046,0.077,0.1,0.122,0.144l8.907,8.924c1.763,1.76,4.626,1.758,6.383,0 C50.438,46.921,50.439,44.057,48.681,42.295z" />
          <path d="M35.496,6.079C27.388-2.027,14.198-2.027,6.089,6.081c-8.117,8.106-8.118,21.306-0.006,29.415 c8.112,8.105,21.305,8.105,29.413-0.001C43.604,27.387,43.603,14.186,35.496,6.079z M9.905,31.678 C3.902,25.675,3.904,15.902,9.907,9.905c6.003-6.002,15.77-6.002,21.771-0.003c5.999,6,5.997,15.762,0,21.774 C25.676,37.66,15.91,37.682,9.905,31.678z" />
          <path d="M14.18,22.464c-0.441-1.812-2.257-4.326-3.785-3.525c-1.211,0.618-0.87,3.452-0.299,5.128 c2.552,7.621,11.833,9.232,12.798,8.268C23.843,31.387,15.928,29.635,14.18,22.464z" />
        </>
      );
      break;
    
    case "SortDesc":
      viewBox = "0 0 24 24";
      markup = (
        <>
          <title>{icon}</title>
          <path d="M0 7.33l2.829-2.83 9.175 9.339 9.167-9.339 2.829 2.83-11.996 12.17z" />
        </>
      );
      break;

    case "SortAsc":
      viewBox = "0 0 24 24";
      markup = (
        <>
          <title>{icon}</title>
          <path d="M0 16.67l2.829 2.83 9.175-9.339 9.167 9.339 2.829-2.83-11.996-12.17z" />
        </>
      );
      break;

    case "Hamburger":
      viewBox = "0 0 100 80";
      markup = (
        <>
          <title>{icon}</title>
          <path d="M2 3h12a1 1 0 0 1 0 2H2a1 1 0 1 1 0-2zm0 4h12a1 1 0 0 1 0 2H2a1 1 0 1 1 0-2zm0 4h12a1 1 0 0 1 0 2H2a1 1 0 0 1 0-2z" id="a" />
        </>
      );
      break;

    case "VDots":
      viewBox = "0 0 24 24";
      markup = (
        <>
          <title>{icon}</title>
          <path d="M12 16c1.656 0 3 1.344 3 3s-1.344 3-3 3-3-1.344-3-3 1.344-3 3-3zm0 1c1.104 0 2 .896 2 2s-.896 2-2 2-2-.896-2-2 .896-2 2-2zm0-8c1.656 0 3 1.344 3 3s-1.344 3-3 3-3-1.344-3-3 1.344-3 3-3zm0 1c1.104 0 2 .896 2 2s-.896 2-2 2-2-.896-2-2 .896-2 2-2zm0-8c1.656 0 3 1.344 3 3s-1.344 3-3 3-3-1.344-3-3 1.344-3 3-3zm0 1c1.104 0 2 .896 2 2s-.896 2-2 2-2-.896-2-2 .896-2 2-2z" />
        </>
      );
      break;

    case "Trash":
      viewBox = "0 0 110.61 122.88";
      markup = (
        <>
          <title>{icon}</title>
          <path d="M39.27,58.64a4.74,4.74,0,1,1,9.47,0V93.72a4.74,4.74,0,1,1-9.47,0V58.64Zm63.6-19.86L98,103a22.29,22.29,0,0,1-6.33,14.1,19.41,19.41,0,0,1-13.88,5.78h-45a19.4,19.4,0,0,1-13.86-5.78l0,0A22.31,22.31,0,0,1,12.59,103L7.74,38.78H0V25c0-3.32,1.63-4.58,4.84-4.58H27.58V10.79A10.82,10.82,0,0,1,38.37,0H72.24A10.82,10.82,0,0,1,83,10.79v9.62h23.35a6.19,6.19,0,0,1,1,.06A3.86,3.86,0,0,1,110.59,24c0,.2,0,.38,0,.57V38.78Zm-9.5.17H17.24L22,102.3a12.82,12.82,0,0,0,3.57,8.1l0,0a10,10,0,0,0,7.19,3h45a10.06,10.06,0,0,0,7.19-3,12.8,12.8,0,0,0,3.59-8.1L93.37,39ZM71,20.41V12.05H39.64v8.36ZM61.87,58.64a4.74,4.74,0,1,1,9.47,0V93.72a4.74,4.74,0,1,1-9.47,0V58.64Z" />
        </>
      );
      break;

    case "FilterX":
      viewBox = "0 0 122.88 107.128";
      markup = (
        <>
          <title>{icon}</title>
          <path fillRule="evenodd" clipRule="evenodd" d="M91.124,15.645c12.928,0,23.406,10.479,23.406,23.406 c0,12.927-10.479,23.406-23.406,23.406c-12.927,0-23.406-10.479-23.406-23.406C67.718,26.125,78.197,15.645,91.124,15.645 L91.124,15.645z M2.756,0h117.322c1.548,0,2.802,1.254,2.802,2.802c0,0.848-0.368,1.622-0.996,2.139l-10.667,13.556 c-1.405-1.375-2.95-2.607-4.614-3.672l6.628-9.22H9.43l37.975,46.171c0.59,0.516,0.958,1.254,0.958,2.102v49.148l21.056-9.623 V57.896c1.651,1.9,3.548,3.582,5.642,4.996v32.133c0,1.105-0.627,2.064-1.586,2.506l-26.476,12.758 c-1.327,0.773-3.023,0.332-3.798-1.033c-0.258-0.441-0.368-0.92-0.368-1.4V55.02L0.803,4.756c-1.07-1.106-1.07-2.839,0-3.945 C1.355,0.258,2.056,0,2.756,0L2.756,0z M96.93,28.282c1.328-1.349,3.489-1.355,4.825-0.013c1.335,1.342,1.341,3.524,0.013,4.872 l-5.829,5.914l5.836,5.919c1.317,1.338,1.299,3.506-0.04,4.843c-1.34,1.336-3.493,1.333-4.81-0.006l-5.797-5.878l-5.807,5.889 c-1.329,1.349-3.489,1.355-4.826,0.013c-1.335-1.342-1.341-3.523-0.013-4.872l5.83-5.913l-5.836-5.919 c-1.317-1.338-1.3-3.507,0.04-4.843c1.339-1.336,3.492-1.333,4.81,0.006l5.796,5.878L96.93,28.282L96.93,28.282z" />
        </>
      );
      break;

    case "Filter":
      viewBox = "0 0 122.88 107.128";
      markup = (
        <>
          <title>{icon}</title>
          <path d="M2.788,0h117.297c1.544,0,2.795,1.251,2.795,2.795c0,0.85-0.379,1.611-0.978,2.124l-46.82,46.586v39.979 c0,1.107-0.643,2.063-1.576,2.516l-22.086,12.752c-1.333,0.771-3.039,0.316-3.812-1.016c-0.255-0.441-0.376-0.922-0.375-1.398 h-0.006V51.496L0.811,4.761C-0.275,3.669-0.27,1.904,0.822,0.819c0.544-0.541,1.255-0.811,1.966-0.811V0L2.788,0z M113.323,5.591 H9.493L51.851,48.24c0.592,0.512,0.966,1.27,0.966,2.114v49.149l16.674-9.625V50.354h0.008c0-0.716,0.274-1.432,0.822-1.977 L113.323,5.591L113.323,5.591z" />
        </>
      );
      break;

    case "Edit":
      viewBox = "0 0 117.74 122.88";
      markup = (
        <>
          <title>{icon}</title>
          <path d="M94.62,2c-1.46-1.36-3.14-2.09-5.02-1.99c-1.88,0-3.56,0.73-4.92,2.2L73.59,13.72l31.07,30.03l11.19-11.72 c1.36-1.36,1.88-3.14,1.88-5.02s-0.73-3.66-2.09-4.92L94.62,2L94.62,2L94.62,2z M41.44,109.58c-4.08,1.36-8.26,2.62-12.35,3.98 c-4.08,1.36-8.16,2.72-12.35,4.08c-9.73,3.14-15.07,4.92-16.22,5.23c-1.15,0.31-0.42-4.18,1.99-13.6l7.74-29.61l0.64-0.66 l30.56,30.56L41.44,109.58L41.44,109.58L41.44,109.58z M22.2,67.25l42.99-44.82l31.07,29.92L52.75,97.8L22.2,67.25L22.2,67.25z" />
        </>
      );
      break;

    case "Duplicate":
      viewBox = "0 0 100.32 122.88";
      markup = (
        <>
          <title>{icon}</title>
          <path d="M76.43,113.78a2.89,2.89,0,1,1,5.78,0v3.76a5.32,5.32,0,0,1-1.56,3.76h0a5.27,5.27,0,0,1-3.76,1.57H5.34a5.29,5.29,0,0,1-3.76-1.57h0A5.3,5.3,0,0,1,0,117.54V23.06a5.31,5.31,0,0,1,1.57-3.77l.23-.21a5.29,5.29,0,0,1,3.54-1.35H9A2.89,2.89,0,1,1,9,23.5H5.78v93.6H76.43v-3.32ZM37,85.54a2.65,2.65,0,1,1,0-5.29H62.67a2.65,2.65,0,1,1,0,5.29Zm0-16.21A2.65,2.65,0,0,1,37,64H71.92a2.65,2.65,0,0,1,0,5.3Zm0-16.22a2.65,2.65,0,1,1,0-5.3H82.17a2.65,2.65,0,0,1,0,5.3ZM71,1.05,98.17,29.67a2.9,2.9,0,0,1,2.15,2.8V99.82A5.33,5.33,0,0,1,95,105.15H23.45a5.28,5.28,0,0,1-3.76-1.56h0a5.31,5.31,0,0,1-1.57-3.77V5.34a5.3,5.3,0,0,1,1.57-3.77l.23-.21A5.25,5.25,0,0,1,23.45,0H68.73A2.89,2.89,0,0,1,71,1.05ZM94.54,36H68.73a2.89,2.89,0,0,1-2.89-2.89V5.78H23.89v93.6H94.54V36Zm-3.83-5.78L71.62,10.11V30.19Z" />
        </>
      );
      break;

    default:
      break;
  }
  return (
    <svg className={className} width={width} fill={color} id={"icon" + icon} data-name={"icon" + icon} xmlns="http://www.w3.org/2000/svg" viewBox={viewBox}>
      {markup}
    </svg>
  )
}

const useOutsideAlerter = (ref) => {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        alert("You clicked outside of me!");
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
}

export default StandardTable;