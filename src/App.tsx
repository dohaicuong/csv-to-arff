import React from 'react'
import { Container, Paper, Grid, TextField, Button } from '@material-ui/core'

const App = () => {
  const inputRef = React.createRef<HTMLInputElement>()

  const [name, setName] = React.useState('')
  const [value, setValue] = React.useState<string>('')
  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = inputRef.current?.files?.[0]
    if(!file) return

    const name = file.name.split('.csv').slice(0, -1).join()
    setName(name)
    const data = await fileToString(file)

    const { headerString, contentString } = parseHeaderAndContent(data)

    const headers = parseHeaders(headerString)
    const rows = parseRows(contentString)

    const types = getArffTypes({ headers, rows })
    
    const arrf = parseToArff(name, types, contentString)
    setValue(arrf)
  }
  const download = () => {
    if(value) downloadString(`${name}.arrf`, value)
  }

  return (
    <Container className="App" maxWidth='md'>
      <Paper style={{ padding: 16 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <input type='file' ref={inputRef} onChange={onChange} />
          </Grid>
          <Grid item xs={12}>
            <TextField
              variant='outlined'
              multiline
              fullWidth
              rows={6}
              rowsMax={25}
              value={value}
              onChange={e => setValue(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant='contained'
              color='primary'
              disabled={!Boolean(value || name)}
              onClick={download}
            >
              download
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  )
}

export default App;

const fileToString = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = e => {
      const data = e.target?.result
      if(!data) reject('No data')
      resolve(data as string)
    }
    reader.readAsText(file)
  })
}

const parseHeaderAndContent = (csvString: string): { headerString: string, contentString: string } => {
  const headerString = csvString.split('\n')[0]
  const contentString = csvString.split('\n').slice(1).join('\n')
  return { headerString, contentString }
}

const parseHeaders = (headerString: string): string[] => {
  return headerString.replace(/"/g, '').replace(/\n/g, '').split(',').map(header => header.trim())
}
const parseRows = (contentString: string) => {
  return contentString.split('\n').map(row => row.split(',') || '?')
}

const getArffTypes = ({ headers, rows }: { headers: string[], rows: string[][] }) => {
  const firstRow = rows[0]
  const types = firstRow.map((field, index) => {
    const name = headers[index]
    const type = isNaN(Number(field))
        ? 'enum'
        : Number(field) % 1 === 0 ? 'integer' : 'real'
    const values: Set<string> = new Set()
    
    return { name, type, values }
  })
  for(const row of rows) {
    types.forEach((type, index) => {
      if(type.type !== 'enum') return
      if(type.values.has(row[index])) return

      type.values.add(row[index].trim())
    })
  }
  const cleanedTypes = types.map(type => {
    return {
      ...type,
      values: Array.from(type.values).filter(value => value !== '?')
    }
  })

  return cleanedTypes
}

const parseToArff = (relation: string, types: any, data: string) => {
  const arffAttributes = types
    .map((type: any) => {
      const value = type.type !== 'enum' ? type.type : `{${type.values.join(',')}}`
      return `@attribute '${type.name}' ${value}`
    })
    .join(`\n`)

  return `@relation ${relation}\n${arffAttributes}\n@data\n${data}`
}

const downloadString = (name: string, data: string) => {
  const blob = new Blob([data])
  // @ts-ignore
  if(window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveBlob(blob, name)
  }
  else{
      var elem = window.document.createElement('a')
      elem.href = window.URL.createObjectURL(blob)
      elem.download = name
      document.body.appendChild(elem)
      elem.click()
      document.body.removeChild(elem)
  }
}