const express = require('express');
const router = express.Router();
const Document = require('../models/Docs');
router.post('/newDoc', async (req, res) => {
  try {
    const { content } = req.body;

    let document = await Document.findOne();
    if (!document) {
      document = new Document();
    }

    const newVersion = document.versions.length + 1;
    document.versions.push({ content, version: newVersion });
    
    await document.save();
    
    res.status(200).json({ message: 'Documento salvo com sucesso!', document });
  } catch (error) {
    console.error('Erro ao salvar documento:', error);
    res.status(500).json({ message: 'Erro ao salvar documento' });
  }
});

router.get('/version/:versionNumber', async (req, res) => {
    try {
      const { versionNumber } = req.params;
      const document = await Document.findOne();
  
      if (!document || !document.versions.length) {
        return res.status(404).json({ message: 'Documento não encontrado' });
      }
  
      const version = document.versions.find(v => v.version === parseInt(versionNumber));
      if (!version) {
        return res.status(404).json({ message: 'Versão não encontrada' });
      }
  
      res.status(200).json({ version });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao obter versão do documento' });
    }
  });

  router.put('/version/:versionNumber', async (req, res) => {
    const { versionNumber } = req.params;
    const { content } = req.body;
    try {
        const document = await Document.findOne();
        if (!document || !document.versions[versionNumber - 1]) {
            return res.status(404).json({ message: 'Versão não encontrada' });
        }

        document.versions[versionNumber - 1].content = content;
        await document.save();

        res.status(200).json({ message: 'Versão atualizada com sucesso!', version: document.versions[versionNumber - 1] });
    } catch (error) {
        console.error('Erro ao atualizar versão:', error);
        res.status(500).json({ message: 'Erro ao atualizar versão' });
    }
});

module.exports = router;
