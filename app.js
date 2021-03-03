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
//{"Locations":["8"],"Models":["861"],"MakeID":56,"Years":[]}

// --------------------------------------------------------
//      LOGIC
// --------------------------------------------------------

// populates the year selections with years 1955 - 2020
buildYearOptions();

Promise.all([
    fetchData(locURL),
    fetchData(makeURL)
])
.then(data => {
    const locs = data[0];
    let makes = data[1];
    // console.log('locations:', locs);
    // console.log('makes:', makes);

    makeDataSet = [...makes];

    makes = makes.sort((a, b) => a.makeName < b.makeName ? -1 : 1); // sorts makes by ABC order
    generateOptions(makes);
});

carMakeSelect.addEventListener("change", e => {
    const makeId = e.target.value;
    fetchData(modelURL + makeId)
        .then(modelJson => {
            modelJson = modelJson.sort((a, b) => a.modelName < b.modelName ? -1 : 1); // sorts makes by ABC order
            carModelSelect.innerHTML = ""; // resets the options
            for (let model of modelJson)
            {
                let txt = optionHtml;
                txt = txt
                    .replace("{VALUE}", model.modelID)
                    .replace("{OPTION}", model.modelName);
                //console.log(text);
                carModelSelect.insertAdjacentHTML("beforeend", txt);
            }
        });
})

addButton.addEventListener("click", () => {
    if (carYearSelect.value === "#" || carMakeSelect.value === "#" || carModelSelect.value === "#") alert("Invalid Car!");
    else 
    {
        // const makeName = makeDataSet.filter(make => make.makeID == carMakeSelect.value);
        const makeName = carMakeSelect[carMakeSelect.selectedIndex].text;
        const modelName = carModelSelect[carModelSelect.selectedIndex].text;
        
        const carString = `<li>${carYearSelect.value} ${makeName} ${modelName}</li>`;
        document.getElementById('carList').insertAdjacentHTML('beforeend', carString);
        let _data = {
            Locations: [locationID],
            Models: [carModelSelect.value], 
            MakeID: carMakeSelect.value,
            Years: [carYearSelect.value]
          }
          fetch(searchURL, {
            method: "POST",
            headers: {"Content-Type": "application/json; charset=UTF-8"},
            body: JSON.stringify(_data)
          }).then(response => response.json())
            .then(json => {
                // console.log(json[0].exact)
                if (json[0].exact.length === 0) 
                {
                    alert("Sorry, no exact matches for this car!");
                }
                else
                {
                    for (let match of json[0].exact)
                    {
                        const carObj = {
                            Row: match.row,
                            Year: match.modelYear,
                            Make: match.makeName,
                            Model: match.modelName
                        }
                        console.log(carObj);
                        
                    }
                }

            });
    }
});


// --------------------------------------------------------
//      FUNCTIONS
// --------------------------------------------------------

function generateOptions(makes) {
    let html = "";
    makes.forEach(make => html += optionHtml.replace("{VALUE}", make.makeID).replace("{OPTION}", make.makeName));
    carMakeSelect.innerHTML = html;
}

function fetchData(url) 
{
    return fetch(url)
        .then(res => res.json())
        .catch(err => console.log('Looks like there was a problem', err));
} 

function buildYearOptions()
{
    let year = 1995;
    while (year != 2021)
    {
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

    