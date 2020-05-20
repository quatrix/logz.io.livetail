# logz.io live tail cli (UNOFFICIAL)

CLI tool to get a live tail of log events from logz.io Live Tail service

## installation
yarn install

## usage

### token
since i didn't implement login yet, you'll need to get the token manually:

1. go to the Live Tail tab in logz.io web interface
1. open developer tools / inspect
1. go to Network tab
1. find a request that's called `live-tail`
1. from the headers copy the `X-Auth-Token` header
1. from the cookie copy the `logz-lastAuthToken` field
1. create a json file with the following format and save it as `account_name.json` (replace place holders with your values) 

```json
{
    "last_auth_token":  "{logz-lastAuthToken}"
    "x_auth_token": "{X-Auth-Token}"
}
```

### help


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

### limitations

* corrently only `parsed` mode is implemented (but very easy to implement regex mode)
* if there are no new messages, it will quit, need to add some polling mechanism (logs.io actually send an event when you should poll next)
* `is` some field
* `is_not` some field
* missing: exists
* missing: not_exists
* etc...

### output fields
by default the output fields are `@timestamp` and `message`, you can specify multiple `-o field` and these fields will be added
(when you add fields, you need to also add message)


```bash
node src/livetail.js -c accounts/my_account.json -o module -o env -o level
```


#### is_not

to filter out messages that have specific values in a given field


```bash
node src/livetail.js -c accounts/my_account.json --is_not env:prod


# or multiple values
node src/livetail.js -c accounts/my_account.json --is_not env:staging,cd
```


#### is

same as `is_not` but reversed

```bash
node src/livetail.js -c accounts/my_account.json --is env:prod
```
