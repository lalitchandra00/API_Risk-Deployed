# API Risk
This project implements a Machine Learning–based Risk Classification API using Python.
It analyzes raw text input such as logs, messages, or code snippets and classifies the content into Critical, High Risk, or No Risk categories through a deployed REST API.
## Project Overview
This is an end-to-end Machine Learning and API deployment project that demonstrates how a trained NLP model can be exposed as a web service.
The system uses a trained classification model to evaluate incoming text in real time and determine the associated risk level based on learned patterns.
<br>
## Dataset
The model is trained on a text-based risk classification dataset, where each data sample is labeled according to its severity level.

During preprocessing:

Text is cleaned and normalized
Input is tokenized using whitespace-based tokenization

Labels are encoded as:
- No Risk → 0
- High Risk → 1
- Critical → 2
<br>

## Model & Accuracy
The classification model is implemented using Logistic Regression, a widely used algorithm for text-based classification tasks.

Key features:

- Text data is converted into numerical form using TF-IDF Vectorization

- Each token is evaluated individually

- Final prediction follows a priority-based decision logic:

- If any token is classified as Critical, the overall result is Critical

- If no Critical token is found but any token is High Risk, the result is High Risk

- If no risky tokens are detected, the result is No Risk
<br>

## Technologies Used
- Python

- Scikit-learn (TF-IDF Vectorization, Logistic Regression, Model Evaluation)

- NLTK (for optional text preprocessing)

- Pandas (data handling)

- NumPy


