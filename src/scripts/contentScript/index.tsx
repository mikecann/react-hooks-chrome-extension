import * as React from "react";
import * as ReactDOM from "react-dom";
import { ChildPageApp } from "../common/ChildPageApp";

console.log("hello from the content script page..");

const div = document.createElement("div");
document.body.appendChild(div);
ReactDOM.render(<ChildPageApp name="contentScript" />, div);
