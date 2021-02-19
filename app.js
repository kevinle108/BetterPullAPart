const locationID = "18"; // for Louisville
const locURL = "https://enterpriseservice.pullapart.com/Location";
const makeURL = "https://inventoryservice.pullapart.com/Make/";
const modelURL = "https://inventoryservice.pullapart.com/Model?makeID=";
const searchURL = "https://inventoryservice.pullapart.com/Vehicle/Search";
const carYearSelect = document.getElementById("carYear");
const carMakeSelect = document.getElementById("carMake");
const carModelSelect = document.getElementById("carModel");
const addButton = document.getElementById("addButton");
const optionHtml = `<option value="{VALUE}">{OPTION}</option>`;


//{"Locations":["8"],"Models":["861"],"MakeID":56,"Years":[]}






addButton.addEventListener("click", () => {
    if (carYearSelect.value === "#" || carMakeSelect.value === "#" || carModelSelect.value === "#") alert("Invalid Car!");
    else 
    {
        let _data = {
            Locations: [8],
            Models: [carModelSelect.value], 
            MakeID: carMakeSelect.value,
            Years: [carYearSelect.value]
          }
          
          fetch(searchURL, {
            method: "POST",
            body: JSON.stringify(_data),
            headers: {"Content-type": "application/json; charset=UTF-8"}
          }).then(response => response.json()).then(json => console.log(json));
    }
});

carMakeSelect.addEventListener("change", e => {
    const makeId = e.target.value;
    getData(modelURL + makeId)
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

// populates the year selections with years 1955 - 2020
buildYearOptions();

// getData(locURL);


getData(makeURL)
    .then(makeJson => {
        makeJson = makeJson.sort((a, b) => a.makeName < b.makeName ? -1 : 1); // sorts makes by ABC order
        for (let make of makeJson)
        {
            let txt = optionHtml;
            txt = txt
                .replace("{VALUE}", make.makeID)
                .replace("{OPTION}", make.makeName);
            //console.log(text);
            carMakeSelect.insertAdjacentHTML("beforeend", txt);
        }
    });






//// FUNCTIONS ////



    async function getData(url) 
    {
        const response = await fetch(url);
        const json = await response.json();
        return json;
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


    