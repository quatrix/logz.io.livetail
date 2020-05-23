# Logz.io Live-Tail CLI (UNOFFICIAL)

CLI tool to get a live tail of log events from https://logz.io Live Tail service

## Installation

```bash
yarn install
```

## Usage

### Getting Auth Token
Since i didn't implement login yet, you'll need to get the token manually:

1. Go to the Live Tail tab in https://logz.io web interface
1. Open developer tools / inspect
1. Go to Network tab
1. Find a request that's called `live-tail`
1. From the headers copy the `X-Auth-Token` header
1. From the cookie copy the `logz-lastAuthToken` field
1. Create a json file with the following format and save it as `account_name.json` (replace place holders with your values) 

```json
{
    "last_auth_token":  "{logz-lastAuthToken}"
    "x_auth_token": "{X-Auth-Token}"
}
```

### Help


```
# node src/livetail.js --help

usage: livetail.js [-h] [-v] -c AUTH_CONFIG [-m {RAW,PARSED}]
                   [-o OUTPUT_FIELDS] [--is_not IS_NOT] [--is IS]


Command line interface for Logz.io Live Tail

Optional arguments:
  -h, --help            Show this help message and exit.
  -v, --version         Show program's version number and exit.
  -c AUTH_CONFIG, --auth_config AUTH_CONFIG
                        json file with auth tokens
  -m {RAW,PARSED}, --mode {RAW,PARSED}
                        filter mode, raw or parse
  -o OUTPUT_FIELDS, --output_fields OUTPUT_FIELDS
                        what fields to get from the log
  --is_not IS_NOT       filter where field != value [syntax: field:value0,value1,value2]
  --is IS               filter where field == value [syntax: field:value0,value1,value2]
```


### Output Fields
By default the output fields are `@timestamp` and `message`, you can specify multiple `-o field` and these fields will be added (When you add fields, you need to also add message)


```bash
node src/livetail.js -c accounts/my_account.json -o module -o env -o level
```

### Filters

#### is_not 

To filter out messages that have specific values in a given field


```bash
node src/livetail.js -c accounts/my_account.json --is_not env:prod


# or multiple values
node src/livetail.js -c accounts/my_account.json --is_not env:staging,cd
```


#### is 

Same as `is_not` but reversed

```bash
node src/livetail.js -c accounts/my_account.json --is env:prod
```

### TODO

- [ ] Implement `login` and getting a token
- [ ] Polling for events after websocket closes 
- [ ] `REGEX` mode
- [ ] `is_exists` / `is_not_exists` filters
- [ ] output formatting, being able to pass a format/template 
- [ ] loading filters from configuration file (sort of saved filters)
