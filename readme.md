## Routing

* `api/{state-abbr}` - Get all data currently available for that state
* `api/{state-abbr}/{scaper-id}` - Get the data for that state for only that sraper
* `api/supported-states` - A list of currently supported states 

## Conventions

* Confirmed cases are always labeled as such. Do not use "positive" or "total" or any other key.
* Timestamps are recorded in Unix time (seconds since epoch) ex: `1583874630`.
* In cases where there is a single point of data with date but no time, it should be ISO 8601 ex: `2020-03-11`.
* All scrapers **must** return a `data` object with a `confirmed` property. Due to nature of data sources containing different data, any other properties are optional and considered non-standard.