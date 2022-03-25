const XmpParser = require('../backend/XmpParser')

const parser = new XmpParser()

describe('xmp to xml converter', () => {
  it('print out', () => {
    const xmpContent = `<xmp><response><RegisterId>90897001</RegisterId><Message>Success</Message></response></xmp>`
    const expectContent = {
      response: {
        RegisterId: 90897001,
        Message: 'Success'
      }
    }
    expect(parser.parse(xmpContent)).toEqual(expectContent)
  })

  it('parse user input', () => {
    const xmpContent = '<xmp><response><RegisterId>90897001</RegisterId><Message>Success</Message><UserInput>111</UserInput></response></xmp>'
    const expectContent = {
       response: {
          Message: "Success",
          RegisterId: 90897001,
          UserInput: 111
       }
    }
    expect(parser.parse(xmpContent)).toEqual(expectContent)
  })

  it('parse user choice', () => {
    const xmpContent = '<xmp><response><RegisterId>90897001</RegisterId><Message>Success</Message><UserChoice>Credit</UserChoice></response></xmp>'
    const expectContent = {
      response: {
        RegisterId: 90897001,
        Message: 'Success',
        UserChoice: 'Credit'
      }
    }
    expect(parser.parse(xmpContent)).toEqual(expectContent)
  })

  it('parse transaction status - no open batch', () => {
    const xmpContent = '<xmp><response><RefId>1</RefId><Message>No open batch</Message></response></xmp>'
    const expectContent = {
      response: {
        RefId: 1,
        Message: 'No open batch'
      }
    }
    expect(parser.parse(xmpContent)).toEqual(expectContent)
  })

  it('parse transaction request response failed', () => {
    const xmpContent = '<xmp><response></response></xmp>'
    const expectContent = {

    }
    expect(parser.parse(xmpContent)).toEqual(expectContent)
  })

  it('parse transaction request response success', () => {
    const xmpContent = '<xmp><response></response></xmp>'
    const expectContent = {

    }
    expect(parser.parse(xmpContent)).toEqual(expectContent)
  })
})
