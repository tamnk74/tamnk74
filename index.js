require("dotenv").config();
const Mustache = require("mustache");
const axios = require("axios");
const moment = require("moment");
const fs = require("fs");

require("moment-lunar");

const MUSTACHE_MAIN_DIR = "./main.mustache";

const getTimes = async () => {
  const solarDate = moment();
  const lunarDate = moment().lunar().format("dddd MMM, DD, YYYY HH:mm");

  const solarNewYear = moment()
    .year(solarDate.year() + 1)
    .month(0)
    .date(1);
  const lunarNewYear = moment()
    .year(lunarDate.year() + 1)
    .month(0)
    .date(1)
    .solar();

  const tetDays = lunarNewYear.diff(moment(), "days");
  const newYearDays = solarNewYear.diff(moment(), "days");

  return {
    solarDate: solarDate.format("dddd MMM, DD, YYYY HH:mm"),
    lunarDate,
    tetDays,
    newYearDays,
  };
};

const getQuote = async () => {
  try {
    const { data } = await axios.get(
      "https://quotes.rest/qod?language=en&quot;"
    );
    const quote = data.contents.quotes[0].quote;
    const author = data.contents.quotes[0].author;

    console.log("new quote", `"${quote}"`);

    return {
      quote,
      author,
    };
  } catch (err) {
    console.error(err.message);
    return {};
  }
};

async function generateReadMe() {
  const { quote, author } = await getQuote();
  const { solarDate, lunarDate, tetDays, newYearDays } = await getTimes();
  await fs.readFile(MUSTACHE_MAIN_DIR, (err, data) => {
    if (err) throw err;
    const output = Mustache.render(data.toString(), {
      quote,
      author,
      solarDate,
      lunarDate,
      tetDays,
      newYearDays,
    });
    fs.writeFileSync("README.md", output);
  });
}

async function action() {
  /**
   * Generate README
   */
  await generateReadMe();
}

action();
