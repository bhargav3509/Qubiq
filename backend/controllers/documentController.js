const prisma = require('../config/database');
const supabase = require('../config/supabase');
const extractionService = require('../services/documentExtractionService');
const analysisService = require('../services/documentAnalysisService');
const { v4: uuidv4 } = require('uuid');

const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { originalname, buffer, mimetype, size } = req.file;
    const ext = originalname.split('.').pop().toLowerCase();
    const storageKey = `documents/${req.user.id}/${uuidv4()}.${ext}`;

    let storageUrl = null;
    if (supabase) {
      try {
        const { error } = await supabase.storage
          .from('qubiq-documents')
          .upload(storageKey, buffer, { contentType: mimetype });

        if (!error) {
          const { data: urlData } = supabase.storage
            .from('qubiq-documents')
            .getPublicUrl(storageKey);
          storageUrl = urlData.publicUrl;
        }
      } catch (storageErr) {
        console.warn('Supabase storage upload failed:', storageErr.message);
      }
    }

    const document = await prisma.document.create({
      data: {
        userId: req.user.id,
        title: originalname.replace(/\.[^/.]+$/, ''),
        originalName: originalname,
        fileType: ext,
        fileSize: size,
        storageUrl,
        storageKey,
        status: 'processing',
      },
    });

    // Process document asynchronously
    processDocument(document.id, buffer, originalname).catch(console.error);

    res.status(201).json(document);
  } catch (error) {
    next(error);
  }
};

async function processDocument(documentId, buffer, filename) {
  try {
    // Step 1: Extract text
    const extracted = await extractionService.extract(buffer, filename);

    await prisma.document.update({
      where: { id: documentId },
      data: {
        extractedText: extracted.text,
        pageCount: extracted.pageCount,
        wordCount: extracted.wordCount,
        status: 'analyzing',
      },
    });

    if (!extracted.text || extracted.text.trim().length < 50) {
      await prisma.document.update({
        where: { id: documentId },
        data: { status: 'failed' },
      });
      return;
    }

    // Step 2: AI analysis
    const title = filename.replace(/\.[^/.]+$/, '');
    const analysis = await analysisService.analyzeDocument(extracted.text, title);

    // Step 3: Save topics
    const topicRecords = [];
    if (analysis.mainTopics && Array.isArray(analysis.mainTopics)) {
      for (let i = 0; i < analysis.mainTopics.length; i++) {
        const mainTopic = analysis.mainTopics[i];
        const topicRecord = await prisma.topic.create({
          data: {
            documentId,
            name: mainTopic.name,
            description: mainTopic.description || '',
            orderIndex: i,
          },
        });
        topicRecords.push(topicRecord);

        if (mainTopic.subtopics && Array.isArray(mainTopic.subtopics)) {
          for (let j = 0; j < mainTopic.subtopics.length; j++) {
            await prisma.topic.create({
              data: {
                documentId,
                name: mainTopic.subtopics[j].name,
                description: mainTopic.subtopics[j].description || '',
                parentId: topicRecord.id,
                orderIndex: j,
              },
            });
          }
        }
      }
    }

    // Step 4: Create missions from main topics
    for (let i = 0; i < topicRecords.length; i++) {
      const topicRecord = topicRecords[i];
      await prisma.mission.create({
        data: {
          documentId,
          topicId: topicRecord.id,
          title: `Mission: ${topicRecord.name}`,
          description: topicRecord.description,
          type: i === topicRecords.length - 1 ? 'boss_battle' : 'standard',
          difficulty: i < 2 ? 'easy' : i < 4 ? 'medium' : 'hard',
          xpReward: (i + 1) * 50 + 50,
          orderIndex: i,
          worldIndex: Math.floor(i / 3) + 1,
          isLocked: i > 0,
        },
      });
    }

    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'ready' },
    });
  } catch (error) {
    console.error('Document processing error:', error.message);
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'failed' },
    }).catch(() => {});
  }
}

const getDocuments = async (req, res, next) => {
  try {
    const documents = await prisma.document.findMany({
      where: { userId: req.user.id },
      include: {
        _count: { select: { topics: true, quizzes: true, missions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(documents);
  } catch (error) {
    next(error);
  }
};

const getDocument = async (req, res, next) => {
  try {
    const document = await prisma.document.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: {
        topics: {
          where: { parentId: null },
          include: { children: { orderBy: { orderIndex: 'asc' } } },
          orderBy: { orderIndex: 'asc' },
        },
        missions: { orderBy: [{ worldIndex: 'asc' }, { orderIndex: 'asc' }] },
        _count: { select: { quizzes: true } },
      },
    });

    if (!document) return res.status(404).json({ error: 'Document not found' });
    res.json(document);
  } catch (error) {
    next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const document = await prisma.document.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!document) return res.status(404).json({ error: 'Document not found' });

    if (supabase && document.storageKey) {
      await supabase.storage.from('qubiq-documents').remove([document.storageKey]).catch(console.warn);
    }

    await prisma.document.delete({ where: { id: req.params.id } });
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadDocument, getDocuments, getDocument, deleteDocument };

