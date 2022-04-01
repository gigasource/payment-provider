export const TextAlignment = {
  left: 'l',
  center: 'c',
  right: 'r'
}

export default class PrintOutContentBuilder {
  constructor() {
    this.content = ''
  }

  /**
   * Text to print
   * @param content Text to print
   * @param bold Indicates that text should be printed in bold
   * @param alignment Text aligtment
   */
  txt(content, { bold = false, alignment = TextAlignment.left }) {
    if (!content)
      throw "Missing content";

    if (content.length > 40)
      throw "Maximum content length is 40";

    this.content += `<t><${alignment}>${bold ? '<b>': ''}${content}${bold ? '</b>' : ''}</${alignment}></t>`;
    return this
  }

  /**
   * Indicates that printer should feed a line after current string
   */
  lf() {
    this.content += '<lf/>'
    return this
  }

  br() {
    this.content += '<br/>'
    return this
  }

  /***
   * Includes the bitmap for printing.
   * Must be base64 encoded black/white BMP file.
   * Image is always printed from the first line. No 'lf' is required.
   * @param base64Img
   */
  img(base64Img) {
    this.content += `<img>${base64Img}</img>`
    return this
  }

  qr(qr) {
    this.content += `<qr>${qr}</qr>`
    return this
  }

  build() {
    return this.content;
  }
}
