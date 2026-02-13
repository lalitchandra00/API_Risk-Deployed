# API Risk
Developed a Machine Learning–based security detection system that scans code snippets to identify API keys or secrets, helping prevent accidental credential leaks in repositories and reducing risk of automated exploitation by malicious bots.
Designed and implemented a text classification pipeline using TF-IDF feature extraction and Logistic Regression to automatically flag sensitive tokens, enabling proactive detection of credential exposure before code deployment.
## Project Overview
Developed a Machine Learning–based security detection system that scans code snippets to identify API keys or secrets, helping prevent accidental credential leaks in repositories and reducing risk of automated exploitation by malicious bots.
Designed and implemented a text classification pipeline using TF-IDF feature extraction and Logistic Regression to automatically flag sensitive tokens, enabling proactive detection of credential exposure before code deployment.
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


