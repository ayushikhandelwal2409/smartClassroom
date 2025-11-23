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

        // send image to ml
        const imgRes = await axios.post("http://127.0.0.1:5000/embed-image", 
            form, 
            {
                headers: form.getHeaders()},
                
            );

        const imgVec = imgRes.data.embedding;

        const finalEmbedding = textVec.map((v, i)=>(v + imgVec[i]) / 2)

        // store in db
        const item = await LostItem.create({
            title,
            description,
            image_url: req.file.path,
            embedding: finalEmbedding
        });

        res.json({message: "Lost item added", item})
    }
    catch(err){
        res.status(500).json({error: err.message})
    }
}


const searchLostItem = async (req, res) => {
    try {
        const query = req.body.query;

        // query → embedding
            const embedRes = await axios.post("http://127.0.0.1:5000/embed-text", {
            text: query
        })

        const qVec = embedRes.data.embedding;

        // fetch all items
        const items = await LostItem.find();

        // compare similarity
        const similarity = (A, B) => {
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
                score: similarity(qVec, item.embedding)
            }))
            .sort((a, b) => b.score - a.score);

            res.json(results);

    } 
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}


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


module.exports = {addLostItem, searchLostItem, latestLostItem};