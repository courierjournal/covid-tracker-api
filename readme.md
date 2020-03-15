# COVID Tracker API
A quick and dirty modular API designed to scrape information on COVID-19 status in the US. This is an experimental prototype.

https://cv19.newscarr.net

## Routing

* `api/status/{state-abbr}` - Get all data currently available for that state
* `api/status/{state-abbr}/{scraper-id}` - Get the data for that state for only that sraper
* `api/supported-states` - A list of currently supported states 

## Conventions

* Confirmed cases are always labeled as such. Do not use "positive" or "total" or any other key.
* Timestamps are recorded in milliseconds since epoch in order to be more easily parsable by javascripts Date() constructor ex: `1584228637251`.
* In cases where there is a single point of data with date but no time, it should be ISO 8601 ex: `2020-03-11`.
* All scrapers **must** return a `data` object with a `confirmed` property. Due to nature of data sources containing different data, any other properties are optional and considered non-standard.