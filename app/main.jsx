import ReactDOM from "react-dom";
import React from "react";
import $ from "jquery";

import App from "./components/app";
import "./main.scss";
import AppStore from "./appstore.js";
import Sheet from "./sheet.js";
import Base from "./base.js";
import SuggestionSources from "./suggestions.js";

const pcg = require("./../package.json");

const TESTING = false;
console.log("testing mode", TESTING);

window["version"] = pcg.version;

// global variables
window["map"] = false;
window["Base"] = Base;
window["SuggestionSources"] = SuggestionSources;

window["username"] = "";

/* testing simscores

const simScoreTests = [
  { reference: "coordinatex", p: ["coordinatex", "x"], n: ["y", "coordinatey"] }
];

simScoreTests.forEach(t => {
  const score = Base.simScoreBi(t.reference, t.p, t.n);
  console.log(t.reference, ";", t.p, t.n, ";", score);
});

*/

// load map layers
Base.requestConfigFile("basemaps.json", data => (window["basemaps"] = data));
Base.requestConfigFile("mapoverlays.json", overlays => {
  window["overlaymaps"] = overlays;
  Object.keys(overlaymaps).map(okey => {
    const overlay = overlaymaps[okey];
    if (overlaymaps[okey].type === "geojson") {
      Base.requestDataFile(overlay.file, ovd => (overlaymaps[okey].data = ovd));
    }
  });
});

window["store"] = new AppStore();

// assigning config. If TESTING === true, config will be extended with config_testing.json
const loadConfig = next => {
  store.changeLoadingStatus("config");
  const configPath = TESTING ? "config_testing.json" : "config.json";
  Base.requestConfigFile(configPath, configData => {
    Base.requestConfigFile("config_api.json", otherConfigData => {
      next(Object.assign(configData, otherConfigData));
    });
  });
};

loadConfig(config => {
  window.config = config;
  store.loadConfig(config);

  ReactDOM.render(
    <App />,
    document.body.appendChild(document.createElement("div"))
  );

  window["sheetId"] = location.hash.substring(1);
  window["initSheet"] = () => {
    store.changeLoadingStatus("signing");
    Sheet.init(() => store.init());
  };

  if (sheetId) {
    initSheet();
  } else {
    store.changeLoadingStatus("prompting table");
  }
});

module.hot.accept();
