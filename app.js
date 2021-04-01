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
let modelDataset = [];
let modelHtmlSet = [];
// let locationDataSet = []; for future implementation to support more locations besides Louisville
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
buildMakeOptions();
// document.getElementById('carMake').addEventListener('click', buildMakeOptions, {once : true});

// carMakeSelect.addEventListener("change", (e) => {
//   const makeId = e.target.value;
//   if (makeId == '#') {
//     carModelSelect.innerHTML = `<option value="#">Model</option>`;
//     return;
//   }
//   fetchData(modelURL + makeId).then((modelJson) => {
//     modelJson = modelJson.sort((a, b) => (a.modelName < b.modelName ? -1 : 1)); // sorts makes by ABC order
//     carModelSelect.innerHTML = `<option value="#">Model</option>`; // resets the options
//     for (let model of modelJson) {
//       let txt = optionHtml;
//       txt = txt
//         .replace("{VALUE}", model.modelID)
//         .replace("{OPTION}", model.modelName.toUpperCase());
//       carModelSelect.insertAdjacentHTML("beforeend", txt);
//     }
//   });
// });

carMakeSelect.addEventListener("change", (e) => {
  const makeId = e.target.value;
  if (makeId == '#') {
    carModelSelect.innerHTML = `<option value="#">Model</option>`;
    return;
  }
  const modelOptions = modelHtmlSet.find(ele => ele[0] == makeId)[1];
  carModelSelect.innerHTML = modelOptions;
});

addButton.addEventListener("click", () => {
  if (
    carYearSelect.value === "#" ||
    carMakeSelect.value === "#" ||
    carModelSelect.value === "#"
  )
    alert("Invalid Car Search!\nPlease make sure you select a valid Year, Make, and Model.");
  else {
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
            // console.log([locationDataSet, makeDataSet, dataset]);
          }
        }
      });
  }
});

// --------------------------------------------------------
//      FUNCTIONS
// --------------------------------------------------------

function displayCarEntry(carName, result) {
  const idName = carName.split(' ').join('_');
  const carEntryHtml = `
  <div id="${idName}" class="carEntry">
      <div class="carNameWrap">
        <div class="carName">${carName}</div>
        <div class="matchCount">Exact Matches: <div class="matchNum">${result.exactMatches.length}</div></div>
      </div>
        <div id="closeButton_${idName}" class="closeEntry" role="button">x</button>
  </div>
  `;
  document.getElementById("carList").insertAdjacentHTML("beforeend", carEntryHtml)
  document.getElementById(`closeButton_${idName}`).addEventListener('click', (e) => {
    const carToRemove = e.target.id.split('closeButton_')[1];
    const split = carToRemove.split('_');
    const carYear = split[0];
    const carMake = split[1];
    const carModel = split[2];
    const filtered = dataset.lotLocations.filter(lot => {
      return !(lot.modelYear == carYear && lot.makeName == carMake && lot.modelName == carModel);
    });
    dataset.lotLocations = filtered;
    rebuildSortedTable(dataset);
    document.getElementById(carToRemove).remove();
    dataset.searchEntries = dataset.searchEntries.filter(entry => entry !== split.join(' '));
  })
}

function rebuildSortedTable(dataset) {
  document.getElementById('lotTable').innerHTML = '';
  let sortedLots = '<div class="row header"><div class="cell">Lot</div><div class="cell">Car</div><div class="cell">Date on Yard</div></div>';
  dataset.lotLocations.sort((a, b) => a.row < b.row ? -1 : 1).forEach(lotItem => {
    sortedLots +=
    `
    <div class="row">
      <div class="cell lotValue" data-title="Lot:">
        <label>
          ${lotItem.row}<input type="checkbox" class="lotCheckbox">
        </label>        
      </div>
      <div class="cell cellCar" data-title="Car:">${lotItem.modelYear} ${lotItem.makeName} ${lotItem.modelName}</div>
      <div class="cell cellDate" data-title="Date on Yard:">${formatDate(lotItem.dateYardOn)}</div>
    </div>
    `;
  });
  document.getElementById('lotTable').innerHTML = sortedLots;
  // add click event to checkboxes
  const checkboxes = document.querySelectorAll('.lotCheckbox');
  checkboxes.forEach(x => x.addEventListener('change', (e) => {
    const row = e.currentTarget.parentElement.parentElement.parentElement;
    if (e.target.checked) {
      row.style.textDecoration = 'line-through';
    }
    if (!e.target.checked) {
      row.style.textDecoration = 'none';
    }
  }))
}

function formatDate(dateFromData) {
  const today = new Date();
  const carDate = new Date(dateFromData);
  const diff = today.getTime() - carDate.getTime();
  const days = Math.ceil(diff / (1000 * 3600 * 24));
  return `${days} days ago`;

  // Uncomment to just display the exact month and year
  // const date = new Date(dateFromData).toDateString().split(' ');
  // index in date refers to the date's:
  // [0] - day of week 
  // [1] - month 
  // [2] - day
  // [3] - year
  // return `${date[1]} ${date[3]}`;
}

// function buildMakeOptions() {
//   Promise.all([
//     // fetchData(locURL), 
//     fetchData(makeURL)
//   ]).then((data) => {
//     // const locs = data[0];
//     let makes = data[0];
//     makeDataSet = [...makes];
//     makes = makes.sort((a, b) => (a.makeName < b.makeName ? -1 : 1)); // sorts makes by ABC order
//     generateOptions(makes);
//   });
// }

function buildMakeOptions() {
    fetchData(makeURL).then((data) => {
    let makes = data;
    makeDataSet = [...makes];
    makes = makes.sort((a, b) => (a.makeName < b.makeName ? -1 : 1)); // sorts makes by ABC order
    generateOptions(makes);
    console.log(makeDataSet);
    makeDataSet.forEach(make => {
      fetchData(modelURL + make.makeID).then((modelJson) => {
        modelJson = modelJson.sort((a, b) => (a.modelName < b.modelName ? -1 : 1)); // sorts makes by ABC order
        let modelsHtml = `<option value="#">Model</option>`; // resets the options
        for (let model of modelJson) {
          let txt = optionHtml;
          txt = txt
            .replace("{VALUE}", model.modelID)
            .replace("{OPTION}", model.modelName.toUpperCase());
          modelsHtml += txt;
        }
        // console.log(modelsHtml);
        const model = [make.makeID, modelsHtml];
        modelHtmlSet.push(model);
      });      
    })
    console.dir(modelHtmlSet); 
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
  let html = `<option value="#">Make</option>`;
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
  let year = 1955;
  while (year != 2021) {
    let txt = optionHtml;
    txt = txt.replace("{VALUE}", year).replace("{OPTION}", year);
    carYearSelect.insertAdjacentHTML("beforeend", txt);
    year++;
  }
}
