const axios = require("axios");
const LostItem = require("../models/LostItem");
const FormData = require('form-data');
const fs = require('fs');


const addLostItem = async (req, res) =>{
    try{
        const {title, description} = req.body;

        // send text to ml
        const textRes = await axios.post("http://127.0.0.1:5000/embed-text",{
            text: title + " " + description
        })

        const textVec = textRes.data.embedding


        // create form-data
        const form = new FormData();
        form.append('image', fs.createReadStream(req.file.path)) // reads the image

        // console.log("FILE:", req.file);

        // send image to ml
        const imgRes = await axios.post("http://127.0.0.1:5000/embed-image", 
            form, 
            {
                headers: form.getHeaders()},
                
            );

        const imgVec = imgRes.data.embedding;

        // check for duplicate using cosine similarity
        const existing = await LostItem.find(); 

        const similarity = (A, B) => {
        if (!A || !B) return 0;
        let dot = 0, a = 0, b = 0;
        for (let i = 0; i < A.length; i++) {
            dot += A[i] * B[i];
            a += A[i] * A[i];
            b += B[i] * B[i];
        }
            return dot / (Math.sqrt(a) * Math.sqrt(b));
        };

        // check image similarity threshold
        let isDuplicate = false;
        for (let i = 0; i < existing.length; i++) {
        const score = similarity(imgVec, existing[i].image_embedding);
        console.log("Duplicate check score:", score);
        
        if (score > 0.92) {   // threshold for exact same item
            isDuplicate = true;
            break;
            }
        }

        if (isDuplicate) {
        return res.status(409).json({
            message: "Duplicate item detected - this lost item already exists."
        });
        }

        // store in db
        const item = await LostItem.create({
            title,
            description,
            image_url: req.file.path,
            text_embedding: textVec,
            image_embedding: imgVec
        });

        res.json({message: "Lost item added", item})
    }
    catch(err){
        res.status(500).json({error: err.message})
    }
}

// search by text
const searchLostItem = async (req, res) => {
    try {
        const query = req.body.query || "";

        // query → embedding
        let qVec = null;
        if(query.trim() !== ""){
            const embedRes = await axios.post("http://127.0.0.1:5000/embed-text", {
            text: query
            })
        qVec = embedRes.data.embedding;
        }

        // fetch all items
        const items = await LostItem.find();

        // compare similarity
        const similarity = (A, B) => {
            if(!A || !B) return 0;
            let dot = 0, a = 0, b = 0;
            for (let i = 0; i < A.length; i++) {
                dot += A[i] * B[i];
                a += A[i] * A[i];
                b += B[i] * B[i];
            }
            return dot / (Math.sqrt(a) * Math.sqrt(b));
        };

        // create sorted result list
        const results = items
            .map((item) => ({
                item,
                score: qVec ? similarity(qVec, item.text_embedding): 0
            }))
            .sort((a, b) => b.score - a.score);

            res.json(results);

    } 
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// search by image
const imageSearchLostItem = async (req, res) => {
  try {
    const fs = require("fs");
    const FormData = require("form-data");

    const form = new FormData();
    form.append("image", fs.createReadStream(req.file.path));

    // Send image → ML Server
    
    const imgRes = await axios.post(
      "http://127.0.0.1:5000/embed-image",
      form,
      { headers: form.getHeaders() }
    );

    const qVec = imgRes.data.embedding;

    // Fetch all stored items
    const items = await LostItem.find();

    // Cosine similarity
    const similarity = (A, B) => {
        if(!A || !B) return 0;
      let dot = 0, a = 0, b = 0;
      for (let i = 0; i < A.length; i++) {
        dot += A[i] * B[i];
        a += A[i] * A[i];
        b += B[i] * B[i];
      }
      return dot / (Math.sqrt(a) * Math.sqrt(b));
    };

    const results = items
      .map(item => ({
        item,
        score: similarity(qVec, item.image_embedding) // image search
      }))
      .sort((a, b) => b.score - a.score);

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// get latest lost item
const latestLostItem =  async (req, res) => {
    try {
        const latest = await LostItem.find().sort({ createdAt: -1 }).limit(1);
        if (!latest.length) {
            return res.json(null);
        }
        res.json(latest[0]);
    } 
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// get all items
    const getAllLostItems = async (req, res) => {
    try {
        const items = await LostItem.find().sort({ createdAt: -1 });
        res.json(items.map(item => ({ item, score: 0 })));
    } 
    catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

module.exports = {addLostItem, searchLostItem, latestLostItem, imageSearchLostItem, getAllLostItems};
