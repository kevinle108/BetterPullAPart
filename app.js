const locationID = "8"; // for Louisville
const locURL = "https://enterpriseservice.pullapart.com/Location";
const makeURL = "https://inventoryservice.pullapart.com/Make/";
const modelURL = "https://inventoryservice.pullapart.com/Model?makeID=";
const searchURL = "https://inventoryservice.pullapart.com/Vehicle/Search";
const carYearSelect = document.getElementById("carYear");
const carMakeSelect = document.getElementById("carMake");
const carModelSelect = document.getElementById("carModel");
const addButton = document.getElementById("addButton");
const optionHtml = `<option value="{VALUE}">{OPTION}</option>`;
let makeDataSet = [];
let locationDataSet = [];
let dataset = {

  // used for preventing duplicate searches of the same car
  searchEntries: [],
  
  // an array of lot locations, used for sorting by row number
  lotLocations: 
  [
    // will have a lotLocation
  ],

}
//{"Locations":["8"],"Models":["861"],"MakeID":56,"Years":[]}


// --------------------------------------------------------
//      LOGIC
// --------------------------------------------------------

// populates the year selections with years 1955 - 2020
buildYearOptions();
document.getElementById('carMake').addEventListener('click', buildMakeOptions, {once : true});

carMakeSelect.addEventListener("change", (e) => {
  const makeId = e.target.value;
  fetchData(modelURL + makeId).then((modelJson) => {
    modelJson = modelJson.sort((a, b) => (a.modelName < b.modelName ? -1 : 1)); // sorts makes by ABC order
    carModelSelect.innerHTML = ""; // resets the options
    for (let model of modelJson) {
      let txt = optionHtml;
      txt = txt
        .replace("{VALUE}", model.modelID)
        .replace("{OPTION}", model.modelName.toUpperCase());
      //console.log(text);
      carModelSelect.insertAdjacentHTML("beforeend", txt);
    }
  });
});

addButton.addEventListener("click", () => {
  if (
    carYearSelect.value === "#" ||
    carMakeSelect.value === "#" ||
    carModelSelect.value === "#"
  )
    alert("Invalid Car!");
  else {
    // const makeName = makeDataSet.filter(make => make.makeID == carMakeSelect.value);
    const makeName = carMakeSelect[carMakeSelect.selectedIndex].text;
    const modelName = carModelSelect[carModelSelect.selectedIndex].text;

    let _data = {
      Locations: [locationID],
      Models: [carModelSelect.value],
      MakeID: carMakeSelect.value,
      Years: [carYearSelect.value],
    };
    fetch(searchURL, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify(_data),
    })
      .then((response) => response.json())
      .then((json) => {
        const result = searchDataFromJson(json);
        if (result.exactMatches.length == 0) {
          alert("Sorry, no matches found for this car!");
        } else {
          const carName = `${carYearSelect.value} ${makeName} ${modelName}`;
          // check if this car has already added to searchEntries
          if (dataset.searchEntries.find(entry => entry === carName)) {
            alert('This car is already in there!')
          } else {
            dataset.searchEntries.push(carName);
            result.exactMatches.forEach(match => dataset.lotLocations.push({...match}))
            displayCarEntry(carName, result);
            rebuildSortedTable(dataset);
            console.log([locationDataSet, makeDataSet, dataset]);
          }

        }

        // for (let match of json[0].exact)
        // {
        //     const carObj = {
        //         Row: match.row,
        //         Year: match.modelYear,
        //         Make: match.makeName,
        //         Model: match.modelName
        //     }
        //     console.log(carObj);

        // }
      });
  }
});


function displayCarEntry(carName, result) {
  const carEntryHtml = `
  <div class="carEntry">
      <div class="carName">${carName}</div>
      <div class="matchCount">Exact Matches: <div class="matchNum">${result.exactMatches.length}</div></div>
  </div>
  `;
  document.getElementById("carList").insertAdjacentHTML("beforeend", carEntryHtml);
}

function rebuildSortedTable(dataset) {
  document.getElementById('lotTable').innerHTML = '';
  let sortedLots = '<div class="row header"><div class="cell">Lot</div><div class="cell">Year Make Model</div><div class="cell">Date on Yard</div></div>';
  dataset.lotLocations.sort((a, b) => a.row < b.row ? -1 : 1).forEach(lotItem => {
    sortedLots +=
    `
    <div class="row">
      <div class="cell lotValue" data-title="Lot">
        <label>
          <input type="checkbox">${lotItem.row}
        </label>        
      </div>
      <div class="cell" data-title="Car">${lotItem.modelYear} ${lotItem.makeName} ${lotItem.modelName}</div>
      <div class="cell" data-title="Car">${formatDate(lotItem.dateYardOn)}</div>
    </div>
    `;
  });
  document.getElementById('lotTable').innerHTML = sortedLots;
}

// --------------------------------------------------------
//      FUNCTIONS
// --------------------------------------------------------

function formatDate(dateFromData) {
  const date = new Date(dateFromData).toDateString().split(' ');
  // index in date refers to the date's:
  // [0] - day of week 
  // [1] - month 
  // [2] - day
  // [3] - year
  return `${date[1]} ${date[3]}`;
}


function buildMakeOptions() {
  Promise.all([
    // fetchData(locURL), 
    fetchData(makeURL)
  ]).then((data) => {
    // const locs = data[0];
    let makes = data[0];
    makeDataSet = [...makes];
    makes = makes.sort((a, b) => (a.makeName < b.makeName ? -1 : 1)); // sorts makes by ABC order
    generateOptions(makes);
  });
}

function buildTableRow(lotLocation) {
  return `<div class="row"><div class="cell" data-title="Lot"><input type="checkbox">${lotLocation.row}</div><div class="cell" data-title="Car">${lotLocation.modelYear} ${lotLocation.makeName} ${lotLocation.modelName}</div></div>`
}

function searchDataFromJson(json) {
  return {
    exactMatches: [...json[0].exact],
    closeMatches: [...json[0].other],
  };
}

function generateOptions(makes) {
  let html = "";
  makes.forEach(
    (make) =>
      (html += optionHtml
        .replace("{VALUE}", make.makeID)
        .replace("{OPTION}", make.makeName.toUpperCase()))
  );
  carMakeSelect.innerHTML = html;
}

function fetchData(url) {
  return fetch(url)
    .then((res) => res.json())
    .catch((err) => console.log("Looks like there was a problem", err));
}

function buildYearOptions() {
  let year = 1995;
  while (year != 2021) {
    let txt = optionHtml;
    txt = txt.replace("{VALUE}", year).replace("{OPTION}", year);
    carYearSelect.insertAdjacentHTML("beforeend", txt);
    year++;
  }
}

// function checkStatus(res)
// {
//     // rsp.ok ? new Promise.resolve(rsp) : new Promise.reject(new Error(rsp.statusText))
//     if (res.ok)
//     {
//         return new Promise.resolve(res);
//     }
//     else
//     {
//         return new Promise.reject(new Error(res.statusText));
//     }
// }
