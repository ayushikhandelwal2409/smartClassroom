# Flask = lightweight web server
# Helps us create API endpoints


from flask import Flask, request, jsonify

from sentence_transformers import SentenceTransformer

# This library contains models for text embeddings

from transformers import CLIPProcessor, CLIPModel
from PIL import Image

import numpy as np
from numpy.linalg import norm

# CLIPModel = converts images into embeddings
# PIL = used to read images

app = Flask(__name__)  # start ml server

# loads the ml model
# We use: "all-MiniLM-L6-v2" (fast + accurate)
text_model = SentenceTransformer("all-MiniLM-L6-v2")

clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")


# convert text = embedding

@app.post("/embed-text")
def embed_text():
    text = request.json["text"]
    emb = text_model.encode(text)
    emb =emb/ norm(emb)
    return jsonify({"embedding": emb.tolist()})


# convert image = embedding

@app.post("/embed-image")
def embed_image():
    file = request.files["image"]
    image = Image.open(file.stream)

    inputs = clip_processor(images=image, return_tensors="pt")
    outputs = clip_model.get_image_features(**inputs)


    img_vec = outputs[0].detach().numpy() 
    img_vec = img_vec / norm(img_vec)

    return jsonify({"embedding": img_vec.tolist()})


app.run(host="0.0.0.0", port=5000)

