const fs = require('fs');
const b = fs.readFileSync('public/models/human_teeth.glb');
const l = b.readUInt32LE(12);
const s = b.toString('utf8', 20, 20 + l);
const j = JSON.parse(s);
console.log('extensionsRequired:', j.extensionsRequired);
console.log('extensionsUsed:', j.extensionsUsed);
console.log('materials:', j.materials.length);
j.materials.forEach(m => {
  console.log('  ' + m.name, 'normalTex:', !!m.normalTexture, 'ext:', !!m.extensions);
});
console.log('textures:', j.textures?.length);
console.log('images:', j.images?.length);
console.log('Total meshes:', j.meshes.length);
console.log('Total nodes:', j.nodes.length);
