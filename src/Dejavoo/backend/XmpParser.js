const { XMLParser } = require("fast-xml-parser");

const xmp2xml = xmpContent => {
  return xmpContent.replace('<xmp>', '').replace('</xmp>', '')
}

class XmpParser {
  constructor() {
    this._parser = new XMLParser()
  }

  parse(xmpContent) {
    return this._parser.parse(xmp2xml(xmpContent))
  }
}

module.exports = XmpParser
