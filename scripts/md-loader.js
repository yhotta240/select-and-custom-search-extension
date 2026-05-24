const matter = require('gray-matter');
const { marked } = require('marked');
const sanitizeHtml = require('sanitize-html');

function toDocumentMeta(data) {
  const metadata = {
    id: data.id || '',
    title: data.title || 'Untitled',
    order: data.order || 0,
    visible: data.visible !== false,
    expanded: data.expanded !== false,
    date: data.date || '',
    lang: data.lang || '',
  };

  return metadata;
}

/**
 * .md を読み込み，メタ情報付きオブジェクトとして出力する
 */
module.exports = function (source) {
  const callback = this.async();

  try {
    const { data, content } = matter(source);

    const html = marked.parse(content, { async: false });

    const sanitizedHtml = sanitizeHtml(html, {
      allowedTags: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'hr',
        'ul', 'ol', 'li',
        'strong', 'em', 'code', 'pre', 'blockquote',
        'a', 'img',
      ],
      allowedAttributes: {
        a: ['href', 'title', 'target', 'rel'],
        img: ['src', 'alt', 'title', 'width', 'height'],
      },
      allowedSchemes: ['http', 'https', 'mailto'],
      allowedSchemesAppliedToAttributes: ['href', 'src'],
      allowProtocolRelative: false,
      transformTags: {
        a: (tagName, attribs) => ({
          tagName,
          attribs: {
            ...attribs,
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        }),
      },
    });

    const document = {
      metadata: {
        ...toDocumentMeta(data),
      },
      content: sanitizedHtml,
    };

    const code = `export default ${JSON.stringify(document, null, 2)};`;

    callback(null, code);
  } catch (error) {
    callback(error);
  }
};
