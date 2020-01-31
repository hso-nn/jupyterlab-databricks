import * as React from "react"

import { FormGroup, InputGroup } from "@blueprintjs/core"


interface IInputFormProps {
  onChange: Function,
  apiKey: string,
  uri: string
}


function InputForm({ onChange, uri, apiKey }: IInputFormProps) {
    return (<div>
      <FormGroup
        label="Databricks URI"
        labelFor="databricksUriInput"
      >
        <InputGroup
          id="databricksUriInput"
          placeholder="https://westeurope.azuredatabricks.net"
          onChange={(evt: any) => onChange("uri", evt.target.value)}
          defaultValue={uri}
        />
      </FormGroup>
      <FormGroup
        label="Databricks API key"
        labelFor="databricksKeyInput"
      >
        <InputGroup
          id="databricksKeyInput"
          onChange={(evt: any) => onChange("api_key", evt.target.value)}
          defaultValue={apiKey}
        />
      </FormGroup>
  
    </div>)
  }

export default InputForm
