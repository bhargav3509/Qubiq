const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const path = require('path');

class DocumentExtractionService {
  async extract(buffer, filename) {
    const ext = path.extname(filename).toLowerCase();

    switch (ext) {
      case '.pdf':
        return this.extractPDF(buffer);
      case '.docx':
        return this.extractDOCX(buffer);
      case '.pptx':
        return this.extractPPTX(buffer);
      case '.txt':
        return this.extractTXT(buffer);
      default:
        throw new Error(`Unsupported file type: ${ext}`);
    }
  }

  async extractPDF(buffer) {
    try {
      const data = await pdf(buffer);
      return {
        text: data.text || '',
        pageCount: data.numpages || 0,
        wordCount: (data.text || '').split(/\s+/).filter(Boolean).length,
      };
    } catch (err) {
      console.error('PDF extraction error:', err.message);
      return { text: '', pageCount: 0, wordCount: 0 };
    }
  }

  async extractDOCX(buffer) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return {
        text: result.value || '',
        pageCount: null,
        wordCount: (result.value || '').split(/\s+/).filter(Boolean).length,
      };
    } catch (err) {
      console.error('DOCX extraction error:', err.message);
      return { text: '', pageCount: null, wordCount: 0 };
    }
  }

  async extractPPTX(buffer) {
    try {
      const yauzl = require('yauzl');
      const texts = [];

      return new Promise((resolve) => {
        yauzl.fromBuffer(buffer, { lazyEntries: true }, (err, zipfile) => {
          if (err) {
            resolve({ text: '', pageCount: null, wordCount: 0 });
            return;
          }

          zipfile.readEntry();
          zipfile.on('entry', (entry) => {
            if (/ppt\/slides\/slide\d+\.xml/.test(entry.fileName)) {
              zipfile.openReadStream(entry, (err, readStream) => {
                if (err) {
                  zipfile.readEntry();
                  return;
                }
                let data = '';
                readStream.on('data', (chunk) => (data += chunk));
                readStream.on('end', () => {
                  const textContent = data
                    .replace(/<a:t>/g, ' ')
                    .replace(/<[^>]+>/g, '')
                    .replace(/\s+/g, ' ')
                    .trim();
                  if (textContent) texts.push(textContent);
                  zipfile.readEntry();
                });
                readStream.on('error', () => zipfile.readEntry());
              });
            } else {
              zipfile.readEntry();
            }
          });

          zipfile.on('end', () => {
            const text = texts.join('\n\n');
            resolve({
              text,
              pageCount: texts.length,
              wordCount: text.split(/\s+/).filter(Boolean).length,
            });
          });

          zipfile.on('error', () =>
            resolve({ text: '', pageCount: null, wordCount: 0 })
          );
        });
      });
    } catch (err) {
      console.error('PPTX extraction error:', err.message);
      return { text: '', pageCount: null, wordCount: 0 };
    }
  }

  async extractTXT(buffer) {
    const text = buffer.toString('utf-8');
    return {
      text,
      pageCount: null,
      wordCount: text.split(/\s+/).filter(Boolean).length,
    };
  }
}

module.exports = new DocumentExtractionService();

