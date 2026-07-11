// Generic renderer: takes arbitrary nested JSON (any Prokerala API response
// shape) and turns it into readable labeled fields, tables for arrays of
// objects, and chip lists for arrays of primitives — no per-endpoint
// templates required. Used directly for the generic Vedic tools, and as an
// "Additional Details" section under the hand-designed pages.
(function (global) {
  function humanizeKey(key) {
    return key
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function isIsoDate(str) {
    return typeof str === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(str);
  }

  function renderValue(value) {
    if (value === null || value === undefined || value === '') return '<span class="pj-empty">—</span>';
    if (typeof value === 'boolean') {
      return '<span class="pj-badge pj-badge-' + (value ? 'yes' : 'no') + '">' + (value ? 'Yes' : 'No') + '</span>';
    }
    if (typeof value === 'number') return '<span class="pj-number">' + value + '</span>';
    if (typeof value === 'string') {
      if (isIsoDate(value)) {
        try {
          var d = new Date(value);
          if (!isNaN(d.getTime())) return escapeHtml(d.toLocaleString());
        } catch (e) { /* fall through */ }
      }
      return escapeHtml(value);
    }
    return '';
  }

  function renderNode(data, depth) {
    depth = depth || 0;
    if (depth > 6) return '<span class="pj-empty">…</span>';

    if (data === null || data === undefined) return '<span class="pj-empty">—</span>';

    if (Array.isArray(data)) {
      if (data.length === 0) return '<span class="pj-empty">None</span>';
      var firstIsObj = data[0] !== null && typeof data[0] === 'object' && !Array.isArray(data[0]);
      if (firstIsObj) {
        var keys = Object.keys(data[0]);
        var html = '<div class="pj-table-wrap"><table class="pj-table"><thead><tr>';
        keys.forEach(function (k) { html += '<th>' + escapeHtml(humanizeKey(k)) + '</th>'; });
        html += '</tr></thead><tbody>';
        data.forEach(function (row) {
          html += '<tr>';
          keys.forEach(function (k) {
            var v = row[k];
            html += '<td>' + (v !== null && typeof v === 'object' ? renderNode(v, depth + 1) : renderValue(v)) + '</td>';
          });
          html += '</tr>';
        });
        html += '</tbody></table></div>';
        return html;
      }
      return '<div class="pj-chips">' + data.map(function (v) {
        return '<span class="pj-chip">' + renderValue(v) + '</span>';
      }).join('') + '</div>';
    }

    if (typeof data === 'object') {
      var entries = Object.entries(data);
      if (entries.length === 0) return '<span class="pj-empty">—</span>';
      var out = '<div class="pj-grid">';
      entries.forEach(function (entry) {
        var k = entry[0], v = entry[1];
        out += '<div class="pj-field">';
        out += '<div class="pj-label">' + escapeHtml(humanizeKey(k)) + '</div>';
        if (v !== null && typeof v === 'object') {
          out += '<div class="pj-value pj-nested">' + renderNode(v, depth + 1) + '</div>';
        } else {
          out += '<div class="pj-value">' + renderValue(v) + '</div>';
        }
        out += '</div>';
      });
      out += '</div>';
      return out;
    }

    return renderValue(data);
  }

  global.renderPrettyJson = function (containerEl, data) {
    containerEl.innerHTML = renderNode(data, 0);
  };
})(window);
