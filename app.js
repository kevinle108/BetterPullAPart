const locationID = "18"; // for Louisville
const locURL = "https://enterpriseservice.pullapart.com/Location";
const makeURL = "https://inventoryservice.pullapart.com/Make/";
const modelURL = "https://inventoryservice.pullapart.com/Model?makeID=";
const carYearSelect = document.getElementById("carYear");
const carMakeSelect = document.getElementById("carMake");
const carModelSelect = document.getElementById("carModel");
const optionHtml = `<option value="{VALUE}">{OPTION}</option>`;

carMakeSelect.addEventListener("change", e => {
    const makeId = e.target.value;
    getData(modelURL + makeId)
        .then(modelJson => {
            console.log(modelJson)
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

getData(makeURL)
    .then(json => {
        console.log(json);
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