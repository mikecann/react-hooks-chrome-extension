import * as React from "react";
import * as ReactDOM from "react-dom";
import { ChildPageApp } from "../common/ChildPageApp";

console.log("hello from the browser action page..");

ReactDOM.render(<ChildPageApp name="browserAction" />, document.getElementById("root"));
