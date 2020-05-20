const fetch = require('node-fetch')
const WebSocket = require('ws')
const fs = require('fs-extra')
const { ArgumentParser } = require('argparse')

const LIVE_TAIL_URL = "https://app.logz.io/live-tail"

const getWS = async (auth, options) => {
    return fetch(LIVE_TAIL_URL, {
      "headers": {
        "x-auth-token": auth.x_auth_token,
        "x-logz-csrf-token": "foobar",
        "cookie": `logz-lastAuthToken=${auth.last_auth_token}; Logzio-Csrf=foobar;`
      },
      "body": JSON.stringify(options),
      "method": "POST",
    })
    .then(res => res.json())
    .then(res => res["url"])
}

const tail = async (auth, options) => {
    const url = await getWS(auth, options)
    const socket = new WebSocket(url)

    socket.onopen = e => {
      console.log("[open] Connection established");
    };

    socket.onmessage = event => {
        const messages = JSON.parse(event.data)

        for (const message of messages) {
          console.log(options.outputFields.map(i=>`${i}: ${message[i]}`).join(" "))
        }

    };

    socket.onclose = event => {
      if (event.wasClean) {
        console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
      } else {
        console.log("[close] Connection died");
      }
    }

    socket.onerror = error => {
      console.log(`[error] ${error.message}`)
    }


}

const getArgs = () => {
  var parser = new ArgumentParser({
      version: '0.0.1',
      addHelp: true,
      description: 'Command line interface for Logz.io Live Tail',
  })

  parser.addArgument(
    [ '-c', '--auth_config' ],
    {
      help: 'json file with auth tokens',
      required: true
    }
  )

  parser.addArgument(
    [ '-m', '--mode' ],
    {
      help: 'filter mode, raw or parse',
      choices: ['RAW', 'PARSED'],
      defaultValue: 'PARSED'
    }
  )

  parser.addArgument(
    [ '-o', '--output_fields' ],
    {
      help: 'what fields to get from the log',
      defaultValue: ["@timestamp"],
      action: 'append'
    }
  )

  parser.addArgument(
    [ '--is_not' ],
    {
      help: 'filter where field != value [syntax: field:value0,value1,value2]',
      action: 'append',
      defaultValue: [],
    }
  )

  parser.addArgument(
    [ '--is' ],
    {
      help: 'filter where field == value [syntax: field:value0,value1,value2]',
      action: 'append',
      defaultValue: [],
    }
  )

  return parser.parseArgs();
}


const createOptions = args => {
  if (args.output_fields.length == 1) {
    args.output_fields.push('message')
  }

  const fieldFilters = []

  for (const f of args.is_not) {
    const [field, values] = f.split(":")
    fieldFilters.push({field, filterType: "IS_NOT", fieldValues: values.split(','), negate: true})
  }

  for (const f of args.is) {
    const [field, values] = f.split(":")
    fieldFilters.push({field, filterType: "IS", fieldValues: values.split(','), negate: false})
  }

  return {
    "outputFields": args.output_fields,
    "fieldFilters": fieldFilters,
    "regexFilters": [],
    "mode": args.mode,
  }
}

const main = async () => {
  const args = getArgs()
  const options = createOptions(args)
  const auth = await fs.readJson(args.auth_config)
      
  await tail(auth, options)
}

main()
