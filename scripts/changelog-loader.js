const matter = require('gray-matter');
const { marked } = require('marked');
const sanitizeHtml = require('sanitize-html');

const versionRegex = /(\d+\.\d+\.\d+)/;
const dateRegex = /-?\s*(\d{4}-\d{2}-\d{2})/;

function toVersionMeta(data) {
  return {
    id: data.id || '',
    title: data.title || 'Untitled',
    version: data.version || '',
    date: data.date || '',
    order: data.order || 0,
  };
}

function parseVersionItems(fullHtml) {
  const sections = fullHtml.split(/<h2[^>]*>/);  // <h2> ごとに分割，先頭の前文は捨てる
  sections.shift();

  const items = [];

  for (const section of sections) {
    const closeTag = section.indexOf('</h2>');
    const headerText = section.slice(0, closeTag).trim();
    const body = section.slice(closeTag + '</h2>'.length).trim();

    const version = (headerText.match(versionRegex) || [])[1] || '';
    if (!version) continue;

    const date = (headerText.match(dateRegex) || [])[1] || '';
    const [major, minor, patch] = version.split('.').map(Number);
    const order = major * 1000000 + minor * 1000 + patch;

    items.push({
      metadata: toVersionMeta({ id: version, version, title: headerText, date, order }),
      content: body,
    });
  }

  return items;
}

module.exports = function (source) {
  const callback = this.async();

  try {
    const { content } = matter(source);

    const fullHtml = String(marked.parse(content, { async: false }));
    const versionItems = parseVersionItems(fullHtml);

    const sanitizeOptions = {
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
    };

    const result = versionItems.map((item) => {
      const sanitized = sanitizeHtml(item.content, sanitizeOptions);
      return {
        metadata: item.metadata,
        content: sanitized,
      };
    });

    const code = `export default ${JSON.stringify(result, null, 2)};`;

    callback(null, code);
  } catch (error) {
    callback(error);
  }
};
