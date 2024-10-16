const mongoose = require('mongoose');

const VersionSchema = new mongoose.Schema({
    id:{type: String},
  content: { type: String, default: '' },
  version: { type: Number, default: 1 },
}, { timestamps: true }); // timestamps para manter registro de criação e atualização

const DocumentSchema = new mongoose.Schema({
  versions: [VersionSchema]
});

DocumentSchema.pre('save', function(next) {
  if (this.versions.length > 0) {
    const lastVersion = this.versions[this.versions.length - 1].version;
    this.versions.push({ content: this.versions[this.versions.length - 1].content, version: lastVersion + 1 });
  } else {
    this.versions.push({ content: '', version: 1 });
  }
  next();
});

module.exports = mongoose.model('Document', DocumentSchema);