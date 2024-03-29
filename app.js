const locationID = "8"; // locationID for Louisville
// let locationDataSet = []; for future implementation to support more locations besides Louisville

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
let dataset = {
  // used for preventing duplicate searches of the same car
  searchEntries: [],
  // an array of lot locations, used for sorting by row number
  lotLocations: [],
}

// --------------------------------------------------------
//                        LOGIC
// --------------------------------------------------------

buildYears();
buildMakeAndModels();
addChangeEventListenerToMake();
addClickEventListenerToAddButton();

// --------------------------------------------------------
//                        FUNCTIONS
// --------------------------------------------------------

function buildYears() {
  let year = 1955;
  while (year != 2021) {
    let txt = optionHtml;
    txt = txt.replace("{VALUE}", year).replace("{OPTION}", year);
    carYearSelect.insertAdjacentHTML("beforeend", txt);
    year++;
  }
}

function fetchData(url) {
  return fetch(url)
    .then((res) => res.json())
    .catch((err) => console.log("Looks like there was a problem", err));
}

function buildMakeAndModels() {
  fetchData(makeURL).then((data) => {
    let makes = data;
    makeDataSet = [...makes];
    makes = makes.filter(a => !a.rareFind).sort((a, b) => (a.makeName < b.makeName ? -1 : 1)); // filters out rares and then sorts by ABC order
    buildMakeOptions(makes);
    buildModelsHtmls();
  });
}

function buildMakeOptions(makes) {
  let html = `<option value="#">Make</option>`;
  makes.forEach(
    (make) =>
      (html += optionHtml
        .replace("{VALUE}", make.makeID)
        .replace("{OPTION}", make.makeName.toUpperCase()))
  );
  carMakeSelect.innerHTML = html;
}

// builds an array that contains the model options in html strings for each makeId
// this is used to avoid making a separate api call each time a different make is selected 
function buildModelsHtmls() {
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
    const model = [make.makeID, modelsHtml];
    modelHtmlSet.push(model);
  });      
})
}



function addClickEventListenerToAddButton() {
  addButton.addEventListener("click", () => {
    if (carYearSelect.value === "#" ||
      carMakeSelect.value === "#" ||
      carModelSelect.value === "#")
      alert("Invalid Car Search!\nPlease make sure you select a valid Year, Make, and Model.");
    else {
      // sample data required for car search: {"Locations":["8"],"Models":["861"],"MakeID":56,"Years":[]}
      const makeName = carMakeSelect[carMakeSelect.selectedIndex].text;
      const modelName = carModelSelect[carModelSelect.selectedIndex].text;
      let _data = {
        Locations: [locationID],
        Models: [carModelSelect.value],
        MakeID: carMakeSelect.value,
        Years: [carYearSelect.value],
      };

      var myHeaders = new Headers();
      myHeaders.append("authority", "inventoryservice.pullapart.com");
      myHeaders.append("accept", "*/*");
      myHeaders.append("accept-language", "en-US,en;q=0.9");
      myHeaders.append("content-type", "application/json; charset=utf-8");
      myHeaders.append("origin", "https://www.pullapart.com");
      myHeaders.append("referer", "https://www.pullapart.com/");
      myHeaders.append("sec-ch-ua", "\"Google Chrome\";v=\"111\", \"Not(A:Brand\";v=\"8\", \"Chromium\";v=\"111\"");
      myHeaders.append("sec-ch-ua-mobile", "?0");
      myHeaders.append("sec-ch-ua-platform", "\"Windows\"");
      myHeaders.append("sec-fetch-dest", "empty");
      myHeaders.append("sec-fetch-mode", "cors");
      myHeaders.append("sec-fetch-site", "same-site");
      myHeaders.append("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36");

      var raw = `{\"Locations\":[8],\"MakeID\":${_data.MakeID},\"Years\":[${_data.Years}],\"Models\":[${_data.Models}]}`

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
      };

      fetch("https://inventoryservice.pullapart.com/Vehicle/Search", requestOptions)
        .then((response) => response.json())
        .then((json) => {
          const result = searchDataFromJson(json);
          if (result.exactMatches.length == 0) {
            alert("Sorry, no matches found for this car!");
          } else {
            const carName = `${carYearSelect.value} ${makeName} ${modelName}`;
            // check if this car has already added to searchEntries
            if (dataset.searchEntries.find(entry => entry === carName)) {
              alert('This car is already in there!');
            } else {
              dataset.searchEntries.push(carName);
              result.exactMatches.forEach(match => dataset.lotLocations.push({ ...match }));
              displayCarEntry(carName, result);
              const previousCheckedLots = checkedLots();
              buildSortedTable(dataset);
              recheckLotsInTable(previousCheckedLots);
            }
          }
        });
    }
  });
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

function searchDataFromJson(json) {
  return {
    exactMatches: [...json[0].exact],
    closeMatches: [...json[0].other],
  };
}

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
    // check table for checked lots
    const previouscheckedLots = checkedLots();
    const carToRemove = e.target.id.split('closeButton_')[1];
    const split = carToRemove.split('_');
    const carYear = split[0];
    const carMake = split[1];
    const carModel = split[2];
    const filtered = dataset.lotLocations.filter(lot => {
      return !(lot.modelYear == carYear && lot.makeName == carMake && lot.modelName == carModel);
    });
    dataset.lotLocations = filtered;
    buildSortedTable(dataset);
    // rechecked the lots that were previously checked
    recheckLotsInTable(previouscheckedLots);
    document.getElementById(carToRemove).remove();
    dataset.searchEntries = dataset.searchEntries.filter(entry => entry !== split.join(' '));
  })
}

function checkedLots() {
  const boxes = document.querySelectorAll('.lotCheckbox:checked');
  const checkedLots = [];
  boxes.forEach(box => checkedLots.push(box.parentElement.innerText));
  return checkedLots;
}

function recheckLotsInTable(previouscheckedLots) {
  const labels = document.querySelectorAll('.lotValue > label');
  labels.forEach(label => {
    if (previouscheckedLots.includes(label.innerText)) {
      const checkbox = label.querySelector('.lotCheckbox');
      const row = label.parentElement.parentElement;
      row.style.textDecoration = 'line-through';
      checkbox.checked = 'true';
    }
  })
}

function buildTableRow(lotLocation) {
  return `<div class="row"><div class="cell" data-title="Lot"><input type="checkbox">${lotLocation.row}</div><div class="cell" data-title="Car">${lotLocation.modelYear} ${lotLocation.makeName} ${lotLocation.modelName}</div></div>`
}

function buildSortedTable(dataset) {
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
  addClickEventToLotCheckboxes();
}

function addClickEventToLotCheckboxes() {
  const checkboxes = document.querySelectorAll('.lotCheckbox');
  checkboxes.forEach(x => x.addEventListener('change', (e) => {
    const row = e.currentTarget.parentElement.parentElement.parentElement;
    if (e.target.checked) {
      row.style.textDecoration = 'line-through';
    }
    if (!e.target.checked) {
      row.style.textDecoration = 'none';
    }
  }));
}

function addChangeEventListenerToMake() {
  carMakeSelect.addEventListener("change", (e) => {
    const makeId = e.target.value;
    if (makeId == '#') {
      carModelSelect.innerHTML = `<option value="#">Model</option>`;
      return;
    }
    const modelOptions = modelHtmlSet.find(ele => ele[0] == makeId)[1];
    carModelSelect.innerHTML = modelOptions;
  });
}
