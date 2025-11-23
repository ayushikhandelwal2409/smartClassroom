# Flask = lightweight web server
# Helps us create API endpoints


from flask import Flask, request, jsonify

from sentence_transformers import SentenceTransformer

# This library contains models for text embeddings

from transformers import CLIPProcessor, CLIPModel
from PIL import Image

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
    embedding = text_model.encode(text).tolist()
    return jsonify({"embedding": embedding})


# convert image = embedding

@app.post("/embed-image")
def embed_image():
    file = request.files["image"]
    image = Image.open(file.stream)

    inputs = clip_processor(images=image, return_tensors="pt")
    outputs = clip_model.get_image_features(**inputs)
    emb = outputs[0].detach().numpy().tolist()  # convert tensor → Python list
    return jsonify({"embedding": emb})


app.run(host="0.0.0.0", port=5000)


