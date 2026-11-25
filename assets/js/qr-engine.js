/**
 * Pure Client-Side QR Code Generator (ISO/IEC 18004 Byte Mode, Versions 1-10)
 * Supports UTF-8, Error Correction Levels L/M/Q/H, Canvas & SVG rendering.
 * Zero external dependencies — 100% offline & privacy-safe.
 */
(function (global) {
  "use strict";

  // Galois Field GF(256) with primitive polynomial 0x11d
  const EXP = new Uint8Array(512);
  const LOG = new Uint8Array(256);
  (function initGF() {
    let x = 1;
    for (let i = 0; i < 255; i++) {
      EXP[i] = x;
      LOG[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11d;
    }
    for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  })();

  function gfMul(a, b) {
    if (a === 0 || b === 0) return 0;
    return EXP[LOG[a] + LOG[b]];
  }

  function rsGeneratorPoly(degree) {
    let poly = [1];
    for (let i = 0; i < degree; i++) {
      const next = new Array(poly.length + 1).fill(0);
      const factor = EXP[i];
      for (let j = 0; j < poly.length; j++) {
        next[j] ^= poly[j];
        next[j + 1] ^= gfMul(poly[j], factor);
      }
      poly = next;
    }
    return poly;
  }

  function rsComputeRemainder(data, ecLen) {
    const gen = rsGeneratorPoly(ecLen);
    const res = new Uint8Array(ecLen);
    for (let i = 0; i < data.length; i++) {
      const factor = data[i] ^ res[0];
      for (let j = 0; j < ecLen - 1; j++) res[j] = res[j + 1];
      res[ecLen - 1] = 0;
      if (factor !== 0) {
        for (let j = 0; j < ecLen; j++) {
          res[j] ^= gfMul(gen[j + 1], factor);
        }
      }
    }
    return res;
  }

  // [totalCodewords, ecPerBlock, blocksG1, dataPerBlockG1, blocksG2, dataPerBlockG2]
  const VERSION_TABLE = {
    L: [
      null,
      [26, 7, 1, 19, 0, 0],
      [44, 10, 1, 34, 0, 0],
      [70, 15, 1, 55, 0, 0],
      [100, 20, 1, 80, 0, 0],
      [134, 26, 1, 108, 0, 0],
      [172, 18, 2, 68, 0, 0],
      [196, 20, 2, 78, 0, 0],
      [242, 24, 2, 97, 0, 0],
      [292, 30, 2, 116, 0, 0],
      [346, 18, 2, 68, 2, 69],
    ],
    M: [
      null,
      [26, 10, 1, 16, 0, 0],
      [44, 16, 1, 28, 0, 0],
      [70, 26, 1, 44, 0, 0],
      [100, 18, 2, 32, 0, 0],
      [134, 24, 2, 43, 0, 0],
      [172, 16, 4, 27, 0, 0],
      [196, 18, 4, 31, 0, 0],
      [242, 22, 2, 38, 2, 39],
      [292, 22, 3, 36, 2, 37],
      [346, 26, 4, 43, 1, 44],
    ],
    Q: [
      null,
      [26, 13, 1, 13, 0, 0],
      [44, 22, 1, 22, 0, 0],
      [70, 18, 2, 17, 0, 0],
      [100, 26, 2, 24, 0, 0],
      [134, 18, 2, 15, 2, 16],
      [172, 24, 4, 19, 0, 0],
      [196, 18, 2, 14, 4, 15],
      [242, 22, 4, 18, 2, 19],
      [292, 20, 4, 16, 4, 17],
      [346, 24, 6, 19, 2, 20],
    ],
    H: [
      null,
      [26, 17, 1, 9, 0, 0],
      [44, 28, 1, 16, 0, 0],
      [70, 22, 2, 13, 0, 0],
      [100, 16, 4, 9, 0, 0],
      [134, 22, 2, 11, 2, 12],
      [172, 28, 4, 15, 0, 0],
      [196, 26, 4, 13, 1, 14],
      [242, 26, 4, 14, 2, 15],
      [292, 24, 4, 12, 4, 13],
      [346, 28, 6, 15, 2, 16],
    ],
  };

  const ALIGN_POS = [
    [],
    [],
    [6, 18],
    [6, 22],
    [6, 26],
    [6, 30],
    [6, 34],
    [6, 22, 38],
    [6, 24, 42],
    [6, 26, 46],
    [6, 28, 50],
  ];

  const EC_FORMAT_BITS = { L: 1, M: 0, Q: 3, H: 2 };

  function encodeUTF8(str) {
    if (typeof TextEncoder !== "undefined") {
      return Array.from(new TextEncoder().encode(str));
    }
    const out = [];
    for (let i = 0; i < str.length; i++) {
      let c = str.charCodeAt(i);
      if (c < 0x80) out.push(c);
      else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
      else out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    }
    return out;
  }

  function getFormatBits(ecLevel, mask) {
    const data = (EC_FORMAT_BITS[ecLevel] << 3) | mask;
    let rem = data;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >> 9) * 0x537);
    return ((data << 10) | rem) ^ 0x5412;
  }

  function getVersionBits(version) {
    let rem = version;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >> 11) * 0x1f25);
    return (version << 12) | rem;
  }

  function chooseVersion(byteLen, ecLevel) {
    const table = VERSION_TABLE[ecLevel];
    for (let v = 1; v <= 10; v++) {
      const [, , b1, d1, b2, d2] = table[v];
      const totalDataBytes = b1 * d1 + b2 * d2;
      const charCountBits = v < 10 ? 8 : 16;
      const neededBits = 4 + charCountBits + byteLen * 8;
      if (neededBits <= totalDataBytes * 8) return v;
    }
    throw new Error("입력 텍스트가 너무 깁니다. (최대 약 270바이트 이하로 줄여주세요)");
  }

  function buildCodewords(bytes, version, ecLevel) {
    const [, ecPerBlock, b1, d1, b2, d2] = VERSION_TABLE[ecLevel][version];
    const totalDataBytes = b1 * d1 + b2 * d2;
    const bits = [];
    const pushBits = (val, len) => {
      for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1);
    };

    // Byte mode indicator (0100)
    pushBits(4, 4);
    pushBits(bytes.length, version < 10 ? 8 : 16);
    for (const b of bytes) pushBits(b, 8);

    // Terminator (up to 4 zeros)
    const maxBits = totalDataBytes * 8;
    const term = Math.min(4, maxBits - bits.length);
    for (let i = 0; i < term; i++) bits.push(0);

    // Byte alignment
    while (bits.length % 8 !== 0) bits.push(0);

    const dataBytes = [];
    for (let i = 0; i < bits.length; i += 8) {
      let byte = 0;
      for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
      dataBytes.push(byte);
    }

    // Pad bytes 0xEC, 0x11
    const pads = [0xec, 0x11];
    let p = 0;
    while (dataBytes.length < totalDataBytes) {
      dataBytes.push(pads[p++ % 2]);
    }

    // Split into blocks & compute RS EC
    const blocks = [];
    const ecBlocks = [];
    let offset = 0;
    for (let i = 0; i < b1; i++) {
      const blk = dataBytes.slice(offset, offset + d1);
      offset += d1;
      blocks.push(blk);
      ecBlocks.push(rsComputeRemainder(blk, ecPerBlock));
    }
    for (let i = 0; i < b2; i++) {
      const blk = dataBytes.slice(offset, offset + d2);
      offset += d2;
      blocks.push(blk);
      ecBlocks.push(rsComputeRemainder(blk, ecPerBlock));
    }

    // Interleave data & EC
    const result = [];
    const maxD = Math.max(d1, d2);
    for (let i = 0; i < maxD; i++) {
      for (const blk of blocks) {
        if (i < blk.length) result.push(blk[i]);
      }
    }
    for (let i = 0; i < ecPerBlock; i++) {
      for (const ec of ecBlocks) result.push(ec[i]);
    }
    return result;
  }

  function createMatrix(version) {
    const size = version * 4 + 17;
    const modules = Array.from({ length: size }, () => new Uint8Array(size));
    const isFunc = Array.from({ length: size }, () => new Uint8Array(size));

    const setFunc = (r, c, dark) => {
      if (r >= 0 && r < size && c >= 0 && c < size) {
        modules[r][c] = dark ? 1 : 0;
        isFunc[r][c] = 1;
      }
    };

    // Finder patterns + separators
    const drawFinder = (r0, c0) => {
      for (let dr = -1; dr <= 7; dr++) {
        for (let dc = -1; dc <= 7; dc++) {
          const r = r0 + dr, c = c0 + dc;
          if (r < 0 || r >= size || c < 0 || c >= size) continue;
          const inBox = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
          const dark =
            inBox &&
            (dr === 0 || dr === 6 || dc === 0 || dc === 6 || (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4));
          setFunc(r, c, dark);
        }
      }
    };
    drawFinder(0, 0);
    drawFinder(0, size - 7);
    drawFinder(size - 7, 0);

    // Timing patterns
    for (let i = 8; i < size - 8; i++) {
      setFunc(6, i, i % 2 === 0);
      setFunc(i, 6, i % 2 === 0);
    }

    // Alignment patterns
    const pos = ALIGN_POS[version];
    for (let i = 0; i < pos.length; i++) {
      for (let j = 0; j < pos.length; j++) {
        const r = pos[i], c = pos[j];
        if ((i === 0 && j === 0) || (i === 0 && j === pos.length - 1) || (i === pos.length - 1 && j === 0)) {
          continue;
        }
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const dark = Math.max(Math.abs(dr), Math.abs(dc)) !== 1;
            setFunc(r + dr, c + dc, dark);
          }
        }
      }
    }

    // Dark module & reserve format info
    setFunc(size - 8, 8, true);
    for (let i = 0; i < 9; i++) {
      if (!isFunc[8][i]) setFunc(8, i, false);
      if (!isFunc[i][8]) setFunc(i, 8, false);
    }
    for (let i = 0; i < 8; i++) {
      setFunc(8, size - 1 - i, false);
      setFunc(size - 1 - i, 8, false);
    }

    // Version info for version >= 7
    if (version >= 7) {
      const vBits = getVersionBits(version);
      for (let i = 0; i < 18; i++) {
        const dark = ((vBits >> i) & 1) === 1;
        const r = Math.floor(i / 3);
        const c = size - 11 + (i % 3);
        setFunc(r, c, dark);
        setFunc(c, r, dark);
      }
    }

    return { size, modules, isFunc };
  }

  function placeData(matrix, codewords) {
    const { size, modules, isFunc } = matrix;
    let bitIdx = 0;
    const totalBits = codewords.length * 8;
    let upward = true;

    for (let col = size - 1; col >= 1; col -= 2) {
      if (col === 6) col--;
      for (let step = 0; step < size; step++) {
        const r = upward ? size - 1 - step : step;
        for (let dc = 0; dc < 2; dc++) {
          const c = col - dc;
          if (!isFunc[r][c]) {
            let dark = 0;
            if (bitIdx < totalBits) {
              dark = (codewords[bitIdx >> 3] >> (7 - (bitIdx & 7))) & 1;
              bitIdx++;
            }
            modules[r][c] = dark;
          }
        }
      }
      upward = !upward;
    }
  }

  function maskBit(mask, r, c) {
    switch (mask) {
      case 0: return (r + c) % 2 === 0;
      case 1: return r % 2 === 0;
      case 2: return c % 3 === 0;
      case 3: return (r + c) % 3 === 0;
      case 4: return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
      case 5: return ((r * c) % 2) + ((r * c) % 3) === 0;
      case 6: return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
      case 7: return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
      default: return false;
    }
  }

  function applyFormat(modules, size, ecLevel, mask) {
    const bits = getFormatBits(ecLevel, mask);
    for (let i = 0; i <= 5; i++) modules[8][i] = (bits >> (14 - i)) & 1;
    modules[8][7] = (bits >> 8) & 1;
    modules[8][8] = (bits >> 7) & 1;
    modules[7][8] = (bits >> 6) & 1;
    for (let i = 9; i < 15; i++) modules[14 - i][8] = (bits >> (14 - i)) & 1;

    for (let i = 0; i < 8; i++) modules[8][size - 1 - i] = (bits >> i) & 1;
    for (let i = 8; i < 15; i++) modules[size - 15 + i][8] = (bits >> i) & 1;
    modules[size - 8][8] = 1;
  }

  function penaltyScore(modules, size) {
    let score = 0;
    // Rule 1: runs of 5+
    for (let r = 0; r < size; r++) {
      let run = 1;
      for (let c = 1; c < size; c++) {
        if (modules[r][c] === modules[r][c - 1]) {
          run++;
          if (run === 5) score += 3;
          else if (run > 5) score += 1;
        } else run = 1;
      }
    }
    for (let c = 0; c < size; c++) {
      let run = 1;
      for (let r = 1; r < size; r++) {
        if (modules[r][c] === modules[r - 1][c]) {
          run++;
          if (run === 5) score += 3;
          else if (run > 5) score += 1;
        } else run = 1;
      }
    }
    // Rule 2: 2x2 blocks
    for (let r = 0; r < size - 1; r++) {
      for (let c = 0; c < size - 1; c++) {
        const v = modules[r][c];
        if (v === modules[r][c + 1] && v === modules[r + 1][c] && v === modules[r + 1][c + 1]) {
          score += 3;
        }
      }
    }
    return score;
  }

  function generate(text, ecLevel = "M") {
    const level = ["L", "M", "Q", "H"].includes(ecLevel) ? ecLevel : "M";
    const bytes = encodeUTF8(text || " ");
    const version = chooseVersion(bytes.length, level);
    const codewords = buildCodewords(bytes, version, level);
    const base = createMatrix(version);
    placeData(base, codewords);

    let bestMask = 0;
    let bestScore = Infinity;
    let bestModules = null;

    for (let m = 0; m < 8; m++) {
      const cloned = base.modules.map((row) => new Uint8Array(row));
      for (let r = 0; r < base.size; r++) {
        for (let c = 0; c < base.size; c++) {
          if (!base.isFunc[r][c] && maskBit(m, r, c)) {
            cloned[r][c] ^= 1;
          }
        }
      }
      applyFormat(cloned, base.size, level, m);
      const sc = penaltyScore(cloned, base.size);
      if (sc < bestScore) {
        bestScore = sc;
        bestMask = m;
        bestModules = cloned;
      }
    }

    return {
      version,
      ecLevel: level,
      mask: bestMask,
      size: base.size,
      modules: bestModules,
    };
  }

  function drawToCanvas(qr, canvas, opts = {}) {
    const pixelSize = opts.size || 280;
    const quiet = opts.margin ?? 4;
    const fg = opts.fg || "#0f172a";
    const bg = opts.bg || "#ffffff";
    const totalModules = qr.size + quiet * 2;
    const scale = Math.max(2, Math.floor(pixelSize / totalModules));
    const actualSize = totalModules * scale;

    canvas.width = actualSize;
    canvas.height = actualSize;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, actualSize, actualSize);
    ctx.fillStyle = fg;

    for (let r = 0; r < qr.size; r++) {
      for (let c = 0; c < qr.size; c++) {
        if (qr.modules[r][c]) {
          ctx.fillRect((c + quiet) * scale, (r + quiet) * scale, scale, scale);
        }
      }
    }
    return canvas;
  }

  function toSVG(qr, opts = {}) {
    const quiet = opts.margin ?? 4;
    const fg = opts.fg || "#0f172a";
    const bg = opts.bg || "#ffffff";
    const total = qr.size + quiet * 2;
    let paths = "";
    for (let r = 0; r < qr.size; r++) {
      for (let c = 0; c < qr.size; c++) {
        if (qr.modules[r][c]) {
          paths += `M${c + quiet},${r + quiet}h1v1h-1z`;
        }
      }
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="${bg}"/><path d="${paths}" fill="${fg}"/></svg>`;
  }

  global.QREngine = { generate, drawToCanvas, toSVG };
})(window);
