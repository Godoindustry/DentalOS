// Remove KHR_materials_pbrSpecularGlossiness from required extensions
// so Three.js r184+ can load the model without error
const fs = require('fs');

const src = 'human_teeth.glb';
const dst = 'public/models/human_teeth.glb';

const buf = fs.readFileSync(src);
const jsonLen = buf.readUInt32LE(12); // JSON chunk length
const jsonStr = buf.toString('utf8', 20, 20 + jsonLen);
const gltf = JSON.parse(jsonStr);

console.log('Before:', JSON.stringify({
  extensionsUsed: gltf.extensionsUsed,
  extensionsRequired: gltf.extensionsRequired,
}));

// Remove the extension references
delete gltf.extensionsRequired;
if (gltf.extensionsUsed) {
  gltf.extensionsUsed = gltf.extensionsUsed.filter(e => e !== 'KHR_materials_pbrSpecularGlossiness');
  if (gltf.extensionsUsed.length === 0) delete gltf.extensionsUsed;
}

// Also remove extension data from materials
if (gltf.materials) {
  gltf.materials.forEach(mat => {
    if (mat.extensions) {
      delete mat.extensions['KHR_materials_pbrSpecularGlossiness'];
      if (Object.keys(mat.extensions).length === 0) delete mat.extensions;
    }
  });
}

console.log('After:', JSON.stringify({
  extensionsUsed: gltf.extensionsUsed,
  extensionsRequired: gltf.extensionsRequired,
}));

const newJson = JSON.stringify(gltf);
const pad = 4 - (newJson.length % 4);
const paddedJson = pad < 4 ? newJson + '\0'.repeat(pad) : newJson;

// Rebuild GLB
const header = Buffer.alloc(12);
header.write('glTF', 0);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(12 + 8 + paddedJson.length + 8 + (buf.length - 20 - jsonLen - 8), 8);

const jsonChunk = Buffer.alloc(8 + paddedJson.length);
jsonChunk.writeUInt32LE(paddedJson.length, 0);
jsonChunk.writeUInt32LE(0x4E4F534A, 4); // JSON
jsonChunk.write(paddedJson, 8, paddedJson.length, 'utf8');

const binStart = 20 + jsonLen + 8; // after json chunk header
const binLen = buf.length - binStart - 8; // -8 for bin chunk header
const binChunk = Buffer.alloc(8 + binLen);
binChunk.writeUInt32LE(binLen, 0);
binChunk.writeUInt32LE(0x004E4942, 4); // BIN
buf.copy(binChunk, 8, binStart + 8, buf.length);

const out = Buffer.concat([header, jsonChunk, binChunk]);
fs.writeFileSync(dst, out);
console.log('Written to', dst, '(' + out.length + ' bytes)');

// Verify the fix
const verify = fs.readFileSync(dst);
const vLen = verify.readUInt32LE(12);
const vJson = JSON.parse(verify.toString('utf8', 20, 20 + vLen));
console.log('Verified: extensionsRequired:', vJson.extensionsRequired, 'extensionsUsed:', vJson.extensionsUsed);
