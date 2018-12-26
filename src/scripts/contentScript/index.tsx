import * as React from "react";
import * as ReactDOM from "react-dom";
import { ChildPageApp } from "../common/ChildPageApp";

console.log("hello from the content script page..");

ReactDOM.render(<ChildPageApp name="contentScript" />, document.getElementById("root"));
