'use strict';
const input = document.querySelector('input');
const errorMessage = document.querySelector('.error-message');
const homepage = document.querySelector('.homepage');
const detailsPage = document.querySelector('.details-page');
const countryContainer = document.querySelector('.country-container');
const body = document.querySelector('body');
const detailsPageArticle = document.querySelector('.details-page > article');
const back = document.querySelector('.back');
const loader = document.querySelector('.loader');

const showLoader = function () {
  loader.classList.remove('hidden');
};
const removeLoader = function () {
  loader.classList.add('hidden');
};

let countryDetailsContainer;

const renderCountries = function (flag, name, population, region, capital) {
  countryContainer.insertAdjacentHTML(
    'afterbegin',
    `  <div class="country-details-container">
          <img src="${flag}" alt="flag">
          <div>
              <h2 data-name="${name}" class="country-name">${name}</h2>
              <p>population: <span class="population">${population.toLocaleString()}</span></p>
              <p>region: <span class="region">${region}</span></p>
              <p>capital:<span class="capital"> ${capital}</span></p>
          </div>
      </div>`
  );
  countryDetailsContainer = document.querySelectorAll(
    '.country-details-container'
  );
};

const removeErrMsg = function () {
  countryContainer.classList.remove('hidden');
  detailsPageArticle.classList.remove('hidden');
  errorMessage.classList.add('hidden');
};

const renderErrMsg = function (
  errMsg = 'country does not exist, please input another country.'
) {
  countryContainer.classList.add('hidden');
  detailsPageArticle.classList.add('hidden');
  errorMessage.classList.remove('hidden');
  errorMessage.innerHTML = errMsg;
};

const renderDetailsPage = function (
  countryName,
  flag,
  nativeName,
  population,
  region,
  capital,
  domain,
  currencies,
  language,
  bordersArr
) {
  const detailsCountryName = document.querySelector(
    '.details-page--country-name'
  );
  const detailsCountryFlag = document.querySelector('.details-img');
  const detailsCountryRegion = document.querySelector('.details-page--region');
  const detailsCountryDomain = document.querySelector('.details-page--domain');
  const detailsCountryBorderCountries = document.querySelector(
    '.details-page__border-countries'
  );
  const detailsCountryCapital = document.querySelector(
    '.details-page--capital'
  );
  const detailsCountryCurrencies = document.querySelector(
    '.details-page--currencies'
  );
  const detailsCountryLanguage = document.querySelector(
    '.details-page--languages'
  );
  const detailsCountryPopulation = document.querySelector(
    '.details-page--population'
  );
  const detailsCountryNativeName = document.querySelector(
    '.details-page--native-name'
  );
  detailsPageArticle.classList.remove('translate-right');
  detailsPageArticle.classList.add('translate-left');
  homepage.classList.add('hidden');
  detailsCountryName.textContent = `${countryName}`;
  detailsCountryFlag.src = `${flag}`;
  detailsCountryPopulation.textContent = `${population.toLocaleString()}`;
  detailsCountryRegion.textContent = `${region}`;
  detailsCountryCapital.textContent = `${capital}`;
  detailsCountryCurrencies.textContent = `${currencies}`;
  detailsCountryLanguage.textContent = `${language}`;
  detailsCountryNativeName.textContent = `${nativeName}`;
  detailsCountryDomain.textContent = `${domain}`;
  const borderList = document.querySelector(
    '.details-page__border-countries ul'
  );

  borderList.innerHTML = '';
  bordersArr.forEach(bd => {
    borderList.insertAdjacentHTML(
      'afterbegin',
      `  <li>
          <p>${bd}</p>
      </li>`
    );
    const borders = document.querySelectorAll(
      '.details-page__border-countries ul li p'
    );
    borders.forEach(bd => {
      bd.addEventListener('click', function () {
        getClickedCountry(bd.textContent.trim());
      });
    });
  });
};

back.addEventListener('click', function () {
  showCountryContainer();
  detailsPageArticle.classList.remove('translate-left');
  detailsPageArticle.classList.add('translate-right');
  homepage.classList.remove('hidden');
});

const clearCountryContainer = function () {
  countryContainer.innerHTML = '';
};
const showCountryContainer = function () {
  countryContainer.classList.remove('hidden');
};
const hideCountryContainer = function () {
  countryContainer.classList.add('hidden');
};

let allRestCountryData;

async function getAllCountries() {
  try {
    showLoader();
    const res = await fetch('https://restcountries.com/v3.1/all');
    const data = await res.json();
    allRestCountryData = data;
    data.sort((a, b) => {
      return b.name.common.localeCompare(a.name.common);
    });
    if (res.ok) {
      removeLoader();
      data.forEach(data => {
        renderCountries(
          data.flags.png,
          data.name.common,
          data.population,
          data.region,
          data.capital
        );
      });
    }

    // cd : country details
    countryDetailsContainer.forEach(cD => {
      cD.addEventListener('click', function () {
        const countryNameEl = cD.querySelector('.country-name');
        const countryName = countryNameEl.getAttribute('data-name');
        getClickedCountry(countryName);
      });
    });
  } catch (err) {
    console.log(err);
  }
}

getAllCountries();

async function getClickedCountry(name) {
  try {
    hideCountryContainer();
    showLoader();
    const res = await fetch(`https://restcountries.com/v3.1/name/${name}`);
    const [data] = await res.json();
    if (!res.ok) {
      throw new Error(`Response was'nt gotten`);
    }

    if (res.ok) {
      removeLoader();
      const [capital] =
        data?.capital !== undefined || null ? data.capital : 'none';
      const nameObj = data?.name;
      const nativeName = Object.values(data?.name?.nativeName ?? {});
      const currencies = Object.values(data.currencies ?? {});
      const languages = Object.values(data.languages ?? {});

      const bordersArr = [];
      allRestCountryData.forEach(country => {
        if (country.borders?.includes(data.cca3) === true) {
          bordersArr.push(country?.name?.common);
        }

        renderDetailsPage(
          data.name.common,
          data.flags.png,
          nativeName[0]?.official ?? 'none',
          data.population,
          data.region,
          capital,
          data?.tld[0] ?? 'none',
          currencies[0]?.name ?? 'none',
          languages[0] ?? 'none',
          bordersArr
        );
      });
    }
  } catch (err) {
    console.log(err);
  }
}

async function getTypedCountries() {
  try {
    const query = input.value.trim();
    const res = await fetch(`https://restcountries.com/v3.1/name/${query}`);

    if (query === '') {
      getAllCountries();
      throw new Error('no input');
    }
    if (!res.ok && query !== '') renderErrMsg();

    const data = await res.json();
    data.sort((a, b) => {
      return b.name.common.localeCompare(a.name.common);
    });
    if (res.ok) {
      removeErrMsg();
      // clearCountryContainer();
      data.forEach(data => {
        renderCountries(
          data.flags.png,
          data.name.common,
          data.population,
          data.region,
          data.capital ?? 'no capital'
        );
      });
    }

    countryDetailsContainer.forEach(cD => {
      cD.addEventListener('click', function () {
        const countryNameEl = cD.querySelector('.country-name');
        const countryName = countryNameEl.getAttribute('data-name');
        getClickedCountry(countryName);
      });
    });
  } catch (err) {
    console.log(err);
  }
}
// update countries on input
input.addEventListener('input', getTypedCountries);

// get country by regions

async function getRegionCountries(region) {
  try {
    showLoader();
    hideCountryContainer();
    const res = await fetch(`https://restcountries.com/v3.1/region/${region}`);
    if (!res.ok) {
      throw new Error('response wasnt gotten');
    }
    const data = await res.json();
    data.sort((a, b) => {
      return b.name.common.localeCompare(a.name.common);
    });
    if (res.ok) {
      removeLoader();
      showCountryContainer();
      clearCountryContainer();
      data.forEach(data => {
        renderCountries(
          data.flags.png,
          data.name.common,
          data.population,
          data.region,
          data.capital
        );
      });
    }
    // console.log(allRestCountryData);
    // const filterArr = allRestCountryData.filter(country => {
    //   country.region === region;
    //   console.log(country.region.toLowerCase);
    //   console.log(country.region === region);
    //   console.log(country.region);
    // });
    // console.log(filterArr);
    countryDetailsContainer.forEach(cD => {
      cD.addEventListener('click', function () {
        const countryNameEl = cD.querySelector('.country-name');
        const countryName = countryNameEl.getAttribute('data-name');
        getClickedCountry(countryName);
      });
    });
  } catch (err) {
    console.log(err);
  }
}

// toggle hidden of the filter options

const filterContainer = document.querySelector('.filter');
const optionsContainer = document.querySelector('.options');
const options = document.querySelectorAll('.options p');
const filterImg = document.querySelector('.filter img');
filterContainer.addEventListener('click', function () {
  optionsContainer.classList.toggle('hidden');
  filterImg.classList.toggle('rotate-up');
  filterImg.classList.toggle('rotate-down');
});

// render countries based on selected region option

options.forEach(op => {
  op.addEventListener('click', function () {
    const region = op.textContent.trim();
    getRegionCountries(region);
  });
});
