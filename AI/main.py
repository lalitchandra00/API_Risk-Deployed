import uvicorn
from fastapi import FastAPI, Body
import numpy as np
import pandas as pd
import pickle
import nltk
from nltk.tokenize import word_tokenize
from fastapi import HTTPException


app = FastAPI()
pickle_in = open("model.pkl", "rb")
model = pickle.load(pickle_in)

pickle_in_2 = open("vectorizer.pkl", "rb")
vectorizer = pickle.load(pickle_in_2)

@app.post('/predict')
def API_Risk(text: str = Body(...,
        media_type="text/plain",
        title="Enter Text",
        description="Paste your message here"
    )
):
    
    text = text.split()

    for i in text:
        textv = vectorizer.transform([i]).toarray()
        result = model.predict(textv)

        if result[0] == 2:
            return {"found" : True,
                "risk": "Critical",
                "secret" : i}

        if result[0] == 1:
            return {"found" : True,
                "risk": "High Risk",
                "secret" : i}

    return {"found" : False,
        "risk": "No Risk"}


if __name__ == '__main__':
    uvicorn.run(app, host = '127.0.0.1', port = 8000)   